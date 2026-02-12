// components/qr-pdf.tsx
import { useState, useEffect, useRef } from "react";
import { QRControlType } from "@/types/qr-controls";
import { toast } from "sonner";
import {
  getFileSizeLimit,
  canUploadFileType,
  formatFileSize,
} from "@/lib/file-upload-limits";
import {
  IconFileTypePdf,
  IconUpload,
  IconTrash,
  IconDownload,
  IconEye,
} from "@tabler/icons-react";

interface PDFSaveData {
  controlType: string;
  title: string;
  description: string;
  url: string;
  fileName: string;
  fileSize: number;
  pageCount?: number;
  allowDownload: boolean;
  accentColour: string;
}

interface Props extends QRControlType {
  user: any;
  subscriptionLevel: number;
}

export default function QRPDF({
  setText,
  setChanged,
  setSaveData,
  initialData,
  user,
  subscriptionLevel,
}: Props) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState(initialData?.url || "");
  const [fileName, setFileName] = useState(initialData?.fileName || "");
  const [fileSize, setFileSize] = useState<number>(initialData?.fileSize || 0);
  const [allowDownload, setAllowDownload] = useState(
    initialData?.allowDownload !== false
  );
  const [accentColour, setAccentColour] = useState(
    initialData?.accentColour || "#7c3aed"
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploaded, setIsUploaded] = useState(!!initialData?.url);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = getFileSizeLimit("pdf", subscriptionLevel);
  const canUpload = user && canUploadFileType("pdf", subscriptionLevel);

  // Initialize from saved data
  useEffect(() => {
    if (initialData && !isInitialized) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setPdfUrl(initialData.url || "");
      setFileName(initialData.fileName || "");
      setFileSize(initialData.fileSize || 0);
      setAllowDownload(initialData.allowDownload !== false);
      setAccentColour(initialData.accentColour || "#7c3aed");
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
    if (file.type !== "application/pdf") {
      toast("Please select a PDF file", {
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

    setPdfFile(file);
    setFileName(file.name);
    setFileSize(file.size);
    setTitle(title || file.name.replace(/\.pdf$/i, ""));
    setIsUploaded(false);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPdfUrl(previewUrl);
  };

  // Upload PDF to R2 via API
  const uploadPdf = async () => {
    if (!pdfFile || !user) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", pdfFile);
      formData.append("type", "pdf");

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 15, 90));
      }, 300);

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
      if (pdfUrl.startsWith("blob:")) {
        URL.revokeObjectURL(pdfUrl);
      }

      setPdfUrl(result.url);
      setIsUploaded(true);
      setPdfFile(null);

      toast("PDF uploaded successfully!", {
        description: `Storage: ${result.storageUsed} used, ${result.storageRemaining} remaining`,
      });

      updateParentValue();
    } catch (error) {
      console.error("Upload error:", error);
      toast("Upload failed. Please try again.", {
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

  // Generate encoded data for PDF viewer
  const generateEncodedData = () => {
    if (!title || !pdfUrl || !isUploaded) return "";

    const data = {
      title,
      description,
      url: pdfUrl,
      fileName,
      fileSize,
      allowDownload,
      accentColour,
      ts: Date.now(),
    };

    const jsonStr = JSON.stringify(data);
    return btoa(unescape(encodeURIComponent(jsonStr)));
  };

  // Update parent with PDF URL
  const updateParentValue = () => {
    if (title && pdfUrl && isUploaded) {
      const encodedData = generateEncodedData();
      const pdfViewerUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://qrmory.com"}/pdf/${encodedData}`;
      setText(pdfViewerUrl);
      setChanged(true);

      if (setSaveData) {
        const saveData: PDFSaveData = {
          controlType: "pdf",
          title,
          description,
          url: pdfUrl,
          fileName,
          fileSize,
          allowDownload,
          accentColour,
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
  }, [title, description, pdfUrl, allowDownload, accentColour, isUploaded]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl && pdfUrl.startsWith("blob:")) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, []);

  // Show upgrade prompt for non-eligible users
  if (!canUpload) {
    return (
      <div className="text-center p-6 bg-gradient-to-br from-qrmory-purple-50 to-qrmory-purple-100 rounded-lg border border-qrmory-purple-200">
        <div className="w-16 h-16 mx-auto mb-4 bg-qrmory-purple-200 rounded-full flex items-center justify-center">
          <IconFileTypePdf className="w-8 h-8 text-qrmory-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-qrmory-purple-800 mb-2">
          PDF QR Codes
        </h3>
        <p className="text-qrmory-purple-600 mb-4">
          Upgrade to Explorer or higher to share PDFs with your QR codes.
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
      {/* Document Title */}
      <label className="control-label">
        Document Title*:
        <input
          type="text"
          className="control-input w-full"
          placeholder="My Document"
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
          placeholder="Brief description of the document..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          maxLength={300}
        />
      </label>

      {/* Accent Colour */}
      <label className="control-label">
        Accent Colour:
        <div className="flex items-center space-x-2">
          <input
            type="color"
            className="h-8 w-12 border-0 rounded cursor-pointer"
            value={accentColour}
            onChange={(e) => setAccentColour(e.target.value)}
          />
          <input
            type="text"
            className="control-input flex-grow text-sm"
            value={accentColour}
            onChange={(e) => setAccentColour(e.target.value)}
          />
        </div>
      </label>

      {/* File Upload Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-neutral-700">PDF File</h4>

        {!pdfUrl && (
          <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-qrmory-purple-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="w-12 h-12 mx-auto mb-3 bg-neutral-100 rounded-full flex items-center justify-center">
              <IconFileTypePdf className="w-6 h-6 text-neutral-400" />
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm font-medium text-qrmory-purple-600 hover:text-qrmory-purple-800"
            >
              Select PDF File
            </button>
            <p className="text-xs text-neutral-500 mt-1">
              PDF up to {formatFileSize(MAX_FILE_SIZE)}
            </p>
          </div>
        )}

        {pdfUrl && (
          <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <IconFileTypePdf className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <div className="text-sm font-medium">{fileName || title}</div>
                  <div className="text-xs text-neutral-500">
                    {formatFileSize(fileSize)}
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
                    if (pdfUrl.startsWith("blob:")) {
                      URL.revokeObjectURL(pdfUrl);
                    }
                    setPdfUrl("");
                    setPdfFile(null);
                    setFileName("");
                    setFileSize(0);
                    setIsUploaded(false);
                  }}
                  disabled={isUploading}
                  className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 disabled:opacity-50"
                >
                  <IconTrash size={16} />
                </button>
              </div>
            </div>

            {/* PDF Preview (embedded) */}
            {!pdfUrl.startsWith("blob:") && isUploaded && (
              <div className="bg-white border rounded-lg overflow-hidden">
                <iframe
                  src={`${pdfUrl}#view=FitH`}
                  className="w-full h-48"
                  title="PDF Preview"
                />
              </div>
            )}

            {/* Blob preview message */}
            {pdfUrl.startsWith("blob:") && (
              <div className="bg-neutral-100 rounded-lg p-4 text-center">
                <IconEye className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                <p className="text-sm text-neutral-600">
                  Upload the file to enable preview
                </p>
              </div>
            )}

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
            {pdfFile && !isUploaded && !isUploading && (
              <button
                type="button"
                onClick={uploadPdf}
                className="w-full mt-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <IconUpload size={18} />
                Upload PDF
              </button>
            )}
          </div>
        )}
      </div>

      {/* Viewer Settings */}
      {pdfUrl && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-neutral-700 mb-3">
            Viewer Settings
          </h4>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-qrmory-purple-600 rounded"
              checked={allowDownload}
              onChange={(e) => setAllowDownload(e.target.checked)}
            />
            <span className="text-sm text-neutral-700">
              Allow viewers to download the PDF
            </span>
          </label>
        </div>
      )}

      {/* Preview */}
      {title && pdfUrl && isUploaded && (
        <div className="pt-3 rounded-lg border bg-neutral-50 border-neutral-200">
          <p className="px-3 text-xs font-medium uppercase text-neutral-500">
            Preview
          </p>
          <div className="mt-3 mx-3 mb-3 rounded-lg overflow-hidden bg-white border">
            <div
              className="p-4 text-white"
              style={{ backgroundColor: accentColour }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <IconFileTypePdf className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold">{title}</h3>
                  <p className="text-xs opacity-80">{fileName}</p>
                </div>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between bg-neutral-50">
              <span className="text-sm text-neutral-600">
                {formatFileSize(fileSize)}
              </span>
              {allowDownload && (
                <div className="flex items-center gap-1 text-sm text-neutral-500">
                  <IconDownload size={16} />
                  <span>Download enabled</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
