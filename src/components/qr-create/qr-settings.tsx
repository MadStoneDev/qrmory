// components/qr-settings.tsx
"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { toast } from "sonner";

import { createClient } from "@/utils/supabase/client";
import { UserSettings } from "@/lib/default-settings";
import { qrControls } from "@/lib/qr-control-object";

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

interface Props {
  qrState: QRState;
  loadingStates: LoadingStates;
  shadow?: boolean;
  user: any;
  userSettings: UserSettings;
  quotaInfo?: QuotaInfo;
  onUpdateQRState: (updates: Partial<QRState>) => void;
  onUpdateLoadingState: (key: keyof LoadingStates, value: boolean) => void;
  onGenerateQR: () => void;
}

export default function QRSettingsRefactored({
  qrState,
  loadingStates,
  shadow = false,
  user,
  userSettings,
  quotaInfo = {
    currentCount: 0,
    maxQuota: 3,
    subscriptionLevel: "free",
    subscriptionStatus: "inactive",
  },
  onUpdateQRState,
  onUpdateLoadingState,
  onGenerateQR,
}: Props) {
  const { createDynamicQR, releaseShortcode } = useShortcodeManager(user);

  // Local input state for controlled inputs
  const [titleInput, setTitleInput] = useState(qrState.title);
  const [textInput, setTextInput] = useState(qrState.textValue);

  // QR control component state
  const [qrControl, setQRControl] = useState(() =>
    qrControls[qrState.activeSelector].component(
      (value: string) => {
        setTextInput(value);
        onUpdateQRState({ textValue: value, changed: true });
      },
      (changed: boolean) => onUpdateQRState({ changed }),
      (data: any) => onUpdateQRState({ saveData: data }),
    ),
  );

  // Memoized quota status
  const quotaStatus: QuotaStatus = useMemo(() => {
    const hasReachedQuota = quotaInfo.currentCount >= quotaInfo.maxQuota;
    const isNearQuota = quotaInfo.currentCount >= quotaInfo.maxQuota - 1;
    return { hasReachedQuota, isNearQuota };
  }, [quotaInfo.currentCount, quotaInfo.maxQuota]);

  // Handle selector changes
  const handleSelectorChange = useCallback(
    (key: string) => {
      setTextInput("");
      onUpdateQRState({
        textValue: "",
        saveData: null,
        activeSelector: key,
        changed: true,
      });

      setQRControl(
        qrControls[key].component(
          (value: string) => {
            setTextInput(value);
            onUpdateQRState({ textValue: value, changed: true });
          },
          (changed: boolean) => onUpdateQRState({ changed }),
          (data: any) => onUpdateQRState({ saveData: data }),
        ),
      );
    },
    [onUpdateQRState],
  );

  // Handle dynamic QR toggle with rate limiting
  const handleMakeDynamic = useCallback(async () => {
    // Validate rate limit first
    const subscriptionLevel = user?.subscription_level || 0;
    const rateLimitResult = await UserRateLimiter.checkUserLimit(
      "qr_generation",
      user?.id,
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
                window.location.href = "/subscription";
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
    qrState.isDynamic,
    qrState.isShortcodeSaved,
    qrState.shortCode,
    quotaInfo,
    createDynamicQR,
    releaseShortcode,
    onUpdateQRState,
    onUpdateLoadingState,
    user,
  ]);

  // Handle save QR with rate limiting
  const handleSaveQR = useCallback(async () => {
    if (qrState.textValue.length === 0) {
      toast("Please enter content first", {
        description: "QR code needs content to be saved.",
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
                window.location.href = "/subscription";
              },
            }
          : undefined,
      });
      return;
    }

    // Rate limiting for save operations
    const subscriptionLevel = user?.subscription_level || 0;
    const rateLimitResult = await UserRateLimiter.checkUserLimit(
      "qr_save",
      user?.id,
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

    onUpdateLoadingState("saving", true);

    try {
      const supabase = createClient();

      const enhancedSaveData = qrState.saveData
        ? {
            ...(qrState.saveData.controlType
              ? {}
              : { controlType: qrState.activeSelector }),
            ...qrState.saveData,
          }
        : null;

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
  }, [qrState, quotaInfo, user, onUpdateQRState, onUpdateLoadingState]);

  // Handle title input changes with debouncing
  const handleTitleChange = useCallback(
    (value: string) => {
      setTitleInput(value);
      onUpdateQRState({ title: value });
    },
    [onUpdateQRState],
  );

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
    </article>
  );
}
