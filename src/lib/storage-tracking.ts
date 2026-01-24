// lib/storage-tracking.ts
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../../database.types";
import { getStorageQuota, formatFileSize } from "./file-upload-limits";
import { getUserR2StorageUsage, listUserFiles } from "./r2-storage";

export interface StorageUsage {
  totalUsed: number;
  totalQuota: number;
  percentUsed: number;
  remaining: number;
  formattedUsed: string;
  formattedQuota: string;
  formattedRemaining: string;
  isNearLimit: boolean;
  isAtLimit: boolean;
}

export interface StorageBreakdown {
  images: number;
  audio: number;
  video: number;
  other: number;
}

/**
 * Get the total storage used by a user from Supabase storage buckets
 * Note: This only counts Supabase storage (images/audio).
 * For combined storage including R2 (video/pdf), use getCombinedStorageUsage.
 */
export async function getUserStorageUsage(
  supabase: SupabaseClient<Database>,
  userId: string,
  subscriptionLevel: number
): Promise<StorageUsage> {
  const totalQuota = getStorageQuota(subscriptionLevel);

  try {
    // Get list of files in user's folders across storage buckets
    const buckets = ["qr-images", "qr-audio"];
    let totalUsed = 0;

    for (const bucket of buckets) {
      const { data: files, error } = await supabase.storage
        .from(bucket)
        .list(userId, {
          limit: 1000,
          offset: 0,
        });

      if (error) {
        console.error(`Error listing files in ${bucket}:`, error);
        continue;
      }

      if (files) {
        for (const file of files) {
          // Skip folders
          if (file.id === null) continue;
          totalUsed += file.metadata?.size || 0;
        }
      }
    }

    const percentUsed = totalQuota > 0 ? Math.round((totalUsed / totalQuota) * 100) : 0;
    const remaining = Math.max(0, totalQuota - totalUsed);

    return {
      totalUsed,
      totalQuota,
      percentUsed,
      remaining,
      formattedUsed: formatFileSize(totalUsed),
      formattedQuota: formatFileSize(totalQuota),
      formattedRemaining: formatFileSize(remaining),
      isNearLimit: percentUsed >= 80,
      isAtLimit: percentUsed >= 100,
    };
  } catch (error) {
    console.error("Error calculating storage usage:", error);
    return {
      totalUsed: 0,
      totalQuota,
      percentUsed: 0,
      remaining: totalQuota,
      formattedUsed: "0 Bytes",
      formattedQuota: formatFileSize(totalQuota),
      formattedRemaining: formatFileSize(totalQuota),
      isNearLimit: false,
      isAtLimit: false,
    };
  }
}

/**
 * Get combined storage usage from both Supabase and R2
 * This includes images, audio (Supabase) and video, PDF (R2)
 */
export async function getCombinedStorageUsage(
  supabase: SupabaseClient<Database>,
  userId: string,
  subscriptionLevel: number
): Promise<StorageUsage> {
  const totalQuota = getStorageQuota(subscriptionLevel);

  try {
    // Get Supabase storage usage
    const supabaseUsage = await getUserStorageUsage(supabase, userId, subscriptionLevel);

    // Get R2 storage usage (video + pdf)
    let r2Usage = 0;
    try {
      r2Usage = await getUserR2StorageUsage(userId);
    } catch (e) {
      // R2 might not be configured yet, ignore error
      console.warn("R2 storage not available:", e);
    }

    const totalUsed = supabaseUsage.totalUsed + r2Usage;
    const percentUsed = totalQuota > 0 ? Math.round((totalUsed / totalQuota) * 100) : 0;
    const remaining = Math.max(0, totalQuota - totalUsed);

    return {
      totalUsed,
      totalQuota,
      percentUsed,
      remaining,
      formattedUsed: formatFileSize(totalUsed),
      formattedQuota: formatFileSize(totalQuota),
      formattedRemaining: formatFileSize(remaining),
      isNearLimit: percentUsed >= 80,
      isAtLimit: percentUsed >= 100,
    };
  } catch (error) {
    console.error("Error calculating combined storage usage:", error);
    return {
      totalUsed: 0,
      totalQuota,
      percentUsed: 0,
      remaining: totalQuota,
      formattedUsed: "0 Bytes",
      formattedQuota: formatFileSize(totalQuota),
      formattedRemaining: formatFileSize(totalQuota),
      isNearLimit: false,
      isAtLimit: false,
    };
  }
}

