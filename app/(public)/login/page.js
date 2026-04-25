"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLoaderRouter } from "@/components/site/useLoaderRouter";

const defaultForm = {
  name: "",
  email: "",
  password: "",
  role: "user",
  contact: "",
  address: "",
};

function LoginContent() {
  const router = useLoaderRouter();
  const params = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectTo = params.get("redirect") || "/dashboard";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin
        ? { email: form.email, password: form.password }
        : form;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Authentication failed");
      }

      if (!isLogin && json.data?.requiresApproval) {
        setInfo("Seller account created. Please wait for admin approval before login.");
        setIsLogin(true);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="public-wrap page-shell">
      <div className="auth-layout">
        <article className="auth-info-card auth-info-visual" data-reveal>
          <p className="hero-kicker">Secure Access</p>
          <h1>{isLogin ? "Welcome Back" : "Create Your Account"}</h1>
          <p className="public-muted">
            Access your role-based dashboard, track inquiries, and manage your property workflow.
          </p>
          <ul className="public-list">
            <li>Users can save and inquire on listings</li>
            <li>Sellers can create and manage listings</li>
            <li>Admin verifies sellers and moderates properties</li>
          </ul>
          <p className="public-muted">
            By continuing, you agree to our <Link href="/about">platform terms</Link>.
          </p>
        </article>

        <article className="auth-form-card" data-reveal>
          <h2>{isLogin ? "Login" : "Register"}</h2>
          <form className="auth-form" onSubmit={handleSubmit}>
            {!isLogin ? (
              <>
                <input
                  className="input"
                  placeholder="Name"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  required
                />
                <select
                  className="select"
                  value={form.role}
                  onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
                >
                  <option value="user">User</option>
                  <option value="owner">Seller</option>
                </select>
                <input
                  className="input"
                  placeholder="Contact"
                  value={form.contact}
                  onChange={(event) => setForm((prev) => ({ ...prev, contact: event.target.value }))}
                />
                <input
                  className="input"
                  placeholder="Address"
                  value={form.address}
                  onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
                />
              </>
            ) : null}

            <input
              className="input"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              required
            />
            <input
              className="input"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              required
            />

            {info ? <p className="public-success">{info}</p> : null}
            {error ? <p className="public-error">{error}</p> : null}

            <button className="public-btn" type="submit" disabled={loading}>
              {loading ? "Please wait..." : isLogin ? "Login" : "Create Account"}
            </button>
          </form>

          <button
            type="button"
            className="public-btn secondary"
            onClick={() => setIsLogin((prev) => !prev)}
            style={{ marginTop: "0.75rem" }}
          >
            {isLogin ? "Need an account? Register" : "Already have an account? Login"}
          </button>
        </article>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<section className="public-wrap page-shell">Loading...</section>}>
      <LoginContent />
    </Suspense>
  );
}
