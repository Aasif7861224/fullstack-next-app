import { env } from "@/lib/env";
import ContactLeadForm from "@/components/public/ContactLeadForm";

export const metadata = {
  title: "Contact Us | UrbanKeys",
  description: "Reach our support and sales team for property assistance and platform support.",
  alternates: { canonical: `${env.appUrl}/contact` },
};

export default function ContactPage() {
  return (
    <section className="public-wrap page-shell">
      <div className="public-section">
        <div className="public-banner contact-banner" data-parallax data-parallax-depth="14">
          <div className="public-banner-content">
            <p className="hero-kicker" data-reveal>
              Contact UrbanKeys
            </p>
            <h1 data-reveal>Talk to Our Property Team</h1>
            <p className="public-muted" data-reveal>
              Need help finding the right listing, scheduling a callback, or resolving an issue? Share details and our
              team will connect with you.
            </p>
          </div>
        </div>

        <div className="public-section-head" data-reveal>
          <h1>Contact Us</h1>
          <p className="public-muted">
            Need help finding the right property or managing your listing? Our team is ready to assist.
          </p>
        </div>
        <div className="contact-layout">
          <div className="detail-card contact-info-panel" data-reveal>
            <h3>Office</h3>
            <p className="public-muted">
              UrbanKeys, Financial District,
              <br />
              Mumbai, India
            </p>
            <h4>Business Hours</h4>
            <p className="public-muted">Mon - Sat: 9:00 AM to 7:00 PM</p>
            <h4>Phone</h4>
            <p className="public-muted">+91 90000 11111</p>
            <h4>Email</h4>
            <p className="public-muted">support@urbankeys.local</p>
            <iframe
              title="office-map"
              src="https://www.google.com/maps?q=mumbai&z=11&output=embed"
              width="100%"
              height="220"
              loading="lazy"
              style={{ border: "1px solid #d8dfeb", borderRadius: "12px" }}
            />
          </div>

          <div data-reveal>
            <ContactLeadForm />
          </div>
        </div>
      </div>
    </section>
  );
}
