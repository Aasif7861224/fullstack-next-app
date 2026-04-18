import Link from "next/link";
import AdminActionButton from "@/components/admin/AdminActionButton";
import { listAdminProperties } from "@/services/adminService";

export const metadata = {
  title: "Admin Property Moderation",
};

function buildAdminQuery(params, page) {
  const next = new URLSearchParams();
  if (params.status) next.set("status", params.status);
  if (params.deleted) next.set("deleted", params.deleted);
  if (params.q) next.set("q", params.q);
  next.set("page", `${page}`);
  return next.toString();
}

export default async function AdminPropertiesPage({ searchParams }) {
  const params = await searchParams;
  const page = Math.max(Number(params.page || 1), 1);
  const limit = 12;
  const status = params.status || "all";
  const deleted = params.deleted || "exclude";
  const q = params.q || "";
  const skip = (page - 1) * limit;

  const data = await listAdminProperties({ page, limit, skip, status, deleted, q });
  const canPrev = data.pagination.page > 1;
  const canNext = data.pagination.hasMore;

  return (
    <section className="admin-panel">
      <div className="admin-headline">
        <div>
          <p className="admin-kicker">MODERATION</p>
          <h1>Properties Control</h1>
          <p className="small">Approve, reject, restore, and review listing quality at scale.</p>
        </div>
      </div>

      <form className="admin-filter-grid" method="GET">
        <input className="input" name="q" defaultValue={q} placeholder="Search by title/city/slug" />
        <select className="select" name="status" defaultValue={status}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="rejected">Rejected</option>
        </select>
        <select className="select" name="deleted" defaultValue={deleted}>
          <option value="exclude">Exclude Deleted</option>
          <option value="all">Include Deleted</option>
          <option value="only">Only Deleted</option>
        </select>
        <button className="admin-btn" type="submit">
          Apply Filters
        </button>
      </form>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Property</th>
              <th>Seller</th>
              <th>Status</th>
              <th>Price</th>
              <th>Views</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
              <tr key={item._id}>
                <td>
                  <strong>{item.title}</strong>
                  <p>{item.slug}</p>
                  <p>{item.city || item.location}</p>
                </td>
                <td>
                  <p>{item.ownerId?.name || "N/A"}</p>
                  <p>{item.ownerId?.email || "N/A"}</p>
                </td>
                <td>
                  <span className={`status-tag ${item.status}`}>{item.status}</span>
                  {item.isDeleted ? <span className="status-tag deleted">deleted</span> : null}
                </td>
                <td>?{item.price}</td>
                <td>{item.views}</td>
                <td>
                  <div className="admin-actions-inline">
                    {!item.isDeleted ? (
                      <>
                        <AdminActionButton
                          url={`/api/admin/properties/${item._id}/approve`}
                          label="Approve"
                          className="small-btn"
                        />
                        <AdminActionButton
                          url={`/api/admin/properties/${item._id}/reject`}
                          label="Reject"
                          className="small-btn ghost"
                        />
                      </>
                    ) : (
                      <AdminActionButton
                        url={`/api/admin/properties/${item._id}/restore`}
                        label="Restore"
                        className="small-btn"
                      />
                    )}
                    <Link className="admin-btn small-btn ghost" href={`/properties/${item.slug}`}>
                      View
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-pagination">
        {canPrev ? (
          <Link href={`/admin/properties?${buildAdminQuery({ status, deleted, q }, page - 1)}`} className="admin-btn ghost">
            Previous
          </Link>
        ) : (
          <span />
        )}
        <p className="small">
          Page {data.pagination.page} / {data.pagination.totalPages}
        </p>
        {canNext ? (
          <Link href={`/admin/properties?${buildAdminQuery({ status, deleted, q }, page + 1)}`} className="admin-btn ghost">
            Next
          </Link>
        ) : (
          <span />
        )}
      </div>
    </section>
  );
}
