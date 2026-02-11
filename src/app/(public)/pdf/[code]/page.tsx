// app/(public)/pdf/[code]/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import {
  IconFileTypePdf,
  IconDownload,
  IconExternalLink,
  IconAlertCircle,
} from "@tabler/icons-react";

interface PDFData {
  title: string;
  description?: string;
  url: string;
  fileName: string;
  fileSize: number;
  allowDownload: boolean;
  accentColour: string;
  ts: number;
}

interface Props {
  params: Promise<{
    code: string;
  }>;
}

function decodeData(encoded: string): PDFData | null {
  try {
    const decoded = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Failed to decode PDF data:", error);
    return null;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function PDFViewer({ params }: Props) {
  const { code } = use(params);
  const [data, setData] = useState<PDFData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);

  useEffect(() => {
    const pdfData = decodeData(code);
    if (pdfData) {
      setData(pdfData);
      setIsLoading(false);
    } else {
      setError("Invalid PDF link");
      setIsLoading(false);
    }
  }, [code]);

  const handleDownload = async () => {
    if (!data) return;

    try {
      const response = await fetch(data.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.fileName || "document.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      // Fallback: open in new tab
      window.open(data.url, "_blank");
    }
  };

  const openInNewTab = () => {
    if (data) {
      window.open(data.url, "_blank");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <IconAlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Document Not Found
          </h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center animate-pulse">
            <IconFileTypePdf className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header
        className="text-white p-4 shadow-lg"
        style={{ backgroundColor: data.accentColour }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <IconFileTypePdf className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{data.title}</h1>
              <p className="text-sm opacity-80">
                {data.fileName} • {formatFileSize(data.fileSize)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openInNewTab}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <IconExternalLink size={18} />
              <span className="hidden sm:inline">Open</span>
            </button>

            {data.allowDownload && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <IconDownload size={18} />
                <span className="hidden sm:inline">Download</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Description */}
      {data.description && (
        <div className="bg-white border-b p-4">
          <div className="max-w-6xl mx-auto">
            <p className="text-gray-600">{data.description}</p>
          </div>
        </div>
      )}

      {/* PDF Viewer */}
      <main className="flex-1 p-4">
        <div className="max-w-6xl mx-auto h-full">
          {!iframeError ? (
            <iframe
              src={`${data.url}#view=FitH&toolbar=${data.allowDownload ? 1 : 0}`}
              className="w-full bg-white rounded-lg shadow-lg"
              style={{ height: "calc(100vh - 200px)", minHeight: "500px" }}
              title={data.title}
              onError={() => setIframeError(true)}
            />
          ) : (
            // Fallback if iframe fails
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <IconFileTypePdf className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {data.title}
              </h2>
              <p className="text-gray-600 mb-6">
                Unable to display PDF preview in browser.
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={openInNewTab}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <IconExternalLink size={20} />
                  Open PDF
                </button>
                {data.allowDownload && (
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-6 py-3 border-2 border-gray-800 text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <IconDownload size={20} />
                    Download
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center">
        <a
          href="https://qrmory.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Powered by QRmory
        </a>
      </footer>
    </div>
  );
}
