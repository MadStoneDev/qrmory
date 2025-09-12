// components/qr-audio.tsx
import { useState, useEffect, useRef } from "react";
import { QRControlType } from "@/types/qr-controls";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface AudioSaveData {
  controlType: string;
  title: string;
  description: string;
  artist: string;
  url: string;
  duration?: number;
  autoPlay: boolean;
  showControls: boolean;
  backgroundColour: string;
}

interface Props extends QRControlType {
  user: any;
  subscriptionLevel: number;
}

export default function QRAudio({
  setText,
  setChanged,
  setSaveData,
  initialData,
  user,
  subscriptionLevel,
}: Props) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [artist, setArtist] = useState(initialData?.artist || "");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState(initialData?.url || "");
  const [duration, setDuration] = useState<number | undefined>(
    initialData?.duration,
  );
  const [autoPlay, setAutoPlay] = useState(initialData?.autoPlay || false);
  const [showControls, setShowControls] = useState(
    initialData?.showControls !== false,
  );
  const [backgroundColour, setBackgroundColour] = useState(
    initialData?.backgroundColour || "#1a1a1a",
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(!!initialData?.url);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // File size limit: 10MB for all paid users
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  // Check if user can upload audio
  const canUpload = user && subscriptionLevel > 0;

  // Initialize from saved data
  useEffect(() => {
    if (initialData && !isInitialized) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setArtist(initialData.artist || "");
      setAudioUrl(initialData.url || "");
      setDuration(initialData.duration);
      setAutoPlay(initialData.autoPlay || false);
      setShowControls(initialData.showControls !== false);
      setBackgroundColour(initialData.backgroundColour || "#1a1a1a");
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
    if (!file.type.startsWith("audio/")) {
      toast(`"${file.name}" is not an audio file`, {
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
        `File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}`,
        {
          style: {
            backgroundColor: "rgb(254, 226, 226)",
            color: "rgb(153, 27, 27)",
          },
        },
      );
      return;
    }

    setAudioFile(file);
    setTitle(title || file.name.replace(/\.[^/.]+$/, "")); // Set title to filename if empty

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setAudioUrl(previewUrl);
    setIsUploaded(false);

    // Get duration from audio file
    const audio = new Audio(previewUrl);
    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
    });
  };

  // Upload audio to Supabase
  const uploadAudio = async () => {
    if (!audioFile || !user) return;

    setIsUploading(true);

    const supabase = createClient();
    const fileExt = audioFile.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    try {
      const { data, error } = await supabase.storage
        .from("qr-audio")
        .upload(fileName, audioFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("qr-audio").getPublicUrl(fileName);

      // Clean up preview URL
      if (audioUrl.startsWith("blob:")) {
        URL.revokeObjectURL(audioUrl);
      }

      setAudioUrl(publicUrl);
      setIsUploaded(true);
      setAudioFile(null);

      toast("Audio uploaded successfully!", {
        description: "Your audio file is now ready to share.",
      });

      updateParentValue();
    } catch (error) {
      console.error("Upload error:", error);

      toast("Upload failed", {
        description:
          "Please try again or contact support if the issue persists.",
        style: {
          backgroundColor: "rgb(254, 226, 226)",
          color: "rgb(153, 27, 27)",
        },
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Generate encoded data for audio player
  const generateEncodedData = () => {
    if (!title || !audioUrl || !isUploaded) return "";

    const data = {
      title,
      description,
      artist,
      url: audioUrl,
      duration,
      autoPlay,
      showControls,
      backgroundColour: backgroundColour,
      ts: new Date().getTime(),
    };

    const jsonStr = JSON.stringify(data);
    return btoa(unescape(encodeURIComponent(jsonStr)));
  };

  // Update parent with audio URL
  const updateParentValue = () => {
    if (title && audioUrl && isUploaded) {
      const encodedData = generateEncodedData();
      const audioPlayerUrl = `https://qrmory.com/audio/${encodedData}`;
      setText(audioPlayerUrl);
      setChanged(true);

      if (setSaveData) {
        const saveData: AudioSaveData = {
          controlType: "audio",
          title,
          description,
          artist,
          url: audioUrl,
          duration,
          autoPlay,
          showControls,
          backgroundColour: backgroundColour,
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
  }, [
    title,
    description,
    artist,
    audioUrl,
    autoPlay,
    showControls,
    backgroundColour,
    isUploaded,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioUrl && audioUrl.startsWith("blob:")) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, []);

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
              d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z"
              clipRule="evenodd"
            />
            <path
              fillRule="evenodd"
              d="M13.828 7.172a1 1 0 011.414 0A5.983 5.983 0 0117 12a5.983 5.983 0 01-1.758 4.828 1 1 0 11-1.414-1.414A3.987 3.987 0 0015 12a3.987 3.987 0 00-1.172-2.828 1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-qrmory-purple-800 mb-2">
          Audio QR Codes
        </h3>
        <p className="text-qrmory-purple-600 mb-4">
          Upgrade to Explorer or higher to share audio files with your QR codes.
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

  return (
    <>
      <label className="control-label">
        Audio Title*:
        <input
          type="text"
          className="control-input w-full"
          placeholder="My Audio Recording"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
        />
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="control-label">
          Artist/Creator (optional):
          <input
            type="text"
            className="control-input w-full"
            placeholder="Artist name"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            maxLength={50}
          />
        </label>

        <label className="control-label">
          Background Colour:
          <div className="flex items-center space-x-2">
            <input
              type="color"
              className="h-8 w-12 border-0 rounded"
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
      </div>

      <label className="control-label">
        Description (optional):
        <textarea
          className="control-input w-full"
          placeholder="Tell listeners about this audio..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          maxLength={200}
        />
      </label>

      {/* File Upload Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-neutral-700">Audio File</h4>

        {!audioUrl && (
          <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-qrmory-purple-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="w-12 h-12 mx-auto mb-3 bg-neutral-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-neutral-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm font-medium text-qrmory-purple-600 hover:text-qrmory-purple-800"
            >
              Select Audio File
            </button>
            <p className="text-xs text-neutral-500 mt-1">
              MP3, WAV, AAC up to {formatFileSize(MAX_FILE_SIZE)}
            </p>
          </div>
        )}

        {audioUrl && (
          <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-qrmory-purple-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-qrmory-purple-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium">
                    {audioFile?.name || title}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {audioFile && formatFileSize(audioFile.size)}
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
                    if (audioUrl.startsWith("blob:")) {
                      URL.revokeObjectURL(audioUrl);
                    }
                    setAudioUrl("");
                    setAudioFile(null);
                    setDuration(undefined);
                    setIsUploaded(false);
                  }}
                  disabled={isUploading}
                  className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>

            {/* Audio Preview */}
            <audio
              ref={audioRef}
              controls
              className="w-full"
              src={audioUrl}
              onLoadedMetadata={(e) => {
                const audio = e.target as HTMLAudioElement;
                setDuration(audio.duration);
              }}
            />

            {/* Upload Button */}
            {audioFile && !isUploaded && (
              <button
                type="button"
                onClick={uploadAudio}
                disabled={isUploading}
                className="w-full mt-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-neutral-300 disabled:cursor-not-allowed"
              >
                {isUploading ? "Uploading..." : "Upload Audio"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Player Settings */}
      {audioUrl && (
        <div className="border-t pt-4 mt-6">
          <h4 className="text-sm font-medium text-neutral-700 mb-3">
            Player Settings
          </h4>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showControls"
                className="form-checkbox h-4 w-4 text-qrmory-purple-600"
                checked={showControls}
                onChange={(e) => setShowControls(e.target.checked)}
              />
              <label
                htmlFor="showControls"
                className="text-sm text-neutral-700"
              >
                Show player controls
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoPlay"
                className="form-checkbox h-4 w-4 text-qrmory-purple-600"
                checked={autoPlay}
                onChange={(e) => setAutoPlay(e.target.checked)}
              />
              <label htmlFor="autoPlay" className="text-sm text-neutral-700">
                Auto-play (not recommended)
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      {title && audioUrl && isUploaded && (
        <div className="pt-3 rounded-lg border bg-neutral-50 border-neutral-200">
          <p className="px-3 text-xs font-medium uppercase text-neutral-500">
            Preview
          </p>
          <div
            className="mt-3 mx-3 mb-3 rounded-lg overflow-hidden"
            style={{ backgroundColor: backgroundColour }}
          >
            <div className="p-6 text-white text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              <h3 className="text-lg font-bold mb-1">{title}</h3>
              {artist && <p className="text-sm opacity-80 mb-2">{artist}</p>}
              {description && (
                <p className="text-xs opacity-70 mb-4">{description}</p>
              )}

              <div className="bg-black bg-opacity-30 rounded-lg p-3">
                <div className="flex items-center justify-between text-xs opacity-80 mb-2">
                  <span>0:00</span>
                  {duration && <span>{formatDuration(duration)}</span>}
                </div>
                <div className="w-full bg-white bg-opacity-30 rounded-full h-1 mb-3">
                  <div className="bg-white rounded-full h-1 w-0"></div>
                </div>
                <div className="flex items-center justify-center space-x-4">
                  <button className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30">
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
