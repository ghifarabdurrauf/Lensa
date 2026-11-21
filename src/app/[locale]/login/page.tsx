"use client";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";
import { Icon } from "@/components/Icon";
import { LangSwitch } from "@/components/Shell";
import { chooseDemo, hasBackend, supabase } from "@/lib/repo";

export default function Login() {
  const { t, locale, user, authReady } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const callback = () => `${window.location.origin}/${locale}/auth/callback`;

  useEffect(() => { if (authReady && user) router.replace(`/${locale}`); }, [authReady, user, router, locale]);

  async function sendLink(e: FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) { setErr(t.form.required); return; }
    setBusy(true); setErr(null);
    const { error } = await supabase().auth.signInWithOtp({ email, options: { emailRedirectTo: callback() } });
    setBusy(false);
    if (error) setErr(error.message); else setSent(true);
  }

  async function github() {
    setErr(null);
    const { error } = await supabase().auth.signInWithOAuth({ provider: "github", options: { redirectTo: callback() } });
    if (error) setErr(error.message);
  }

  function demo() {
    chooseDemo(true);
    window.location.href = `/${locale}`; // muat ulang supaya aplikasi memakai penyimpanan demo
  }

  return (
    <main className="login-wrap">
      <div className="login-lang"><LangSwitch /></div>
      <section className="g g2 login rise" aria-labelledby="lt">
        <span className="brand-icon lg" aria-hidden="true"><span /></span>
        <h1 id="lt" className="disp">{t.login.title}</h1>
        <p className="login-sub">{t.login.sub}</p>

        {hasBackend ? (
          sent ? (
            <div className="login-sent" role="status"><Icon name="mail" size={22} /><p>{t.login.sent}</p></div>
          ) : (
            <>
              <form onSubmit={sendLink} className="login-form" noValidate>
                <div className="field">
                  <label htmlFor="em">{t.login.email}</label>
                  <input id="em" type="email" autoComplete="email" inputMode="email" className="input" placeholder={t.login.emailPh}
                    value={email} onChange={(e) => { setEmail(e.target.value); setErr(null); }} aria-invalid={!!err} />
                </div>
                <button className="btn btn-pri full" disabled={busy}><Icon name="mail" size={17} />{busy ? t.common.loading : t.login.send}</button>
              </form>
              <div className="or"><span>{t.login.or}</span></div>
              <button className="btn btn-soft full" onClick={github}><Icon name="github" size={18} />{t.login.github}</button>
            </>
          )
        ) : <p className="login-note">{t.login.noBackend}</p>}

        {err && <p className="err" role="alert">{err}</p>}
        <button className={`btn ${hasBackend ? "btn-ghost" : "btn-pri"} full`} onClick={demo}><Icon name="sparkle" size={17} />{t.login.demo}</button>
      </section>
    </main>
  );
}
