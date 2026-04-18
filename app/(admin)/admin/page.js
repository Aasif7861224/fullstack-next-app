import Link from "next/link";
import { ROLE_LABEL } from "@/lib/constants";
import { getAdminAnalytics } from "@/services/adminService";

export const metadata = {
  title: "Admin Overview",
};

function TrendBars({ trend }) {
  const max = Math.max(...trend.map((item) => item.count), 1);
  return (
    <div className="trend-grid">
      {trend.map((item) => (
        <div key={item.date} className="trend-item">
          <div className="trend-bar-wrap">
            <div className="trend-bar" style={{ height: `${(item.count / max) * 100}%` }} />
          </div>
          <span>{item.date.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}

export default async function AdminPage() {
  const analytics = await getAdminAnalytics();

  return (
    <section className="admin-panel">
      <div className="admin-headline">
        <div>
          <p className="admin-kicker">FUTURE READY OPERATIONS</p>
          <h1>Admin Command Center</h1>
          <p className="small">
            Centralized moderation, platform insights, seller ticket handling, and exportable reports.
          </p>
        </div>
        <div className="admin-head-actions">
          <Link className="admin-btn" href="/admin/reports">
            Open Reports
          </Link>
          <Link className="admin-btn ghost" href="/admin/seller-feedback">
            Seller Feedback
          </Link>
          <a className="admin-btn ghost" href="/api/admin/reports/export">
            Export Excel
          </a>
        </div>
      </div>

      <div className="admin-kpi-grid">
        <article className="admin-kpi-card">
          <h3>Total Properties</h3>
          <strong>{analytics.properties.total}</strong>
          <p>Approved: {analytics.properties.active}</p>
        </article>
        <article className="admin-kpi-card">
          <h3>Moderation Queue</h3>
          <strong>{analytics.properties.pending}</strong>
          <p>Rejected: {analytics.properties.rejected}</p>
        </article>
        <article className="admin-kpi-card">
          <h3>Inquiries</h3>
          <strong>{analytics.inquiries.total}</strong>
          <p>Last 7 days: {analytics.inquiries.last7Days}</p>
        </article>
        <article className="admin-kpi-card">
          <h3>Seller Tickets</h3>
          <strong>{analytics.sellerFeedback.open}</strong>
          <p>In Review: {analytics.sellerFeedback.inReview}</p>
        </article>
        <article className="admin-kpi-card">
          <h3>Featured Active</h3>
          <strong>{analytics.featured.activeFeatured}</strong>
          <p>Deleted Listings: {analytics.properties.deleted}</p>
        </article>
      </div>

      <div className="admin-card-grid">
        <article className="admin-glass-card">
          <h2>Inquiry Trend (7 days)</h2>
          <TrendBars trend={analytics.inquiries.trend7d} />
        </article>

        <article className="admin-glass-card">
          <h2>Top Viewed Listings</h2>
          <ul className="admin-list">
            {analytics.topViewed.map((item) => (
              <li key={item._id}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.city || "N/A"}</p>
                </div>
                <span>{item.views} views</span>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <div className="admin-card-grid">
        <article className="admin-glass-card">
          <h2>Pending Property Approvals</h2>
          <ul className="admin-list">
            {analytics.moderationQueue.length === 0 ? <li>No pending properties.</li> : null}
            {analytics.moderationQueue.map((item) => (
              <li key={item._id}>
                <div>
                  <strong>{item.title}</strong>
                  <p>
                    {item.city || "N/A"} - {item.ownerId?.name || "Seller"}
                  </p>
                </div>
                <Link className="admin-btn small-btn" href="/admin/properties">
                  Moderate
                </Link>
              </li>
            ))}
          </ul>
        </article>

        <article className="admin-glass-card">
          <h2>Recent Users</h2>
          <ul className="admin-list">
            {analytics.users.recent.map((item) => (
              <li key={item._id}>
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.email}</p>
                </div>
                <span>{ROLE_LABEL[item.role] || item.role}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <div className="admin-card-grid">
        <article className="admin-glass-card">
          <h2>Latest Seller Feedback</h2>
          <ul className="admin-list">
            {analytics.sellerFeedback.recent.length === 0 ? <li>No seller tickets yet.</li> : null}
            {analytics.sellerFeedback.recent.slice(0, 6).map((item) => (
              <li key={item._id}>
                <div>
                  <strong>{item.subject}</strong>
                  <p>
                    {item.sellerId?.name || "Seller"} - {item.priority} - {item.status}
                  </p>
                </div>
                <Link className="admin-btn small-btn ghost" href="/admin/seller-feedback">
                  Open
                </Link>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
