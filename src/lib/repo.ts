"use client";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { firstStatus, type Item, type ItemInput, type StatusChange, type Track } from "./types";
import { demoSeed } from "./demo-data";

export interface UserInfo { id: string; email: string | null; name: string }
export interface ProfileInfo { display_name?: string | null; locale?: string; palette?: string; theme_mode?: string }

export interface Repo {
  mode: "supabase" | "demo";
  getUser(): Promise<UserInfo | null>;
  signOut(): Promise<void>;
  listItems(): Promise<Item[]>;
  createItem(input: ItemInput): Promise<Item>;
  updateItem(id: string, patch: Partial<ItemInput>): Promise<Item>;
  deleteItem(id: string): Promise<void>;
  listHistory(itemId: string): Promise<StatusChange[]>;
  updateProfile(p: ProfileInfo): Promise<void>;
}

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const hasBackend = Boolean(URL_ && KEY);

let _sb: SupabaseClient | null = null;
export function supabase(): SupabaseClient {
  if (!hasBackend) throw new Error("Supabase belum dikonfigurasi");
  if (!_sb) _sb = createClient(URL_!, KEY!, { auth: { flowType: "pkce", persistSession: true, detectSessionInUrl: true } });
  return _sb;
}

const DETAIL_TABLE: Record<Track, string> = {
  job: "job_details",
  scholarship: "scholarship_details",
  university: "university_details",
};
const DETAIL_FIELDS: Record<Track, string[]> = {
  job: ["employment_type", "work_mode", "source", "salary"],
  scholarship: ["coverage", "level", "benefits", "requirements"],
  university: ["program", "intake", "tuition", "ielts_min"],
};
const ITEM_FIELDS = ["type", "title", "organization", "country", "city", "url", "deadline", "opens_at", "status", "priority", "favorite", "notes"] as const;

/** Kosongkan string kosong jadi null, supaya database tidak menyimpan "" */
function clean<T extends Record<string, unknown>>(o: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(o)) out[k] = typeof v === "string" && v.trim() === "" ? null : typeof v === "string" ? v.trim() : v;
  return out as T;
}

function pick(src: Record<string, unknown>, keys: readonly string[]) {
  const o: Record<string, unknown> = {};
  for (const k of keys) if (k in src) o[k] = src[k];
  return o;
}

type Row = Record<string, unknown> & { type: Track };
function fromRow(r: Row): Item {
  const raw = r[DETAIL_TABLE[r.type]] as unknown;
  const d = (Array.isArray(raw) ? raw[0] : raw) as Record<string, unknown> | null;
  const details: Record<string, unknown> = {};
  if (d) for (const f of DETAIL_FIELDS[r.type]) details[f] = d[f] ?? null;
  return {
    id: r.id as string, type: r.type, title: r.title as string,
    organization: (r.organization as string) ?? null, country: (r.country as string) ?? null, city: (r.city as string) ?? null,
    url: (r.url as string) ?? null, deadline: (r.deadline as string) ?? null, opens_at: (r.opens_at as string) ?? null,
    status: r.status as string, priority: (r.priority as Item["priority"]) ?? "medium", favorite: Boolean(r.favorite),
    notes: (r.notes as string) ?? null, details: details as Item["details"],
    created_at: r.created_at as string, updated_at: r.updated_at as string,
  };
}

const SELECT = "*, job_details(*), scholarship_details(*), university_details(*)";

