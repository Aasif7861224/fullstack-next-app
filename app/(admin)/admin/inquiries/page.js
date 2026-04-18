import { listAdminInquiries } from "@/services/adminService";

export const metadata = {
  title: "Admin Inquiries",
};

export default async function AdminInquiriesPage({ searchParams }) {
  const params = await searchParams;
  const page = Math.max(Number(params.page || 1), 1);
  const limit = 20;
  const skip = (page - 1) * limit;
  const status = params.status || "all";
  const q = params.q || "";

  const data = await listAdminInquiries({ page, limit, skip, status, q });

  return (
    <section className="admin-panel">
      <div className="admin-headline">
        <div>
          <p className="admin-kicker">LEAD PIPELINE</p>
          <h1>Inquiries Management</h1>
          <p className="small">Monitor incoming leads and communication quality in one stream.</p>
        </div>
      </div>

      <form className="admin-filter-grid" method="GET">
        <input className="input" name="q" defaultValue={q} placeholder="Search by name/email/message" />
        <select className="select" name="status" defaultValue={status}>
          <option value="all">All status</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="closed">Closed</option>
        </select>
        <button className="admin-btn" type="submit">
          Apply Filters
        </button>
      </form>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Sender</th>
              <th>Property</th>
              <th>Seller</th>
              <th>Status</th>
              <th>Email Delivery</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
              <tr key={item._id}>
                <td>
                  <strong>{item.name}</strong>
                  <p>{item.email}</p>
                  <p>{item.phone}</p>
                </td>
                <td>{item.propertyId?.title || "N/A"}</td>
                <td>{item.ownerId?.email || "N/A"}</td>
                <td>{item.status}</td>
                <td>
                  Seller: {item.ownerEmailSent ? "Yes" : "No"}
                  <br />
                  Sender: {item.senderEmailSent ? "Yes" : "No"}
                </td>
                <td>{new Date(item.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
