import { redirect } from "next/navigation";
import { getServerSessionUser } from "@/lib/auth";
import { ROLE, ROLE_LABEL } from "@/lib/constants";
import { getUserDashboardData } from "@/services/dashboardService";

export const metadata = {
  title: "User Dashboard",
};

export default async function DashboardPage() {
  const user = await getServerSessionUser();
  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  if (user.role === ROLE.ADMIN) {
    redirect("/admin");
  }

  if (user.role === ROLE.OWNER) {
    redirect("/seller");
  }

  const data = await getUserDashboardData(user._id);
  return (
    <section className="section">
      <h1>User Dashboard</h1>
      <p className="small">
        Welcome, {user.name} ({ROLE_LABEL[user.role] || user.role})
      </p>
      <div className="grid three">
        <div className="kpi">
          <strong>{data.myProperties.length}</strong>
          <p className="small">My Properties</p>
        </div>
        <div className="kpi">
          <strong>{data.savedProperties.length}</strong>
          <p className="small">Saved Properties</p>
        </div>
        <div className="kpi">
          <strong>{data.myInquiries.length}</strong>
          <p className="small">My Inquiries</p>
        </div>
      </div>

      <h3 style={{ marginTop: "1rem" }}>Latest Saved Properties</h3>
      <ul className="small">
        {data.savedProperties.slice(0, 8).map((item) => (
          <li key={item._id}>{item.title}</li>
        ))}
      </ul>
    </section>
  );
}
