"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const baseLinks = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Properties" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/saved-properties", label: "Saved" },
];

export default function PublicNavbarClient({ user = null, dashboardHref = "/dashboard" }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const links = useMemo(() => baseLinks, []);

  const isActive = (href) => {
    if (href === "/") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="public-header">
      <div className="public-wrap public-header-inner">
        <Link href="/" className="public-brand">
          <span>UrbanKeys</span>
          <small>Verified Real Estate</small>
        </Link>

        <button type="button" className="public-mobile-toggle" onClick={() => setOpen((prev) => !prev)}>
          Menu
        </button>

        <nav className={`public-nav ${open ? "open" : ""}`}>
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(item.href) ? "active" : ""}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="public-nav-actions">
          {user ? (
            <>
              <Link href={dashboardHref} className="public-btn secondary" onClick={() => setOpen(false)}>
                Dashboard
              </Link>
              <button type="button" className="public-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="public-btn">
              Login / Register
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
