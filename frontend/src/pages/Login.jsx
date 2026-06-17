import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { translateServerError } from "../lib/i18n";
import LangSwitcher from "../components/LangSwitcher";
import logo from "../assets/logo.png";
import styles from "./Login.module.css";

export default function Login() {
  const { login, register } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function validate() {
    if (mode === "register") {
      if (password.length < 6) return t.errorPasswordShort;
      if (email !== confirmEmail) return t.errorEmailMismatch;
      if (password !== confirmPassword) return t.errorPasswordMismatch;
    }
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate("/dashboard");
    } catch (err) {
      setError(translateServerError(err.message, t));
    } finally {
      setLoading(false);
    }
  }

  function switchMode(next) {
    setMode(next);
    setError("");
    setName("");
    setEmail("");
    setConfirmEmail("");
    setPassword("");
    setConfirmPassword("");
  }

  const isLogin = mode === "login";

  return (
    <div className={styles.page}>
      <div className={styles.glow} aria-hidden="true" />
      <LangSwitcher />

      <div className={styles.card}>
        <header className={styles.header}>
          <img src={logo} alt="Workfolio" className={styles.logo} />
          <h1 className={styles.title}>Workfolio</h1>
          <p className={styles.tagline}>
            {isLogin ? t.taglineLogin : t.taglineRegister}
          </p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {!isLogin && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="name">{t.name}</label>
              <input
                id="name"
                type="text"
                className={styles.input}
                placeholder={t.namePlaceholder}
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">{t.email}</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder={t.emailPlaceholder}
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="confirmEmail">{t.confirmEmail}</label>
              <input
                id="confirmEmail"
                type="email"
                className={styles.input}
                placeholder={t.confirmEmailPlaceholder}
                autoComplete="off"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                required
              />
            </div>
          )}

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label className={styles.label} htmlFor="password">{t.password}</label>
              {isLogin && (
                <button type="button" className={styles.forgotLink}>
                  {t.forgotPassword}
                </button>
              )}
            </div>
            <input
              id="password"
              type="password"
              className={styles.input}
              placeholder={t.passwordPlaceholder}
              autoComplete={isLogin ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="confirmPassword">{t.confirmPassword}</label>
              <input
                id="confirmPassword"
                type="password"
                className={styles.input}
                placeholder={t.confirmPasswordPlaceholder}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <span className={styles.spinner} aria-label="Loading" />
            ) : isLogin ? t.submitLogin : t.submitRegister}
          </button>
        </form>

        <p className={styles.footer}>
          {isLogin ? t.noAccount : t.haveAccount}{" "}
          <button
            type="button"
            className={styles.signUpLink}
            onClick={() => switchMode(isLogin ? "register" : "login")}
          >
            {isLogin ? t.signUp : t.signIn}
          </button>
        </p>
      </div>
    </div>
  );
}