/**
 * Get a breakdown of storage usage by file type
 */
export async function getStorageBreakdown(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<StorageBreakdown> {
  const breakdown: StorageBreakdown = {
    images: 0,
    audio: 0,
    video: 0,
    other: 0,
  };

  try {
    // Get images from Supabase
    const { data: imageFiles } = await supabase.storage
      .from("qr-images")
      .list(userId, { limit: 1000 });

    if (imageFiles) {
      for (const file of imageFiles) {
        if (file.id !== null) {
          breakdown.images += file.metadata?.size || 0;
        }
      }
    }

    // Get audio from Supabase
    const { data: audioFiles } = await supabase.storage
      .from("qr-audio")
      .list(userId, { limit: 1000 });

    if (audioFiles) {
      for (const file of audioFiles) {
        if (file.id !== null) {
          breakdown.audio += file.metadata?.size || 0;
        }
      }
    }

    // Get video from R2
    try {
      const videoFiles = await listUserFiles(userId, "video");
      for (const file of videoFiles) {
        breakdown.video += file.size;
      }

      // Get PDFs from R2 (counted as "other")
      const pdfFiles = await listUserFiles(userId, "pdf");
      for (const file of pdfFiles) {
        breakdown.other += file.size;
      }
    } catch (e) {
      // R2 might not be configured yet
      console.warn("R2 storage not available for breakdown:", e);
    }

    return breakdown;
  } catch (error) {
    console.error("Error getting storage breakdown:", error);
    return breakdown;
  }
}

/**
 * Check if user can upload a file of given size
 */
export async function canUploadFile(
  supabase: SupabaseClient<Database>,
  userId: string,
  subscriptionLevel: number,
  fileSize: number
): Promise<{ canUpload: boolean; message?: string }> {
  const usage = await getUserStorageUsage(supabase, userId, subscriptionLevel);

  if (usage.remaining < fileSize) {
    return {
      canUpload: false,
      message: `Not enough storage space. You have ${usage.formattedRemaining} remaining, but this file is ${formatFileSize(fileSize)}.`,
    };
  }

  // Check if this would push them over 90% (warn but allow)
  const newPercentUsed = Math.round(((usage.totalUsed + fileSize) / usage.totalQuota) * 100);
  if (newPercentUsed >= 90 && !usage.isNearLimit) {
    return {
      canUpload: true,
      message: `Warning: This upload will use ${newPercentUsed}% of your storage quota.`,
    };
  }

  return { canUpload: true };
}

/**
 * Delete user's files from storage (used when account is deleted or downgraded)
 */
export async function deleteUserFiles(
  supabase: SupabaseClient<Database>,
  userId: string,
  buckets: string[] = ["qr-images", "qr-audio"]
): Promise<{ success: boolean; deletedCount: number; error?: string }> {
  let deletedCount = 0;

  try {
    for (const bucket of buckets) {
      const { data: files, error: listError } = await supabase.storage
        .from(bucket)
        .list(userId, { limit: 1000 });

      if (listError) {
        console.error(`Error listing files in ${bucket}:`, listError);
        continue;
      }

      if (files && files.length > 0) {
        const filePaths = files
          .filter((f) => f.id !== null)
          .map((f) => `${userId}/${f.name}`);

        if (filePaths.length > 0) {
          const { error: deleteError } = await supabase.storage
            .from(bucket)
            .remove(filePaths);

          if (deleteError) {
            console.error(`Error deleting files from ${bucket}:`, deleteError);
          } else {
            deletedCount += filePaths.length;
          }
        }
      }
    }

    return { success: true, deletedCount };
  } catch (error) {
    console.error("Error deleting user files:", error);
    return {
      success: false,
      deletedCount,
      error: "Failed to delete some files",
    };
  }
}
