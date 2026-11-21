"use client";
import { useEffect, useMemo, useState, type DragEvent } from "react";
import { useApp } from "./AppProvider";
import { DeadlineTag, Empty, FavButton, Monogram, PageHeader, StatusTag } from "./bits";
import { Icon } from "./Icon";
import { daysLeft, STATUSES, type Item, type Track } from "@/lib/types";

type View = "board" | "list";
type SortKey = "deadline" | "updated" | "title" | "priority";
const PRIO = { high: 0, medium: 1, low: 2 };

export function sortItems(list: Item[], key: SortKey) {
  const s = [...list];
  if (key === "deadline") s.sort((a, b) => {
    const da = daysLeft(a.deadline), db = daysLeft(b.deadline);
    const va = da === null ? 1e9 : da < 0 ? 1e8 - da : da;
    const vb = db === null ? 1e9 : db < 0 ? 1e8 - db : db;
    return va - vb;
  });
  if (key === "updated") s.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  if (key === "title") s.sort((a, b) => a.title.localeCompare(b.title));
  if (key === "priority") s.sort((a, b) => PRIO[a.priority] - PRIO[b.priority]);
  return s;
}

export function TrackView({ type }: { type: Track }) {
  const { t, items, loading, openForm, openDetail, update, toast } = useApp();
  const [view, setView] = useState<View>("list");
  const [q, setQ] = useState("");
  const [fav, setFav] = useState(false);
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState<SortKey>("deadline");
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const vkey = `lensa-view-${type}`;

  useEffect(() => {
    let v: string | null = null;
    try { v = localStorage.getItem(vkey); } catch { /* abaikan */ }
    if (v === "board" || v === "list") setView(v);
    else setView(type === "job" && window.innerWidth >= 900 ? "board" : "list");
  }, [type, vkey]);
  const changeView = (v: View) => { setView(v); try { localStorage.setItem(vkey, v); } catch { /* abaikan */ } };

  const mine = items.filter((i) => i.type === type);
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return sortItems(mine.filter((i) =>
      (!fav || i.favorite) && (!status || i.status === status) &&
      (!needle || [i.title, i.organization, i.city, i.country, i.notes].some((x) => x?.toLowerCase().includes(needle)))), sort);
  }, [mine, q, fav, status, sort]);

  const st = (s: string) => t.status[s as keyof typeof t.status] ?? s;
  const favCount = mine.filter((i) => i.favorite).length;
  const statuses = STATUSES[type];

  const onDrop = async (e: DragEvent, s: string) => {
    e.preventDefault();
    setOver(null);
    const id = dragId ?? e.dataTransfer.getData("text/plain");
    setDragId(null);
    const it = items.find((x) => x.id === id);
    if (!it || it.status === s) return;
    const r = await update(id, { status: s }, true);
    if (r) toast(`${t.common.statusChanged}: ${st(s)}`);
  };

  return (
    <div className="page rise">
      <PageHeader title={t.track[type]} sub={`${mine.length} ${t.home.stats.tracked} · ${favCount} ${t.home.stats.favorites}`}>
        <div className="g seg seg-g" role="group" aria-label="View">
          <button aria-pressed={view === "board"} onClick={() => changeView("board")}><Icon name="grid" size={15} /> {t.common.board}</button>
          <button aria-pressed={view === "list"} onClick={() => changeView("list")}><Icon name="list" size={15} /> {t.common.list}</button>
        </div>
        <button className="btn btn-pri hide-m" onClick={() => openForm({ type })}><Icon name="plus" size={17} />{t.common.add}</button>
      </PageHeader>

      <div className="toolbar">
        <label className="g search">
          <Icon name="search" size={17} />
          <span className="sr-only">{t.common.search}</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`${t.common.search} ${t.trackOne[type]}…`} />
        </label>
        <div className="chips">
          <button className="chip" aria-pressed={!fav && !status} onClick={() => { setFav(false); setStatus(""); }}>{t.common.all} {mine.length}</button>
          <button className="chip" aria-pressed={fav} onClick={() => setFav((v) => !v)}><Icon name="star" size={14} filled={fav} />{t.common.favorites}</button>
          {view === "list" && (
            <select className="chip chip-sel" value={status} onChange={(e) => setStatus(e.target.value)} aria-label={t.form.status}>
              <option value="">{t.form.status}: {t.common.all.toLowerCase()}</option>
              {statuses.map((s) => <option key={s} value={s}>{st(s)}</option>)}
            </select>
          )}
          <select className="chip chip-sel" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label={t.common.sort}>
            {(["deadline", "updated", "title", "priority"] as const).map((k) => <option key={k} value={k}>{t.sort[k]}</option>)}
          </select>
        </div>
      </div>

      {loading && !items.length ? <div className="skel-list">{[0, 1, 2].map((i) => <div key={i} className="g skel" />)}</div>
        : !mine.length ? (
          <div className="g">
            <Empty icon={type} body={t.empty[type]} action={<button className="btn btn-pri" onClick={() => openForm({ type })}><Icon name="plus" size={17} />{t.common.add}</button>} />
          </div>
        ) : view === "board" ? (
          <div className="board" role="list">
            {statuses.map((s) => {
              const col = filtered.filter((i) => i.status === s);
              return (
                <section key={s} className={`g col ${over === s ? "over" : ""} ${s === "rejected" ? "col-rej" : ""}`} aria-label={st(s)}
                  onDragOver={(e) => { e.preventDefault(); setOver(s); }} onDragLeave={() => setOver((o) => (o === s ? null : o))} onDrop={(e) => onDrop(e, s)}>
                  <header className="col-h"><span className={`dot d-${s === "rejected" ? "mut" : type}`} />{st(s)}<span className="col-n">{col.length}</span></header>
                  <div className="col-body">
                    {col.map((i) => (
                      <article key={i.id} className={`card ${dragId === i.id ? "dragging" : ""}`} draggable
                        onDragStart={(e) => { setDragId(i.id); e.dataTransfer.setData("text/plain", i.id); e.dataTransfer.effectAllowed = "move"; }}
                        onDragEnd={() => { setDragId(null); setOver(null); }}>
                        <button className="card-hit" onClick={() => openDetail(i.id)} aria-label={i.title} />
                        <div className="card-co"><Monogram item={i} size={30} /><div><b>{i.organization || "—"}</b><small>{i.city || i.country || ""}</small></div><FavButton item={i} size={16} /></div>
                        <h3>{i.title}</h3>
                        <div className="card-f"><span className="tag t-mut">{t.priority[i.priority]}</span><DeadlineTag item={i} /></div>
                      </article>
                    ))}
                    {!col.length && <div className="drop">{t.board.dropHere}</div>}
                  </div>
                </section>
              );
            })}
          </div>
        ) : !filtered.length ? (
          <div className="g"><Empty icon="search" body={t.empty.filtered} /></div>
        ) : (
          <ul className="g rows" role="list">
            {filtered.map((i) => (
              <li key={i.id} className="row">
                <button className="row-hit" onClick={() => openDetail(i.id)} aria-label={i.title} />
                <Monogram item={i} />
                <div className="row-main"><b>{i.title}</b><small>{[i.organization, i.city || i.country].filter(Boolean).join(" · ")}</small></div>
                <div className="row-tags"><StatusTag item={i} /><DeadlineTag item={i} /></div>
                <FavButton item={i} />
                <Icon name="chev" size={15} className="row-chev" />
              </li>
            ))}
          </ul>
        )}
    </div>
  );
}
