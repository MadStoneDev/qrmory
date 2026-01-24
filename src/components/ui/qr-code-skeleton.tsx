"use client";

import { Skeleton } from "./skeleton";

interface QRCodeSkeletonProps {
  count?: number;
}

export function QRCodeItemSkeleton() {
  return (
    <article className="border rounded-lg shadow-sm bg-white overflow-hidden mb-6">
      <div className="py-3 px-4 flex flex-row items-center gap-4 w-full border-b border-neutral-200/70">
        {/* QR Code placeholder */}
        <Skeleton className="w-16 h-16 rounded" />

        {/* Content placeholder */}
        <div className="flex-grow space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-40" />
        </div>

        {/* Action buttons placeholder */}
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
    </article>
  );
}

export function QRCodeListSkeleton({ count = 3 }: QRCodeSkeletonProps) {
  return (
    <div className="space-y-4" role="status" aria-label="Loading QR codes">
      {Array.from({ length: count }).map((_, index) => (
        <QRCodeItemSkeleton key={index} />
      ))}
      <span className="sr-only">Loading QR codes...</span>
    </div>
  );
}
