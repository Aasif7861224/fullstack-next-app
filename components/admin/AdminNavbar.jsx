"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ROLE_LABEL } from "@/lib/constants";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/properties", label: "Properties" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/contact-leads", label: "Contact Leads" },
  { href: "/admin/seller-feedback", label: "Seller Feedback" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/testimonials", label: "Testimonials" },
];

export default function AdminNavbar({ user }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="admin-header">
      <div className="admin-wrap admin-header-content">
        <div className="admin-brand-wrap">
          <span className="admin-brand-pill">CONTROL HUB</span>
          <Link href="/admin" className="admin-brand">
            Admin Nexus
          </Link>
        </div>
        <button className="admin-mobile-toggle" onClick={() => setOpen((prev) => !prev)} type="button">
          Menu
        </button>
        <nav className={`admin-nav ${open ? "open" : ""}`}>
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? "active" : ""}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/" onClick={() => setOpen(false)}>
            View Site
          </Link>
          <button type="button" className="admin-btn ghost" onClick={handleLogout}>
            Logout
          </button>
        </nav>
        <div className="admin-user-chip">
          <span>{user.name}</span>
          <small>{ROLE_LABEL[user.role] || user.role}</small>
        </div>
      </div>
    </header>
  );
}
