import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { demoCredentials, useDemoAuth } from "./DemoAuth";

export function LoginPage() {
  const { isLoggedIn, login } = useDemoAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (isLoggedIn) return <Navigate to="/" replace />;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (login(email, password)) navigate("/");
    else setError("Use the demo email and password shown above.");
  }

  return <main className="login-page"><section className="page-card narrow-card"><p className="eyebrow">Demo access only</p><h1>Sign in</h1><p>This is a local mock login, not real authentication. It only stores a browser session flag.</p><p className="demo-credentials"><strong>Email:</strong> {demoCredentials.email}<br /><strong>Password:</strong> {demoCredentials.password}</p><form className="task-form" onSubmit={submit}><label htmlFor="login-email">Email</label><input id="login-email" onChange={(event) => setEmail(event.target.value)} type="email" value={email} /><label htmlFor="login-password">Password</label><input id="login-password" onChange={(event) => setPassword(event.target.value)} type="password" value={password} />{error && <p className="form-error" role="alert">{error}</p>}<button className="button button--primary" type="submit">Sign in</button></form></section></main>;
}
