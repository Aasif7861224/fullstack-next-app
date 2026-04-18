import SiteNavbar from "@/components/site/SiteNavbar";
import SiteFooter from "@/components/site/SiteFooter";
import ScrollToTopButton from "@/components/site/ScrollToTopButton";
import CinematicMotion from "@/components/public/CinematicMotion";

export default function PublicLayout({ children }) {
  return (
    <div className="public-shell">
      <CinematicMotion />
      <SiteNavbar />
      <main className="public-main">{children}</main>
      <SiteFooter />
      <ScrollToTopButton />
    </div>
  );
}
