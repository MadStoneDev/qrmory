// src/components/qr-create/qr-settings.tsx
"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { toast } from "sonner";

import { createClient } from "@/utils/supabase/client";
import { UserSettings } from "@/lib/default-settings";
import { qrControlsLazy as qrControls } from "@/lib/qr-control-object-lazy";

import { useShortcodeManager } from "@/hooks/useShortcodeManager";

import {
  validateQuotaForDynamicQR,
  validateQuotaForSave,
  QuotaInfo,
} from "@/utils/quota-validation";
import { QRState, LoadingStates, QuotaStatus } from "@/types/qr-types";
import { QRTypeSelector } from "@/components/ui/QRTypeSelector";
import { QRActionButtons } from "@/components/ui/QRActionButtons";
import { QRStatusIndicators } from "@/components/ui/QRStatusIndicators";

import { UserRateLimiter } from "@/lib/rate-limiter";
import { ColorPicker } from "@/components/colour-picker";
import { ShapeSelector } from "@/components/qr-create/shape-selector";
import { FrameSelector } from "@/components/qr-create/frame-selector";
import TemplateSelector from "@/components/qr-create/template-selector";
import TemplateSaveDialog from "@/components/qr-create/template-save-dialog";
import { QRShapeSettings } from "@/lib/qr-shapes";
import { QRFrameSettings } from "@/lib/qr-frames";
import { QRTemplate, QRTemplateConfig, TemplateCategory } from "@/lib/qr-templates";

interface Props {
  qrState: QRState;
  loadingStates: LoadingStates;
  shadow?: boolean;
  user: any;
  quotaInfo?: QuotaInfo;
  qrColors: { foreground: string; background: string };
  onUpdateQRColors: (
    updates: Partial<{ foreground: string; background: string }>,
  ) => void;
  onUpdateQRState: (updates: Partial<QRState>) => void;
  onUpdateLoadingState: (key: keyof LoadingStates, value: boolean) => void;
  onGenerateQR: () => void;
  shapeSettings: QRShapeSettings;
  onUpdateShapeSettings: (settings: QRShapeSettings) => void;
  frameSettings: QRFrameSettings;
  onUpdateFrameSettings: (settings: QRFrameSettings) => void;
  // Template props
  userTemplates?: QRTemplate[];
  selectedTemplateId?: string | null;
  onApplyTemplate?: (template: QRTemplate) => void;
  onSaveTemplate?: () => void;
  showSaveTemplateDialog?: boolean;
  onCloseSaveDialog?: () => void;
  onSaveTemplateConfirm?: (name: string, description: string, category: TemplateCategory) => Promise<void>;
  currentTemplateConfig?: QRTemplateConfig;
}

// Define which QR types require paid subscriptions
const PREMIUM_QR_TYPES = ["imageGallery", "audio", "video"];
const SUBSCRIPTION_REQUIRED_TYPES = {
  imageGallery: 1, // Requires Explorer or higher
  audio: 1, // Requires Explorer or higher
  video: 1, // Requires Explorer or higher
};

