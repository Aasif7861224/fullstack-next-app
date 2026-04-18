import Link from "next/link";
import AdminSellerFeedbackEditor from "@/components/admin/AdminSellerFeedbackEditor";
import { listAdminSellerFeedback } from "@/services/sellerService";

export const metadata = {
  title: "Admin Seller Feedback",
};

function buildQuery({ status, priority, q }, page) {
  const query = new URLSearchParams();
  if (status) query.set("status", status);
  if (priority) query.set("priority", priority);
  if (q) query.set("q", q);
  query.set("page", `${page}`);
  return query.toString();
}

export default async function AdminSellerFeedbackPage({ searchParams }) {
  const params = await searchParams;
  const page = Math.max(Number(params.page || 1), 1);
  const limit = 12;
  const skip = (page - 1) * limit;
  const status = params.status || "all";
  const priority = params.priority || "all";
  const q = params.q || "";

  const data = await listAdminSellerFeedback({ page, limit, skip, status, priority, q });
  const canPrev = data.pagination.page > 1;
  const canNext = data.pagination.hasMore;

  return (
    <section className="admin-panel">
      <div className="admin-headline">
        <div>
          <p className="admin-kicker">SELLER SUPPORT DESK</p>
          <h1>Seller Feedback Tickets</h1>
          <p className="small">Review seller concerns and reply directly from admin workspace.</p>
        </div>
      </div>

      <form className="admin-filter-grid" method="GET">
        <input className="input" name="q" defaultValue={q} placeholder="Search subject/message/reply" />
        <select className="select" name="status" defaultValue={status}>
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_review">In Review</option>
          <option value="resolved">Resolved</option>
        </select>
        <select className="select" name="priority" defaultValue={priority}>
          <option value="all">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <button className="admin-btn" type="submit">
          Apply Filters
        </button>
      </form>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Seller</th>
              <th>Ticket</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Updated</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.items.length === 0 ? (
              <tr>
                <td colSpan={6}>No feedback tickets found.</td>
              </tr>
            ) : null}
            {data.items.map((item) => (
              <tr key={item._id}>
                <td>
                  <strong>{item.sellerId?.name || "Unknown"}</strong>
                  <p>{item.sellerId?.email || "-"}</p>
                </td>
                <td>
                  <strong>{item.subject}</strong>
                  <p>{item.message}</p>
                </td>
                <td>{item.priority}</td>
                <td>{item.status}</td>
                <td>{new Date(item.updatedAt).toLocaleString()}</td>
                <td>
                  <AdminSellerFeedbackEditor
                    id={item._id}
                    initialStatus={item.status}
                    initialReply={item.adminReply}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-pagination">
        {canPrev ? (
          <Link href={`/admin/seller-feedback?${buildQuery({ status, priority, q }, page - 1)}`} className="admin-btn ghost">
            Previous
          </Link>
        ) : (
          <span />
        )}
        <p className="small">
          Page {data.pagination.page} / {data.pagination.totalPages}
        </p>
        {canNext ? (
          <Link href={`/admin/seller-feedback?${buildQuery({ status, priority, q }, page + 1)}`} className="admin-btn ghost">
            Next
          </Link>
        ) : (
          <span />
        )}
      </div>
    </section>
  );
}
