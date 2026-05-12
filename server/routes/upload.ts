/**
 * Cloudinary Upload API — Server routes for image upload.
 *
 * POST /api/upload
 * Body: { image: string (base64 or URL), folder?: string }
 * Response: { url: string, publicId: string, width: number, height: number }
 *
 * POST /api/upload/multiple
 * Body: { images: string[], folder?: string }
 * Response: { urls: Array<{ url, publicId, width, height }> }
 *
 * DELETE /api/upload/:publicId
 * Deletes an image from Cloudinary.
 */
import { eventHandler, readBody } from 'h3';
import { v2 as cloudinary } from 'cloudinary';

// ── Cloudinary Config ─────────────────────────────────────────────────────────

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

// ── Upload Helper ──────────────────────────────────────────────────────────────

async function uploadToCloudinary(
  imageSource: string,
  folder: string = 'bexiemart'
): Promise<{ url: string; publicId: string; width: number; height: number }> {
  const result = await cloudinary.uploader.upload(imageSource, {
    folder,
    transformation: [
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ],
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  };
}

// ── Routes ─────────────────────────────────────────────────────────────────────

export const uploadSingle = eventHandler(async (event) => {
  const body = await readBody(event);
  const { image, folder } = body as { image: string; folder?: string };

  if (!image) {
    throw new Error('Image data is required');
  }

  const result = await uploadToCloudinary(image, folder);
  return result;
});

export const uploadMultiple = eventHandler(async (event) => {
  const body = await readBody(event);
  const { images, folder } = body as { images: string[]; folder?: string };

  if (!images || images.length === 0) {
    throw new Error('Image data is required');
  }

  const results = await Promise.all(
    images.map((img) => uploadToCloudinary(img, folder))
  );

  return { urls: results };
});

export const deleteImage = eventHandler(async (event) => {
  const publicId = event.context.params?.publicId;

  if (!publicId) {
    throw new Error('Public ID is required');
  }

  const result = await cloudinary.uploader.destroy(publicId);
  return { result: result.result };
});

// ── Generate Upload Signature (for client-side direct upload) ─────────────────

export const generateSignature = eventHandler(async (event) => {
  const body = await readBody(event);
  const { folder, timestamp } = body as { folder?: string; timestamp?: number };

  const ts = timestamp || Math.round(Date.now() / 1000);
  const folderName = folder || 'bexiemart';

  const signature = cloudinary.utils.api_sign_request(
    { timestamp: ts, folder: folderName },
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp: ts,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    folder: folderName,
  };
});
