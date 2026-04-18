import Link from "next/link";
import { getServerSessionUser } from "@/lib/auth";
import { listMyProperties } from "@/services/propertyService";
import SellerPropertyActions from "@/components/seller/SellerPropertyActions";

export const metadata = {
  title: "Seller Listings",
};

function buildQuery(params, page) {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.q) query.set("q", params.q);
  query.set("page", `${page}`);
  return query.toString();
}

export default async function SellerPropertiesPage({ searchParams }) {
  const user = await getServerSessionUser();
  const params = await searchParams;
  const page = Math.max(Number(params.page || 1), 1);
  const limit = 10;
  const skip = (page - 1) * limit;
  const status = params.status || "all";
  const q = params.q || "";

  const data = await listMyProperties(user, { page, limit, skip, status, q });
  const canPrev = data.pagination.page > 1;
  const canNext = data.pagination.hasMore;

  return (
    <section className="seller-panel">
      <div className="seller-headline">
        <div>
          <p className="seller-kicker">MY INVENTORY</p>
          <h1>My Listings</h1>
          <p className="small">Create, edit, and delete your properties. Every add/edit goes for admin approval.</p>
        </div>
        <div className="seller-head-actions">
          <Link href="/seller/properties/new" className="seller-btn">
            Add Listing
          </Link>
        </div>
      </div>

      <form className="seller-filter-grid" method="GET">
        <input className="input" name="q" defaultValue={q} placeholder="Search by title, slug, city" />
        <select className="select" name="status" defaultValue={status}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="active">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button className="seller-btn" type="submit">
          Apply Filters
        </button>
      </form>

      <div className="seller-table-wrap">
        <table className="seller-table">
          <thead>
            <tr>
              <th>Property</th>
              <th>Status</th>
              <th>Price</th>
              <th>Views</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.items.length === 0 ? (
              <tr>
                <td colSpan={6}>No properties found.</td>
              </tr>
            ) : null}
            {data.items.map((item) => (
              <tr key={item._id}>
                <td>
                  <strong>{item.title}</strong>
                  <p>{item.slug}</p>
                  <p>{item.city || item.location}</p>
                </td>
                <td>
                  <span className={`status-tag ${item.status}`}>
                    {item.status === "active" ? "approved" : item.status}
                  </span>
                </td>
                <td>INR {item.price}</td>
                <td>{item.views}</td>
                <td>
                  {item.isFeatured && item.featuredTill ? (
                    <span className="status-tag active">
                      active till {new Date(item.featuredTill).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="small">Not featured</span>
                  )}
                </td>
                <td>
                  <div className="seller-actions-inline">
                    <Link className="seller-btn small-btn ghost" href={`/seller/properties/${item._id}/edit`}>
                      Edit
                    </Link>
                    <SellerPropertyActions
                      propertyId={item._id}
                      isFeatured={item.isFeatured}
                      featuredTill={item.featuredTill}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="seller-pagination">
        {canPrev ? (
          <Link href={`/seller/properties?${buildQuery({ status, q }, page - 1)}`} className="seller-btn ghost">
            Previous
          </Link>
        ) : (
          <span />
        )}
        <p className="small">
          Page {data.pagination.page} / {data.pagination.totalPages}
        </p>
        {canNext ? (
          <Link href={`/seller/properties?${buildQuery({ status, q }, page + 1)}`} className="seller-btn ghost">
            Next
          </Link>
        ) : (
          <span />
        )}
      </div>
    </section>
  );
}
