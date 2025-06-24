"use client";

import { useState } from "react";
import { useQRCode } from "next-qrcode";
import { recreateQRValue } from "@/utils/qr-recreator";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { downloadToSVG } from "@/utils/qr-save";
import d3ToPng from "d3-svg-to-png";
import { UserSettings } from "@/lib/default-settings";
import {
  IconPencil,
  IconX,
  IconDeviceFloppy,
  IconDownload,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";

// Import all QR control components
import QRCoupon from "@/components/qr-coupon";
import QRFacebook from "@/components/qr-facebook";
import QRInstagram from "@/components/qr-instagram";
import QRLocation from "@/components/qr-location";
import QRText from "@/components/qr-text";
import QRTwitter from "@/components/qr-twitter";
import QRVCard from "@/components/qr-vcard";
import QRWebsite from "@/components/qr-website";
import QRWifi from "@/components/qr-wifi";
import QRYoutube from "@/components/qr-youtube";
import Link from "next/link";

interface MyCodeItemProps {
  id: string;
  title: string;
  type: string;
  content: any;
  qr_value: string;
  shortcode?: string;
  created_at: string;
  is_active: boolean;
  settings: UserSettings;
}

interface QRSizes {
  [key: string]: number;
}

export default function MyCodeItem({
  id,
  title: initialTitle = "No Title",
  type = "static",
  content: initialContent,
  qr_value: initialQrValue = "",
  shortcode,
  created_at,
  is_active,
  settings,
}: MyCodeItemProps) {
  const { SVG } = useQRCode();
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Use state variables to track current values
  const [currentTitle, setCurrentTitle] = useState(initialTitle);
  const [currentContent, setCurrentContent] = useState(initialContent);
  const [currentQrValue, setCurrentQrValue] = useState(initialQrValue);

  // For editing
  const [editedTitle, setEditedTitle] = useState(initialTitle);
  const [editedContent, setEditedContent] = useState(initialContent);
  const [editedQRValue, setEditedQRValue] = useState(initialQrValue);

  const [qrChanged, setQrChanged] = useState(false);
  const [saving, setSaving] = useState(false);

  const qrSizeLookup: QRSizes = {
    small: 120,
    medium: 250,
    large: 500,
  };

  // For dynamic QR codes, get the display value (shortcode URL)
  const displayValue =
    type === "dynamic" && shortcode
      ? `https://qrmory.com/${shortcode}`
      : currentQrValue;

  // Function to get the actual QR value
  const getQRValue = () => {
    // For display in UI, use shortcode for dynamic QRs
    if (type === "dynamic" && shortcode) {
      return `https://qrmory.com/${shortcode}`;
    }

    // If content has control type, recreate the value
    if (currentContent && currentContent.controlType) {
      return recreateQRValue(currentContent);
    }

    // Fallback to saved value
    return currentQrValue;
  };

  // Handle editing toggle
  const toggleEdit = () => {
    if (type !== "dynamic") {
      toast("Only dynamic QR codes can be edited", {
        style: {
          backgroundColor: "rgb(254, 226, 226)",
          color: "rgb(153, 27, 27)",
        },
      });
      return;
    }

    setIsEditing(!isEditing);
    if (!isEditing) setIsExpanded(true);

    // Reset changes when canceling edit
    if (isEditing) {
      setEditedTitle(currentTitle);
      setEditedContent(currentContent);
      setEditedQRValue(currentQrValue);
      setQrChanged(false);
    }
  };

  // Save changes to the QR code
  const saveChanges = async () => {
    if (!editedContent || !editedQRValue) return;

    setSaving(true);

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("qr_codes")
        .update({
          title: editedTitle,
          content: editedContent,
          qr_value: editedQRValue,
        })
        .eq("id", id);

      if (error) throw error;

      // Update local state to reflect changes in the UI
      setCurrentTitle(editedTitle);
      setCurrentContent(editedContent);
      setCurrentQrValue(editedQRValue);

      // Exit edit mode and reset change tracking
      setIsEditing(false);
      setQrChanged(false);

      toast("QR code updated successfully!");
    } catch (error) {
      console.error("Error updating QR code:", error);
      toast("Error updating QR code", {
        description: "Something went wrong. Please try again later.",
        style: {
          backgroundColor: "rgb(254, 226, 226)",
          color: "rgb(153, 27, 27)",
        },
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle QR code downloads
  const handleDownload = (format: "svg" | "png" | "jpg") => {
    const svgSelector = `#qr-code-${id} svg`;
    const originalSvg = document.querySelector(svgSelector);

    if (!originalSvg) {
      toast("Error downloading QR code", {
        description: "QR code element not found",
        style: {
          backgroundColor: "rgb(254, 226, 226)",
          color: "rgb(153, 27, 27)",
        },
      });
      return;
    }

    const size = qrSizeLookup[settings.qrSize] || 250;

    if (format === "svg") {
      // For SVG downloads we can directly use the original element
      downloadToSVG(originalSvg, currentTitle || "qrmory-qr-code");
      toast(`QR code downloaded as SVG (${settings.qrSize} size)`);
    } else {
      // For PNG/JPG, we need to clone and resize before download
      const clonedSvg = originalSvg.cloneNode(true) as SVGElement;

      // Set the dimensions to the size from settings
      clonedSvg.setAttribute("width", `${size}`);
      clonedSvg.setAttribute("height", `${size}`);
      clonedSvg.setAttribute(
        "viewBox",
        originalSvg.getAttribute("viewBox") || "0 0 29 29",
      );

      // If format is JPG, ensure white background and black foreground
      if (format === "jpg") {
        // Add a white background rectangle
        const rect = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect",
        );
        rect.setAttribute("width", "100%");
        rect.setAttribute("height", "100%");
        rect.setAttribute("fill", "white");

        // Insert the background rect as the first child
        clonedSvg.insertBefore(rect, clonedSvg.firstChild);

        // Ensure all path elements are black
        const paths = clonedSvg.querySelectorAll(
          "path, rect:not(:first-child)",
        );
        paths.forEach((path) => {
          path.setAttribute("fill", "black");
        });
      }

      // Create a temporary container
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.opacity = "0";
      tempContainer.style.pointerEvents = "none";
      tempContainer.id = `temp-svg-container-${id}`;
      tempContainer.appendChild(clonedSvg);
      document.body.appendChild(tempContainer);

      // Use d3ToPng with the temporary container
      d3ToPng(
        `#temp-svg-container-${id} svg`,
        currentTitle || "qrmory-qr-code",
        {
          format: format,
        },
      )
        .then(() => {
          toast(
            `QR code downloaded as ${format.toUpperCase()} (${
              settings.qrSize
            } size)`,
          );
          document.body.removeChild(tempContainer);
        })
        .catch((err) => {
          console.error("Error downloading QR code:", err);
          toast("Failed to download QR code");
          document.body.removeChild(tempContainer);
        });
    }
  };

  // Get the appropriate editor component based on control type
  const renderEditor = () => {
    if (!currentContent || !currentContent.controlType) return null;

    const updateTextValue = (value: string) => {
      setEditedQRValue(value);
      setQrChanged(true);
    };

    const updateChanged = (changed: boolean) => {
      setQrChanged(changed);
    };

    const updateSaveData = (data: any) => {
      // Preserve the controlType
      setEditedContent({
        controlType: currentContent.controlType,
        ...data,
      });
    };

    // Map control type to component
    switch (currentContent.controlType) {
      case "website":
        return (
          <QRWebsite
            setText={updateTextValue}
            setChanged={updateChanged}
            setSaveData={updateSaveData}
            initialData={currentContent}
          />
        );
      case "facebook":
        return (
          <QRFacebook
            setText={updateTextValue}
            setChanged={updateChanged}
            setSaveData={updateSaveData}
            initialData={currentContent}
          />
        );
      case "instagram":
        return (
          <QRInstagram
            setText={updateTextValue}
            setChanged={updateChanged}
            setSaveData={updateSaveData}
            initialData={currentContent}
          />
        );
      case "twitter":
        return (
          <QRTwitter
            setText={updateTextValue}
            setChanged={updateChanged}
            setSaveData={updateSaveData}
            initialData={currentContent}
          />
        );
      case "youtube":
        return (
          <QRYoutube
            setText={updateTextValue}
            setChanged={updateChanged}
            setSaveData={updateSaveData}
            initialData={currentContent}
          />
        );
      case "text":
        return (
          <QRText
            setText={updateTextValue}
            setChanged={updateChanged}
            setSaveData={updateSaveData}
            initialData={currentContent}
          />
        );
      case "wifi":
        return (
          <QRWifi
            setText={updateTextValue}
            setChanged={updateChanged}
            setSaveData={updateSaveData}
            initialData={currentContent}
          />
        );
      case "vcard":
        return (
          <QRVCard
            setText={updateTextValue}
            setChanged={updateChanged}
            setSaveData={updateSaveData}
            initialData={currentContent}
          />
        );
      case "coupon":
        return (
          <QRCoupon
            setText={updateTextValue}
            setChanged={updateChanged}
            setSaveData={updateSaveData}
            initialData={currentContent}
          />
        );
      case "location":
        return (
          <QRLocation
            setText={updateTextValue}
            setChanged={updateChanged}
            setSaveData={updateSaveData}
            initialData={currentContent}
          />
        );
      default:
        return <div>Unsupported QR type: {currentContent.controlType}</div>;
    }
  };

  return (
    <article className="border rounded-lg shadow-sm bg-white overflow-hidden mb-6">
      {/* QR Code Header */}
      <div
        className={`py-3 px-4 flex flex-row items-center gap-4 w-full border-b border-neutral-200/70`}
      >
        <div
          id={`qr-code-${id}`}
          className="w-16 h-16 flex items-center justify-center"
        >
          <SVG
            text={displayValue}
            options={{
              errorCorrectionLevel: settings.qrErrorCorrectionLevel,
              color: { dark: "#1E073E", light: "#FFFFFF00" },
              margin: 1,
              width: 64,
            }}
          />
        </div>

        <div className="flex-grow">
          {isEditing ? (
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              placeholder="QR Code Title"
            />
          ) : (
            <>
              <h2
                className={`text-qrmory-purple-800 font-serif text-sm sm:text-base font-bold`}
              >
                {currentTitle}
              </h2>
              <h3 className="font-sans text-xs md:text-sm text-neutral-500">
                {type === "dynamic" ? "Dynamic" : "Static"} • Created:{" "}
                {new Date(created_at).toLocaleDateString()}
              </h3>
              {type === "dynamic" && shortcode && (
                <div className="text-xs text-neutral-500">
                  Shortcode: https://qrmory.com/
                  <Link
                    href={`https://qrmory.com/${shortcode}`}
                    className={`font-bold`}
                  >
                    {shortcode}
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex space-x-2">
          {type === "dynamic" && (
            <button
              onClick={toggleEdit}
              className="p-2 text-qrmory-purple-800 hover:bg-qrmory-purple-100 rounded transition-colors"
              title={isEditing ? "Cancel editing" : "Edit QR code"}
            >
              {isEditing ? <IconX size={20} /> : <IconPencil size={20} />}
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-qrmory-purple-800 hover:bg-qrmory-purple-800 hover:text-white rounded transition-all duration-300 ease-in-out"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <IconChevronUp size={20} />
            ) : (
              <IconChevronDown size={20} />
            )}
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="p-4 bg-neutral-50">
          {isEditing ? (
            <div className="space-y-4">
              <h3 className="font-medium text-neutral-700">Edit QR Code</h3>
              <div className="bg-white p-4 rounded-md border">
                {renderEditor()}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={toggleEdit}
                  className="px-4 py-2 text-neutral-700 border border-neutral-300 rounded-md hover:bg-neutral-100"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={saveChanges}
                  className="px-4 py-2 bg-qrmory-purple-800 text-white rounded-md hover:bg-qrmory-purple-700 flex items-center space-x-1"
                  disabled={saving || !qrChanged}
                >
                  <IconDeviceFloppy size={18} />
                  <span>{saving ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className={`font-bold text-qrmory-purple-800`}>
                Download QR Code
              </h3>
              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3">
                <div className="w-32 h-32">
                  <SVG
                    text={displayValue}
                    options={{
                      errorCorrectionLevel: settings.qrErrorCorrectionLevel,
                      color: { dark: "#1E073E", light: "#FFFFFF00" },
                      margin: 1,
                      width: 128,
                    }}
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => handleDownload("svg")}
                    className="px-4 py-2 border border-qrmory-purple-800 text-qrmory-purple-800 hover:text-white rounded-md hover:bg-qrmory-purple-800 flex items-center justify-center space-x-1"
                  >
                    <IconDownload size={18} />
                    <span>Download SVG</span>
                  </button>
                  <button
                    onClick={() => handleDownload("png")}
                    className="px-4 py-2 border border-qrmory-purple-800 text-qrmory-purple-800 hover:text-white rounded-md hover:bg-qrmory-purple-800 flex items-center justify-center space-x-1"
                  >
                    <IconDownload size={18} />
                    <span>Download PNG</span>
                  </button>
                  <button
                    onClick={() => handleDownload("jpg")}
                    className="px-4 py-2 border border-qrmory-purple-800 text-qrmory-purple-800 hover:text-white rounded-md hover:bg-qrmory-purple-800 flex items-center justify-center space-x-1"
                  >
                    <IconDownload size={18} />
                    <span>Download JPG</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
