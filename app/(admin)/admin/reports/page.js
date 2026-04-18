import { getAdminAnalytics } from "@/services/adminService";

export const metadata = {
  title: "Admin Reports",
};

function Distribution({ rows }) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <div className="distribution-wrap">
      {rows.map((row) => (
        <div key={row.label} className="distribution-row">
          <span>{row.label}</span>
          <div className="distribution-track">
            <div className="distribution-fill" style={{ width: `${(row.value / max) * 100}%` }} />
          </div>
          <strong>{row.value}</strong>
        </div>
      ))}
    </div>
  );
}

export default async function AdminReportsPage() {
  const analytics = await getAdminAnalytics();
  const paidRevenue = analytics.featured.revenueByCurrency
    .map((item) => `${item._id}: ${item.total}`)
    .join(" | ");

  return (
    <section className="admin-panel">
      <div className="admin-headline">
        <div>
          <p className="admin-kicker">REPORT INTELLIGENCE</p>
          <h1>Advanced Reports</h1>
          <p className="small">Visual status reports plus one-click downloadable Excel workbook.</p>
        </div>
        <a className="admin-btn" href="/api/admin/reports/export">
          Export Full Excel
        </a>
      </div>

      <div className="admin-card-grid">
        <article className="admin-glass-card">
          <h2>Property Status Distribution</h2>
          <Distribution rows={analytics.properties.statusDistribution} />
        </article>
        <article className="admin-glass-card">
          <h2>Revenue Snapshot</h2>
          <p className="small">
            Featured listing paid revenue by currency:
            <br />
            <strong>{paidRevenue || "No paid transactions yet"}</strong>
          </p>
          <h3 style={{ marginTop: "1rem" }}>Recent Inquiries</h3>
          <ul className="admin-list compact">
            {analytics.inquiries.recent.slice(0, 6).map((item) => (
              <li key={item._id}>
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.propertyId?.title || "Property unavailable"}</p>
                </div>
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

