import SiteNavbar from "@/components/site/SiteNavbar";
import SiteFooter from "@/components/site/SiteFooter";

export default function DashboardLayout({ children }) {
  return (
    <div className="public-shell">
      <SiteNavbar />
      <main className="site-wrap">{children}</main>
      <SiteFooter />
    </div>
  );
}

