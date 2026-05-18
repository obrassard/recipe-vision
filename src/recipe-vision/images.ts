import { readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const MAX_IMAGE_DIMENSION = 8000;

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg"]);
type SupportedMediaType = "image/png" | "image/jpeg";

export async function findImages(repositoryPath: string): Promise<string[]> {
  const absoluteRepositoryPath = path.resolve(repositoryPath);
  const entries = await readdir(absoluteRepositoryPath, { withFileTypes: true });
  const imagePaths: string[] = [];

  for (const entry of entries) {
    if (!entry.isFile()) {
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();

    if (IMAGE_EXTENSIONS.has(extension)) {
      imagePaths.push(path.join(absoluteRepositoryPath, entry.name));
    }
  }

  return imagePaths.sort((left, right) => left.localeCompare(right));
}

export function getMediaType(imagePath: string): SupportedMediaType {
  const extension = path.extname(imagePath).toLowerCase();

  if (extension === ".png") {
    return "image/png";
  }

  if (extension === ".jpg" || extension === ".jpeg") {
    return "image/jpeg";
  }

  throw new Error(`Unsupported image type for file: ${imagePath}`);
}

/**
 * Returns a buffer with the image resized to fit within MAX_IMAGE_DIMENSION x MAX_IMAGE_DIMENSION.
 * If the image is already within bounds, returns the original buffer unchanged.
 */
export async function resizeImageIfNeeded(imagePath: string): Promise<{ buffer: Buffer; mediaType: SupportedMediaType }> {
  const mediaType = getMediaType(imagePath);
  const image = sharp(imagePath);
  const { width, height } = await image.metadata();

  const needsResize = (width && width > MAX_IMAGE_DIMENSION) || (height && height > MAX_IMAGE_DIMENSION);

  const buffer = needsResize
    ? await image.resize(MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION, { fit: "inside", withoutEnlargement: true }).toBuffer()
    : Buffer.from(await Bun.file(imagePath).arrayBuffer());

  return { buffer, mediaType };
}

