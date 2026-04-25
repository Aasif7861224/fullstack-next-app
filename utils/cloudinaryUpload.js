export const MAX_IMAGE_COUNT = 5;
export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function buildFileKey(file) {
  return [file.name, file.size, file.type, file.lastModified].join(":");
}

export function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 MB";
  }

  return `${(bytes / (1024 * 1024)).toFixed(bytes >= 1024 * 1024 ? 1 : 2)} MB`;
}

function validateUploadConfig() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Image upload is not configured. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET."
    );
  }

  return {
    cloudName,
    uploadPreset,
    folder: process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || "",
  };
}

function validateImageFile(file) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error(`${file.name} must be a JPG, PNG, or WEBP image.`);
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`${file.name} is too large. Maximum size is 5MB.`);
  }
}

export function validateSelectedImages(files, { existingCount = 0, maxCount = MAX_IMAGE_COUNT } = {}) {
  const selectedFiles = Array.from(files || []).filter(Boolean);
  const uniqueFiles = [];
  const seenKeys = new Set();

  selectedFiles.forEach((file) => {
    validateImageFile(file);
    const fileKey = buildFileKey(file);
    if (seenKeys.has(fileKey)) {
      return;
    }

    seenKeys.add(fileKey);
    uniqueFiles.push(file);
  });

  const remainingSlots = Math.max(maxCount - existingCount, 0);
  if (existingCount + uniqueFiles.length > maxCount) {
    if (remainingSlots === 0) {
      throw new Error(`You already have ${maxCount} images. Remove one before adding another.`);
    }

    throw new Error(`You can upload up to ${maxCount} images total. Select ${remainingSlots} or fewer new image(s).`);
  }

  return uniqueFiles;
}

function uploadSingleImage(file, config, onProgress) {
  return new Promise((resolve, reject) => {
    const endpoint = `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`;
    const payload = new FormData();
    payload.append("file", file);
    payload.append("upload_preset", config.uploadPreset);

    if (config.folder) {
      payload.append("folder", config.folder);
    }

    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint);
    xhr.timeout = 45000;

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }
      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onerror = () => {
      reject(new Error(`Upload failed for ${file.name}. Check your network and try again.`));
    };

    xhr.ontimeout = () => {
      reject(new Error(`Upload timed out for ${file.name}. Please try again.`));
    };

    xhr.onload = () => {
      let body = null;

      try {
        body = JSON.parse(xhr.responseText || "{}");
      } catch {
        reject(new Error(`Upload failed for ${file.name}. Cloudinary returned an invalid response.`));
        return;
      }

      if (xhr.status < 200 || xhr.status >= 300 || !body?.secure_url) {
        reject(new Error(body?.error?.message || `Upload failed for ${file.name}.`));
        return;
      }

      resolve(body);
    };

    xhr.send(payload);
  });
}

export async function uploadImagesToCloudinary(files, { cache, onProgress } = {}) {
  const selectedFiles = validateSelectedImages(files);

  if (!selectedFiles.length) {
    onProgress?.(100);
    return [];
  }

  const config = validateUploadConfig();
  const fileProgress = selectedFiles.map(() => 0);
  const fileKeyIndexes = new Map();
  const pendingUploads = new Map();

  selectedFiles.forEach((file, index) => {
    const fileKey = buildFileKey(file);
    const indexes = fileKeyIndexes.get(fileKey) || [];
    indexes.push(index);
    fileKeyIndexes.set(fileKey, indexes);
  });

  const emitProgress = () => {
    const total = fileProgress.reduce((sum, item) => sum + item, 0);
    onProgress?.(Math.round(total / selectedFiles.length));
  };

  const images = await Promise.all(
    selectedFiles.map(async (file, index) => {
      validateImageFile(file);

      const fileKey = buildFileKey(file);
      const cachedImage = cache?.get(fileKey);

      if (cachedImage) {
        fileProgress[index] = 100;
        emitProgress();
        return {
          ...cachedImage,
          isPrimary: index === 0,
        };
      }

      let uploadPromise = pendingUploads.get(fileKey);

      if (!uploadPromise) {
        uploadPromise = uploadSingleImage(file, config, (percent) => {
          (fileKeyIndexes.get(fileKey) || [index]).forEach((progressIndex) => {
            fileProgress[progressIndex] = percent;
          });
          emitProgress();
        })
          .then((uploaded) => {
            const image = {
              url: uploaded.secure_url,
              altText: file.name || `property image ${index + 1}`,
            };

            cache?.set(fileKey, image);
            return image;
          })
          .finally(() => {
            pendingUploads.delete(fileKey);
          });

        pendingUploads.set(fileKey, uploadPromise);
      }

      const uploadedImage = await uploadPromise;
      fileProgress[index] = 100;
      emitProgress();

      return {
        ...uploadedImage,
        isPrimary: index === 0,
      };
    })
  );

  return images;
}
