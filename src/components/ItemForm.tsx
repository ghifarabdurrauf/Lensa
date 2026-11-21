"use client";
import { useState, type FormEvent } from "react";
import { useApp } from "./AppProvider";
import { Dialog } from "./bits";
import { Icon } from "./Icon";
import { STATUSES, type ItemInput, type Priority } from "@/lib/types";

type FormState = Omit<ItemInput, "details"> & { details: Record<string, string> };

export function ItemForm() {
  const { t, formState, closeForm, create, update } = useApp();
  const type = formState!.type;
  const editing = formState!.item;
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [f, setF] = useState<FormState>(() => {
    const d = editing?.details ?? {};
    return {
      type,
      title: editing?.title ?? "", organization: editing?.organization ?? "", country: editing?.country ?? "", city: editing?.city ?? "",
      url: editing?.url ?? "", deadline: editing?.deadline ?? "", opens_at: editing?.opens_at ?? "",
      status: editing?.status ?? STATUSES[type][0], priority: editing?.priority ?? "medium",
      favorite: editing?.favorite ?? false, notes: editing?.notes ?? "",
      details: Object.fromEntries(Object.entries(d).map(([k, v]) => [k, v == null ? "" : String(v)])),
    };
  });
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((s) => ({ ...s, [k]: v }));
  const setD = (k: string, v: string) => setF((s) => ({ ...s, details: { ...s.details, [k]: v } }));
  const one = t.trackOne[type];

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!f.title.trim()) { setErr(t.form.required); return; }
    setBusy(true);
    const details: Record<string, string | number | null> = { ...f.details };
    if (type === "university") {
      const v = String(details.ielts_min ?? "").replace(",", ".");
      details.ielts_min = v === "" ? null : Number(v);
    }
    const payload = { ...f, details } as unknown as ItemInput;
    const ok = editing ? await update(editing.id, payload) : await create(payload);
    setBusy(false);
    if (ok) closeForm();
  }

  const sel = (k: string, opts: string[]) => (
    <select id={k} className="input" value={f.details[k] ?? ""} onChange={(e) => setD(k, e.target.value)}>
      <option value="">—</option>
      {opts.map((o) => <option key={o} value={o}>{t.opt[o as keyof typeof t.opt]}</option>)}
    </select>
  );

  return (
    <Dialog label={editing ? t.form.editTitle(one) : t.form.newTitle(one)} onClose={closeForm}>
      <form onSubmit={submit} className="form" noValidate>
        <div className="dlg-head">
          <button type="button" className="link-btn" onClick={closeForm}>{t.common.cancel}</button>
          <h2 className="sheet-title">{editing ? t.form.editTitle(one) : t.form.newTitle(one)}</h2>
          <button type="submit" className="link-btn strong" disabled={busy}>{busy ? t.common.saving : t.common.save}</button>
        </div>

        <div className="form-body">
          <div className="field">
            <label htmlFor="title">{t.form.title[type]} *</label>
            <input id="title" className="input" value={f.title} placeholder={t.form.titlePh[type]}
              onChange={(e) => { set("title", e.target.value); setErr(null); }} aria-invalid={!!err} aria-describedby={err ? "title-err" : undefined} />
            {err && <span id="title-err" className="err">{err}</span>}
          </div>
          <div className="field">
            <label htmlFor="org">{t.form.organization[type]}</label>
            <input id="org" className="input" value={f.organization ?? ""} onChange={(e) => set("organization", e.target.value)} />
          </div>
          <div className="row2">
            <div className="field"><label htmlFor="country">{t.form.country}</label><input id="country" className="input" value={f.country ?? ""} onChange={(e) => set("country", e.target.value)} /></div>
            <div className="field"><label htmlFor="city">{t.form.city}</label><input id="city" className="input" value={f.city ?? ""} onChange={(e) => set("city", e.target.value)} /></div>
          </div>
          <div className="row2">
            <div className="field"><label htmlFor="deadline">{t.form.deadline}</label><input id="deadline" type="date" className="input" value={f.deadline ?? ""} onChange={(e) => set("deadline", e.target.value)} /></div>
            <div className="field"><label htmlFor="opens">{t.form.opensAt}</label><input id="opens" type="date" className="input" value={f.opens_at ?? ""} onChange={(e) => set("opens_at", e.target.value)} /></div>
          </div>
          <div className="row2">
            <div className="field"><label htmlFor="status">{t.form.status}</label>
              <select id="status" className="input" value={f.status} onChange={(e) => set("status", e.target.value)}>
                {STATUSES[type].map((s) => <option key={s} value={s}>{t.status[s as keyof typeof t.status]}</option>)}
              </select></div>
            <div className="field"><label htmlFor="prio">{t.form.priority}</label>
              <select id="prio" className="input" value={f.priority} onChange={(e) => set("priority", e.target.value as Priority)}>
                {(["high", "medium", "low"] as const).map((p) => <option key={p} value={p}>{t.priority[p]}</option>)}
              </select></div>
          </div>
          <div className="field">
            <label htmlFor="url">{t.form.url}</label>
            <input id="url" type="url" inputMode="url" className="input" placeholder="https://" value={f.url ?? ""} onChange={(e) => set("url", e.target.value)} />
          </div>

          <div className="form-sep"><span>{t.form.details}</span></div>

          {type === "job" && (<>
            <div className="row2">
              <div className="field"><label htmlFor="employment_type">{t.form.employmentType}</label>{sel("employment_type", ["full_time", "internship", "contract", "part_time"])}</div>
              <div className="field"><label htmlFor="work_mode">{t.form.workMode}</label>{sel("work_mode", ["onsite", "hybrid", "remote"])}</div>
            </div>
            <div className="row2">
              <div className="field"><label htmlFor="source">{t.form.source}</label><input id="source" className="input" placeholder="LinkedIn, Glints…" value={f.details.source ?? ""} onChange={(e) => setD("source", e.target.value)} /></div>
              <div className="field"><label htmlFor="salary">{t.form.salary}</label><input id="salary" className="input" value={f.details.salary ?? ""} onChange={(e) => setD("salary", e.target.value)} /></div>
            </div>
          </>)}
          {type === "scholarship" && (<>
            <div className="row2">
              <div className="field"><label htmlFor="coverage">{t.form.coverage}</label>{sel("coverage", ["full", "partial"])}</div>
              <div className="field"><label htmlFor="level">{t.form.level}</label>{sel("level", ["s2", "s3", "exchange"])}</div>
            </div>
            <div className="field"><label htmlFor="benefits">{t.form.benefits}</label><textarea id="benefits" className="input" rows={2} value={f.details.benefits ?? ""} onChange={(e) => setD("benefits", e.target.value)} /></div>
            <div className="field"><label htmlFor="requirements">{t.form.requirements}</label><textarea id="requirements" className="input" rows={2} value={f.details.requirements ?? ""} onChange={(e) => setD("requirements", e.target.value)} /></div>
          </>)}
          {type === "university" && (<>
            <div className="field"><label htmlFor="program">{t.form.program}</label><input id="program" className="input" value={f.details.program ?? ""} onChange={(e) => setD("program", e.target.value)} /></div>
            <div className="row3">
              <div className="field"><label htmlFor="intake">{t.form.intake}</label><input id="intake" className="input" placeholder="Sep 2027" value={f.details.intake ?? ""} onChange={(e) => setD("intake", e.target.value)} /></div>
              <div className="field"><label htmlFor="tuition">{t.form.tuition}</label><input id="tuition" className="input" value={f.details.tuition ?? ""} onChange={(e) => setD("tuition", e.target.value)} /></div>
              <div className="field"><label htmlFor="ielts_min">{t.form.ieltsMin}</label><input id="ielts_min" className="input" inputMode="decimal" placeholder="6.5" value={f.details.ielts_min ?? ""} onChange={(e) => setD("ielts_min", e.target.value)} /></div>
            </div>
          </>)}

          <div className="field">
            <label htmlFor="notes">{t.form.notes}</label>
            <textarea id="notes" className="input" rows={3} placeholder={t.form.notesPh} value={f.notes ?? ""} onChange={(e) => set("notes", e.target.value)} />
          </div>
          <label className="check">
            <input type="checkbox" checked={f.favorite} onChange={(e) => set("favorite", e.target.checked)} />
            <Icon name="star" size={17} filled={f.favorite} /> {t.common.favorites}
          </label>
        </div>
        <div className="form-foot">
          <button type="button" className="btn btn-soft" onClick={closeForm}>{t.common.cancel}</button>
          <button type="submit" className="btn btn-pri" disabled={busy}>{busy ? t.common.saving : t.common.save}</button>
        </div>
      </form>
    </Dialog>
  );
}
