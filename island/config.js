/* Island Dreams — connection to the family's online journal.

   Leave both blank and the app keeps entries on this device only
   (handy for trying it out). Fill them in from your Supabase project
   (Project Settings → API) and every family member shares one journal.
   See ISLAND.md for the full setup.

   The anon key is meant to be public: the database rules in setup.sql
   are what keep the journal private to the family list. Never put the
   service_role key here. */
window.ISLAND_CONFIG = {
  supabaseUrl: '',
  supabaseAnonKey: ''
};
