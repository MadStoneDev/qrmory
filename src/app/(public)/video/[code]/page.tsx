// app/(public)/video/[code]/page.tsx
"use client";

import { useState, useEffect, useRef, use } from "react";
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconVolume,
  IconVolumeOff,
  IconMaximize,
  IconRewindBackward10,
  IconRewindForward10,
  IconVideo,
} from "@tabler/icons-react";

interface VideoData {
  title: string;
  description?: string;
  url: string;
  duration?: number;
  autoPlay: boolean;
  loop: boolean;
  muted: boolean;
  showControls: boolean;
  backgroundColour: string;
  ts: number;
}

interface Props {
  params: Promise<{
    code: string;
  }>;
}

function decodeData(encoded: string): VideoData | null {
  try {
    const decoded = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Failed to decode video data:", error);
    return null;
  }
}

export default function VideoPlayer({ params }: Props) {
  const { code } = use(params);
  const [data, setData] = useState<VideoData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCustomControls, setShowCustomControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const videoData = decodeData(code);
    if (videoData) {
      setData(videoData);
      setIsMuted(videoData.muted);
    } else {
      setError("Invalid video link");
      setIsLoading(false);
    }
  }, [code]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !data) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);

      if (data.autoPlay) {
        video.play().catch(console.error);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      if (!data.loop) {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };

    const handleError = () => {
      setError("Failed to load video");
      setIsLoading(false);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
    };
  }, [data]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(console.error);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;

    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.min(
      Math.max(0, video.currentTime + seconds),
      duration
    );
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getProgress = () => {
    if (duration === 0) return 0;
    return (currentTime / duration) * 100;
  };

  const handleMouseMove = () => {
    setShowCustomControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowCustomControls(false);
      }
    }, 3000);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-900/50 rounded-full flex items-center justify-center">
            <IconVideo className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Video Not Found</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: "#000000" }}
      >
        <div className="text-center text-white">
          <div className="w-16 h-16 mx-auto mb-4 bg-white bg-opacity-20 rounded-full flex items-center justify-center animate-pulse">
            <IconVideo className="w-8 h-8" />
          </div>
          <p>Loading video player...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: data.backgroundColour }}
    >
      {/* Header */}
      <div className="p-4 text-white">
        <h1 className="text-xl font-bold">{data.title}</h1>
        {data.description && (
          <p className="text-sm opacity-80 mt-1">{data.description}</p>
        )}
      </div>

      {/* Video Container */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center relative"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowCustomControls(false)}
      >
        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Video Element */}
        <video
          ref={videoRef}
          src={data.url}
          className="w-full max-h-[70vh] object-contain"
          loop={data.loop}
          muted={isMuted}
          playsInline
          controls={data.showControls}
          onClick={!data.showControls ? togglePlayPause : undefined}
        />

        {/* Custom Controls Overlay */}
        {!data.showControls && (
          <>
            {/* Center Play Button */}
            {!isPlaying && !isLoading && (
              <button
                onClick={togglePlayPause}
                className="absolute inset-0 flex items-center justify-center bg-black/30 group"
              >
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <IconPlayerPlay className="w-10 h-10 text-white ml-1" />
                </div>
              </button>
            )}

            {/* Bottom Controls */}
            <div
              className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
                showCustomControls ? "opacity-100" : "opacity-0"
              }`}
            >
              {/* Progress Bar */}
              <div
                className="w-full bg-white/30 rounded-full h-1 cursor-pointer mb-4"
                onClick={handleSeek}
              >
                <div
                  className="bg-white rounded-full h-1 transition-all duration-100"
                  style={{ width: `${getProgress()}%` }}
                />
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                  {/* Play/Pause */}
                  <button
                    onClick={togglePlayPause}
                    className="hover:text-white/80 transition-colors"
                  >
                    {isPlaying ? (
                      <IconPlayerPause size={24} />
                    ) : (
                      <IconPlayerPlay size={24} />
                    )}
                  </button>

                  {/* Skip Backward */}
                  <button
                    onClick={() => skip(-10)}
                    className="hover:text-white/80 transition-colors"
                  >
                    <IconRewindBackward10 size={20} />
                  </button>

                  {/* Skip Forward */}
                  <button
                    onClick={() => skip(10)}
                    className="hover:text-white/80 transition-colors"
                  >
                    <IconRewindForward10 size={20} />
                  </button>

                  {/* Mute Toggle */}
                  <button
                    onClick={toggleMute}
                    className="hover:text-white/80 transition-colors"
                  >
                    {isMuted ? (
                      <IconVolumeOff size={20} />
                    ) : (
                      <IconVolume size={20} />
                    )}
                  </button>

                  {/* Time Display */}
                  <span className="text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="hover:text-white/80 transition-colors"
                >
                  <IconMaximize size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* QRmory Branding */}
      <div className="p-4 text-center">
        <a
          href="https://qrmory.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-white/50 hover:text-white/70 transition-colors"
        >
          Powered by QRmory
        </a>
      </div>
    </div>
  );
}
