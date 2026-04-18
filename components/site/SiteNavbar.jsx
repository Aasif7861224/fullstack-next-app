import { getServerSessionUser } from "@/lib/auth";
import { ROLE } from "@/lib/constants";
import PublicNavbarClient from "@/components/site/PublicNavbarClient";
import { serializeUserNav } from "@/utils/serializers";

function getDashboardHref(role) {
  if (role === ROLE.ADMIN) return "/admin";
  if (role === ROLE.OWNER) return "/seller";
  return "/dashboard";
}

export default async function SiteNavbar() {
  const user = await getServerSessionUser();
  const navUser = serializeUserNav(user);
  const dashboardHref = getDashboardHref(navUser?.role);
  return <PublicNavbarClient user={navUser} dashboardHref={dashboardHref} />;
}
