// src/components/qr-create/qr-creator.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";

import QRPreview from "./qr-preview";
import QRSettings from "./qr-settings";
import { suggestedTitles } from "@/data/defaults/suggested-titles";
import { UserSettings, DEFAULT_FRAME_SETTINGS, QRFrameSettings as QRFrameSettingsType } from "@/lib/default-settings";
import { QRShapeSettings, DEFAULT_SHAPE_SETTINGS } from "@/lib/qr-shapes";
import { QRFrameSettings } from "@/lib/qr-frames";
import {
  QRTemplate,
  QRTemplateConfig,
  TemplateCategory,
} from "@/lib/qr-templates";

interface QuotaInfo {
  currentCount: number;
  maxQuota: number;
  subscriptionLevel: string;
  subscriptionStatus: string;
}

interface QRCreatorProps {
  withHeading?: boolean;
  shadow?: boolean;
  user: any;
  userSettings: UserSettings;
  quotaInfo?: QuotaInfo;
}

// Centralized QR state interface
interface QRState {
  title: string;
  value: string;
  textValue: string;
  changed: boolean;
  shortCode: string;
  activeSelector: string;
  isDynamic: boolean;
  isShortcodeSaved: boolean;
  saveData: any;
}

// Error boundary for async operations
class QRErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("QR Creator Error:", error, errorInfo);
    toast("An error occurred", {
      description: "Please refresh the page and try again.",
      style: {
        backgroundColor: "rgb(254, 226, 226)",
        color: "rgb(153, 27, 27)",
      },
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 text-center text-red-600">
            <p>Something went wrong. Please refresh the page.</p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default function QRCreator({
  withHeading = true,
  shadow = false,
  user = null,
  userSettings,
  quotaInfo = {
    currentCount: 0,
    maxQuota: 3,
    subscriptionLevel: "free",
    subscriptionStatus: "inactive",
  },
}: QRCreatorProps) {
  // States
  const [qrColors, setQRColors] = useState({
    foreground: userSettings.colors.foreground || "#2A0B4D",
    background: userSettings.colors.background || "#FFFFFF",
  });

  const [colorInputs, setColorInputs] = useState({
    foreground: qrColors.foreground,
    background: qrColors.background,
  });

  // Shape and frame settings
  const [shapeSettings, setShapeSettings] = useState<QRShapeSettings>(
    userSettings.shapeSettings || DEFAULT_SHAPE_SETTINGS
  );

  const [frameSettings, setFrameSettings] = useState<QRFrameSettings>(
    userSettings.frameSettings || DEFAULT_FRAME_SETTINGS
  );

  // Template state
  const [userTemplates, setUserTemplates] = useState<QRTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false);

  // Consolidated state management
  const [qrState, setQRState] = useState<QRState>(() => ({
    title: suggestedTitles[Math.floor(Math.random() * suggestedTitles.length)],
    value: "Welcome to QRmory!",
    textValue: "",
    changed: true,
    shortCode: "",
    activeSelector: "website",
    isDynamic: false,
    isShortcodeSaved: false,
    saveData: null,
  }));

  // Loading states
  const [loadingStates, setLoadingStates] = useState({
    generating: false,
    saving: false,
    makingDynamic: false,
  });

  // Memoized handlers to prevent unnecessary re-renders
  const updateQRState = useCallback((updates: Partial<QRState>) => {
    setQRState((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateQRColors = useCallback(
    (updates: Partial<typeof qrColors>) => {
      setQRColors((prev) => ({ ...prev, ...updates }));
    },
    [updateQRState],
  );

  const updateShapeSettings = useCallback((settings: QRShapeSettings) => {
    setShapeSettings(settings);
  }, []);

  const updateFrameSettings = useCallback((settings: QRFrameSettings) => {
    setFrameSettings(settings);
  }, []);

  // Template handlers
  const handleApplyTemplate = useCallback((template: QRTemplate) => {
    setSelectedTemplateId(template.id);
    setQRColors(template.config.colors);
    setColorInputs(template.config.colors);
    setShapeSettings(template.config.shapeSettings);
    setFrameSettings(template.config.frameSettings);
    setQRState((prev) => ({ ...prev, changed: true }));
  }, []);

  const handleSaveTemplate = useCallback(
    async (name: string, description: string, category: TemplateCategory) => {
      const config: QRTemplateConfig = {
        colors: qrColors,
        shapeSettings,
        frameSettings,
      };

      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, category, config }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save template");
      }

      const data = await response.json();

      // Add new template to local state
      setUserTemplates((prev) => [...prev, data.template]);
      setSelectedTemplateId(data.template.id);
    },
    [qrColors, shapeSettings, frameSettings]
  );

  const handleOpenSaveDialog = useCallback(() => {
    setShowSaveTemplateDialog(true);
  }, []);

  const handleCloseSaveDialog = useCallback(() => {
    setShowSaveTemplateDialog(false);
  }, []);

  const updateLoadingState = useCallback(
    (key: keyof typeof loadingStates, value: boolean) => {
      setLoadingStates((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // Generate QR code handler
  const handleGenerateQR = useCallback(async () => {
    if (qrState.textValue.length === 0) {
      toast("Please enter content first", {
        description: "QR code needs content to generate.",
      });
      return;
    }

    updateLoadingState("generating", true);

    try {
      // Simulate API call delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 300));

      updateQRState({
        value: qrState.textValue,
        changed: false,
      });

      toast("QR code generated successfully!", {
        description: "Your QR code is ready for download.",
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast("Failed to generate QR code", {
        description: "Please try again.",
        style: {
          backgroundColor: "rgb(254, 226, 226)",
          color: "rgb(153, 27, 27)",
        },
      });
    } finally {
      updateLoadingState("generating", false);
    }
  }, [qrState.textValue, updateQRState, updateLoadingState]);

  // Computed display value for QR code
  const displayValue = useMemo(() => {
    if (qrState.shortCode && qrState.isDynamic) {
      return `${process.env.NEXT_PUBLIC_SITE_URL}/${qrState.shortCode}`;
    }
    return qrState.value;
  }, [qrState.shortCode, qrState.isDynamic, qrState.value]);

  // Fetch user templates on mount
  useEffect(() => {
    if (!user) return;

    const fetchTemplates = async () => {
      try {
        const response = await fetch("/api/templates");
        if (response.ok) {
          const data = await response.json();
          setUserTemplates(data.templates || []);
        }
      } catch (error) {
        console.error("Failed to fetch templates:", error);
      }
    };

    fetchTemplates();
  }, [user]);

  // Cleanup effect for unreserved shortcodes
  useEffect(() => {
    return () => {
      if (qrState.shortCode && qrState.isDynamic && !qrState.isShortcodeSaved) {
        // Fire and forget cleanup
        fetch("/api/release-shortcode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shortcode: qrState.shortCode,
            saved: false,
          }),
        }).catch((err) => {
          console.error("Failed to release shortcode:", err);
        });
      }
    };
  }, []); // Empty dependency array - only runs on unmount

  return (
    <QRErrorBoundary>
      <div
        id="start-creating"
        className={`${
          withHeading ? "mx-auto mt-24 px-2 lg:px-6 max-w-6xl" : ""
        } mb-16 w-full text-center text-qrmory-purple-800`}
      >
        {withHeading && (
          <>
            <h2 className="font-header text-3xl lg:text-4.5xl">
              Start Creating
            </h2>
            <h3 className="font-serif text-sm lg:text-xl font-bold uppercase">
              Go on! Give it a go
            </h3>
          </>
        )}

        <section
          className={`${
            withHeading ? "py-16" : ""
          } flex lg:flex-row flex-col items-stretch gap-6 min-h-qr-card w-full`}
        >
          <QRSettings
            qrState={qrState}
            loadingStates={loadingStates}
            shadow={shadow}
            user={user}
            quotaInfo={quotaInfo}
            onUpdateQRState={updateQRState}
            onUpdateLoadingState={updateLoadingState}
            onGenerateQR={handleGenerateQR}
            qrColors={qrColors}
            onUpdateQRColors={updateQRColors}
            shapeSettings={shapeSettings}
            onUpdateShapeSettings={updateShapeSettings}
            frameSettings={frameSettings}
            onUpdateFrameSettings={updateFrameSettings}
            userTemplates={userTemplates}
            selectedTemplateId={selectedTemplateId}
            onApplyTemplate={handleApplyTemplate}
            onSaveTemplate={handleOpenSaveDialog}
            showSaveTemplateDialog={showSaveTemplateDialog}
            onCloseSaveDialog={handleCloseSaveDialog}
            onSaveTemplateConfirm={handleSaveTemplate}
            currentTemplateConfig={{
              colors: qrColors,
              shapeSettings,
              frameSettings,
            }}
          />

          <QRPreview
            qrState={qrState}
            displayValue={displayValue}
            shadow={shadow}
            user={user}
            userSettings={userSettings}
            qrColors={qrColors}
            shapeSettings={shapeSettings}
            frameSettings={frameSettings}
          />
        </section>
      </div>
    </QRErrorBoundary>
  );
}
