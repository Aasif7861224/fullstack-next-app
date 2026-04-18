import { parsePagination } from "@/lib/pagination";
import { getAuthUserFromRequest, getOptionalAuthUserFromRequest } from "@/lib/auth";
import {
  createPropertyFromForm,
  getSavedPropertyIdSet,
  getManagePropertyById,
  getPropertyBySlug,
  incrementPropertyView,
  listSavedProperties,
  listMyProperties,
  listPublicProperties,
  saveProperty,
  softDeleteProperty,
  unsaveProperty,
  updatePropertyFromForm,
} from "@/services/propertyService";
import { serializePagination, serializePublicProperty } from "@/utils/serializers";

function buildQuery(searchParams) {
  return {
    q: searchParams.get("q") || "",
    city: searchParams.get("city") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    bhk: searchParams.get("bhk") || "",
    propertyType: searchParams.get("propertyType") || "",
    rentOrSell: searchParams.get("rentOrSell") || "",
    sort: searchParams.get("sort") || "",
  };
}

function serializePropertyListPayload(data, savedIdSet = null) {
  const items = data.items.map((item) => {
    const serialized = serializePublicProperty(item);
    if (savedIdSet) {
      serialized.isSavedByCurrentUser = savedIdSet.has(serialized._id);
    }
    return serialized;
  });

  return {
    ...data,
    items,
    pagination: serializePagination(data.pagination),
  };
}

export async function listPublicPropertiesController(request, responseBuilder) {
  const { searchParams } = new URL(request.url);
  const query = buildQuery(searchParams);
  const { page, limit, skip } = parsePagination(searchParams);
  const [data, user] = await Promise.all([
    listPublicProperties({ page, limit, skip, query }),
    getOptionalAuthUserFromRequest(request),
  ]);

  if (!user) return responseBuilder(serializePropertyListPayload(data));

  const savedIdSet = await getSavedPropertyIdSet(user._id);
  return responseBuilder(serializePropertyListPayload(data, savedIdSet));
}

export async function getPropertyBySlugController(slug, responseBuilder) {
  const data = await getPropertyBySlug(slug);
  return responseBuilder(serializePublicProperty(data));
}

export async function incrementPropertyViewController(slug, responseBuilder) {
  const data = await incrementPropertyView(slug);
  return responseBuilder(data);
}

export async function createPropertyController(request, responseBuilder) {
  const user = await getAuthUserFromRequest(request);
  const formData = await request.formData();
  const property = await createPropertyFromForm(formData, user);
  return responseBuilder(serializePublicProperty(property), 201);
}

export async function updatePropertyController(id, request, responseBuilder) {
  const user = await getAuthUserFromRequest(request);
  const formData = await request.formData();
  const property = await updatePropertyFromForm(id, formData, user);
  return responseBuilder(serializePublicProperty(property));
}

export async function deletePropertyController(id, request, responseBuilder) {
  const user = await getAuthUserFromRequest(request);
  const result = await softDeleteProperty(id, user);
  return responseBuilder(result);
}

export async function listMyPropertiesController(request, responseBuilder) {
  const user = await getAuthUserFromRequest(request);
  const { searchParams } = new URL(request.url);
  const { page, limit, skip } = parsePagination(searchParams);
  const status = searchParams.get("status");
  const q = searchParams.get("q") || "";
  const data = await listMyProperties(user, { page, limit, skip, status, q });
  return responseBuilder(data);
}

export async function getManagedPropertyController(id, request, responseBuilder) {
  const user = await getAuthUserFromRequest(request);
  const data = await getManagePropertyById(id, user);
  return responseBuilder(data);
}

export async function savePropertyController(id, request, responseBuilder) {
  const user = await getAuthUserFromRequest(request);
  const data = await saveProperty(user, id);
  return responseBuilder(data);
}

export async function unsavePropertyController(id, request, responseBuilder) {
  const user = await getAuthUserFromRequest(request);
  const data = await unsaveProperty(user, id);
  return responseBuilder(data);
}

export async function listSavedPropertiesController(request, responseBuilder) {
  const user = await getAuthUserFromRequest(request);
  const { searchParams } = new URL(request.url);
  const { page, limit, skip } = parsePagination(searchParams);
  const data = await listSavedProperties(user, { page, limit, skip });
  const serialized = serializePropertyListPayload(data);
  serialized.items = serialized.items.map((item) => ({ ...item, isSavedByCurrentUser: true }));
  return responseBuilder(serialized);
}
