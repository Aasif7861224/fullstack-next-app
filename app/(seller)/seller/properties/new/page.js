import SellerPropertyForm from "@/components/seller/SellerPropertyForm";

export const metadata = {
  title: "Add Listing",
};

export default function SellerAddPropertyPage() {
  return <SellerPropertyForm mode="create" />;
}
