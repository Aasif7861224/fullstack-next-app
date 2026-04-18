import Link from "next/link";
import { getServerSessionUser } from "@/lib/auth";
import { getSellerAnalytics } from "@/services/sellerService";

export const metadata = {
  title: "Seller Overview",
};

export default async function SellerOverviewPage() {
  const user = await getServerSessionUser();
  const analytics = await getSellerAnalytics(user);

  return (
    <section className="seller-panel">
      <div className="seller-headline">
        <div>
          <p className="seller-kicker">LISTING COMMAND DECK</p>
          <h1>Seller Dashboard</h1>
          <p className="small">
            Welcome {user.name}. Add or update listings, track inquiries, and monitor views in one place.
          </p>
        </div>
        <div className="seller-head-actions">
          <Link href="/seller/properties/new" className="seller-btn">
            Add New Property
          </Link>
          <Link href="/seller/properties" className="seller-btn ghost">
            Manage Listings
          </Link>
        </div>
      </div>

      <div className="seller-kpi-grid">
        <article className="seller-kpi-card">
          <h3>Total Listings</h3>
          <strong>{analytics.propertyCounts.total}</strong>
          <p>Active: {analytics.propertyCounts.active}</p>
        </article>
        <article className="seller-kpi-card">
          <h3>Pending Approval</h3>
          <strong>{analytics.propertyCounts.pending}</strong>
          <p>Rejected: {analytics.propertyCounts.rejected}</p>
        </article>
        <article className="seller-kpi-card">
          <h3>Total Inquiries</h3>
          <strong>{analytics.inquiryStats.total}</strong>
          <p>New: {analytics.inquiryStats.newCount}</p>
        </article>
        <article className="seller-kpi-card">
          <h3>Total Views</h3>
          <strong>{analytics.viewStats.totalViews}</strong>
          <p>Avg per listing: {analytics.viewStats.avgViewsPerProperty}</p>
        </article>
      </div>

      <div className="seller-card-grid">
        <article className="seller-glass-card">
          <h2>Top Viewed Properties</h2>
          <ul className="seller-list">
            {analytics.viewStats.topViewed.length === 0 ? <li>No view data available yet.</li> : null}
            {analytics.viewStats.topViewed.map((item) => (
              <li key={item._id}>
                <div>
                  <strong>{item.title}</strong>
                  <p>
                    {(item.city || "N/A")} - {item.status}
                  </p>
                </div>
                <span>{item.views} views</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="seller-glass-card">
          <h2>Latest Inquiries</h2>
          <ul className="seller-list">
            {analytics.inquiryStats.recent.length === 0 ? <li>No inquiries yet.</li> : null}
            {analytics.inquiryStats.recent.slice(0, 6).map((item) => (
              <li key={item._id}>
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.propertyId?.title || "Property unavailable"}</p>
                </div>
                <span>{item.status}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <div className="seller-card-grid">
        <article className="seller-glass-card">
          <h2>Needs Attention</h2>
          <ul className="seller-list compact">
            <li>
              <div>
                <strong>{analytics.propertyCounts.pending}</strong>
                <p>Listings waiting for admin approval</p>
              </div>
              <Link href="/seller/properties" className="seller-btn small-btn ghost">
                Open
              </Link>
            </li>
            <li>
              <div>
                <strong>{analytics.propertyCounts.rejected}</strong>
                <p>Rejected listings that need edits and re-submit</p>
              </div>
              <Link href="/seller/properties?status=rejected" className="seller-btn small-btn ghost">
                Review
              </Link>
            </li>
            <li>
              <div>
                <strong>{analytics.inquiryStats.newCount}</strong>
                <p>Unread inquiries from interested users</p>
              </div>
              <Link href="/seller/inquiries?status=new" className="seller-btn small-btn ghost">
                Respond
              </Link>
            </li>
          </ul>
        </article>

        <article className="seller-glass-card">
          <h2>Featured Monitor</h2>
          <p className="small">Active featured listings: {analytics.featuredStats.activeFeatured}</p>
          <ul className="seller-list compact">
            {analytics.featuredStats.expiringSoon.length === 0 ? <li>No featured listing expiring soon.</li> : null}
            {analytics.featuredStats.expiringSoon.map((item) => (
              <li key={item._id}>
                <div>
                  <strong>{item.title}</strong>
                  <p>Expires {new Date(item.featuredTill).toLocaleDateString()}</p>
                </div>
                <span>{item.views} views</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
