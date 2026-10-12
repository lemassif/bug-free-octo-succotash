/* Island Dreams — where the journal is kept.

   Two stores share one interface:

   - CloudStore keeps everything in the family's Supabase project:
     entries and lists in Postgres, photos in a private Storage
     bucket. Anyone whose email is on the family list can sign in
     with a code sent to that email and read and write everything.
   - LocalStore keeps everything in this browser (IndexedDB). It is
     what runs before config.js is filled in, so the app can be tried
     out, but nothing in it reaches anyone else.

   Every photo is stored twice: a full copy (longest side 1600 px)
   and a thumbnail (480 px), both JPEG. The list only ever loads
   thumbnails, which matters on the river's slow connection. */

export const DEFAULT_PEOPLE = [
  'PAPA', 'MEMA', 'Susan', 'Joshua', 'Jackie', 'Rebekah', 'Satomi',
  'Sora', 'Katie', 'Lorenzo', 'Haru', 'Chance', 'Tatiana'
];

export const DEFAULT_ACTIVITIES = [
  'Fish caught', 'Campfire', 'Boating', 'Boat sightings', 'Tubing',
  'Swimming', 'Cooking on the boat', 'Geocaching', 'Sightseeing', 'Fireworks'
];

export function createStore(config) {
  const c = config || {};
  if (c.supabaseUrl && c.supabaseAnonKey) return new CloudStore(c);
  return new LocalStore();
}

const byPosition = (a, b) => a.position - b.position;
const byCreated = (a, b) => String(a.created_at).localeCompare(String(b.created_at));
const clean = (s) => String(s || '').trim().replace(/\s+/g, ' ');

/* ------------------------------------------------------------------ */
/*  Cloud                                                              */
/* ------------------------------------------------------------------ */

const BUCKET = 'photos';
const URL_LIFETIME = 6 * 60 * 60; // seconds a signed photo link stays valid

class CloudStore {
  constructor(config) {
    this.mode = 'cloud';
    this.config = config;
    this.sb = null;
    this.urls = new Map(); // storage path -> { url, expires }
  }

