// lib/file-upload-limits.ts
export const FILE_UPLOAD_LIMITS = {
  // Subscription levels: 0=Free, 1=Explorer, 2=Creator, 3=Champion
  storage_quotas: {
    0: 50 * 1024 * 1024, // Free: 50MB total storage
    1: 500 * 1024 * 1024, // Explorer: 500MB total storage
    2: 2 * 1024 * 1024 * 1024, // Creator: 2GB total storage
    3: 10 * 1024 * 1024 * 1024, // Champion: 10GB total storage
  },

  // Per-file size limits
  file_size_limits: {
    image: {
      0: 5 * 1024 * 1024, // Free: 5MB per image
      1: 10 * 1024 * 1024, // Explorer: 10MB per image
      2: 20 * 1024 * 1024, // Creator: 20MB per image
      3: 50 * 1024 * 1024, // Champion: 50MB per image
    },
    audio: {
      0: 0, // Free: No audio uploads
      1: 25 * 1024 * 1024, // Explorer: 25MB per audio
      2: 50 * 1024 * 1024, // Creator: 50MB per audio
      3: 100 * 1024 * 1024, // Champion: 100MB per audio
    },
    video: {
      0: 0, // Free: No video uploads
      1: 0, // Explorer: No video uploads (too expensive)
      2: 100 * 1024 * 1024, // Creator: 100MB per video
      3: 500 * 1024 * 1024, // Champion: 500MB per video
    },
    pdf: {
      0: 0, // Free: No PDF uploads
      1: 10 * 1024 * 1024, // Explorer: 10MB per PDF
      2: 25 * 1024 * 1024, // Creator: 25MB per PDF
      3: 50 * 1024 * 1024, // Champion: 50MB per PDF
    },
  },

  // Number of files per QR code
  file_count_limits: {
    image_gallery: {
      0: 3, // Free: 3 images max
      1: 10, // Explorer: 10 images max
      2: 25, // Creator: 25 images max
      3: 100, // Champion: 100 images max
    },
    audio_playlist: {
      0: 0, // Free: No audio
      1: 3, // Explorer: 3 audio files max
      2: 10, // Creator: 10 audio files max
      3: 25, // Champion: 25 audio files max
    },
  },

  // Allowed file types
  allowed_types: {
    image: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    audio: ["audio/mpeg", "audio/wav", "audio/mp4", "audio/aac"],
    video: ["video/mp4", "video/webm", "video/quicktime"],
    pdf: ["application/pdf"],
  },

  // File expiration (to manage storage costs)
  expiration_days: {
    0: 30, // Free: Files expire after 30 days
    1: 90, // Explorer: Files expire after 90 days
    2: null, // Creator: No expiration
    3: null, // Champion: No expiration
  },
} as const;

export function getStorageQuota(subscriptionLevel: number): number {
  return (
    FILE_UPLOAD_LIMITS.storage_quotas[
      subscriptionLevel as keyof typeof FILE_UPLOAD_LIMITS.storage_quotas
    ] || 0
  );
}

export function getFileSizeLimit(
  fileType: "image" | "audio" | "video" | "pdf",
  subscriptionLevel: number,
): number {
  return (
    FILE_UPLOAD_LIMITS.file_size_limits[fileType][
      subscriptionLevel as keyof typeof FILE_UPLOAD_LIMITS.file_size_limits.image
    ] || 0
  );
}

export function getFileCountLimit(
  qrType: "image_gallery" | "audio_playlist",
  subscriptionLevel: number,
): number {
  return (
    FILE_UPLOAD_LIMITS.file_count_limits[qrType][
      subscriptionLevel as keyof typeof FILE_UPLOAD_LIMITS.file_count_limits.image_gallery
    ] || 0
  );
}

export function canUploadFileType(
  fileType: "image" | "audio" | "video" | "pdf",
  subscriptionLevel: number,
): boolean {
  return getFileSizeLimit(fileType, subscriptionLevel) > 0;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