/* ===================== Supabase ===================== */
function supabaseRepo(): Repo {
  const sb = supabase();
  const one = async (id: string) => {
    const { data, error } = await sb.from("items").select(SELECT).eq("id", id).single();
    if (error) throw error;
    return fromRow(data as Row);
  };
  return {
    mode: "supabase",
    async getUser() {
      const { data } = await sb.auth.getUser();
      const u = data.user;
      if (!u) return null;
      const { data: prof } = await sb.from("profiles").select("display_name").eq("id", u.id).maybeSingle();
      const name = (prof?.display_name as string) || (u.user_metadata?.name as string) || (u.email ?? "").split("@")[0];
      return { id: u.id, email: u.email ?? null, name };
    },
    async signOut() { await sb.auth.signOut(); },
    async listItems() {
      const { data, error } = await sb.from("items").select(SELECT).order("deadline", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return (data as Row[]).map(fromRow);
    },
    async createItem(input) {
      const row = clean(pick(input as unknown as Record<string, unknown>, ITEM_FIELDS));
      const { data, error } = await sb.from("items").insert(row).select("id").single();
      if (error) throw error;
      const id = data.id as string;
      const det = clean(pick(input.details as Record<string, unknown>, DETAIL_FIELDS[input.type]));
      const { error: e2 } = await sb.from(DETAIL_TABLE[input.type]).upsert({ item_id: id, ...det });
      if (e2) throw e2;
      return one(id);
    },
    async updateItem(id, patch) {
      const row = clean(pick(patch as Record<string, unknown>, ITEM_FIELDS.filter((f) => f !== "type")));
      if (Object.keys(row).length) {
        const { error } = await sb.from("items").update(row).eq("id", id);
        if (error) throw error;
      }
      if (patch.details) {
        const cur = await one(id);
        const det = clean(pick(patch.details as Record<string, unknown>, DETAIL_FIELDS[cur.type]));
        const { error } = await sb.from(DETAIL_TABLE[cur.type]).upsert({ item_id: id, ...det });
        if (error) throw error;
      }
      return one(id);
    },
    async deleteItem(id) {
      const { error } = await sb.from("items").delete().eq("id", id);
      if (error) throw error;
    },
    async listHistory(itemId) {
      const { data, error } = await sb.from("status_history").select("*").eq("item_id", itemId).order("changed_at", { ascending: false });
      if (error) throw error;
      return data as StatusChange[];
    },
    async updateProfile(p) {
      const { data } = await sb.auth.getUser();
      if (!data.user) return;
      await sb.from("profiles").update(clean(p as Record<string, unknown>)).eq("id", data.user.id);
    },
  };
}

/* ===================== Demo (localStorage) ===================== */
const DEMO_KEY = "lensa-demo-v1";
interface DemoDB { items: Item[]; history: StatusChange[]; name: string }

function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function demoRepo(): Repo {
  const load = (): DemoDB => {
    try {
      const raw = localStorage.getItem(DEMO_KEY);
      if (raw) return JSON.parse(raw) as DemoDB;
    } catch { /* storage diblokir: pakai data contoh di memori */ }
    const seeded = demoSeed();
    const db: DemoDB = {
      items: seeded,
      history: seeded.map((i) => ({ id: uid(), item_id: i.id, from_status: null, to_status: i.status, changed_at: i.created_at })),
      name: "Ghifar",
    };
    save(db);
    return db;
  };
  let mem: DemoDB | null = null;
  const save = (db: DemoDB) => { mem = db; try { localStorage.setItem(DEMO_KEY, JSON.stringify(db)); } catch { /* abaikan */ } };
  const get = () => mem ?? (mem = load());
  const wait = () => new Promise((r) => setTimeout(r, 120));

  return {
    mode: "demo",
    async getUser() { return { id: "demo", email: null, name: get().name }; },
    async signOut() { try { localStorage.removeItem("lensa-mode"); } catch { /* abaikan */ } },
    async listItems() { await wait(); return structuredClone(get().items); },
    async createItem(input) {
      await wait();
      const db = get();
      const now = new Date().toISOString();
      const item: Item = { ...structuredClone(input), status: input.status || firstStatus(input.type), id: uid(), created_at: now, updated_at: now };
      db.items.push(item);
      db.history.push({ id: uid(), item_id: item.id, from_status: null, to_status: item.status, changed_at: now });
      save(db);
      return structuredClone(item);
    },
    async updateItem(id, patch) {
      await wait();
      const db = get();
      const i = db.items.findIndex((x) => x.id === id);
      if (i < 0) throw new Error("not found");
      const prev = db.items[i];
      const next: Item = { ...prev, ...structuredClone(patch), details: { ...prev.details, ...(patch.details ?? {}) }, type: prev.type, updated_at: new Date().toISOString() };
      if (patch.status && patch.status !== prev.status)
        db.history.push({ id: uid(), item_id: id, from_status: prev.status, to_status: patch.status, changed_at: next.updated_at });
      db.items[i] = next;
      save(db);
      return structuredClone(next);
    },
    async deleteItem(id) {
      await wait();
      const db = get();
      db.items = db.items.filter((x) => x.id !== id);
      db.history = db.history.filter((h) => h.item_id !== id);
      save(db);
    },
    async listHistory(itemId) {
      return get().history.filter((h) => h.item_id === itemId).sort((a, b) => b.changed_at.localeCompare(a.changed_at));
    },
    async updateProfile(p) {
      const db = get();
      if (p.display_name) db.name = p.display_name;
      save(db);
    },
  };
}

export function isDemoChosen() {
  try { return localStorage.getItem("lensa-mode") === "demo"; } catch { return false; }
}
export function chooseDemo(on: boolean) {
  try { if (on) localStorage.setItem("lensa-mode", "demo"); else localStorage.removeItem("lensa-mode"); } catch { /* abaikan */ }
}

export function getRepo(): Repo {
  return !hasBackend || isDemoChosen() ? demoRepo() : supabaseRepo();
}
