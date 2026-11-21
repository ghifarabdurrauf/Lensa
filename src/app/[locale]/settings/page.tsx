"use client";
import { useEffect, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { PageHeader } from "@/components/bits";
import { Icon } from "@/components/Icon";
import { initials, LangSwitch } from "@/components/Shell";
import { chooseDemo } from "@/lib/repo";
import type { Item, Palette, ThemeMode } from "@/lib/types";

const CSV_COLS = ["type", "title", "organization", "country", "city", "status", "priority", "favorite", "deadline", "opens_at", "url", "notes", "created_at", "updated_at"] as const;

function toCsv(items: Item[]) {
  const detailKeys = Array.from(new Set(items.flatMap((i) => Object.keys(i.details ?? {})))).sort();
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = [...CSV_COLS, ...detailKeys];
  const rows = items.map((i) => [...CSV_COLS.map((c) => esc(i[c])), ...detailKeys.map((k) => esc((i.details as Record<string, unknown>)[k]))].join(","));
  return "﻿" + [head.join(","), ...rows].join("\n"); // BOM supaya Excel membaca huruf beraksen dengan benar
}

export default function Settings() {
  const { t, user, items, prefs, setPrefs, repo, refreshUser, toast, locale } = useApp();
  const [name, setName] = useState(user?.name ?? "");
  useEffect(() => setName(user?.name ?? ""), [user?.name]);

  const saveName = async () => {
    const v = name.trim();
    if (!v || v === user?.name) return;
    try { await repo.updateProfile({ display_name: v }); await refreshUser(); toast(t.common.saved); }
    catch { toast(t.common.error, "err"); }
  };

  const exportCsv = () => {
    const blob = new Blob([toCsv(items)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `lensa-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const signOut = async () => {
    await repo.signOut();
    chooseDemo(false);
    window.location.href = `/${locale}/login`;
  };

  const palettes: { k: Palette; sw: string[] }[] = [
    { k: "sage", sw: ["#ECEAE5", "#B9CBC0", "#355C50"] },
    { k: "sand", sw: ["#F1ECE5", "#D8C3A6", "#5E4A39"] },
    { k: "stone", sw: ["#16191C", "#2C4A44", "#9EC2B4"] },
  ];

  return (
    <div className="page rise narrow">
      <PageHeader title={t.settings.title} />

      <section className="g set-group" aria-label={t.settings.profile}>
        <div className="set-profile">
          <span className="avatar lg" aria-hidden="true">{initials(user?.name ?? "")}</span>
          <div className="field grow">
            <label htmlFor="dn">{t.settings.name}</label>
            <input id="dn" className="input" value={name} onChange={(e) => setName(e.target.value)} onBlur={saveName}
              onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()} />
          </div>
        </div>
        <p className="muted sm">{user?.email ?? t.common.demo}</p>
      </section>

      <section className="g set-group" aria-label={t.settings.language}>
        <div className="set-row"><span>{t.settings.language}</span><LangSwitch /></div>
        <div className="set-row">
          <span>{t.settings.theme}</span>
          <div className="seg" role="group" aria-label={t.settings.theme}>
            {(["light", "dark", "auto"] as ThemeMode[]).map((m) => (
              <button key={m} aria-pressed={prefs.mode === m} disabled={prefs.palette === "stone"} onClick={() => setPrefs({ mode: m })}>{t.settings[m]}</button>
            ))}
          </div>
        </div>
        <div className="set-row col">
          <span>{t.settings.palette}</span>
          <div className="pal-row">
            {palettes.map((p) => (
              <button key={p.k} className={`pal ${prefs.palette === p.k ? "on" : ""}`} aria-pressed={prefs.palette === p.k} onClick={() => setPrefs({ palette: p.k })}>
                <span className="pal-sw" aria-hidden="true">{p.sw.map((c) => <i key={c} style={{ background: c }} />)}</span>
                <span>{t.settings[p.k]}</span>
                {prefs.palette === p.k && <Icon name="check" size={15} />}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="g set-group" aria-label={t.settings.data}>
        <button className="set-action" onClick={exportCsv} disabled={!items.length}>
          <span className="set-ic"><Icon name="download" size={18} /></span>
          <span className="grow"><b>{t.settings.export}</b><small>{t.settings.exportSub} · {items.length}</small></span>
          <Icon name="chev" size={15} />
        </button>
      </section>

      <section className="g set-group" aria-label={t.settings.integrations}>
        <div className="set-action static">
          <span className="set-ic"><Icon name="cal" size={18} /></span>
          <span className="grow"><b>{t.settings.integrations}</b><small>{t.settings.soonBody}</small></span>
          <span className="tag t-mut">{t.settings.soon}</span>
        </div>
      </section>

      <button className="btn btn-danger wide-btn" onClick={signOut}><Icon name="logout" size={17} />{t.common.signOut}</button>
    </div>
  );
}
