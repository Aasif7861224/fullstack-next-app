"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useLoaderRouter } from "@/components/site/useLoaderRouter";

const links = [
  { href: "/seller", label: "Overview" },
  { href: "/seller/properties", label: "My Listings" },
  { href: "/seller/properties/new", label: "Add Listing" },
  { href: "/seller/inquiries", label: "Inquiries" },
  { href: "/seller/analytics", label: "Viewer Insights" },
  { href: "/seller/feedback", label: "Feedback" },
];

function isActive(pathname, href) {
  if (href === "/seller") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SellerNavbar({ user }) {
  const pathname = usePathname();
  const router = useLoaderRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="seller-header">
      <div className="seller-wrap seller-header-content">
        <div className="seller-brand-wrap">
          <span className="seller-brand-pill">SELLER WORKSPACE</span>
          <Link href="/seller" className="seller-brand">
            Seller Hub
          </Link>
        </div>

        <button className="seller-mobile-toggle" type="button" onClick={() => setOpen((prev) => !prev)}>
          Menu
        </button>

        <nav className={`seller-nav ${open ? "open" : ""}`}>
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(pathname, item.href) ? "active" : ""}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/" onClick={() => setOpen(false)}>
            View Site
          </Link>
          <button type="button" className="seller-btn ghost" onClick={handleLogout}>
            Logout
          </button>
        </nav>

        <div className="seller-user-chip">
          <span>{user.name}</span>
          <small>Seller</small>
        </div>
      </div>
    </header>
  );
}
