"use client";

import { ArrowRight, ArrowUpRight, Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!username.trim() || !password || submitting) return;
    setSubmitting(true);
    setError("");
    const result = await signIn("credentials", {
      username: username.trim(),
      password,
      redirect: false,
    });
    setSubmitting(false);
    if (result?.error) {
      setError("Login yoki parol noto'g'ri.");
      return;
    }
    router.push("/feed");
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
            Login va parolingiz bilan kiring.
          </p>
          <form className="stack-form" onSubmit={submit}>
            <label className="field">
              <span>Login</span>
              <input
                type="text"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="masalan: aziz"
                autoComplete="username"
                required
              />
            </label>
            <label className="field">
              <span>Parol</span>
              <span className="password-field">
                <input
                  type={visible ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="button button-primary login-submit"
              disabled={!username.trim() || !password || submitting}
            >
              {submitting ? "Kirilmoqda…" : "Kirish"}
              {!submitting && <ArrowRight size={18} />}
            </button>
          </form>
          <p className="login-footnote">
            School 21 hamjamiyatining bir qismi bo‘ling.
          </p>
        </div>
      </section>
    </div>
  );
}
