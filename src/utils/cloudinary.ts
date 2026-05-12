/**
 * Cloudinary Upload — Client-side image upload utility for React Native.
 *
 * Two modes:
 * 1. Server-proxy upload: Sends image to our backend /api/upload, which uploads to Cloudinary
 * 2. Direct upload: Gets signature from backend, uploads directly to Cloudinary (faster)
 *
 * Direct upload is preferred for multiple images as it bypasses the server.
 */
import { Platform } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { API_BASE_URL } from '@/utils/constants';

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

/**
 * Compress and resize image before upload.
 * Returns base64 data URI.
 */
async function prepareImage(uri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1200 } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );
  return `data:image/jpeg;base64,${result.base64!}`;
}

/**
 * Upload a single image via server proxy.
 * Best for single uploads or when direct upload isn't configured.
 */
export async function uploadImage(uri: string, folder?: string): Promise<UploadResult> {
  const base64Image = await prepareImage(uri);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image, folder: folder ?? 'products' }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(error.message);
  }

  return response.json();
}

/**
 * Upload multiple images via server proxy.
 */
export async function uploadImages(
  uris: string[],
  folder?: string
): Promise<UploadResult[]> {
  const base64Images = await Promise.all(uris.map(prepareImage));

  const response = await fetch(`${API_BASE_URL}/upload/multiple`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ images: base64Images, folder: folder ?? 'products' }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(error.message);
  }

  const data = await response.json();
  return data.urls;
}

/**
 * Upload a single image directly to Cloudinary (bypasses server).
 * Requires Cloudinary credentials to be exposed via the signature endpoint.
 * Faster for large files and multiple uploads.
 */
export async function uploadImageDirect(
  uri: string,
  folder: string = 'products'
): Promise<UploadResult> {
  const base64Image = await prepareImage(uri);

  // Get upload signature from our server
  const timestamp = Math.round(Date.now() / 1000);
  const sigResponse = await fetch(`${API_BASE_URL}/upload/signature`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder, timestamp }),
  });

  if (!sigResponse.ok) {
    throw new Error('Failed to get upload signature');
  }

  const { signature, apiKey, cloudName } = await sigResponse.json();

  // Upload directly to Cloudinary
  const formData = new FormData();
  formData.append('file', {
    uri: Platform.OS === 'web' ? uri : uri.replace('file://', ''),
    type: 'image/jpeg',
    name: `${Date.now()}.jpg`,
  } as any);
  formData.append('api_key', apiKey);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);
  formData.append('folder', folder);

  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const uploadResponse = await fetch(cloudinaryUrl, {
    method: 'POST',
    body: formData,
  });

  if (!uploadResponse.ok) {
    throw new Error('Cloudinary upload failed');
  }

  const result = await uploadResponse.json();

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  };
}

/**
 * Upload multiple images directly to Cloudinary.
 */
export async function uploadImagesDirect(
  uris: string[],
  folder: string = 'products'
): Promise<UploadResult[]> {
  return Promise.all(uris.map((uri) => uploadImageDirect(uri, folder)));
}

/**
 * Delete an image from Cloudinary via server.
 */
export async function deleteImage(publicId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/upload/${encodeURIComponent(publicId)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete image');
  }
}
