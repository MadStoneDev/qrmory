// lib/r2-storage.ts
// Cloudflare R2 storage utility for video and PDF uploads
// R2 is S3-compatible, so we use the AWS SDK

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// R2 Configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "qrmory-media";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL; // Optional: Custom domain or R2.dev URL

// Initialize S3 client for R2
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  size?: number;
  error?: string;
}

export interface R2FileInfo {
  key: string;
  size: number;
  lastModified: Date;
}

/**
 * Upload a file to R2 storage
 */
export async function uploadToR2(
  file: Buffer,
  key: string,
  contentType: string
): Promise<UploadResult> {
  try {
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
      // R2 doesn't support ACL, files are private by default
      // Use R2_PUBLIC_URL or signed URLs for access
    });

    await r2Client.send(command);

    const url = getPublicUrl(key);

    return {
      success: true,
      url,
      key,
      size: file.length,
    };
  } catch (error) {
    console.error("R2 upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * Delete a file from R2 storage
 */
export async function deleteFromR2(key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    await r2Client.send(command);
    return true;
  } catch (error) {
    console.error("R2 delete error:", error);
    return false;
  }
}

/**
 * Check if a file exists and get its metadata
 */
export async function getFileInfo(key: string): Promise<R2FileInfo | null> {
  try {
    const command = new HeadObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    const response = await r2Client.send(command);

    return {
      key,
      size: response.ContentLength || 0,
      lastModified: response.LastModified || new Date(),
    };
  } catch (error) {
    return null;
  }
}

/**
 * List all files for a user (prefix-based)
 */
export async function listUserFiles(
  userId: string,
  fileType?: "video" | "pdf"
): Promise<R2FileInfo[]> {
  try {
    const prefix = fileType ? `${userId}/${fileType}/` : `${userId}/`;

    const command = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: prefix,
      MaxKeys: 1000,
    });

    const response = await r2Client.send(command);

    if (!response.Contents) return [];

    return response.Contents.map((item) => ({
      key: item.Key || "",
      size: item.Size || 0,
      lastModified: item.LastModified || new Date(),
    }));
  } catch (error) {
    console.error("R2 list error:", error);
    return [];
  }
}

/**
 * Calculate total storage used by a user in R2
 */
export async function getUserR2StorageUsage(userId: string): Promise<number> {
  const files = await listUserFiles(userId);
  return files.reduce((total, file) => total + file.size, 0);
}

/**
 * Delete all files for a user
 */
export async function deleteUserR2Files(userId: string): Promise<number> {
  const files = await listUserFiles(userId);
  let deletedCount = 0;

  for (const file of files) {
    const success = await deleteFromR2(file.key);
    if (success) deletedCount++;
  }

  return deletedCount;
}

/**
 * Generate a presigned URL for direct upload (client-side)
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return await getSignedUrl(r2Client, command, { expiresIn });
}

/**
 * Get the public URL for a file
 * Uses custom domain if configured, otherwise constructs R2.dev URL
 */
export function getPublicUrl(key: string): string {
  if (R2_PUBLIC_URL) {
    return `${R2_PUBLIC_URL}/${key}`;
  }
  // Fallback to R2.dev public URL (requires public bucket setting in R2)
  return `https://pub-${R2_ACCOUNT_ID}.r2.dev/${key}`;
}

/**
 * Generate a unique file key for storage
 */
export function generateFileKey(
  userId: string,
  fileType: "video" | "pdf",
  originalFilename: string
): string {
  const timestamp = Date.now();
  const ext = originalFilename.split(".").pop()?.toLowerCase() || fileType;
  const sanitizedName = originalFilename
    .replace(/\.[^/.]+$/, "") // Remove extension
    .replace(/[^a-zA-Z0-9-_]/g, "_") // Sanitize
    .substring(0, 50); // Limit length

  return `${userId}/${fileType}/${timestamp}-${sanitizedName}.${ext}`;
}

/**
 * Validate file type against allowed types
 */
export function isValidFileType(
  mimeType: string,
  allowedTypes: string[]
): boolean {
  return allowedTypes.includes(mimeType);
}

export const R2_CONFIG = {
  bucketName: R2_BUCKET_NAME,
  maxVideoSize: 500 * 1024 * 1024, // 500MB max (Champion tier)
  maxPdfSize: 25 * 1024 * 1024, // 25MB max
  allowedVideoTypes: ["video/mp4", "video/webm", "video/quicktime"],
  allowedPdfTypes: ["application/pdf"],
};
