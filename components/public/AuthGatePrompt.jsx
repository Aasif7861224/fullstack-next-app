import Link from "next/link";

export default function AuthGatePrompt({ title, description, redirect = "/saved-properties" }) {
  return (
    <section className="public-section auth-gate">
      <h1>{title}</h1>
      <p className="public-muted">{description}</p>
      <div className="public-inline-actions">
        <Link href={`/login?redirect=${encodeURIComponent(redirect)}`} className="public-btn">
          Login to Continue
        </Link>
        <Link href="/properties" className="public-btn secondary">
          Browse Listings
        </Link>
      </div>
    </section>
  );
}
