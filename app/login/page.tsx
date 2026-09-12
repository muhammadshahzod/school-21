"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState, type FormEvent } from "react";

export default function LoginPage() {
  const [visible, setVisible] = useState(false);
  const [notice, setNotice] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  function submit(event: FormEvent) {
    event.preventDefault();
    setNotice(
      "Email/parol orqali kirish hozircha ulanmagan. Google orqali kiring.",
    );
  }
  async function googleSignIn() {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/feed" });
  }
  return (
    <div id="main-content" className="page-container login-page">
      <section className="login-art">
        <div className="eyebrow">PIRLARDAN. PIRLAR UCHUN.</div>
        <h1>
          Birga <br />
          ko‘proq <br />
          <span>yaratamiz.</span>
        </h1>
        <p>
          Bitta kampus. Turli g‘oyalar.
          <br />
          Sizni tushunadigan hamjamiyat.
        </p>
        <div className="login-art-symbol" aria-hidden="true">
          <span>21</span>
          <ArrowUpRight strokeWidth={1} />
        </div>
        <div className="login-art-footer">
          <span>PEER TO PEER. ALWAYS.</span>
          <span>TASHKENT / UZ</span>
        </div>
      </section>
      <section className="login-form-panel">
        <div className="login-form-inner">
          <span className="eyebrow">DAVRANGIZGA XUSH KELIBSIZ</span>
          <h2>
            Yana ko‘rishganimizdan
            <br />
            xursandmiz<span>.</span>
          </h2>
          <p className="muted login-description">
            Kiring va suhbatni davom ettiring.
          </p>
          <form className="stack-form" onSubmit={submit}>
            <label className="field">
              <span>Email manzilingiz</span>
              <input
                type="email"
                name="email"
                placeholder="ism@student.21-school.uz"
                autoComplete="email"
                required
              />
            </label>
            <label className="field">
              <span>Parol</span>
              <span className="password-field">
                <input
                  type={visible ? "text" : "password"}
                  name="password"
                  placeholder="Parolingizni kiriting"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="icon-button"
                  aria-label={
                    visible ? "Parolni yashirish" : "Parolni ko‘rsatish"
                  }
                  aria-pressed={visible}
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>
            <button
              type="submit"
              className="button button-primary login-submit"
            >
              Kirish
              <ArrowRight size={18} />
            </button>
          </form>
          <div className="login-divider">
            <span />
            yoki
            <span />
          </div>
          <button
            type="button"
            className="button google-button"
            disabled={googleLoading}
            onClick={googleSignIn}
          >
            <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true">
              <path
                fill="currentColor"
                d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.23c1.89-1.74 2.99-4.3 2.99-7.36ZM12 22c2.7 0 4.96-.9 6.61-2.41l-3.23-2.51c-.9.6-2.05.97-3.38.97-2.61 0-4.83-1.76-5.62-4.12H3.04v2.59A10 10 0 0 0 12 22ZM6.38 13.93A6 6 0 0 1 6.06 12c0-.67.12-1.32.32-1.93V7.48H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.52l3.34-2.59ZM12 5.95c1.47 0 2.79.51 3.82 1.5l2.87-2.86A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.96 5.48l3.34 2.59C7.17 7.71 9.39 5.95 12 5.95Z"
              />
            </svg>
            {googleLoading ? "Yo‘naltirilmoqda…" : "Google bilan kirish"}
          </button>
          {notice && (
            <p className="login-notice" role="status">
              {notice}
            </p>
          )}
          <div className="demo-link-section">
            <p>Avval bir ko‘z tashlamoqchimisiz?</p>
            <Link href="/feed">
              Demoni ko‘rish
              <ArrowUpRight size={16} />
            </Link>
          </div>
          <p className="login-footnote">
            School 21 hamjamiyatining bir qismi bo‘ling.
          </p>
        </div>
      </section>
    </div>
  );
}
