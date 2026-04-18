import { getServerSessionUser } from "@/lib/auth";
import { getSellerAnalytics } from "@/services/sellerService";

export const metadata = {
  title: "Seller Analytics",
};

function Distribution({ rows }) {
  const max = Math.max(...rows.map((row) => row.views), 1);
  return (
    <div className="seller-distribution-wrap">
      {rows.map((row) => (
        <div key={row.status} className="seller-distribution-row">
          <span>{row.status}</span>
          <div className="seller-distribution-track">
            <div className="seller-distribution-fill" style={{ width: `${(row.views / max) * 100}%` }} />
          </div>
          <strong>{row.views}</strong>
        </div>
      ))}
    </div>
  );
}

export default async function SellerAnalyticsPage() {
  const user = await getServerSessionUser();
  const analytics = await getSellerAnalytics(user);

  return (
    <section className="seller-panel">
      <div className="seller-headline">
        <div>
          <p className="seller-kicker">VIEWER INSIGHTS</p>
          <h1>Analytics</h1>
          <p className="small">Aggregated property performance metrics without exposing viewer identity.</p>
        </div>
      </div>

      <div className="seller-kpi-grid">
        <article className="seller-kpi-card">
          <h3>Total Views</h3>
          <strong>{analytics.viewStats.totalViews}</strong>
          <p>Avg Views per Property: {analytics.viewStats.avgViewsPerProperty}</p>
        </article>
        <article className="seller-kpi-card">
          <h3>Active Listings</h3>
          <strong>{analytics.propertyCounts.active}</strong>
          <p>Pending: {analytics.propertyCounts.pending}</p>
        </article>
        <article className="seller-kpi-card">
          <h3>Total Inquiries</h3>
          <strong>{analytics.inquiryStats.total}</strong>
          <p>New: {analytics.inquiryStats.newCount}</p>
        </article>
        <article className="seller-kpi-card">
          <h3>Active Featured</h3>
          <strong>{analytics.featuredStats.activeFeatured}</strong>
          <p>Expiring soon: {analytics.featuredStats.expiringSoon.length}</p>
        </article>
      </div>

      <div className="seller-card-grid">
        <article className="seller-glass-card">
          <h2>Views by Listing Status</h2>
          {analytics.viewStats.byStatus.length === 0 ? (
            <p className="small">No data yet.</p>
          ) : (
            <Distribution rows={analytics.viewStats.byStatus} />
          )}
        </article>
        <article className="seller-glass-card">
          <h2>Top Viewed Listings</h2>
          <ul className="seller-list">
            {analytics.viewStats.topViewed.length === 0 ? <li>No listings yet.</li> : null}
            {analytics.viewStats.topViewed.map((item) => (
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
    </section>
  );
}
