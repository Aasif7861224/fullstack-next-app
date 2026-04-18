import Link from "next/link";
import AdminContactLeadEditor from "@/components/admin/AdminContactLeadEditor";
import { listAdminContactLeads } from "@/services/contactLeadService";

export const metadata = {
  title: "Admin Contact Leads",
};

function buildQuery(params, page) {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.q) query.set("q", params.q);
  query.set("page", `${page}`);
  return query.toString();
}

export default async function AdminContactLeadsPage({ searchParams }) {
  const params = await searchParams;
  const page = Math.max(Number(params.page || 1), 1);
  const limit = 20;
  const skip = (page - 1) * limit;
  const status = params.status || "all";
  const q = params.q || "";

  const data = await listAdminContactLeads({ page, limit, skip, status, q });
  const canPrev = data.pagination.page > 1;
  const canNext = data.pagination.hasMore;

  return (
    <section className="admin-panel">
      <div className="admin-headline">
        <div>
          <p className="admin-kicker">CONTACT PIPELINE</p>
          <h1>Contact Leads</h1>
          <p className="small">Review inbound website leads and update resolution status.</p>
        </div>
      </div>

      <form className="admin-filter-grid" method="GET">
        <input className="input" name="q" defaultValue={q} placeholder="Search by name, email, subject" />
        <select className="select" name="status" defaultValue={status}>
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="in_review">In Review</option>
          <option value="resolved">Resolved</option>
        </select>
        <button className="admin-btn" type="submit">
          Apply Filters
        </button>
      </form>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Contact</th>
              <th>Message</th>
              <th>Status</th>
              <th>Source</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.items.length === 0 ? (
              <tr>
                <td colSpan={6}>No contact leads found.</td>
              </tr>
            ) : null}
            {data.items.map((item) => (
              <tr key={item._id}>
                <td>
                  <strong>{item.name}</strong>
                  <p>{item.email}</p>
                  <p>{item.phone || "-"}</p>
                </td>
                <td>
                  <strong>{item.subject}</strong>
                  <p>{item.message}</p>
                </td>
                <td>{item.status}</td>
                <td>{item.sourcePage || "/contact"}</td>
                <td>{new Date(item.createdAt).toLocaleString()}</td>
                <td>
                  <AdminContactLeadEditor
                    id={item._id}
                    initialStatus={item.status}
                    initialNote={item.adminNote}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-pagination">
        {canPrev ? (
          <Link
            href={`/admin/contact-leads?${buildQuery({ status, q }, page - 1)}`}
            className="admin-btn ghost"
          >
            Previous
          </Link>
        ) : (
          <span />
        )}
        <p className="small">
          Page {data.pagination.page} / {data.pagination.totalPages}
        </p>
        {canNext ? (
          <Link
            href={`/admin/contact-leads?${buildQuery({ status, q }, page + 1)}`}
            className="admin-btn ghost"
          >
            Next
          </Link>
        ) : (
          <span />
        )}
      </div>
    </section>
  );
}
