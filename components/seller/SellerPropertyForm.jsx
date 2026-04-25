"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useTopLoader } from "@/components/site/TopLoaderProvider";
import { useLoaderRouter } from "@/components/site/useLoaderRouter";
import { getOptimizedCloudinaryUrl } from "@/utils/cloudinaryImage";
import {
  MAX_IMAGE_COUNT,
  formatFileSize,
  uploadImagesToCloudinary,
  validateSelectedImages,
} from "@/utils/cloudinaryUpload";

function normalizePrimary(images) {
  if (!images.length) return images;
  let primaryIndex = images.findIndex((item) => item.isPrimary);
  if (primaryIndex < 0) primaryIndex = 0;
  return images.map((item, index) => ({
    ...item,
    isPrimary: index === primaryIndex,
  }));
}

function mapInitialForm(initialData = {}) {
  return {
    title: initialData.title || "",
    location: initialData.location || "",
    city: initialData.city || "",
    latitude: initialData.latitude ?? "",
    longitude: initialData.longitude ?? "",
    price: initialData.price ?? "",
    bhk: initialData.bhk ?? "",
    propertyType: initialData.propertyType || "Flat",
    rentOrSell: initialData.rentOrSell || "Sell",
    description: initialData.description || "",
    amenities: Array.isArray(initialData.amenities) ? initialData.amenities.join(", ") : "",
  };
}

