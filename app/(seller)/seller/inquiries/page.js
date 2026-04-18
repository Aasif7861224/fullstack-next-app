import { getServerSessionUser } from "@/lib/auth";
import { listOwnerInquiries } from "@/services/inquiryService";
import SellerInquiriesClient from "@/components/seller/SellerInquiriesClient";

export const metadata = {
  title: "Seller Inquiries",
};

export default async function SellerInquiriesPage({ searchParams }) {
  const user = await getServerSessionUser();
  const params = await searchParams;
  const initialStatus = params.status || "all";
  const items = await listOwnerInquiries(user);

  return (
    <section className="seller-panel">
      <div className="seller-headline">
        <div>
          <p className="seller-kicker">LEAD MANAGEMENT</p>
          <h1>Property Inquiries</h1>
          <p className="small">
            View only inquiries from your own listings. You can mark them read/closed for follow-up.
          </p>
        </div>
      </div>
      <SellerInquiriesClient initialItems={items} initialStatus={initialStatus} />
    </section>
  );
}