  async init() {
    if (!window.supabase) await loadScript('vendor/supabase.js');
    this.sb = window.supabase.createClient(this.config.supabaseUrl, this.config.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
  }

  async session() {
    const { data } = await this.sb.auth.getSession();
    const s = data && data.session;
    return s ? { email: (s.user.email || '').toLowerCase() } : null;
  }

  /* cb(event). Deferred because supabase-js deadlocks if its own calls
     are awaited inside this callback. */
  onAuthChange(cb) {
    this.sb.auth.onAuthStateChange((event) => setTimeout(() => cb(event), 0));
  }

  async sendCode(email) {
    const { error } = await this.sb.auth.signInWithOtp({
      email: clean(email).toLowerCase(),
      options: { emailRedirectTo: location.origin + location.pathname }
    });
    if (error) throw error;
  }

  async verifyCode(email, code) {
    const { error } = await this.sb.auth.verifyOtp({
      email: clean(email).toLowerCase(), token: String(code).replace(/\s/g, ''), type: 'email'
    });
    if (error) throw error;
  }

  async signOut() {
    await this.sb.auth.signOut();
  }

  async isMember() {
    const { data, error } = await this.sb.rpc('is_member');
    if (error) throw error;
    return data === true;
  }

  async listEntries() {
    const { data, error } = await this.sb.from('entries').select('*, photos(*)');
    if (error) throw error;
    data.forEach((e) => { e.photos = (e.photos || []).sort(byCreated); });
    return data;
  }

  async saveEntry(entry) {
    const row = {
      entry_date: entry.entry_date,
      entry_time: entry.entry_time || null,
      title: entry.title || '',
      body: entry.body || '',
      people: entry.people || [],
      activities: entry.activities || []
    };
    const q = entry.id
      ? this.sb.from('entries').update({ ...row, updated_at: new Date().toISOString() }).eq('id', entry.id)
      : this.sb.from('entries').insert(row);
    const { data, error } = await q.select('*, photos(*)').single();
    if (error) throw error;
    data.photos = (data.photos || []).sort(byCreated);
    return data;
  }

  async deleteEntry(entry) {
    const paths = (entry.photos || []).flatMap((p) => [p.path, p.thumb_path]);
    if (paths.length) {
      const { error } = await this.sb.storage.from(BUCKET).remove(paths);
      if (error) throw error;
    }
    const { error } = await this.sb.from('entries').delete().eq('id', entry.id);
    if (error) throw error;
  }

  async addPhoto(entryId, img) {
    const id = crypto.randomUUID();
    const path = `${entryId}/${id}.jpg`;
    const thumb = `${entryId}/${id}-t.jpg`;
    const bucket = this.sb.storage.from(BUCKET);
    for (const [p, blob] of [[path, img.full], [thumb, img.thumb]]) {
      const { error } = await bucket.upload(p, blob, { contentType: 'image/jpeg', upsert: false });
      if (error) throw error;
    }
    const { data, error } = await this.sb.from('photos')
      .insert({ id, entry_id: entryId, path, thumb_path: thumb, width: img.width, height: img.height })
      .select().single();
    if (error) {
      await bucket.remove([path, thumb]);
      throw error;
    }
    return data;
  }

  async deletePhoto(photo) {
    const { error } = await this.sb.from('photos').delete().eq('id', photo.id);
    if (error) throw error;
    await this.sb.storage.from(BUCKET).remove([photo.path, photo.thumb_path]);
  }

  /* Returns Map(photo.id -> url). Signs every missing link in one request. */
  async photoUrls(photos, size) {
    const key = (p) => (size === 'thumb' ? p.thumb_path : p.path);
    const soon = Date.now() + 5 * 60 * 1000;
    const need = photos.map(key).filter((k) => !(this.urls.get(k) && this.urls.get(k).expires > soon));
    if (need.length) {
      const { data, error } = await this.sb.storage.from(BUCKET).createSignedUrls(need, URL_LIFETIME);
      if (error) throw error;
      const expires = Date.now() + URL_LIFETIME * 1000;
      data.forEach((d) => { if (d.signedUrl) this.urls.set(d.path, { url: d.signedUrl, expires }); });
    }
    const out = new Map();
    photos.forEach((p) => { const u = this.urls.get(key(p)); if (u) out.set(p.id, u.url); });
    return out;
  }

  async listOptions() {
    const { data, error } = await this.sb.from('options').select('*');
    if (error) throw error;
    return data.sort(byPosition);
  }

  async addOption(kind, label) {
    const { error } = await this.sb.from('options').insert({ kind, label: clean(label) });
    if (error && error.code !== '23505') throw error; // 23505: already on the list
  }

  async removeOption(kind, label) {
    const { error } = await this.sb.from('options').delete().eq('kind', kind).eq('label', label);
    if (error) throw error;
  }

  async listMembers() {
    const { data, error } = await this.sb.from('members').select('*').order('added_at');
    if (error) throw error;
    return data;
  }

  async addMember(email, name) {
    const { error } = await this.sb.from('members')
      .upsert({ email: clean(email).toLowerCase(), name: clean(name) });
    if (error) throw error;
  }

  async removeMember(email) {
    const { error } = await this.sb.from('members').delete().eq('email', email);
    if (error) throw error;
  }
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error('Could not load ' + src));
    document.head.appendChild(s);
  });
}

/* ------------------------------------------------------------------ */
/*  This device only                                                   */
/* ------------------------------------------------------------------ */

const DB_NAME = 'island-dreams';

class LocalStore {
  constructor() {
    this.mode = 'local';
    this.db = null;
    this.urls = new Map(); // photo id + size -> object URL
  }

