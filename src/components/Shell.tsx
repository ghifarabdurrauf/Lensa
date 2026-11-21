"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useApp } from "./AppProvider";
import { Icon } from "./Icon";
import { ItemForm } from "./ItemForm";
import { ItemDetail } from "./ItemDetail";
import { TRACK_PATH } from "@/lib/i18n";
import { LOCALES, TRACKS, type Locale, type Track } from "@/lib/types";

export function Wall() {
  return (
    <div className="wall" aria-hidden="true">
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <defs><filter id="wb"><feGaussianBlur stdDeviation="60" /></filter></defs>
        <g filter="url(#wb)" opacity=".7">
          <ellipse cx="1150" cy="180" rx="380" ry="230" fill="var(--blob1)" />
          <ellipse cx="260" cy="760" rx="420" ry="220" fill="var(--blob2)" />
          <ellipse cx="760" cy="520" rx="260" ry="160" fill="var(--blob3)" />
        </g>
        <g fill="none" stroke="var(--wline)" strokeWidth="1.2">
          {Array.from({ length: 8 }, (_, i) => {
            const y = 150 + i * 95;
            return <path key={i} d={`M-40 ${y} C 320 ${y - 70}, 640 ${y + 90}, 960 ${y} S 1380 ${y - 60}, 1500 ${y + 10}`} />;
          })}
        </g>
      </svg>
    </div>
  );
}

export function useLocalePath() {
  const { locale } = useApp();
  return (p: string) => `/${locale}${p === "/" ? "" : p}`;
}

export function LangSwitch({ compact = false }: { compact?: boolean }) {
  const { locale } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const go = (l: Locale) => {
    document.cookie = `lensa-locale=${l};path=/;max-age=31536000;samesite=lax`;
    const rest = pathname.split("/").slice(2).join("/");
    router.replace(`/${l}${rest ? "/" + rest : ""}`);
  };
  return (
    <div className="seg" role="group" aria-label="Language" style={compact ? { width: 150 } : undefined}>
      {LOCALES.map((l) => (
        <button key={l} aria-pressed={l === locale} onClick={() => go(l)} lang={l}>{l.toUpperCase()}</button>
      ))}
    </div>
  );
}

function Brand() {
  return (
    <span className="brand">
      <span className="brand-icon" aria-hidden="true"><span /></span>
      <b className="disp">Lensa</b>
    </span>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const { t, user, authReady, items, repo, formState, detailId, openForm } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const lp = useLocalePath();
  const seg = pathname.split("/")[2] ?? "";
  const bare = seg === "login" || seg === "auth";
  const [chooser, setChooser] = useState(false);

  useEffect(() => {
    if (authReady && !user && !bare) router.replace(lp("/login"));
  }, [authReady, user, bare, router, lp]);

  if (bare) return (<><Wall />{children}</>);
  if (!authReady || !user) return (<><Wall /><div className="boot" aria-busy="true"><span className="spinner" /></div></>);

  const counts = Object.fromEntries(TRACKS.map((k) => [k, items.filter((i) => i.type === k).length])) as Record<Track, number>;
  const currentTrack = (Object.entries(TRACK_PATH).find(([, v]) => v === seg)?.[0] as Track | undefined) ?? null;
  const nav = [
    { key: "home", href: "/", icon: "home", label: t.nav.home, short: t.nav.homeShort, on: seg === "" },
    ...TRACKS.map((k) => ({ key: k, href: "/" + TRACK_PATH[k], icon: k, label: t.nav[k], short: t.nav[`${k}Short` as "jobShort"], on: seg === TRACK_PATH[k], count: counts[k] })),
  ];
  const add = () => (currentTrack ? openForm({ type: currentTrack }) : setChooser(true));

  return (
    <>
      <a href="#main" className="skip">Skip to content</a>
      <Wall />
      <div className="shell">
        <aside className="g side" aria-label="Navigasi">
          <Link href={lp("/")} className="side-brand"><Brand /></Link>
          <nav className="side-nav">
            {nav.slice(0, 1).map(({ key, ...n }) => <SideLink key={key} {...n} href={lp(n.href)} />)}
            <div className="side-label">{t.nav.tracks}</div>
            {nav.slice(1).map(({ key, ...n }) => <SideLink key={key} {...n} href={lp(n.href)} />)}
            <div className="side-label">{t.nav.tools}</div>
            <SideLink icon="settings" label={t.nav.settings} href={lp("/settings")} on={seg === "settings"} />
          </nav>
          <div className="side-foot">
            {repo.mode === "demo" && <p className="demo-note">{t.common.demo}</p>}
            <div className="side-lang"><LangSwitch /></div>
            <Link href={lp("/settings")} className="me">
              <span className="avatar" aria-hidden="true">{initials(user.name)}</span>
              <span className="me-txt"><b>{user.name}</b><small>{user.email ?? "Demo"}</small></span>
            </Link>
          </div>
        </aside>

        <main id="main" className="main" tabIndex={-1}>{children}</main>
      </div>

      <div className="tabwrap">
        <nav className="g tabbar" aria-label="Navigasi">
          {nav.map((n) => (
            <Link key={n.key} href={lp(n.href)} className={`tab ${n.on ? "on" : ""}`} aria-current={n.on ? "page" : undefined}>
              <Icon name={n.icon} size={21} /><span>{n.short}</span>
            </Link>
          ))}
        </nav>
        <button className="g icon-btn fab" onClick={add} aria-label={t.common.add}><Icon name="plus" size={24} /></button>
      </div>

      {chooser && <AddChooser onPick={(type) => { setChooser(false); openForm({ type }); }} onClose={() => setChooser(false)} />}
      {formState && <ItemForm key={formState.item?.id ?? formState.type} />}
      {detailId && <ItemDetail key={detailId} />}
    </>
  );
}

function SideLink({ href, icon, label, on, count }: { href: string; icon: string; label: string; on: boolean; count?: number }) {
  return (
    <Link href={href} className={`side-link ${on ? "on" : ""}`} aria-current={on ? "page" : undefined} title={label}>
      <Icon name={icon} /><span className="side-text">{label}</span>
      {count !== undefined && count > 0 && <span className="side-count">{count}</span>}
    </Link>
  );
}

export function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";
}

function AddChooser({ onPick, onClose }: { onPick: (t: Track) => void; onClose: () => void }) {
  const { t } = useApp();
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="g g2 sheet chooser" role="dialog" aria-modal="true" aria-label={t.common.add} onClick={(e) => e.stopPropagation()}>
        <div className="grab" aria-hidden="true" />
        <h2 className="sheet-title">{t.common.add}</h2>
        <div className="chooser-grid">
          {TRACKS.map((k) => (
            <button key={k} className={`chooser-btn t-${k}`} onClick={() => onPick(k)} autoFocus={k === "job"}>
              <Icon name={k} size={24} /><span>{t.track[k]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
