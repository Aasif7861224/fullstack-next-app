import AdminActionButton from "@/components/admin/AdminActionButton";
import { ROLE, ROLE_LABEL } from "@/lib/constants";
import { listUsers } from "@/services/adminService";

export const metadata = {
  title: "Admin Users",
};

export default async function AdminUsersPage() {
  const users = await listUsers();
  return (
    <section className="admin-panel">
      <div className="admin-headline">
        <div>
          <p className="admin-kicker">ACCESS CONTROL</p>
          <h1>User Management</h1>
          <p className="small">Activate/deactivate accounts and monitor role-level distribution.</p>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{ROLE_LABEL[user.role] || user.role}</td>
                <td>
                  {user.disabled && user.role === ROLE.OWNER ? "Pending Approval" : null}
                  {user.disabled && user.role !== ROLE.OWNER ? "Disabled" : null}
                  {!user.disabled ? "Active" : null}
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="admin-actions-inline">
                    {user.disabled ? (
                      <AdminActionButton
                        url={`/api/admin/users/${user._id}/status`}
                        method="PUT"
                        body={{ action: "activate" }}
                        label={user.role === ROLE.OWNER ? "Approve Seller" : "Activate"}
                        className="small-btn"
                      />
                    ) : (
                      <AdminActionButton
                        url={`/api/admin/users/${user._id}/status`}
                        method="PUT"
                        body={{ action: "deactivate" }}
                        label={user.role === ROLE.OWNER ? "Suspend Seller" : "Deactivate"}
                        className="small-btn ghost"
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
