"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { DeadlineTag, Empty, Monogram, StatusTag } from "@/components/bits";
import { Icon } from "@/components/Icon";
import { useLocalePath } from "@/components/Shell";
import { sortItems } from "@/components/TrackView";
import { DATE_LOCALE, fmtDate, TRACK_PATH } from "@/lib/i18n";
import { daysLeft, isActive, isInProgress, TRACKS, type Item, type Track } from "@/lib/types";

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export default function Home() {
  const { t, locale, user, items, loading, openDetail, openForm } = useApp();
  const lp = useLocalePath();

  const active = useMemo(() => items.filter(isActive), [items]);
  const upcoming = useMemo(() => sortItems(active.filter((i) => { const n = daysLeft(i.deadline); return n !== null && n >= 0; }), "deadline"), [active]);
  const next = upcoming[0];
  const week = upcoming.filter((i) => (daysLeft(i.deadline) ?? 99) <= 7);
  const firstName = (user?.name ?? "").split(/\s+/)[0];

  if (!loading && !items.length) {
    return (
      <div className="page rise">
        <header className="page-head"><div className="ph-txt"><p className="eyebrow">{today(locale)}</p><h1 className="disp">{t.home.greeting(firstName)}</h1></div></header>
        <div className="g">
          <Empty icon="sparkle" title={t.home.emptyTitle} body={t.home.emptyBody}
            action={<div className="empty-actions">{TRACKS.map((k) => (
              <button key={k} className="btn btn-soft" onClick={() => openForm({ type: k })}><Icon name={k} size={17} />{t.track[k]}</button>
            ))}</div>} />
        </div>
      </div>
    );
  }

  return (
    <div className="page rise">
      <header className="page-head">
        <div className="ph-txt">
          <p className="eyebrow">{today(locale)}</p>
          <h1 className="disp">{t.home.greeting(firstName)}</h1>
          <p className="ph-sub">{items.length} {t.home.stats.tracked} · {active.length} {t.home.stats.active} · {items.filter((i) => i.favorite).length} {t.home.stats.favorites}</p>
        </div>
      </header>

      <div className="home-grid">
        <section className="g hero" aria-label={t.home.next}>
          <p className="card-label">{t.home.next}</p>
          {next ? (
            <button className="hero-btn" onClick={() => openDetail(next.id)}>
              <div className="hero-count">
                <b className="disp">{daysLeft(next.deadline) === 0 ? "0" : daysLeft(next.deadline)}</b>
                <span>{t.common.days}</span>
              </div>
              <div className="hero-txt">
                <div className="hero-tags"><span className={`tag t-${next.type}`}>{t.track[next.type]}</span><StatusTag item={next} /></div>
                <h2 className="disp">{next.title}</h2>
                <p>{[next.organization, fmtDate(next.deadline, locale, { weekday: "long", day: "numeric", month: "long" })].filter(Boolean).join(" · ")}</p>
              </div>
            </button>
          ) : <p className="muted pad">{t.home.noNext}</p>}
        </section>

        <section className="g rings" aria-label={t.home.readiness}>
          <p className="card-label">{t.home.readiness}</p>
          <div className="ring-row">
            {TRACKS.map((k) => <Ring key={k} type={k} items={items.filter((i) => i.type === k)} />)}
          </div>
        </section>

        <MonthCard items={active} />

        <section className="g list-card" aria-label={t.home.upcoming}>
          <div className="card-h"><p className="card-label">{t.home.upcoming}</p></div>
          {week.length ? (
            <ul className="mini-list">
              {week.map((i) => <MiniRow key={i.id} item={i} onOpen={() => openDetail(i.id)} />)}
            </ul>
          ) : <p className="muted pad">{t.home.nothingDue}</p>}
        </section>

        <section className="g list-card wide" aria-label={t.home.active}>
          <div className="card-h"><p className="card-label">{t.home.active}</p><span className="muted sm">{active.length}</span></div>
          <ul className="mini-list cols">
            {sortItems(active, "deadline").slice(0, 8).map((i) => <MiniRow key={i.id} item={i} onOpen={() => openDetail(i.id)} />)}
          </ul>
          <div className="card-links">
            {TRACKS.map((k) => (
              <Link key={k} href={lp("/" + TRACK_PATH[k])} className="btn btn-soft sm"><Icon name={k} size={16} />{t.nav[`${k}Short` as "jobShort"]}</Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function today(locale: string) {
  return new Intl.DateTimeFormat(DATE_LOCALE[locale as "id"], { weekday: "long", day: "numeric", month: "long" }).format(new Date());
}

function MiniRow({ item, onOpen }: { item: Item; onOpen: () => void }) {
  return (
    <li>
      <button className="mini" onClick={onOpen}>
        <Monogram item={item} size={34} />
        <span className="mini-main"><b>{item.title}</b><small>{item.organization}</small></span>
        <DeadlineTag item={item} />
      </button>
    </li>
  );
}

function Ring({ type, items }: { type: Track; items: Item[] }) {
  const { t } = useApp();
  const done = items.filter(isInProgress).length;
  const total = items.length;
  const pct = total ? done / total : 0;
  const r = 30, c = 2 * Math.PI * r;
  return (
    <div className="ring">
      <svg viewBox="0 0 76 76" width="76" height="76" aria-hidden="true">
        <circle cx="38" cy="38" r={r} className="ring-bg" />
        <circle cx="38" cy="38" r={r} className={`ring-fg rf-${type}`} strokeDasharray={c} strokeDashoffset={c * (1 - pct)} transform="rotate(-90 38 38)" />
      </svg>
      <b className="ring-pct">{Math.round(pct * 100)}%</b>
      <span className="ring-name">{t.track[type]}</span>
      <small>{t.home.progressSub(done, total)}</small>
    </div>
  );
}

function MonthCard({ items }: { items: Item[] }) {
  const { t, locale, openDetail } = useApp();
  const [offset, setOffset] = useState(0);
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const startDay = (first.getDay() + 6) % 7; // Senin sebagai hari pertama
  const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells = Math.ceil((startDay + days) / 7) * 7;
  const todayKey = ymd(now);
  const byDay = new Map<string, Item[]>();
  for (const i of items) if (i.deadline) byDay.set(i.deadline, [...(byDay.get(i.deadline) ?? []), i]);
  const [pick, setPick] = useState<string | null>(null);
  const picked = pick ? byDay.get(pick) ?? [] : [];
  const wd = Array.from({ length: 7 }, (_, k) => new Intl.DateTimeFormat(DATE_LOCALE[locale], { weekday: "narrow" }).format(new Date(2024, 0, 1 + k)));

  return (
    <section className="g month" aria-label={t.home.month}>
      <div className="card-h">
        <p className="card-label cap">{new Intl.DateTimeFormat(DATE_LOCALE[locale], { month: "long", year: "numeric" }).format(first)}</p>
        <div className="month-nav">
          <button className="icon-btn sm" onClick={() => { setOffset((o) => o - 1); setPick(null); }} aria-label="‹"><Icon name="back" size={16} /></button>
          <button className="icon-btn sm" onClick={() => { setOffset((o) => o + 1); setPick(null); }} aria-label="›"><Icon name="chev" size={16} /></button>
        </div>
      </div>
      <div className="cal" role="grid">
        {wd.map((d, k) => <span key={k} className="cal-wd">{d}</span>)}
        {Array.from({ length: cells }, (_, k) => {
          const day = k - startDay + 1;
          if (day < 1 || day > days) return <span key={k} />;
          const key = ymd(new Date(first.getFullYear(), first.getMonth(), day));
          const list = byDay.get(key) ?? [];
          return (
            <button key={k} className={`cal-d ${key === todayKey ? "today" : ""} ${pick === key ? "sel" : ""} ${list.length ? "has" : ""}`}
              disabled={!list.length} onClick={() => setPick(pick === key ? null : key)} aria-label={`${day}${list.length ? `, ${list.length}` : ""}`}>
              {day}
              {list.length > 0 && <span className="cal-dots">{list.slice(0, 3).map((i) => <i key={i.id} className={`d-${i.type}`} />)}</span>}
            </button>
          );
        })}
      </div>
      {picked.length > 0 && (
        <ul className="cal-pick">
          {picked.map((i) => (
            <li key={i.id}><button onClick={() => openDetail(i.id)}><span className={`dot d-${i.type}`} />{i.title}</button></li>
          ))}
        </ul>
      )}
    </section>
  );
}
