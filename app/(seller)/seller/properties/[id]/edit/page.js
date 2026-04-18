import { notFound } from "next/navigation";
import { getServerSessionUser } from "@/lib/auth";
import { getManagePropertyById } from "@/services/propertyService";
import SellerPropertyForm from "@/components/seller/SellerPropertyForm";

export const metadata = {
  title: "Edit Listing",
};

export default async function SellerEditPropertyPage({ params }) {
  const user = await getServerSessionUser();
  const { id } = await params;
  let property = null;

  try {
    property = await getManagePropertyById(id, user);
  } catch {
    notFound();
  }

  return <SellerPropertyForm mode="edit" propertyId={id} initialData={property} />;
}