export default function SellerPropertyForm({ mode = "create", propertyId = "", initialData = null }) {
  const router = useLoaderRouter();
  const topLoader = useTopLoader();
  const [form, setForm] = useState(mapInitialForm(initialData || {}));
  const [existingImages, setExistingImages] = useState(normalizePrimary(initialData?.images || []));
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectionMessage, setSelectionMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const uploadCacheRef = useRef(new Map());

  const isEdit = mode === "edit";
  const remainingImageSlots = Math.max(MAX_IMAGE_COUNT - existingImages.length, 0);
  const remainingAfterSelection = Math.max(MAX_IMAGE_COUNT - existingImages.length - files.length, 0);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePrimary = (index) => {
    setExistingImages((prev) =>
      prev.map((img, imgIndex) => ({
        ...img,
        isPrimary: imgIndex === index,
      }))
    );
  };

  const handleRemoveImage = (index) => {
    setExistingImages((prev) => normalizePrimary(prev.filter((_, imgIndex) => imgIndex !== index)));
  };

  const handleFileChange = (event) => {
    const nextSelection = Array.from(event.target.files || []);

    if (!nextSelection.length) {
      setFiles([]);
      setSelectionMessage("");
      setError("");
      return;
    }

    try {
      const nextFiles = validateSelectedImages(nextSelection, {
        existingCount: existingImages.length,
      });

      setFiles(nextFiles);
      setError("");
      setSelectionMessage(
        nextFiles.length < nextSelection.length
          ? "Duplicate images were skipped. Ready to upload the remaining files."
          : `${nextFiles.length} image(s) ready. Images upload to Cloudinary when you save the listing.`
      );
      event.target.value = "";
    } catch (err) {
      setError(err.message || "Please review your selected images and try again.");
      setSelectionMessage("");
      event.target.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");
    setUploadProgress(files.length ? 0 : 100);
    setStatusText(files.length ? "Uploading images to Cloudinary..." : "Saving listing...");
    topLoader.start(6);

    try {
      const preparedFiles = validateSelectedImages(files, {
        existingCount: existingImages.length,
      });
      let uploadedImages = [];

      if (preparedFiles.length) {
        uploadedImages = await uploadImagesToCloudinary(preparedFiles, {
          cache: uploadCacheRef.current,
          onProgress: (percent) => {
            setUploadProgress(percent);
            topLoader.setProgress(Math.max(12, Math.min(88, percent)));
          },
        });
      }

      setStatusText("Saving listing...");
      topLoader.setProgress(94);

      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        payload.append(key, `${value}`);
      });

      if (isEdit) {
        payload.append("existingImages", JSON.stringify(existingImages));
      }

      payload.append("uploadedImages", JSON.stringify(uploadedImages));

      const endpoint = isEdit ? `/api/properties/manage/${propertyId}` : "/api/properties";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(endpoint, { method, body: payload });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to save property");
      }

      topLoader.finish();
      router.push("/seller/properties");
      router.refresh();
    } catch (err) {
      topLoader.fail();
      setError(err.message || "Something went wrong while saving the property.");
    } finally {
      setLoading(false);
      setStatusText("");
    }
  };

  return (
    <section className="seller-panel">
      <div className="seller-headline">
        <div>
          <p className="seller-kicker">LISTING WORKSPACE</p>
          <h1>{isEdit ? "Edit Listing" : "Add Listing"}</h1>
          <p className="small">Important: listing updates are shown publicly only after admin approval.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="seller-form-grid">
        <label>
          Title
          <input
            className="input"
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            required
          />
        </label>

        <label>
          Location
          <input
            className="input"
            value={form.location}
            onChange={(event) => updateField("location", event.target.value)}
            required
          />
        </label>

        <label>
          City
          <input
            className="input"
            value={form.city}
            onChange={(event) => updateField("city", event.target.value)}
          />
        </label>

        <label>
          Price
          <input
            className="input"
            type="number"
            min="1"
            value={form.price}
            onChange={(event) => updateField("price", event.target.value)}
            required
          />
        </label>

        <label>
          BHK
          <input
            className="input"
            type="number"
            min="1"
            value={form.bhk}
            onChange={(event) => updateField("bhk", event.target.value)}
          />
        </label>

        <label>
          Property Type
          <select
            className="select"
            value={form.propertyType}
            onChange={(event) => updateField("propertyType", event.target.value)}
          >
            <option value="Flat">Flat</option>
            <option value="Villa">Villa</option>
            <option value="House">House</option>
            <option value="Plot">Plot</option>
            <option value="Other">Other</option>
          </select>
        </label>

        <label>
          Rent or Sell
          <select
            className="select"
            value={form.rentOrSell}
            onChange={(event) => updateField("rentOrSell", event.target.value)}
            required
          >
            <option value="Sell">Sell</option>
            <option value="Rent">Rent</option>
          </select>
        </label>

        <label>
          Latitude
          <input
            className="input"
            value={form.latitude}
            onChange={(event) => updateField("latitude", event.target.value)}
          />
        </label>

        <label>
          Longitude
          <input
            className="input"
            value={form.longitude}
            onChange={(event) => updateField("longitude", event.target.value)}
          />
        </label>

        <label className="seller-form-full">
          Amenities (comma separated)
          <input
            className="input"
            value={form.amenities}
            onChange={(event) => updateField("amenities", event.target.value)}
            placeholder="Parking, Lift, Garden"
          />
        </label>

        <label className="seller-form-full">
          Description
          <textarea
            className="textarea"
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            rows={6}
          />
        </label>

        {isEdit && existingImages.length > 0 ? (
          <div className="seller-form-full">
            <p className="small">Existing Images</p>
            <div className="seller-image-grid">
              {existingImages.map((img, index) => (
                <article key={`${img.url}-${index}`} className="seller-image-card">
                  <div className="seller-image-thumb">
                    <Image
                      src={getOptimizedCloudinaryUrl(img.url, "thumbnail")}
                      alt={img.altText || `image ${index + 1}`}
                      fill
                      sizes="(max-width: 1020px) 50vw, 180px"
                    />
                  </div>
                  <div>
                    <label className="small">
                      <input
                        type="radio"
                        checked={img.isPrimary}
                        onChange={() => handlePrimary(index)}
                        name="primaryImage"
                      />{" "}
                      Primary
                    </label>
                  </div>
                  <button
                    type="button"
                    className="seller-btn small-btn ghost"
                    onClick={() => handleRemoveImage(index)}
                  >
                    Remove
                  </button>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        <label className="seller-form-full">
          Upload Images
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="input"
            onChange={handleFileChange}
            disabled={loading || remainingImageSlots === 0}
          />
          <p className="small">
            Upload up to {MAX_IMAGE_COUNT} images total.{" "}
            {files.length ? `${remainingAfterSelection} slot(s) left after this selection.` : `${remainingImageSlots} slot(s) available right now.`}
          </p>
          {files.length ? (
            <>
              <p className="small">{files.length} file(s) selected. Images upload directly to Cloudinary on save.</p>
              <div className="seller-upload-list">
                {files.map((file) => (
                  <div key={`${file.name}-${file.lastModified}`} className="seller-upload-pill">
                    <strong>{file.name}</strong>
                    <span>{formatFileSize(file.size)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : null}
          {selectionMessage ? <p className="small" style={{ color: "#2b6e5c" }}>{selectionMessage}</p> : null}
        </label>

        {loading ? (
          <div className="seller-form-full seller-upload-status" aria-live="polite">
            <div className="seller-upload-meta">
              <span>{statusText || "Working..."}</span>
              {files.length ? <strong>{uploadProgress}%</strong> : null}
            </div>
            <div className="seller-upload-progress" aria-hidden="true">
              <span style={{ width: `${files.length ? uploadProgress : 100}%` }} />
            </div>
          </div>
        ) : null}

        {error ? <p className="small" style={{ color: "#fca5a5" }}>{error}</p> : null}

        <div className="seller-form-full seller-actions-inline">
          <button className="seller-btn" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="btn-spinner" aria-hidden="true" />
                <span>{files.length ? "Uploading..." : "Saving..."}</span>
              </>
            ) : (
              <span>{isEdit ? "Update Listing" : "Create Listing"}</span>
            )}
          </button>
          <button
            className="seller-btn ghost"
            type="button"
            onClick={() => router.push("/seller/properties")}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
