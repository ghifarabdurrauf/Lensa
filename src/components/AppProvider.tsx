"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { DICTS, type Dict } from "@/lib/i18n";
import { getRepo, type Repo, type UserInfo } from "@/lib/repo";
import type { Item, ItemInput, Locale, Palette, Prefs, ThemeMode } from "@/lib/types";

interface Toast { id: number; text: string; tone?: "ok" | "err" }

interface Ctx {
  locale: Locale;
  t: Dict;
  repo: Repo;
  user: UserInfo | null;
  authReady: boolean;
  items: Item[];
  loading: boolean;
  prefs: Prefs;
  setPrefs: (p: Partial<Prefs>) => void;
  reload: () => Promise<void>;
  refreshUser: () => Promise<void>;
  create: (input: ItemInput) => Promise<Item | null>;
  update: (id: string, patch: Partial<ItemInput>, quiet?: boolean) => Promise<Item | null>;
  remove: (id: string) => Promise<boolean>;
  toast: (text: string, tone?: "ok" | "err") => void;
  // panel global
  openForm: (opts: { type: Item["type"]; item?: Item }) => void;
  openDetail: (id: string) => void;
  formState: { type: Item["type"]; item?: Item } | null;
  detailId: string | null;
  closeForm: () => void;
  closeDetail: () => void;
}

const AppCtx = createContext<Ctx | null>(null);
export const useApp = () => {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp di luar AppProvider");
  return c;
};

const PREF_KEY = "lensa-prefs";
function readPrefs(): Prefs {
  try {
    const p = JSON.parse(localStorage.getItem(PREF_KEY) || "{}");
    return { palette: (p.palette as Palette) || "sage", mode: (p.mode as ThemeMode) || "auto" };
  } catch {
    return { palette: "sage", mode: "auto" };
  }
}
export function applyPrefs(p: Prefs) {
  const dark = p.mode === "dark" || (p.mode === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const el = document.documentElement;
  el.dataset.theme = dark ? "dark" : "light";
  el.dataset.palette = p.palette === "stone" ? "sage" : p.palette;
  if (p.palette === "stone") el.dataset.theme = "dark";
}

export function AppProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const repo = useMemo(() => getRepo(), []);
  const t = DICTS[locale];
  const [user, setUser] = useState<UserInfo | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefsState] = useState<Prefs>({ palette: "sage", mode: "auto" });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [formState, setFormState] = useState<{ type: Item["type"]; item?: Item } | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const tid = useRef(0);

  const toast = useCallback((text: string, tone: "ok" | "err" = "ok") => {
    const id = ++tid.current;
    setToasts((s) => [...s, { id, text, tone }]);
    setTimeout(() => setToasts((s) => s.filter((x) => x.id !== id)), tone === "err" ? 5000 : 2400);
  }, []);

  useEffect(() => {
    const p = readPrefs();
    setPrefsState(p);
    applyPrefs(p);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyPrefs(readPrefs());
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setPrefs = useCallback((patch: Partial<Prefs>) => {
    setPrefsState((cur) => {
      const next = { ...cur, ...patch };
      try { localStorage.setItem(PREF_KEY, JSON.stringify(next)); } catch { /* abaikan */ }
      applyPrefs(next);
      repo.updateProfile({ palette: next.palette, theme_mode: next.mode }).catch(() => {});
      return next;
    });
  }, [repo]);

  const refreshUser = useCallback(async () => {
    try { setUser(await repo.getUser()); } catch { setUser(null); }
    setAuthReady(true);
  }, [repo]);

  const reload = useCallback(async () => {
    setLoading(true);
    try { setItems(await repo.listItems()); }
    catch { toast(t.common.error, "err"); }
    finally { setLoading(false); }
  }, [repo, t, toast]);

  useEffect(() => { refreshUser(); }, [refreshUser]);
  useEffect(() => { if (user) reload(); }, [user, reload]);

  const create = useCallback(async (input: ItemInput) => {
    try {
      const it = await repo.createItem(input);
      setItems((s) => [...s, it]);
      toast(t.common.saved);
      return it;
    } catch { toast(t.common.error, "err"); return null; }
  }, [repo, t, toast]);

  const update = useCallback(async (id: string, patch: Partial<ItemInput>, quiet = false) => {
    // pembaruan optimistis: tampilan langsung berubah, dikembalikan bila server menolak
    let prev: Item | undefined;
    setItems((s) => s.map((x) => {
      if (x.id !== id) return x;
      prev = x;
      return { ...x, ...patch, details: { ...x.details, ...(patch.details ?? {}) } } as Item;
    }));
    try {
      const it = await repo.updateItem(id, patch);
      setItems((s) => s.map((x) => (x.id === id ? it : x)));
      if (!quiet) toast(t.common.saved);
      return it;
    } catch {
      if (prev) setItems((s) => s.map((x) => (x.id === id ? prev! : x)));
      toast(t.common.error, "err");
      return null;
    }
  }, [repo, t, toast]);

  const remove = useCallback(async (id: string) => {
    try {
      await repo.deleteItem(id);
      setItems((s) => s.filter((x) => x.id !== id));
      toast(t.common.deleted);
      return true;
    } catch { toast(t.common.error, "err"); return false; }
  }, [repo, t, toast]);

  const value: Ctx = {
    locale, t, repo, user, authReady, items, loading, prefs, setPrefs, reload, refreshUser, create, update, remove, toast,
    openForm: (o) => setFormState(o),
    openDetail: (id) => setDetailId(id),
    formState, detailId,
    closeForm: () => setFormState(null),
    closeDetail: () => setDetailId(null),
  };

  return (
    <AppCtx.Provider value={value}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((x) => (
          <div key={x.id} className={`toast g g2 ${x.tone === "err" ? "toast-err" : ""}`}>{x.text}</div>
        ))}
      </div>
    </AppCtx.Provider>
  );
}
