import { redirect } from "next/navigation";
import { getServerSessionUser } from "@/lib/auth";
import { ROLE } from "@/lib/constants";
import AdminNavbar from "@/components/admin/AdminNavbar";
import AdminFooter from "@/components/admin/AdminFooter";
import { serializeUserNav } from "@/utils/serializers";

export default async function AdminLayout({ children }) {
  const user = await getServerSessionUser();
  if (!user) redirect("/login?redirect=/admin");
  if (user.role !== ROLE.ADMIN) redirect("/dashboard");
  const navUser = serializeUserNav(user);

  return (
    <div className="admin-shell">
      <AdminNavbar user={navUser} />
      <main className="admin-wrap admin-main">{children}</main>
      <AdminFooter />
    </div>
  );
}
