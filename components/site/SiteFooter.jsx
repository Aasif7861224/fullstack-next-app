import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="public-footer">
      <div className="public-wrap public-footer-grid">
        <div>
          <h4>UrbanKeys</h4>
          <p className="public-muted">
            Discover verified listings, trusted sellers, and transparent real estate journeys.
          </p>
        </div>

        <div>
          <h5>Quick Links</h5>
          <ul className="public-footer-list">
            <li>
              <Link href="/properties">Properties</Link>
            </li>
            <li>
              <Link href="/about">About</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
            <li>
              <Link href="/testimonials">Testimonials</Link>
            </li>
          </ul>
        </div>

        <div>
          <h5>Contact</h5>
          <ul className="public-footer-list">
            <li>+91 90000 11111</li>
            <li>support@urbankeys.local</li>
            <li>Mumbai, India</li>
          </ul>
        </div>

        <div>
          <h5>Follow</h5>
          <div className="public-social-row">
            <a href="https://www.facebook.com" target="_blank" rel="noreferrer">
              Facebook
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noreferrer">
              Instagram
            </a>
            <a href="https://www.linkedin.com" target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
      <div className="public-wrap public-footer-bottom">
        <p>Copyright (c) {new Date().getFullYear()} UrbanKeys. All rights reserved.</p>
      </div>
    </footer>
  );
}