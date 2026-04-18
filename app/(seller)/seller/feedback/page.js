import Link from "next/link";
import { getServerSessionUser } from "@/lib/auth";
import { listSellerFeedback } from "@/services/sellerService";
import SellerFeedbackClient from "@/components/seller/SellerFeedbackClient";

export const metadata = {
  title: "Seller Feedback",
};

function buildQuery({ status }, page) {
  const query = new URLSearchParams();
  if (status && status !== "all") query.set("status", status);
  query.set("page", `${page}`);
  return query.toString();
}

export default async function SellerFeedbackPage({ searchParams }) {
  const user = await getServerSessionUser();
  const params = await searchParams;
  const page = Math.max(Number(params.page || 1), 1);
  const limit = 10;
  const skip = (page - 1) * limit;
  const status = params.status || "all";

  const data = await listSellerFeedback(user, { page, limit, skip, status });
  const canPrev = data.pagination.page > 1;
  const canNext = data.pagination.hasMore;

  return (
    <section className="seller-panel">
      <div className="seller-headline">
        <div>
          <p className="seller-kicker">SUPPORT CHANNEL</p>
          <h1>Feedback to Admin</h1>
          <p className="small">Raise issues, request features, and track admin responses.</p>
        </div>
      </div>

      <SellerFeedbackClient data={data} status={status} />

      <div className="seller-pagination">
        {canPrev ? (
          <Link href={`/seller/feedback?${buildQuery({ status }, page - 1)}`} className="seller-btn ghost">
            Previous
          </Link>
        ) : (
          <span />
        )}
        <p className="small">
          Page {data.pagination.page} / {data.pagination.totalPages}
        </p>
        {canNext ? (
          <Link href={`/seller/feedback?${buildQuery({ status }, page + 1)}`} className="seller-btn ghost">
            Next
          </Link>
        ) : (
          <span />
        )}
      </div>
    </section>
  );
}
