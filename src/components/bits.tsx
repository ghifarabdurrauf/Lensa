"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { useApp } from "./AppProvider";
import { Icon } from "./Icon";
import { daysLeft, FINAL_STATUSES, SUCCESS_STATUSES, type Item } from "@/lib/types";

export function DeadlineTag({ item }: { item: Item }) {
  const { t } = useApp();
  const n = daysLeft(item.deadline);
  if (n === null) return <span className="tag t-mut">{t.common.noDeadline}</span>;
  if (FINAL_STATUSES.has(item.status)) return null;
  if (n < 0) return <span className="tag t-mut">{t.common.daysAgo(-n)}</span>;
  const cls = n <= 7 ? "t-hot" : n <= 30 ? `t-${item.type}` : "t-mut";
  return <span className={`tag ${cls}`}>{t.common.daysLeft(n)}</span>;
}

export function StatusTag({ item }: { item: Item }) {
  const { t } = useApp();
  const label = t.status[item.status as keyof typeof t.status] ?? item.status;
  const cls = item.status === "rejected" ? "t-mut" : SUCCESS_STATUSES.has(item.status) ? "t-ok" : `t-${item.type}`;
  return <span className={`tag ${cls}`}>{label}</span>;
}

export function FavButton({ item, size = 18 }: { item: Item; size?: number }) {
  const { t, update, toast } = useApp();
  return (
    <button
      className={`fav ${item.favorite ? "on" : ""}`}
      aria-pressed={item.favorite}
      aria-label={t.common.favorites}
      onClick={async (e) => {
        e.stopPropagation();
        const r = await update(item.id, { favorite: !item.favorite }, true);
        if (r) toast(r.favorite ? t.common.favoriteOn : t.common.favoriteOff);
      }}
    >
      <Icon name="star" size={size} filled={item.favorite} />
    </button>
  );
}

export function Monogram({ item, size = 38 }: { item: Item; size?: number }) {
  const src = (item.organization || item.title || "?").trim();
  return (
    <span className={`mono mono-${item.type}`} style={{ width: size, height: size, fontSize: size * 0.36 }} aria-hidden="true">
      {src[0]?.toUpperCase()}
    </span>
  );
}

export function PageHeader({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
  return (
    <header className="page-head">
      <div className="ph-txt">
        <h1 className="disp">{title}</h1>
        {sub && <p className="ph-sub">{sub}</p>}
      </div>
      {children && <div className="ph-tools">{children}</div>}
    </header>
  );
}

/** Panel/lembar dialog: bottom sheet di HP, panel melayang di layar lebar. */
export function Dialog({ label, onClose, children, variant = "center" }: { label: string; onClose: () => void; children: ReactNode; variant?: "center" | "side" }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const first = ref.current?.querySelector<HTMLElement>("input,select,textarea,button:not(.dlg-x)");
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && ref.current) {
        const f = Array.from(ref.current.querySelectorAll<HTMLElement>("a[href],button:not([disabled]),input,select,textarea")).filter((x) => x.offsetParent !== null);
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; prev?.focus?.(); };
  }, [onClose]);
  return (
    <div className={`overlay ov-${variant}`} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} className={`g g2 dlg dlg-${variant}`} role="dialog" aria-modal="true" aria-label={label}>
        <div className="grab" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}

export function Empty({ icon, title, body, action }: { icon: string; title?: string; body: string; action?: ReactNode }) {
  return (
    <div className="empty">
      <span className="empty-ic"><Icon name={icon} size={26} /></span>
      {title && <h2>{title}</h2>}
      <p>{body}</p>
      {action}
    </div>
  );
}
