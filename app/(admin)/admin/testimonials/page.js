import AdminActionButton from "@/components/admin/AdminActionButton";
import { listAdminTestimonials } from "@/services/adminService";

export const metadata = {
  title: "Admin Testimonials",
};

export default async function AdminTestimonialsPage({ searchParams }) {
  const params = await searchParams;
  const approved = params.approved || "false";
  const page = Math.max(Number(params.page || 1), 1);
  const limit = 20;
  const skip = (page - 1) * limit;
  const data = await listAdminTestimonials({ approved, page, limit, skip });

  return (
    <section className="admin-panel">
      <div className="admin-headline">
        <div>
          <p className="admin-kicker">REPUTATION LAYER</p>
          <h1>Testimonials Moderation</h1>
          <p className="small">Approve trust signals and keep public reviews authentic.</p>
        </div>
        <div className="admin-head-actions">
          <a className={`admin-btn ${approved === "false" ? "" : "ghost"}`} href="/admin/testimonials?approved=false">
            Pending
          </a>
          <a className={`admin-btn ${approved === "true" ? "" : "ghost"}`} href="/admin/testimonials?approved=true">
            Approved
          </a>
          <a className={`admin-btn ${approved === "all" ? "" : "ghost"}`} href="/admin/testimonials?approved=all">
            All
          </a>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Rating</th>
              <th>Message</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
              <tr key={item._id}>
                <td>{item.name || "Anonymous"}</td>
                <td>{item.rating}/5</td>
                <td>{item.message}</td>
                <td>{item.approved ? "Approved" : "Pending"}</td>
                <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                <td>
                  {!item.approved ? (
                    <AdminActionButton
                      url={`/api/admin/testimonials/${item._id}/approve`}
                      method="PUT"
                      label="Approve"
                      className="small-btn"
                    />
                  ) : (
                    <span className="small">Published</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

