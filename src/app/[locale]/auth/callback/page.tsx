"use client";
import { useEffect, useState } from "react";
import { useApp } from "@/components/AppProvider";
import { hasBackend, supabase } from "@/lib/repo";

/** Halaman tujuan setelah klik tautan email atau login GitHub. */
export default function AuthCallback() {
  const { locale, t } = useApp();
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!hasBackend) { window.location.replace(`/${locale}/login`); return; }
    const sb = supabase();
    const url = new URL(window.location.href);
    const desc = url.searchParams.get("error_description");
    if (desc) { setErr(desc); return; }
    const code = url.searchParams.get("code");
    const done = () => window.location.replace(`/${locale}`);
    (async () => {
      // detectSessionInUrl biasanya sudah menukar kode; kalau belum, tukar manual
      const { data } = await sb.auth.getSession();
      if (data.session) return done();
      if (code) {
        const { error } = await sb.auth.exchangeCodeForSession(code);
        if (!error) return done();
        const again = await sb.auth.getSession();
        if (again.data.session) return done();
        setErr(error.message);
      } else setErr(t.common.error);
    })();
  }, [locale, t]);

  return (
    <main className="login-wrap">
      <div className="g g2 login" role="status">
        {err ? (<><p className="err">{err}</p><a className="btn btn-soft full" href={`/${locale}/login`}>{t.login.title}</a></>)
          : (<><span className="spinner" /><p className="login-sub">{t.common.loading}</p></>)}
      </div>
    </main>
  );
}
