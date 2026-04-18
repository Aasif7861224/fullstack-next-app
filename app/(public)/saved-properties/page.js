import { env } from "@/lib/env";
import { getServerSessionUser } from "@/lib/auth";
import { listSavedProperties } from "@/services/propertyService";
import AuthGatePrompt from "@/components/public/AuthGatePrompt";
import SavedPropertiesList from "@/components/public/SavedPropertiesList";
import { serializePagination, serializePublicProperty } from "@/utils/serializers";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Saved Properties | UrbanKeys",
  description: "Access your shortlisted properties and continue your property search journey.",
  alternates: { canonical: `${env.appUrl}/saved-properties` },
};

export default async function SavedPropertiesPage() {
  const user = await getServerSessionUser();
  if (!user) {
    return (
      <section className="public-wrap page-shell">
        <div data-reveal>
          <AuthGatePrompt
            title="Saved Properties"
            description="Save interesting listings and access them quickly from one place."
            redirect="/saved-properties"
          />
        </div>
      </section>
    );
  }

  const data = await listSavedProperties(user, { page: 1, limit: 12, skip: 0 });
  const initialItems = data.items.map((item) => ({
    ...serializePublicProperty(item),
    isSavedByCurrentUser: true,
  }));
  const initialPagination = serializePagination(data.pagination);

  return (
    <section className="public-wrap page-shell">
      <div className="public-section">
        <div className="public-section-head" data-reveal>
          <h1>Saved Properties</h1>
          <p className="public-muted">Your shortlisted listings for quick comparison and follow-up.</p>
        </div>
        <div data-reveal>
          <SavedPropertiesList initialItems={initialItems} initialPagination={initialPagination} />
        </div>
      </div>
    </section>
  );
}
