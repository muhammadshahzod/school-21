"use client";

import { ArrowRight, ArrowUpRight, Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import LanguageSwitch from "@/components/LanguageSwitch";
import { useLang } from "@/lib/useLang";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLang();
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
      setError(t("login.error"));
      return;
    }
    router.push("/feed");
  }

  return (
    <div id="main-content" className="page-container login-page">
      <div className="login-language-switch">
        <LanguageSwitch />
      </div>
      <section className="login-art">
        <div className="eyebrow">{t("login.eyebrow_top")}</div>
        <h1>
          {t("login.title_line1")} <br />
          {t("login.title_line2")} <br />
          <span>{t("login.title_span")}</span>
        </h1>
        <p>
          {t("login.subtitle_line1")}
          <br />
          {t("login.subtitle_line2")}
        </p>
        <div className="login-art-symbol" aria-hidden="true">
          <span>21</span>
          <ArrowUpRight strokeWidth={1} />
        </div>
        <div className="login-art-footer">
          <span>{t("login.footer_left")}</span>
          <span>{t("login.footer_right")}</span>
        </div>
      </section>
      <section className="login-form-panel">
        <div className="login-form-inner">
          <span className="eyebrow">{t("login.eyebrow_welcome")}</span>
          <h2>
            {t("login.heading_line1")}
            <br />
            {t("login.heading_span")}
            <span>.</span>
          </h2>
          <p className="muted login-description">{t("login.description")}</p>
          <form className="stack-form" onSubmit={submit}>
            <label className="field">
              <span>{t("login.label_username")}</span>
              <input
                type="text"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t("login.placeholder_username")}
                autoComplete="username"
                required
              />
            </label>
            <label className="field">
              <span>{t("login.label_password")}</span>
              <span className="password-field">
                <input
                  type={visible ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("login.placeholder_password")}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="icon-button"
                  aria-label={
                    visible ? t("login.hide_password") : t("login.show_password")
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
              {submitting ? t("login.submitting") : t("login.submit")}
              {!submitting && <ArrowRight size={18} />}
            </button>
          </form>
          <p className="login-footnote">{t("login.footnote")}</p>
        </div>
      </section>
    </div>
  );
}