export default function QRSettingsRefactored({
  qrState,
  loadingStates,
  shadow = false,
  user,
  quotaInfo = {
    currentCount: 0,
    maxQuota: 3,
    subscriptionLevel: "free",
    subscriptionStatus: "inactive",
  },
  qrColors,
  onUpdateQRColors,
  onUpdateQRState,
  onUpdateLoadingState,
  onGenerateQR,
  shapeSettings,
  onUpdateShapeSettings,
  frameSettings,
  onUpdateFrameSettings,
  userTemplates = [],
  selectedTemplateId,
  onApplyTemplate,
  onSaveTemplate,
  showSaveTemplateDialog = false,
  onCloseSaveDialog,
  onSaveTemplateConfirm,
  currentTemplateConfig,
}: Props) {
  // States
  const { createDynamicQR, releaseShortcode } = useShortcodeManager(user);

  const [colorInputs, setColorInputs] = useState({
    foreground: qrColors.foreground,
    background: qrColors.background,
  });

  // Local input state for controlled inputs
  const [titleInput, setTitleInput] = useState(qrState.title);
  const [textInput, setTextInput] = useState(qrState.textValue);

  // Get user subscription level
  const userSubscriptionLevel = user?.subscription_level || 0;

  // QR control component state
  const [qrControl, setQRControl] = useState(() => {
    // Check if user can access this QR type
    if (
      PREMIUM_QR_TYPES.includes(qrState.activeSelector) &&
      userSubscriptionLevel === 0
    ) {
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
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-qrmory-purple-800 mb-2">
            Premium Feature
          </h3>
          <p className="text-qrmory-purple-600 mb-4">
            {qrControls[qrState.activeSelector]?.title} QR codes require a paid
            subscription.
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

    return qrControls[qrState.activeSelector].component(
      (value: string) => {
        setTextInput(value);
        onUpdateQRState({ textValue: value, changed: true });
      },
      (changed: boolean) => onUpdateQRState({ changed }),
      (data: any) => onUpdateQRState({ saveData: data }),
      user,
      userSubscriptionLevel,
      qrState.saveData,
    );
  });

  // Memoized quota status
  const quotaStatus: QuotaStatus = useMemo(() => {
    const hasReachedQuota = quotaInfo.currentCount >= quotaInfo.maxQuota;
    const isNearQuota = quotaInfo.currentCount >= quotaInfo.maxQuota - 1;
    return { hasReachedQuota, isNearQuota };
  }, [quotaInfo.currentCount, quotaInfo.maxQuota]);

  // Check if user can access a QR type
  const canAccessQRType = useCallback(
    (qrType: string): boolean => {
      if (!PREMIUM_QR_TYPES.includes(qrType)) return true;

      const requiredLevel =
        SUBSCRIPTION_REQUIRED_TYPES[
          qrType as keyof typeof SUBSCRIPTION_REQUIRED_TYPES
        ];
      return userSubscriptionLevel >= requiredLevel;
    },
    [userSubscriptionLevel],
  );

  // Handle selector changes with subscription validation
  const handleSelectorChange = useCallback(
    (key: string) => {
      // Check if user can access this QR type
      if (!canAccessQRType(key)) {
        toast("Premium Feature Required", {
          description: `${qrControls[key]?.title} QR codes require a paid subscription.`,
          style: {
            backgroundColor: "rgb(254, 226, 226)",
            color: "rgb(153, 27, 27)",
          },
          action: {
            label: "Upgrade",
            onClick: () => {
              window.location.href = "/dashboard/subscription";
            },
          },
        });
        return;
      }

      setTextInput("");
      onUpdateQRState({
        textValue: "",
        saveData: null,
        activeSelector: key,
        changed: true,
      });

      // Create appropriate component based on subscription level
      if (PREMIUM_QR_TYPES.includes(key) && userSubscriptionLevel === 0) {
        setQRControl(
          <div className="text-center p-6 bg-gradient-to-br from-qrmory-purple-50 to-qrmory-purple-100 rounded-lg border border-qrmory-purple-200">
            <div className="w-16 h-16 mx-auto mb-4 bg-qrmory-purple-200 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-qrmory-purple-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-qrmory-purple-800 mb-2">
              Premium Feature
            </h3>
            <p className="text-qrmory-purple-600 mb-4">
              {qrControls[key]?.title} QR codes require a paid subscription.
            </p>
            <a
              href="/dashboard/subscription"
              className="inline-block bg-qrmory-purple-600 text-white px-6 py-2 rounded-lg hover:bg-qrmory-purple-700 transition-colors"
            >
              Upgrade Now
            </a>
          </div>,
        );
      } else {
        setQRControl(
          qrControls[key].component(
            (value: string) => {
              setTextInput(value);
              onUpdateQRState({ textValue: value, changed: true });
            },
            (changed: boolean) => onUpdateQRState({ changed }),
            (data: any) => onUpdateQRState({ saveData: data }),
            user,
            userSubscriptionLevel,
            qrState.saveData,
          ),
        );
      }
    },
    [
      onUpdateQRState,
      user,
      userSubscriptionLevel,
      qrState.saveData,
      canAccessQRType,
    ],
  );

  const isValidHexColor = (hex: string): boolean => {
    return /^#[0-9A-Fa-f]{6}$/.test(hex);
  };

  const handleColorInputChange = useCallback(
    (colorType: "foreground" | "background", value: string) => {
      setColorInputs((prev) => ({
        ...prev,
        [colorType]: value,
      }));
    },
    [],
  );

  const applyColorFromInput = useCallback(
    (colorType: "foreground" | "background") => {
      const inputValue = colorInputs[colorType];
      if (isValidHexColor(inputValue)) {
        onUpdateQRColors({ [colorType]: inputValue });
      } else {
        // Reset invalid input to current valid color
        setColorInputs((prev) => ({
          ...prev,
          [colorType]: qrColors[colorType],
        }));
      }
    },
    [colorInputs, qrColors, onUpdateQRColors],
  );

  // Handle dynamic QR toggle with rate limiting
  const handleMakeDynamic = useCallback(async () => {
    // Check subscription for premium QR types
    if (
      PREMIUM_QR_TYPES.includes(qrState.activeSelector) &&
      userSubscriptionLevel === 0
    ) {
      toast("Premium Feature Required", {
        description:
          "Dynamic QR codes for this type require a paid subscription.",
        style: {
          backgroundColor: "rgb(254, 226, 226)",
          color: "rgb(153, 27, 27)",
        },
        action: {
          label: "Upgrade",
          onClick: () => {
            window.location.href = "/dashboard/subscription";
          },
        },
      });
      return;
    }

    // Validate rate limit first
    const subscriptionLevel = userSubscriptionLevel as 0 | 1 | 2 | 3;
    const rateLimitResult = await UserRateLimiter.checkUserLimit(
      "qr_generation",
      user?.id || "anonymous",
      subscriptionLevel,
    );

    if (!rateLimitResult.success) {
      toast("Rate limit exceeded", {
        description: `Please wait ${rateLimitResult.retryAfter} seconds before creating more QR codes.`,
        style: {
          backgroundColor: "rgb(254, 226, 226)",
          color: "rgb(153, 27, 27)",
        },
      });
      return;
    }

    // If turning off dynamic mode and not saved, allow it
    if (qrState.isDynamic && !qrState.isShortcodeSaved) {
      if (qrState.shortCode) {
        await releaseShortcode(qrState.shortCode);
      }
      onUpdateQRState({
        shortCode: "",
        isDynamic: false,
      });
      return;
    }

    // If turning off dynamic but already saved, prevent it
    if (qrState.isDynamic && qrState.isShortcodeSaved) {
      toast("Dynamic QR Code already saved", {
        description:
          "Dynamic QR codes cannot be converted back to static after saving.",
      });
      return;
    }

    // Validate quota
    const validation = validateQuotaForDynamicQR(quotaInfo);
    if (!validation.canProceed) {
      toast("Dynamic QR quota reached", {
        description: validation.reason,
        style: {
          backgroundColor: "rgb(254, 226, 226)",
          color: "rgb(153, 27, 27)",
        },
        action: validation.shouldUpgrade
          ? {
              label: "Upgrade",
              onClick: () => {
                window.location.href = "/dashboard/subscription";
              },
            }
          : undefined,
      });
      return;
    }

    onUpdateLoadingState("makingDynamic", true);

    try {
      const uniqueCode = await createDynamicQR();

      onUpdateQRState({
        shortCode: uniqueCode,
        isDynamic: true,
      });

      const dynamicUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/${uniqueCode}`;
      toast("Dynamic QR Code Created", {
        description: "Your unique URL is ready to be saved.",
        action: {
          label: "Copy URL",
          onClick: () => {
            navigator.clipboard
              .writeText(dynamicUrl)
              .then(() => {
                toast("URL Copied!", {
                  description: dynamicUrl,
                  duration: 3000,
                });
              })
              .catch((err) => {
                console.error("Failed to copy URL:", err);
                toast("Failed to copy URL", {
                  style: {
                    backgroundColor: "rgb(254, 226, 226)",
                    color: "rgb(153, 27, 27)",
                  },
                });
              });
          },
        },
      });
    } catch (error) {
      console.error("Error creating dynamic QR code:", error);
      toast("Error creating dynamic QR code", {
        description:
          error instanceof Error ? error.message : "Please try again later.",
        style: {
          backgroundColor: "rgb(254, 226, 226)",
          color: "rgb(153, 27, 27)",
        },
      });
    } finally {
      onUpdateLoadingState("makingDynamic", false);
    }
  }, [
    qrState,
    quotaInfo,
    createDynamicQR,
    releaseShortcode,
    onUpdateQRState,
    onUpdateLoadingState,
    user,
    userSubscriptionLevel,
  ]);

  // Handle save QR with rate limiting and subscription validation
  const handleSaveQR = useCallback(async () => {
    if (qrState.textValue.length === 0) {
      toast("Please enter content first", {
        description: "QR code needs content to be saved.",
      });
      return;
    }

    // Check subscription for premium QR types
    if (
      PREMIUM_QR_TYPES.includes(qrState.activeSelector) &&
      userSubscriptionLevel === 0
    ) {
      toast("Premium Feature Required", {
        description: "Saving this QR code type requires a paid subscription.",
        style: {
          backgroundColor: "rgb(254, 226, 226)",
          color: "rgb(153, 27, 27)",
        },
        action: {
          label: "Upgrade",
          onClick: () => {
            window.location.href = "/dashboard/subscription";
          },
        },
      });
      return;
    }

    // Rate limiting for save operations
    const subscriptionLevel = userSubscriptionLevel as 0 | 1 | 2 | 3;
    const rateLimitResult = await UserRateLimiter.checkUserLimit(
      "qr_save",
      user?.id || "anonymous",
      subscriptionLevel,
    );

    if (!rateLimitResult.success) {
      toast("Rate limit exceeded", {
        description: `Please wait ${rateLimitResult.retryAfter} seconds before saving more QR codes.`,
        style: {
          backgroundColor: "rgb(254, 226, 226)",
          color: "rgb(153, 27, 27)",
        },
      });
      return;
    }

    // Validate quota
    const validation = validateQuotaForSave(
      quotaInfo,
      qrState.isDynamic,
      qrState.isShortcodeSaved,
    );

    if (!validation.canProceed) {
      toast("Cannot save QR code", {
        description: validation.reason,
        style: {
          backgroundColor: "rgb(254, 226, 226)",
          color: "rgb(153, 27, 27)",
        },
        action: validation.shouldUpgrade
          ? {
              label: "Upgrade",
              onClick: () => {
                window.location.href = "/dashboard/subscription";
              },
            }
          : undefined,
      });
      return;
    }

    onUpdateLoadingState("saving", true);

    try {
      const supabase = createClient();

      const enhancedSaveData = qrState.saveData
        ? {
            ...(qrState.saveData.controlType
              ? {}
              : { controlType: qrState.activeSelector }),
            ...qrState.saveData,
            // Add creator ID for subscription validation on viewers
            creatorId: user?.id,
          }
        : {
            controlType: qrState.activeSelector,
            creatorId: user?.id,
          };

      const { data, error } = await supabase.from("qr_codes").insert({
        user_id: user.id,
        type: qrState.isDynamic ? "dynamic" : "static",
        content: enhancedSaveData,
        shortcode: qrState.isDynamic ? qrState.shortCode : null,
        is_active: true,
        title:
          qrState.title || `${qrControls[qrState.activeSelector].title} QR`,
        qr_value: qrState.textValue,
      });

      if (error) throw error;

      // Mark the shortcode as saved if it's dynamic
      if (qrState.isDynamic) {
        onUpdateQRState({ isShortcodeSaved: true });
      }

      toast("QR code saved successfully!", {
        description: `Your ${
          qrState.isDynamic ? "dynamic" : "static"
        } QR code has been saved.`,
      });
    } catch (error) {
      console.error("Error saving QR code:", error);
      toast("Error saving QR code", {
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again later.",
        style: {
          backgroundColor: "rgb(254, 226, 226)",
          color: "rgb(153, 27, 27)",
        },
      });
    } finally {
      onUpdateLoadingState("saving", false);
    }
  }, [
    qrState,
    quotaInfo,
    user,
    onUpdateQRState,
    onUpdateLoadingState,
    userSubscriptionLevel,
  ]);

  // Handle title input changes with debouncing
  const handleTitleChange = useCallback(
    (value: string) => {
      setTitleInput(value);
      onUpdateQRState({ title: value });
    },
    [onUpdateQRState],
  );

  useEffect(() => {
    setColorInputs({
      foreground: qrColors.foreground,
      background: qrColors.background,
    });
  }, [qrColors]);

  // Sync local state with props when they change externally
  useEffect(() => {
    if (titleInput !== qrState.title) {
      setTitleInput(qrState.title);
    }
  }, [qrState.title, titleInput]);

  useEffect(() => {
    if (textInput !== qrState.textValue) {
      setTextInput(qrState.textValue);
    }
  }, [qrState.textValue, textInput]);

  return (
    <article
      className={`p-4 sm:p-6 lg:px-8 flex flex-col grow bg-white max-w-full ${
        shadow
          ? "sm:rounded-3xl sm:shadow-xl shadow-neutral-300/50"
          : "lg:rounded-3xl lg:shadow-xl lg:shadow-neutral-300/50"
      }`}
    >
      {/* QR Type Selector */}
      <QRTypeSelector
        activeSelector={qrState.activeSelector}
        onSelectorChange={handleSelectorChange}
        userSubscriptionLevel={userSubscriptionLevel}
        premiumTypes={PREMIUM_QR_TYPES}
      />

      {/* Main Form */}
      <div className="mx-auto flex flex-col grow justify-center w-full text-left">
        {/* Title Input */}
        <label className="control-label">
          Enter QR Title (optional):
          <input
            type="text"
            className="block py-2 control-input w-full"
            onChange={(e) => handleTitleChange(e.target.value)}
            value={titleInput}
            placeholder="Enter a descriptive title..."
            maxLength={100}
          />
        </label>

        {/* Dynamic QR Control Component */}
        <div className="w-full flex justify-center">
          <div className="relative w-full">{qrControl}</div>
        </div>

        <div className="mt-4 p-3 bg-neutral-50 rounded-lg border">
          <h6 className="text-xs font-medium text-neutral-700 mb-3">
            QR Code Colours
          </h6>

          <ColorPicker
            colors={qrColors}
            onChange={onUpdateQRColors}
            showReset={true}
            showContrastWarning={true}
          />
        </div>

        {/* Shape Settings */}
        {/* Template Selector */}
        {onApplyTemplate && (
          <div className="mt-4 p-3 bg-neutral-50 rounded-lg border">
            <TemplateSelector
              userTemplates={userTemplates}
              selectedTemplateId={selectedTemplateId}
              onSelect={onApplyTemplate}
              onSaveTemplate={user ? onSaveTemplate : undefined}
              compact={false}
            />
          </div>
        )}

        <div className="mt-4 p-3 bg-neutral-50 rounded-lg border">
          <h6 className="text-xs font-medium text-neutral-700 mb-3">
            QR Code Shape
          </h6>

          <ShapeSelector
            settings={shapeSettings}
            onChange={onUpdateShapeSettings}
          />
        </div>

        {/* Frame Settings */}
        <div className="mt-4 p-3 bg-neutral-50 rounded-lg border">
          <h6 className="text-xs font-medium text-neutral-700 mb-3">
            Frame & Call-to-Action
          </h6>

          <FrameSelector
            settings={frameSettings}
            onChange={onUpdateFrameSettings}
          />
        </div>

        {/* Action Buttons */}
        <QRActionButtons
          user={user}
          qrState={qrState}
          loadingStates={loadingStates}
          quotaStatus={quotaStatus}
          quotaInfo={quotaInfo}
          onMakeDynamic={handleMakeDynamic}
          onSaveQR={handleSaveQR}
          onGenerateQR={onGenerateQR}
        />

        {/* Status Indicators */}
        <QRStatusIndicators
          qrState={qrState}
          user={user}
          quotaStatus={quotaStatus}
          quotaInfo={quotaInfo}
        />
      </div>

      {/* Template Save Dialog */}
      {showSaveTemplateDialog && onCloseSaveDialog && onSaveTemplateConfirm && currentTemplateConfig && (
        <TemplateSaveDialog
          isOpen={showSaveTemplateDialog}
          onClose={onCloseSaveDialog}
          onSave={onSaveTemplateConfirm}
          currentConfig={currentTemplateConfig}
        />
      )}
    </article>
  );
}
