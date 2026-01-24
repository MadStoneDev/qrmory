// components/qr-video.tsx
import { useState, useEffect, useRef } from "react";
import { QRControlType } from "@/types/qr-controls";
import { toast } from "sonner";
import {
  getFileSizeLimit,
  canUploadFileType,
  formatFileSize,
  FILE_UPLOAD_LIMITS,
} from "@/lib/file-upload-limits";
import { IconVideo, IconUpload, IconTrash, IconPlayerPlay } from "@tabler/icons-react";

interface VideoSaveData {
  controlType: string;
  title: string;
  description: string;
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  autoPlay: boolean;
  loop: boolean;
  muted: boolean;
  showControls: boolean;
  backgroundColour: string;
}

interface Props extends QRControlType {
  user: any;
  subscriptionLevel: number;
}

export default function QRVideo({
  setText,
  setChanged,
  setSaveData,
  initialData,
  user,
  subscriptionLevel,
}: Props) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState(initialData?.url || "");
  const [duration, setDuration] = useState<number | undefined>(initialData?.duration);
  const [autoPlay, setAutoPlay] = useState(initialData?.autoPlay || false);
  const [loop, setLoop] = useState(initialData?.loop || false);
  const [muted, setMuted] = useState(initialData?.muted || false);
  const [showControls, setShowControls] = useState(initialData?.showControls !== false);
  const [backgroundColour, setBackgroundColour] = useState(
    initialData?.backgroundColour || "#000000"
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploaded, setIsUploaded] = useState(!!initialData?.url);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const MAX_FILE_SIZE = getFileSizeLimit("video", subscriptionLevel);
  const canUpload = user && canUploadFileType("video", subscriptionLevel);

  // Initialize from saved data
  useEffect(() => {
    if (initialData && !isInitialized) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setVideoUrl(initialData.url || "");
      setDuration(initialData.duration);
      setAutoPlay(initialData.autoPlay || false);
      setLoop(initialData.loop || false);
      setMuted(initialData.muted || false);
      setShowControls(initialData.showControls !== false);
      setBackgroundColour(initialData.backgroundColour || "#000000");
      setIsUploaded(!!initialData.url);
      setIsInitialized(true);

      if (initialData.title && initialData.url) {
        setTimeout(updateParentValue, 0);
      }
    }
  }, [initialData, isInitialized]);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("video/")) {
      toast("Please select a video file", {
        style: {
          backgroundColor: "rgb(254, 226, 226)",
          color: "rgb(153, 27, 27)",
        },
      });
      return;
    }

    // Validate against allowed types
    const allowedTypes: readonly string[] = FILE_UPLOAD_LIMITS.allowed_types.video;
    if (!allowedTypes.includes(file.type)) {
      toast(`Unsupported format. Allowed: MP4, WebM, MOV`, {
        style: {
          backgroundColor: "rgb(254, 226, 226)",
          color: "rgb(153, 27, 27)",
        },
      });
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast(`File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}`, {
        style: {
          backgroundColor: "rgb(254, 226, 226)",
          color: "rgb(153, 27, 27)",
        },
      });
      return;
    }

    setVideoFile(file);
    setTitle(title || file.name.replace(/\.[^/.]+$/, ""));

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setVideoUrl(previewUrl);
    setIsUploaded(false);

    // Get duration from video file
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      setDuration(video.duration);
      URL.revokeObjectURL(video.src);
    };
    video.src = previewUrl;
  };

  // Upload video to R2 via API
  const uploadVideo = async () => {
    if (!videoFile || !user) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", videoFile);
      formData.append("type", "video");

      // Simulate progress for UX (actual progress would need XMLHttpRequest)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Upload failed");
      }

      // Clean up preview URL
      if (videoUrl.startsWith("blob:")) {
        URL.revokeObjectURL(videoUrl);
      }

      setVideoUrl(result.url);
      setIsUploaded(true);
      setVideoFile(null);

      toast("Video uploaded successfully!", {
        description: `Storage: ${result.storageUsed} used, ${result.storageRemaining} remaining`,
      });

      updateParentValue();
    } catch (error) {
      console.error("Upload error:", error);
      toast(error instanceof Error ? error.message : "Upload failed", {
        style: {
          backgroundColor: "rgb(254, 226, 226)",
          color: "rgb(153, 27, 27)",
        },
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Generate encoded data for video player
  const generateEncodedData = () => {
    if (!title || !videoUrl || !isUploaded) return "";

    const data = {
      title,
      description,
      url: videoUrl,
      duration,
      autoPlay,
      loop,
      muted,
      showControls,
      backgroundColour,
      ts: Date.now(),
    };

    const jsonStr = JSON.stringify(data);
    return btoa(unescape(encodeURIComponent(jsonStr)));
  };

  // Update parent with video URL
  const updateParentValue = () => {
    if (title && videoUrl && isUploaded) {
      const encodedData = generateEncodedData();
      const videoPlayerUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://qrmory.com"}/video/${encodedData}`;
      setText(videoPlayerUrl);
      setChanged(true);

      if (setSaveData) {
        const saveData: VideoSaveData = {
          controlType: "video",
          title,
          description,
          url: videoUrl,
          duration,
          autoPlay,
          loop,
          muted,
          showControls,
          backgroundColour,
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
  }, [title, description, videoUrl, autoPlay, loop, muted, showControls, backgroundColour, isUploaded]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoUrl && videoUrl.startsWith("blob:")) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, []);

  // Show upgrade prompt for non-eligible users
  if (!canUpload) {
    return (
      <div className="text-center p-6 bg-gradient-to-br from-qrmory-purple-50 to-qrmory-purple-100 rounded-lg border border-qrmory-purple-200">
        <div className="w-16 h-16 mx-auto mb-4 bg-qrmory-purple-200 rounded-full flex items-center justify-center">
          <IconVideo className="w-8 h-8 text-qrmory-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-qrmory-purple-800 mb-2">
          Video QR Codes
        </h3>
        <p className="text-qrmory-purple-600 mb-4">
          Upgrade to Creator or Champion to share videos with your QR codes.
        </p>
        <a
          href="/dashboard/subscription"
          className="inline-block bg-qrmory-purple-600 text-white px-6 py-2 rounded-lg hover:bg-qrmory-purple-700 transition-colors"
        >
          Upgrade Now
        </a>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      {/* Video Title */}
      <label className="control-label">
        Video Title*:
        <input
          type="text"
          className="control-input w-full"
          placeholder="My Video"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
        />
      </label>

      {/* Description */}
      <label className="control-label">
        Description (optional):
        <textarea
          className="control-input w-full"
          placeholder="Describe your video..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          maxLength={300}
        />
      </label>

      {/* Background Colour */}
      <label className="control-label">
        Background Colour:
        <div className="flex items-center space-x-2">
          <input
            type="color"
            className="h-8 w-12 border-0 rounded cursor-pointer"
            value={backgroundColour}
            onChange={(e) => setBackgroundColour(e.target.value)}
          />
          <input
            type="text"
            className="control-input flex-grow text-sm"
            value={backgroundColour}
            onChange={(e) => setBackgroundColour(e.target.value)}
          />
        </div>
      </label>

      {/* File Upload Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-neutral-700">Video File</h4>

        {!videoUrl && (
          <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-qrmory-purple-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="w-12 h-12 mx-auto mb-3 bg-neutral-100 rounded-full flex items-center justify-center">
              <IconVideo className="w-6 h-6 text-neutral-400" />
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm font-medium text-qrmory-purple-600 hover:text-qrmory-purple-800"
            >
              Select Video File
            </button>
            <p className="text-xs text-neutral-500 mt-1">
              MP4, WebM, MOV up to {formatFileSize(MAX_FILE_SIZE)}
            </p>
          </div>
        )}

        {videoUrl && (
          <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-qrmory-purple-100 rounded-full flex items-center justify-center">
                  <IconVideo className="w-4 h-4 text-qrmory-purple-600" />
                </div>
                <div>
                  <div className="text-sm font-medium">{videoFile?.name || title}</div>
                  <div className="text-xs text-neutral-500">
                    {videoFile && formatFileSize(videoFile.size)}
                    {duration && ` • ${formatDuration(duration)}`}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {isUploaded && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Uploaded
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (videoUrl.startsWith("blob:")) {
                      URL.revokeObjectURL(videoUrl);
                    }
                    setVideoUrl("");
                    setVideoFile(null);
                    setDuration(undefined);
                    setIsUploaded(false);
                  }}
                  disabled={isUploading}
                  className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 disabled:opacity-50"
                >
                  <IconTrash size={16} />
                </button>
              </div>
            </div>

            {/* Video Preview */}
            <video
              ref={videoRef}
              controls
              className="w-full rounded-lg bg-black"
              src={videoUrl}
              onLoadedMetadata={(e) => {
                const video = e.target as HTMLVideoElement;
                setDuration(video.duration);
              }}
            />

            {/* Upload Progress */}
            {isUploading && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-neutral-500 mb-1">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div
                    className="bg-qrmory-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Upload Button */}
            {videoFile && !isUploaded && !isUploading && (
              <button
                type="button"
                onClick={uploadVideo}
                className="w-full mt-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <IconUpload size={18} />
                Upload Video
              </button>
            )}
          </div>
        )}
      </div>

      {/* Player Settings */}
      {videoUrl && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-neutral-700 mb-3">
            Player Settings
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-qrmory-purple-600 rounded"
                checked={showControls}
                onChange={(e) => setShowControls(e.target.checked)}
              />
              <span className="text-sm text-neutral-700">Show controls</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-qrmory-purple-600 rounded"
                checked={autoPlay}
                onChange={(e) => setAutoPlay(e.target.checked)}
              />
              <span className="text-sm text-neutral-700">Auto-play</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-qrmory-purple-600 rounded"
                checked={loop}
                onChange={(e) => setLoop(e.target.checked)}
              />
              <span className="text-sm text-neutral-700">Loop video</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-qrmory-purple-600 rounded"
                checked={muted}
                onChange={(e) => setMuted(e.target.checked)}
              />
              <span className="text-sm text-neutral-700">Muted by default</span>
            </label>
          </div>
        </div>
      )}

      {/* Preview */}
      {title && videoUrl && isUploaded && (
        <div className="pt-3 rounded-lg border bg-neutral-50 border-neutral-200">
          <p className="px-3 text-xs font-medium uppercase text-neutral-500">
            Preview
          </p>
          <div
            className="mt-3 mx-3 mb-3 rounded-lg overflow-hidden"
            style={{ backgroundColor: backgroundColour }}
          >
            <div className="p-4 text-white text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <IconPlayerPlay className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold">{title}</h3>
              {description && (
                <p className="text-sm opacity-80 mt-1">{description}</p>
              )}
              {duration && (
                <p className="text-xs opacity-60 mt-2">
                  Duration: {formatDuration(duration)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
