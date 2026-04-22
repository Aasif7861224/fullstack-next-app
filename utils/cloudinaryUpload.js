const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function buildFileKey(file) {
  return [file.name, file.size, file.type, file.lastModified].join(":");
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
  const selectedFiles = Array.from(files || []).filter(Boolean);

  if (!selectedFiles.length) {
    onProgress?.(100);
    return [];
  }

  const config = validateUploadConfig();
  const fileProgress = selectedFiles.map(() => 0);

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

      const uploaded = await uploadSingleImage(file, config, (percent) => {
        fileProgress[index] = percent;
        emitProgress();
      });

      const image = {
        url: uploaded.secure_url,
        altText: file.name || `property image ${index + 1}`,
        isPrimary: index === 0,
      };

      cache?.set(fileKey, image);
      fileProgress[index] = 100;
      emitProgress();
      return image;
    })
  );

  return images;
}
