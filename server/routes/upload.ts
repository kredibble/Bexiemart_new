import { eventHandler, readBody, getRouterParam, setResponseStatus, createError } from 'h3';
import { v2 as cloudinary } from 'cloudinary';
import { requireAuth } from '../middleware/auth';
import { success, error } from '../utils/response';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_BATCH_SIZE = 10;
const ALLOWED_MIME_PREFIXES = ['image/', 'application/pdf'];

function isBase64Image(str: string): boolean {
  const mimeMatch = str.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
  if (mimeMatch) {
    const mimeType = mimeMatch[1];
    return ALLOWED_MIME_PREFIXES.some((p) => mimeType.startsWith(p));
  }
  // URL-based images — accept http/https URLs
  if (str.startsWith('http://') || str.startsWith('https://')) return true;
  return false;
}

function getBase64Size(str: string): number {
  // Strip data:...;base64, prefix → get raw base64 size
  const base64Data = str.replace(/^data:image\/\w+;base64,/, '');
  return Math.ceil((base64Data.length * 3) / 4);
}

async function uploadToCloudinary(
  imageSource: string,
  folder: string = 'bexiemart'
): Promise<{ url: string; publicId: string; width: number; height: number }> {
  const result = await cloudinary.uploader.upload(imageSource, {
    folder,
    transformation: [
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
      { max_bytes: MAX_FILE_SIZE },
    ],
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  };
}

export const uploadSingle = eventHandler(async (event) => {
  await requireAuth(event);
  const body = await readBody(event);
  const { image, folder } = body as { image: string; folder?: string };

  if (!image) {
    setResponseStatus(event, 400);
    return error(event as any, 400, 'Image data is required');
  }

  if (!isBase64Image(image)) {
    setResponseStatus(event, 400);
    return error(event as any, 400, 'Invalid image format. Only images and PDFs are allowed');
  }

  if (getBase64Size(image) > MAX_FILE_SIZE) {
    setResponseStatus(event, 400);
    return error(event as any, 400, 'Image exceeds maximum size of 10MB');
  }

  const result = await uploadToCloudinary(image, folder);
  return result;
});

export const uploadMultiple = eventHandler(async (event) => {
  await requireAuth(event);
  const body = await readBody(event);
  const { images, folder } = body as { images: string[]; folder?: string };

  if (!images || images.length === 0) {
    setResponseStatus(event, 400);
    return error(event as any, 400, 'Images array is required');
  }

  if (images.length > MAX_BATCH_SIZE) {
    setResponseStatus(event, 400);
    return error(event as any, 400, `Maximum ${MAX_BATCH_SIZE} images per request`);
  }

  for (const img of images) {
    if (!isBase64Image(img)) {
      setResponseStatus(event, 400);
      return error(event as any, 400, 'Invalid image format detected in batch');
    }
    if (getBase64Size(img) > MAX_FILE_SIZE) {
      setResponseStatus(event, 400);
      return error(event as any, 400, 'One or more images exceed maximum size of 10MB');
    }
  }

  const results = await Promise.all(
    images.map((img) => uploadToCloudinary(img, folder))
  );

  return { urls: results };
});

export const deleteImage = eventHandler(async (event) => {
  await requireAuth(event);
  const publicId = event.context.params?.publicId;

  if (!publicId) {
    setResponseStatus(event, 400);
    return error(event as any, 400, 'Public ID is required');
  }

  const result = await cloudinary.uploader.destroy(publicId);
  return { result: result.result };
});

export const generateSignature = eventHandler(async (event) => {
  await requireAuth(event);
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
