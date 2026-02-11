// app/gallery/[code]/page.tsx
"use client";

import { useState, useEffect, use } from "react";

interface ImageItem {
  id: string;
  url: string;
  title: string;
  description: string;
}

interface GalleryData {
  galleryTitle: string;
  galleryDescription: string;
  images: ImageItem[];
  layout: string;
  showTitles: boolean;
  ts: number;
}

interface Props {
  params: Promise<{
    code: string;
  }>;
}

function decodeData(encoded: string): GalleryData | null {
  try {
    const decoded = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Failed to decode gallery data:", error);
    return null;
  }
}

export default function GalleryViewer({ params }: Props) {
  const { code } = use(params);
  const [data, setData] = useState<GalleryData | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const galleryData = decodeData(code);
    if (galleryData && galleryData.images?.length > 0) {
      setData(galleryData);
    }
    setIsLoading(false);
  }, [code]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-lg animate-pulse"></div>
          <p className="text-gray-600">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.images?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Gallery Not Found
          </h1>
          <p className="text-gray-600">
            This gallery may have been removed or the link is invalid.
          </p>
        </div>
      </div>
    );
  }

  const openLightbox = (image: ImageItem, index: number) => {
    setSelectedImage(image);
    setSelectedIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction: "prev" | "next") => {
    const newIndex =
      direction === "prev"
        ? (selectedIndex - 1 + data.images.length) % data.images.length
        : (selectedIndex + 1) % data.images.length;

    setSelectedIndex(newIndex);
    setSelectedImage(data.images[newIndex]);
  };

  const getGridClass = () => {
    switch (data.layout) {
      case "masonry":
        return "columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4";
      case "carousel":
        return "flex overflow-x-auto space-x-4 pb-4";
      default: // grid
        return "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";
    }
  };

  const getImageClass = () => {
    switch (data.layout) {
      case "masonry":
        return "break-inside-avoid";
      case "carousel":
        return "flex-shrink-0 w-64";
      default: // grid
        return "aspect-square";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {data.galleryTitle}
          </h1>
          {data.galleryDescription && (
            <p className="text-gray-600 mt-2">{data.galleryDescription}</p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            {data.images.length} {data.images.length === 1 ? "image" : "images"}
          </p>
        </div>
      </div>

      {/* Gallery */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className={getGridClass()}>
          {data.images.map((image, index) => (
            <div
              key={image.id}
              className={`${getImageClass()} cursor-pointer group relative overflow-hidden rounded-lg bg-gray-200 hover:shadow-lg transition-all duration-200`}
              onClick={() => openLightbox(image, index)}
            >
              <img
                src={image.url}
                alt={image.title}
                className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 ${
                  data.layout === "carousel"
                    ? "h-48"
                    : data.layout === "masonry"
                      ? "w-full h-auto"
                      : "h-full"
                }`}
                loading="lazy"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm6 0a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V4zm6 0a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm6 0a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3zm6 0a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              {/* Title overlay */}
              {data.showTitles && image.title && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                  <h3 className="text-white text-sm font-medium truncate">
                    {image.title}
                  </h3>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Navigation buttons */}
            {data.images.length > 1 && (
              <>
                <button
                  onClick={() => navigateImage("prev")}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <button
                  onClick={() => navigateImage("next")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}

            {/* Image */}
            <img
              src={selectedImage.url}
              alt={selectedImage.title}
              className="max-w-full max-h-full object-contain"
            />

            {/* Image info */}
            {(selectedImage.title || selectedImage.description) && (
              <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 rounded-lg p-4 text-white">
                {selectedImage.title && (
                  <h3 className="text-lg font-semibold mb-1">
                    {selectedImage.title}
                  </h3>
                )}
                {selectedImage.description && (
                  <p className="text-sm opacity-90">
                    {selectedImage.description}
                  </p>
                )}
                {data.images.length > 1 && (
                  <p className="text-xs opacity-70 mt-2">
                    {selectedIndex + 1} of {data.images.length}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* QRmory branding */}
      <div className="text-center py-8">
        <a
          href="https://qrmory.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          Powered by QRmory
        </a>
      </div>
    </div>
  );
}