  async init() {
    this.db = await new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        db.createObjectStore('entries', { keyPath: 'id' });
        db.createObjectStore('photos', { keyPath: 'id' }).createIndex('entry_id', 'entry_id');
        db.createObjectStore('options', { keyPath: 'key' });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    if ((await this.all('options')).length === 0) {
      let position = 0;
      const seed = [
        ...DEFAULT_PEOPLE.map((label) => ({ kind: 'person', label })),
        ...DEFAULT_ACTIVITIES.map((label) => ({ kind: 'activity', label }))
      ];
      for (const o of seed) await this.put('options', { ...o, key: o.kind + '|' + o.label, position: ++position });
    }
  }

  tx(store, mode, fn) {
    return new Promise((resolve, reject) => {
      const t = this.db.transaction(store, mode);
      const req = fn(t.objectStore(store));
      t.oncomplete = () => resolve(req && req.result);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    });
  }
  all(store) { return this.tx(store, 'readonly', (s) => s.getAll()); }
  get(store, key) { return this.tx(store, 'readonly', (s) => s.get(key)); }
  put(store, value) { return this.tx(store, 'readwrite', (s) => s.put(value)); }
  del(store, key) { return this.tx(store, 'readwrite', (s) => s.delete(key)); }

  async session() { return { email: '' }; }
  onAuthChange() {}
  async isMember() { return true; }
  async signOut() {}

  async listEntries() {
    const [entries, photos] = await Promise.all([this.all('entries'), this.all('photos')]);
    entries.forEach((e) => {
      e.photos = photos.filter((p) => p.entry_id === e.id).map(stripBlobs).sort(byCreated);
    });
    return entries;
  }

  async saveEntry(entry) {
    const now = new Date().toISOString();
    const old = entry.id ? await this.get('entries', entry.id) : null;
    const row = {
      id: entry.id || crypto.randomUUID(),
      entry_date: entry.entry_date,
      entry_time: entry.entry_time || null,
      title: entry.title || '',
      body: entry.body || '',
      people: [...(entry.people || [])],
      activities: [...(entry.activities || [])],
      author_email: old ? old.author_email : '',
      created_at: old ? old.created_at : now,
      updated_at: now
    };
    await this.put('entries', row);
    const photos = (await this.all('photos')).filter((p) => p.entry_id === row.id);
    return { ...row, photos: photos.map(stripBlobs).sort(byCreated) };
  }

  async deleteEntry(entry) {
    for (const p of entry.photos || []) await this.deletePhoto(p);
    await this.del('entries', entry.id);
  }

  async addPhoto(entryId, img) {
    const row = {
      id: crypto.randomUUID(), entry_id: entryId, created_at: new Date().toISOString(),
      width: img.width, height: img.height, full: img.full, thumb: img.thumb
    };
    await this.put('photos', row);
    return stripBlobs(row);
  }

  async deletePhoto(photo) {
    for (const size of ['thumb', 'full']) {
      const k = photo.id + size;
      if (this.urls.has(k)) { URL.revokeObjectURL(this.urls.get(k)); this.urls.delete(k); }
    }
    await this.del('photos', photo.id);
  }

  async photoUrls(photos, size) {
    const out = new Map();
    for (const p of photos) {
      const k = p.id + size;
      if (!this.urls.has(k)) {
        const row = await this.get('photos', p.id);
        if (!row) continue;
        this.urls.set(k, URL.createObjectURL(size === 'thumb' ? row.thumb : row.full));
      }
      out.set(p.id, this.urls.get(k));
    }
    return out;
  }

  async listOptions() {
    return (await this.all('options')).sort(byPosition);
  }

  async addOption(kind, label) {
    label = clean(label);
    const key = kind + '|' + label;
    if (await this.get('options', key)) return;
    const max = Math.max(0, ...(await this.all('options')).map((o) => o.position));
    await this.put('options', { key, kind, label, position: max + 1 });
  }

  async removeOption(kind, label) {
    await this.del('options', kind + '|' + label);
  }

  async listMembers() { return []; }
  async addMember() { throw new Error('Family sharing needs the online journal. See the setup guide.'); }
  async removeMember() {}
}

function stripBlobs(p) {
  const { full, thumb, ...rest } = p;
  return rest;
}
