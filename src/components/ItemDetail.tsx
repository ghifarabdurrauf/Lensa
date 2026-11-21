"use client";
import { useEffect, useState } from "react";
import { useApp } from "./AppProvider";
import { DeadlineTag, Dialog, FavButton, Monogram, StatusTag } from "./bits";
import { Icon } from "./Icon";
import { fmtDate, fmtDateTime } from "@/lib/i18n";
import { STATUSES, type StatusChange } from "@/lib/types";

export function ItemDetail() {
  const { t, locale, items, detailId, closeDetail, update, remove, openForm, repo, toast } = useApp();
  const item = items.find((i) => i.id === detailId);
  const [history, setHistory] = useState<StatusChange[]>([]);

  useEffect(() => {
    if (!item) return;
    repo.listHistory(item.id).then(setHistory).catch(() => setHistory([]));
  }, [repo, item?.id, item?.updated_at]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!item) return null;
  const stages = STATUSES[item.type].filter((s) => s !== "rejected");
  const curIdx = stages.indexOf(item.status);
  const d = item.details;
  const st = (s: string) => t.status[s as keyof typeof t.status] ?? s;

  const facts: [string, string | null | undefined][] = [
    [t.form.deadline, item.deadline ? fmtDate(item.deadline, locale) : null],
    [t.form.opensAt, item.opens_at ? fmtDate(item.opens_at, locale) : null],
    [t.form.priority, t.priority[item.priority]],
    ...(item.type === "job" ? [
      [t.form.employmentType, d.employment_type ? t.opt[d.employment_type as keyof typeof t.opt] : null],
      [t.form.workMode, d.work_mode ? t.opt[d.work_mode as keyof typeof t.opt] : null],
      [t.form.source, d.source], [t.form.salary, d.salary],
    ] as [string, string | null | undefined][] : []),
    ...(item.type === "scholarship" ? [
      [t.form.coverage, d.coverage ? t.opt[d.coverage as keyof typeof t.opt] : null],
      [t.form.level, d.level ? t.opt[d.level as keyof typeof t.opt] : null],
    ] as [string, string | null | undefined][] : []),
    ...(item.type === "university" ? [
      [t.form.program, d.program], [t.form.intake, d.intake], [t.form.tuition, d.tuition],
      [t.form.ieltsMin, d.ielts_min != null ? String(d.ielts_min) : null],
    ] as [string, string | null | undefined][] : []),
  ];

  const setStatus = async (s: string) => {
    if (s === item.status) return;
    const r = await update(item.id, { status: s }, true);
    if (r) toast(`${t.common.statusChanged}: ${st(s)}`);
  };

  return (
    <Dialog label={item.title} onClose={closeDetail} variant="side">
      <div className="det">
        <div className="det-top">
          <button className="icon-btn btn-soft dlg-x" onClick={closeDetail} aria-label={t.common.close}><Icon name="close" size={18} /></button>
          <span className="det-spacer" />
          <FavButton item={item} size={20} />
          <button className="icon-btn btn-soft" onClick={() => { closeDetail(); openForm({ type: item.type, item }); }} aria-label={t.common.edit}><Icon name="edit" size={18} /></button>
        </div>

        <div className="det-id">
          <Monogram item={item} size={48} />
          <div>
            <div className="det-tags"><span className={`tag t-${item.type}`}>{t.track[item.type]}</span><StatusTag item={item} /><DeadlineTag item={item} /></div>
            <h2 className="det-title disp">{item.title}</h2>
            <p className="det-org">{[item.organization, item.city, item.country].filter(Boolean).join(" · ")}</p>
          </div>
        </div>

        <section aria-label={t.detail.stages} className="stages">
          {stages.map((s, i) => (
            <button key={s} className={`stage ${i < curIdx ? "done" : ""} ${i === curIdx ? "cur" : ""}`} onClick={() => setStatus(s)} aria-pressed={i === curIdx}>
              <i aria-hidden="true" /><span>{st(s)}</span>
            </button>
          ))}
        </section>
        <div className="det-actions-row">
          {item.status !== "rejected"
            ? <button className="btn btn-soft sm" onClick={() => setStatus("rejected")}>{st("rejected")}</button>
            : <button className="btn btn-soft sm" onClick={() => setStatus(stages[0])}>{st(stages[0])}</button>}
          {item.url && <a className="btn btn-soft sm" href={item.url} target="_blank" rel="noopener noreferrer"><Icon name="ext" size={16} />{t.common.openLink}</a>}
        </div>

        <dl className="facts">
          {facts.filter(([, v]) => v).map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
        </dl>

        {(item.type === "scholarship" && (d.benefits || d.requirements)) && (
          <section className="det-block">
            {d.benefits && (<><h3>{t.form.benefits}</h3><p>{d.benefits}</p></>)}
            {d.requirements && (<><h3>{t.form.requirements}</h3><p>{d.requirements}</p></>)}
          </section>
        )}

        <section className="det-block">
          <h3>{t.form.notes}</h3>
          <p className={item.notes ? "" : "muted"}>{item.notes || t.detail.noNotes}</p>
        </section>

        <section className="det-block">
          <h3>{t.detail.history}</h3>
          <ol className="hist">
            {history.map((h) => (
              <li key={h.id}><span className="hist-dot" aria-hidden="true" />
                <span>{h.from_status ? `${st(h.from_status)} → ${st(h.to_status)}` : `${t.detail.created} · ${st(h.to_status)}`}</span>
                <time dateTime={h.changed_at}>{fmtDateTime(h.changed_at, locale)}</time></li>
            ))}
          </ol>
        </section>

        <div className="det-foot">
          <button className="btn btn-danger" onClick={async () => { if (confirm(t.common.confirmDelete) && (await remove(item.id))) closeDetail(); }}>
            <Icon name="trash" size={16} />{t.common.delete}
          </button>
          <button className="btn btn-pri" onClick={() => { closeDetail(); openForm({ type: item.type, item }); }}><Icon name="edit" size={16} />{t.common.edit}</button>
        </div>
      </div>
    </Dialog>
  );
}
