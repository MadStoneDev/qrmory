// app/api/upload/route.ts
// Server-side upload API for R2 storage (video and PDF)

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  uploadToR2,
  generateFileKey,
  isValidFileType,
  R2_CONFIG,
  getUserR2StorageUsage,
} from "@/lib/r2-storage";
import {
  getStorageQuota,
  getFileSizeLimit,
  canUploadFileType,
  formatFileSize,
} from "@/lib/file-upload-limits";
import { getUserStorageUsage } from "@/lib/storage-tracking";

export const runtime = "nodejs";
export const maxDuration = 60; // 60 seconds for large uploads

interface UploadResponse {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
  storageUsed?: string;
  storageRemaining?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse>> {
  try {
    // Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's subscription level
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_level")
      .eq("id", user.id)
      .single();

    const subscriptionLevel = profile?.subscription_level ?? 0;

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const fileType = formData.get("type") as "video" | "pdf" | null;

    if (!file || !fileType) {
      return NextResponse.json(
        { success: false, error: "Missing file or file type" },
        { status: 400 }
      );
    }

    // Validate file type permission
    if (!canUploadFileType(fileType, subscriptionLevel)) {
      return NextResponse.json(
        {
          success: false,
          error: `Your subscription does not support ${fileType} uploads. Please upgrade.`,
        },
        { status: 403 }
      );
    }

    // Validate MIME type
    const allowedTypes =
      fileType === "video"
        ? R2_CONFIG.allowedVideoTypes
        : R2_CONFIG.allowedPdfTypes;

    if (!isValidFileType(file.type, allowedTypes)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type. Allowed: ${allowedTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Check file size against tier limit
    const maxFileSize = getFileSizeLimit(fileType, subscriptionLevel);
    if (file.size > maxFileSize) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large. Maximum size for your plan: ${formatFileSize(maxFileSize)}`,
        },
        { status: 400 }
      );
    }

    // Check total storage quota
    const totalQuota = getStorageQuota(subscriptionLevel);

    // Get current usage from both Supabase (images/audio) and R2 (video/pdf)
    const supabaseUsage = await getUserStorageUsage(
      supabase,
      user.id,
      subscriptionLevel
    );
    const r2Usage = await getUserR2StorageUsage(user.id);
    const totalUsed = supabaseUsage.totalUsed + r2Usage;

    if (totalUsed + file.size > totalQuota) {
      const remaining = Math.max(0, totalQuota - totalUsed);
      return NextResponse.json(
        {
          success: false,
          error: `Not enough storage space. You have ${formatFileSize(remaining)} remaining, but this file is ${formatFileSize(file.size)}.`,
          storageUsed: formatFileSize(totalUsed),
          storageRemaining: formatFileSize(remaining),
        },
        { status: 400 }
      );
    }

    // Generate storage key
    const key = generateFileKey(user.id, fileType, file.name);

    // Convert File to Buffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to R2
    const result = await uploadToR2(buffer, key, file.type);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Upload failed" },
        { status: 500 }
      );
    }

    // Calculate new storage usage
    const newTotalUsed = totalUsed + file.size;
    const newRemaining = totalQuota - newTotalUsed;

    return NextResponse.json({
      success: true,
      url: result.url,
      key: result.key,
      storageUsed: formatFileSize(newTotalUsed),
      storageRemaining: formatFileSize(newRemaining),
    });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred. Please try again.",
      },
      { status: 500 }
    );
  }
}

// DELETE endpoint for removing files
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { key } = await request.json();

    if (!key || typeof key !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing file key" },
        { status: 400 }
      );
    }

    // Verify the file belongs to this user (key starts with userId)
    if (!key.startsWith(`${user.id}/`)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Dynamic import to avoid loading R2 client on every request
    const { deleteFromR2 } = await import("@/lib/r2-storage");
    const success = await deleteFromR2(key);

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Failed to delete file" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete API error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
