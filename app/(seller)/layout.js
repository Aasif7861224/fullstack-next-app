import { redirect } from "next/navigation";
import { getServerSessionUser } from "@/lib/auth";
import { ROLE } from "@/lib/constants";
import SellerNavbar from "@/components/seller/SellerNavbar";
import SellerFooter from "@/components/seller/SellerFooter";
import { serializeUserNav } from "@/utils/serializers";

export default async function SellerLayout({ children }) {
  const user = await getServerSessionUser();
  if (!user) redirect("/login?redirect=/seller");
  if (user.role !== ROLE.OWNER) redirect("/dashboard");
  const navUser = serializeUserNav(user);

  return (
    <div className="seller-shell">
      <SellerNavbar user={navUser} />
      <main className="seller-wrap seller-main">{children}</main>
      <SellerFooter />
    </div>
  );
}
