import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { AppError } from "@/utils/errors";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

function extensionFromMime(mime) {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "bin";
}

export async function persistImageFiles(files) {
  if (!files?.length) return [];

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  try {
    await fs.mkdir(uploadDir, { recursive: true });
  } catch (error) {
    throw new AppError(503, "Image upload storage is unavailable in this environment", {
      code: error?.code || null,
    });
  }

  const images = [];
  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    if (!ALLOWED_MIME.has(file.type)) {
      throw new AppError(400, `Unsupported image type: ${file.type}`);
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new AppError(400, `${file.name} is too large. Max 5MB allowed.`);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = extensionFromMime(file.type);
    const randomName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
    const absolutePath = path.join(uploadDir, randomName);
    try {
      await fs.writeFile(absolutePath, buffer);
    } catch (error) {
      throw new AppError(503, "Image upload storage is unavailable in this environment", {
        code: error?.code || null,
      });
    }

    images.push({
      url: `/uploads/${randomName}`,
      isPrimary: index === 0,
      altText: file.name || "property image",
    });
  }

  if (!images.some((img) => img.isPrimary) && images.length > 0) {
    images[0].isPrimary = true;
  }
  return images;
}
