export type Track = "job" | "scholarship" | "university";
export const TRACKS: Track[] = ["job", "scholarship", "university"];

/** Tahapan per jalur. Urutan = urutan kemajuan. Status terakhir selalu "rejected". */
export const STATUSES: Record<Track, string[]> = {
  job: ["saved", "applied", "test", "interview", "offer", "rejected"],
  scholarship: ["research", "preparing", "submitted", "selection", "accepted", "rejected"],
  university: ["not_applied", "preparing", "submitted", "loa_conditional", "loa_unconditional", "rejected"],
};

/** Status yang dianggap selesai (tidak perlu ditindaklanjuti lagi). */
export const FINAL_STATUSES = new Set(["offer", "accepted", "loa_unconditional", "rejected"]);
export const SUCCESS_STATUSES = new Set(["offer", "accepted", "loa_conditional", "loa_unconditional"]);

export type Priority = "high" | "medium" | "low";

export interface JobDetails {
  employment_type?: string | null; // full_time | internship | contract | part_time
  work_mode?: string | null; // onsite | hybrid | remote
  source?: string | null;
  salary?: string | null;
}
export interface ScholarshipDetails {
  coverage?: string | null; // full | partial
  level?: string | null; // s2 | s3 | exchange
  benefits?: string | null;
  requirements?: string | null;
}
export interface UniversityDetails {
  program?: string | null;
  intake?: string | null;
  tuition?: string | null;
  ielts_min?: number | null;
}

export interface Item {
  id: string;
  type: Track;
  title: string;
  organization: string | null;
  country: string | null;
  city: string | null;
  url: string | null;
  deadline: string | null; // yyyy-mm-dd
  opens_at: string | null; // yyyy-mm-dd
  status: string;
  priority: Priority;
  favorite: boolean;
  notes: string | null;
  details: JobDetails & ScholarshipDetails & UniversityDetails;
  created_at: string;
  updated_at: string;
}

export interface StatusChange {
  id: string;
  item_id: string;
  from_status: string | null;
  to_status: string;
  changed_at: string;
}

export type ItemInput = Omit<Item, "id" | "created_at" | "updated_at">;

export type Locale = "id" | "en" | "fr";
export const LOCALES: Locale[] = ["id", "en", "fr"];
export type Palette = "sage" | "sand" | "stone";
export type ThemeMode = "light" | "dark" | "auto";

export interface Prefs {
  palette: Palette;
  mode: ThemeMode;
}

export function firstStatus(t: Track) {
  return STATUSES[t][0];
}

/** Sisa hari dari hari ini (zona waktu perangkat). null bila tanpa tenggat. */
export function daysLeft(date: string | null): number | null {
  if (!date) return null;
  const [y, m, d] = date.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function isActive(i: Item) {
  return !FINAL_STATUSES.has(i.status);
}

/** "Berjalan" = sudah melewati tahap pertama dan belum ditolak. */
export function isInProgress(i: Item) {
  return i.status !== firstStatus(i.type) && i.status !== "rejected";
}
