import * as THREE from "three";
import { Flag, TEAMS, type RosterEntry } from "@bfb/shared";
import { characterParts } from "./characters.ts";
import { rifleGeometry, sniperGeometry } from "../game/viewmodel.ts";

export interface AvatarPose {
  x: number; y: number; z: number;
  yaw: number; pitch: number;
  flags: number;
  speed: number;
}

class Avatar {
  readonly root = new THREE.Group();
  private body: THREE.Mesh;
  private legs: THREE.Mesh[];
  private guns: THREE.Mesh[];
  private gunPivot = new THREE.Group();
  private tag: THREE.Sprite | null = null;
  private walk = 0;
  private fall = 0;
  char = -1;
  team = -1;
  name = "";
  alive = true;

  constructor(private mat: THREE.Material, rifle: THREE.BufferGeometry, sniper: THREE.BufferGeometry, private shadow: THREE.Mesh) {
    this.body = new THREE.Mesh(undefined, mat);
    this.legs = [new THREE.Mesh(undefined, mat), new THREE.Mesh(undefined, mat)];
    this.guns = [new THREE.Mesh(rifle, mat), new THREE.Mesh(sniper, mat)];
    for (const g of this.guns) this.gunPivot.add(g);
    this.root.add(this.body, ...this.legs, this.gunPivot, shadow);
  }

  setLook(e: RosterEntry, showTag: boolean) {
    if (e.char !== this.char || e.team !== this.team) {
      this.char = e.char;
      this.team = e.team;
      const parts = characterParts(e.char, e.team);
      this.body.geometry = parts.body;
      this.legs[0].geometry = parts.leg;
      this.legs[1].geometry = parts.leg;
      this.legs[0].position.set(-0.13, parts.hip, 0);
      this.legs[1].position.set(0.13, parts.hip, 0);
      this.gunPivot.position.copy(parts.hands);
    }
    if (showTag && (e.name !== this.name || !this.tag)) {
      this.name = e.name;
      if (this.tag) this.root.remove(this.tag);
      this.tag = nameTag(e.name, TEAMS[e.team].css);
      this.tag.position.set(0, 2.25, 0);
      this.root.add(this.tag);
    } else if (!showTag && this.tag) {
      this.root.remove(this.tag);
      this.tag = null;
    }
    void this.mat;
  }

  update(dt: number, p: AvatarPose) {
    const alive = (p.flags & Flag.Alive) !== 0;
    if (alive && !this.alive) this.fall = 0;
    this.alive = alive;
    this.root.position.set(p.x, p.y, p.z);
    this.root.rotation.y = p.yaw;
    const sniper = (p.flags & Flag.Sniper) !== 0;
    this.guns[0].visible = !sniper;
    this.guns[1].visible = sniper;
    this.gunPivot.rotation.x = p.pitch * 0.8;
    const ground = (p.flags & Flag.Ground) !== 0;
    this.walk += dt * Math.min(12, p.speed * 1.9);
    const swing = ground ? Math.sin(this.walk) * Math.min(0.7, p.speed * 0.12) : 0.35;
    this.legs[0].rotation.x = swing;
    this.legs[1].rotation.x = ground ? -swing : -0.2;
    // Knocked out: tip over backwards, then vanish under the price tags.
    if (!alive) {
      this.fall = Math.min(1, this.fall + dt * 3);
      this.root.rotation.x = -this.fall * Math.PI * 0.48;
      this.root.visible = this.fall < 1 || dt === 0;
    } else {
      this.root.rotation.x = 0;
      this.root.visible = true;
    }
    this.shadow.visible = alive;
    // Spawn protection: a gentle blink.
    this.body.visible = !(p.flags & Flag.Protected) || Math.floor(performance.now() / 120) % 2 === 0;
  }
}

function nameTag(name: string, color: string): THREE.Sprite {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 64;
  const g = c.getContext("2d")!;
  g.font = "700 30px Arial, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.lineWidth = 6;
  g.strokeStyle = "rgba(0,0,0,0.8)";
  g.strokeText(name, 128, 34);
  g.fillStyle = color;
  g.fillText(name, 128, 34);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  s.scale.set(1.2, 0.3, 1);
  s.renderOrder = 5;
  return s;
}

/** Every other player in the match, posed from interpolated snapshots. */
export class Avatars {
  private map = new Map<number, Avatar>();
  private mat = new THREE.MeshLambertMaterial({ vertexColors: true });
  private rifle = rifleGeometry();
  private sniper = sniperGeometry();
  private shadowGeo = new THREE.CircleGeometry(0.42, 16).rotateX(-Math.PI / 2);
  private shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28, depthWrite: false });

  constructor(private scene: THREE.Scene) {}

  sync(roster: RosterEntry[], myId: number, myTeam: number) {
    const keep = new Set<number>();
    for (const e of roster) {
      if (e.id === myId) continue;
      keep.add(e.id);
      let a = this.map.get(e.id);
      if (!a) {
        const sh = new THREE.Mesh(this.shadowGeo, this.shadowMat);
        sh.position.y = 0.02;
        a = new Avatar(this.mat, this.rifle, this.sniper, sh);
        this.map.set(e.id, a);
        this.scene.add(a.root);
      }
      a.setLook(e, e.team === myTeam);
    }
    for (const [id, a] of this.map) if (!keep.has(id)) { this.scene.remove(a.root); this.map.delete(id); }
  }

  pose(id: number, dt: number, p: AvatarPose) {
    this.map.get(id)?.update(dt, p);
  }

  has(id: number) {
    return this.map.has(id);
  }
}
