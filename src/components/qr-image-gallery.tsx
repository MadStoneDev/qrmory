// components/qr-image-gallery.tsx
import { useState, useEffect, useRef } from "react";
import { QRControlType } from "@/types/qr-controls";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import {
  getFileSizeLimit,
  getFileCountLimit,
  canUploadFileType,
  formatFileSize,
} from "@/lib/file-upload-limits";

interface ImageItem {
  id: string;
  file: File | null;
  url: string;
  title: string;
  description: string;
  uploaded?: boolean;
  uploading?: boolean;
}

interface ImageGallerySaveData {
  controlType: string;
  galleryTitle: string;
  galleryDescription: string;
  images: {
    id: string;
    url: string;
    title: string;
    description: string;
  }[];
  layout: string;
  showTitles: boolean;
}

interface Props extends QRControlType {
  user: any;
  subscriptionLevel: number;
}

export default function QRImageGallery({
  setText,
  setChanged,
  setSaveData,
  initialData,
  user,
  subscriptionLevel,
}: Props) {
  const [galleryTitle, setGalleryTitle] = useState(
    initialData?.galleryTitle || "",
  );
  const [galleryDescription, setGalleryDescription] = useState(
    initialData?.galleryDescription || "",
  );
  const [images, setImages] = useState<ImageItem[]>(initialData?.images || []);
  const [layout, setLayout] = useState(initialData?.layout || "grid");
  const [showTitles, setShowTitles] = useState(
    initialData?.showTitles !== false,
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const [totalSize, setTotalSize] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get tier-based limits from centralized config
  const MAX_FILE_SIZE = getFileSizeLimit("image", subscriptionLevel);
  const MAX_IMAGES = getFileCountLimit("image_gallery", subscriptionLevel);

  // Check if user can upload images (tier must support images)
  const canUpload = user && canUploadFileType("image", subscriptionLevel) && MAX_IMAGES > 0;

  // Initialize from saved data
  useEffect(() => {
    if (initialData && !isInitialized) {
      setGalleryTitle(initialData.galleryTitle || "");
      setGalleryDescription(initialData.galleryDescription || "");
      if (initialData.images) {
        const existingImages = initialData.images.map((img: any) => ({
          id: img.id,
          file: null,
          url: img.url,
          title: img.title || "",
          description: img.description || "",
          uploaded: true,
        }));
        setImages(existingImages);
      }
      setLayout(initialData.layout || "grid");
      setShowTitles(initialData.showTitles !== false);
      setIsInitialized(true);

      if (
        initialData.galleryTitle ||
        (initialData.images && initialData.images.length > 0)
      ) {
        setTimeout(updateParentValue, 0);
      }
    }
  }, [initialData, isInitialized]);

  // Calculate total file size
  useEffect(() => {
    const size = images.reduce((total, img) => {
      return total + (img.file ? img.file.size : 0);
    }, 0);
    setTotalSize(size);
  }, [images]);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    files.forEach((file) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast(`"${file.name}" is not an image file`, {
          style: {
            backgroundColor: "rgb(254, 226, 226)",
            color: "rgb(153, 27, 27)",
          },
        });
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast(
          `"${file.name}" is too large. Maximum size is ${formatFileSize(
            MAX_FILE_SIZE,
          )}`,
          {
            style: {
              backgroundColor: "rgb(254, 226, 226)",
              color: "rgb(153, 27, 27)",
            },
          },
        );
        return;
      }

      // Check image limit
      if (images.length >= MAX_IMAGES) {
        toast(`Maximum ${MAX_IMAGES} images allowed`, {
          style: {
            backgroundColor: "rgb(254, 226, 226)",
            color: "rgb(153, 27, 27)",
          },
        });
        return;
      }

      // Add image to list
      const newImage: ImageItem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        file,
        url: URL.createObjectURL(file),
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        description: "",
        uploaded: false,
        uploading: false,
      };

      setImages((prev) => [...prev, newImage]);
    });

    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Upload single image to Supabase
  const uploadImage = async (image: ImageItem): Promise<string | null> => {
    if (!image.file || !user) return null;

    const supabase = createClient();
    const fileExt = image.file.name.split(".").pop();
    const fileName = `${user.id}/${image.id}.${fileExt}`;

    try {
      const { data, error } = await supabase.storage
        .from("qr-images")
        .upload(fileName, image.file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("qr-images").getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  // Upload all images
  const uploadAllImages = async () => {
    const imagesToUpload = images.filter((img) => !img.uploaded && img.file);

    if (imagesToUpload.length === 0) {
      updateParentValue();
      return;
    }

    // Mark images as uploading
    setImages((prev) =>
      prev.map((img) =>
        imagesToUpload.find((upload) => upload.id === img.id)
          ? { ...img, uploading: true }
          : img,
      ),
    );

    try {
      for (const image of imagesToUpload) {
        const publicUrl = await uploadImage(image);

        if (publicUrl) {
          setImages((prev) =>
            prev.map((img) =>
              img.id === image.id
                ? { ...img, url: publicUrl, uploaded: true, uploading: false }
                : img,
            ),
          );
        }
      }

      toast("Images uploaded successfully!", {
        description: `${imagesToUpload.length} images uploaded to your gallery.`,
      });

      updateParentValue();
    } catch (error) {
      console.error("Upload failed:", error);

      // Reset uploading state
      setImages((prev) => prev.map((img) => ({ ...img, uploading: false })));

      toast("Upload failed", {
        description:
          "Please try again or contact support if the issue persists.",
        style: {
          backgroundColor: "rgb(254, 226, 226)",
          color: "rgb(153, 27, 27)",
        },
      });
    }
  };

  // Remove image
  const removeImage = (id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image && !image.uploaded && image.url.startsWith("blob:")) {
        URL.revokeObjectURL(image.url);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  // Update image details
  const updateImage = (
    id: string,
    field: "title" | "description",
    value: string,
  ) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, [field]: value } : img)),
    );
  };

  // Move image up/down
  const moveImage = (index: number, direction: "up" | "down") => {
    const newImages = [...images];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < newImages.length) {
      [newImages[index], newImages[targetIndex]] = [
        newImages[targetIndex],
        newImages[index],
      ];
      setImages(newImages);
    }
  };

  // Generate encoded data for gallery
  const generateEncodedData = () => {
    const uploadedImages = images.filter((img) => img.uploaded);

    if (!galleryTitle && uploadedImages.length === 0) return "";

    const data = {
      galleryTitle: galleryTitle || "My Gallery",
      galleryDescription,
      images: uploadedImages.map((img) => ({
        id: img.id,
        url: img.url,
        title: img.title,
        description: img.description,
      })),
      layout,
      showTitles,
      ts: new Date().getTime(),
    };

    const jsonStr = JSON.stringify(data);
    return btoa(unescape(encodeURIComponent(jsonStr)));
  };

  // Update parent with gallery URL
  const updateParentValue = () => {
    const uploadedImages = images.filter((img) => img.uploaded);

    if (
      (galleryTitle || uploadedImages.length > 0) &&
      uploadedImages.length > 0
    ) {
      const encodedData = generateEncodedData();
      const galleryUrl = `https://qrmory.com/gallery/${encodedData}`;
      setText(galleryUrl);
      setChanged(true);

      if (setSaveData) {
        const saveData: ImageGallerySaveData = {
          controlType: "image_gallery",
          galleryTitle: galleryTitle || "My Gallery",
          galleryDescription,
          images: uploadedImages.map((img) => ({
            id: img.id,
            url: img.url,
            title: img.title,
            description: img.description,
          })),
          layout,
          showTitles,
        };
        setSaveData(saveData);
      }
    } else {
      setText("");
      setChanged(true);
      if (setSaveData) setSaveData(null);
    }
  };

  // Update whenever form data changes
  useEffect(() => {
    const timer = setTimeout(updateParentValue, 500);
    return () => clearTimeout(timer);
  }, [galleryTitle, galleryDescription, images, layout, showTitles]);

  // Show upgrade prompt for free users
  if (!canUpload) {
    return (
      <div className="text-center p-6 bg-gradient-to-br from-qrmory-purple-50 to-qrmory-purple-100 rounded-lg border border-qrmory-purple-200">
        <div className="w-16 h-16 mx-auto mb-4 bg-qrmory-purple-200 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-qrmory-purple-600"
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
        <h3 className="text-lg font-semibold text-qrmory-purple-800 mb-2">
          Image Galleries
        </h3>
        <p className="text-qrmory-purple-600 mb-4">
          Upgrade to Explorer or higher to create beautiful image galleries with
          your QR codes.
        </p>
        <a
          href={`/dashboard/subscription`}
          className="inline-block bg-qrmory-purple-600 text-white px-6 py-2 rounded-lg hover:bg-qrmory-purple-700 transition-colors"
        >
          Upgrade Now
        </a>
      </div>
    );
  }

  const hasUnuploadedImages = images.some((img) => !img.uploaded);
  const uploadedImages = images.filter((img) => img.uploaded);

  return (
    <>
      <label className="control-label">
        Gallery Title:
        <input
          type="text"
          className="control-input w-full"
          placeholder="My Photo Gallery"
          value={galleryTitle}
          onChange={(e) => setGalleryTitle(e.target.value)}
          maxLength={100}
        />
      </label>

      <label className="control-label">
        Gallery Description (optional):
        <textarea
          className="control-input w-full"
          placeholder="A collection of my favourite photos..."
          value={galleryDescription}
          onChange={(e) => setGalleryDescription(e.target.value)}
          rows={2}
          maxLength={200}
        />
      </label>

      {/* Upload Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium text-neutral-700">
            Images ({images.length}/{MAX_IMAGES})
          </h4>
          <div className="text-xs text-neutral-500">
            Total size: {formatFileSize(totalSize)} | Max per image:{" "}
            {formatFileSize(MAX_FILE_SIZE)}
          </div>
        </div>

        {/* File Input */}
        <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-qrmory-purple-400 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={images.length >= MAX_IMAGES}
          />

          <div className="w-12 h-12 mx-auto mb-3 bg-neutral-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-neutral-400"
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

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={images.length >= MAX_IMAGES}
            className="text-sm font-medium text-qrmory-purple-600 hover:text-qrmory-purple-800 disabled:text-neutral-400 disabled:cursor-not-allowed"
          >
            {images.length >= MAX_IMAGES
              ? "Maximum images reached"
              : "Click to select images"}
          </button>
          <p className="text-xs text-neutral-500 mt-1">
            JPG, PNG, WebP up to {formatFileSize(MAX_FILE_SIZE)} each
          </p>
        </div>

        {/* Upload Button */}
        {hasUnuploadedImages && (
          <button
            type="button"
            onClick={uploadAllImages}
            disabled={images.some((img) => img.uploading)}
            className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-neutral-300 disabled:cursor-not-allowed"
          >
            {images.some((img) => img.uploading)
              ? "Uploading..."
              : `Upload ${images.filter((img) => !img.uploaded).length} Images`}
          </button>
        )}

        {/* Images List */}
        {images.length > 0 && (
          <div className="space-y-3">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="border border-neutral-200 rounded-lg p-3 bg-neutral-50"
              >
                <div className="flex items-start space-x-3">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-16 h-16 object-cover rounded"
                  />

                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium text-neutral-500">
                          Image {index + 1}
                        </span>
                        {image.uploaded && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Uploaded
                          </span>
                        )}
                        {image.uploading && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            Uploading...
                          </span>
                        )}
                      </div>

                      <div className="flex space-x-1">
                        <button
                          type="button"
                          onClick={() => moveImage(index, "up")}
                          disabled={index === 0 || image.uploading}
                          className="text-xs px-2 py-1 bg-neutral-200 text-neutral-600 rounded hover:bg-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveImage(index, "down")}
                          disabled={
                            index === images.length - 1 || image.uploading
                          }
                          className="text-xs px-2 py-1 bg-neutral-200 text-neutral-600 rounded hover:bg-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          disabled={image.uploading}
                          className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        type="text"
                        className="control-input w-full text-sm"
                        placeholder="Image title"
                        value={image.title}
                        onChange={(e) =>
                          updateImage(image.id, "title", e.target.value)
                        }
                        disabled={image.uploading}
                        maxLength={50}
                      />
                      <input
                        type="text"
                        className="control-input w-full text-sm"
                        placeholder="Description (optional)"
                        value={image.description}
                        onChange={(e) =>
                          updateImage(image.id, "description", e.target.value)
                        }
                        disabled={image.uploading}
                        maxLength={100}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gallery Settings */}
      {uploadedImages.length > 0 && (
        <div className="border-t pt-4 mt-6">
          <h4 className="text-sm font-medium text-neutral-700 mb-3">
            Gallery Settings
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="control-label">
              Layout:
              <select
                className="control-input w-full text-sm"
                value={layout}
                onChange={(e) => setLayout(e.target.value)}
              >
                <option value="grid">Grid</option>
                <option value="masonry">Masonry</option>
                <option value="carousel">Carousel</option>
              </select>
            </label>

            <div className="flex items-center space-x-2 mt-6">
              <input
                type="checkbox"
                id="showTitles"
                className="form-checkbox h-4 w-4 text-qrmory-purple-600"
                checked={showTitles}
                onChange={(e) => setShowTitles(e.target.checked)}
              />
              <label htmlFor="showTitles" className="text-sm text-neutral-700">
                Show image titles
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      {uploadedImages.length > 0 &&
        (galleryTitle || uploadedImages.length > 0) && (
          <div className="pt-3 rounded-lg border bg-neutral-50 border-neutral-200">
            <p className="px-3 text-xs font-medium uppercase text-neutral-500">
              Preview
            </p>
            <div className="mt-3 p-4 bg-white rounded-md mx-3 mb-3 border">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-neutral-800">
                  {galleryTitle || "My Gallery"}
                </h3>
                {galleryDescription && (
                  <p className="text-sm text-neutral-600 mt-1">
                    {galleryDescription}
                  </p>
                )}
              </div>

              <div
                className={`grid gap-3 ${
                  layout === "grid"
                    ? "grid-cols-2 md:grid-cols-3"
                    : layout === "masonry"
                      ? "grid-cols-2 md:grid-cols-3"
                      : "grid-cols-1"
                }`}
              >
                {uploadedImages.slice(0, 6).map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-32 object-cover rounded"
                    />
                    {showTitles && image.title && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b">
                        {image.title}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {uploadedImages.length > 6 && (
                <div className="text-center mt-3 text-sm text-neutral-500">
                  + {uploadedImages.length - 6} more images
                </div>
              )}
            </div>
          </div>
        )}
    </>
  );
}
