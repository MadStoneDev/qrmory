"use client";

import React, { useState, useEffect } from "react";

import { qrControls } from "@/lib/qr-control-object";
import {
  IconBolt,
  IconDeviceFloppy,
  IconRocket,
  IconInfoCircle,
} from "@tabler/icons-react";

import { generateShortCode } from "@/utils/general";
import { createClient } from "@/utils/supabase/client";
import { UserSettings } from "@/lib/default-settings";

import { toast } from "sonner";

interface QuotaInfo {
  currentCount: number;
  maxQuota: number;
  subscriptionLevel: string;
  subscriptionStatus: string;
}

interface Props {
  initialQRTitle: string;
  initialTextValue: string;
  initialQRChanged: boolean;
  initialActiveSelector: string;
  shadow?: boolean;
  user: any;
  userSettings: UserSettings;
  quotaInfo?: QuotaInfo;
  onUpdate: (updates: {
    qrTitle?: string;
    textValue?: string;
    qrChanged?: boolean;
    activeSelector?: string;
    qrShortCode?: string;
    qrValue?: string;
  }) => void;
}

export default function QRSettings({
  initialQRTitle,
  initialTextValue,
  initialQRChanged,
  initialActiveSelector,
  shadow = false,
  user,
  userSettings,
  quotaInfo = {
    currentCount: 0,
    maxQuota: 3,
    subscriptionLevel: "free",
    subscriptionStatus: "inactive",
  },
  onUpdate,
}: Props) {
  // States
  const [qrTitle, setQRTitle] = useState(initialQRTitle);
  const [textValue, setTextValue] = useState(initialTextValue);
  const [qrChanged, setQRChanged] = useState(initialQRChanged);
  const [activeSelector, setActiveSelector] = useState(initialActiveSelector);

  const [isDynamic, setIsDynamic] = useState(false);
  const [isShortcodeSaved, setIsShortcodeSaved] = useState(false);
  const [loadingDynamic, setLoadingDynamic] = useState(false);
  const [qrShortCode, setQRShortCode] = useState("");

  const [saveData, setSaveData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Functions
  const updateTextValue = (value: string) => {
    setTextValue(value);
  };

  const updateQRChanged = (changed: boolean) => {
    setQRChanged(changed);
  };

  const updateSaveData = (data: any) => {
    setSaveData(data);
  };

  const generateUniqueShortcode = async () => {
    let isUnique = false;
    let shortCode;
    const maxAttempts = 10;
    let attemptsNeeded = 0;

    for (let attempts = 0; attempts < maxAttempts; attempts++) {
      attemptsNeeded++;
      shortCode = generateShortCode(8);

      // Check if shortcode is available
      const checkResponse = await fetch(
        `/api/check-shortcode?code=${shortCode}`,
      );
      const checkResult = await checkResponse.json();

      if (checkResult.available) {
        isUnique = true;
        break;
      }

      // If we're getting close to max attempts, try a longer code
      if (attempts > 7) {
        shortCode = generateShortCode(9);
      }
    }

    if (!isUnique) {
      // Log failed attempts
      await fetch("/api/log-shortcode-collision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptsNeeded: maxAttempts, success: false }),
      });

      throw new Error(
        `Could not generate a unique shortcode after ${maxAttempts} attempts`,
      );
    }

    // Log successful generation with attempt count
    if (attemptsNeeded > 1) {
      await fetch("/api/log-shortcode-collision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptsNeeded, success: true }),
      });
    }

    return shortCode;
  };

  // Initialize the QR control component with correct callbacks
  const [qrControl, setQRControl] = useState(() =>
    qrControls[activeSelector].component(
      updateTextValue,
      updateQRChanged,
      updateSaveData,
    ),
  );

  // Function to handle selector change
  const handleActiveSelector = (key: string) => {
    setTextValue("");
    setSaveData(null);
    setActiveSelector(key);
    setQRControl(
      qrControls[key].component(
        updateTextValue,
        updateQRChanged,
        updateSaveData,
      ),
    );
    setQRChanged(true);
  };

  // Function to generate the QR code
  const handleGenerateQR = () => {
    if (textValue.length > 0) {
      onUpdate({
        qrValue: textValue,
        qrChanged: false,
        qrShortCode,
      });

      setQRChanged(false);
    }
  };

  const handleSaveQR = async () => {
    if (textValue.length === 0) return;

    if (
      isDynamic &&
      quotaInfo.currentCount >= quotaInfo.maxQuota &&
      !isShortcodeSaved
    ) {
      toast("Dynamic QR quota reached", {
        description: `You've reached your limit of ${quotaInfo.maxQuota} dynamic QR codes. Upgrade your plan to create more.`,
        style: {
          backgroundColor: "rgb(254, 226, 226)",
          color: "rgb(153, 27, 27)",
        },
        action: {
          label: "Upgrade",
          onClick: () => {
            window.location.href = "/account/billing"; // Redirect to billing page
          },
        },
      });
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();

      const enhancedSaveData = saveData
        ? {
            ...(saveData.controlType ? {} : { controlType: activeSelector }),
            ...saveData,
          }
        : null;

      const { data, error } = await supabase.from("qr_codes").insert({
        user_id: user.id,
        type: isDynamic ? "dynamic" : "static",
        content: enhancedSaveData,
        shortcode: isDynamic ? qrShortCode : null,
        is_active: true,
        title: qrTitle || `${qrControls[activeSelector].title} QR`,
        qr_value: textValue,
      });

      if (error) throw error;

      // Mark the shortcode as saved if it's dynamic
      if (isDynamic) {
        setIsShortcodeSaved(true);
      }

      toast("QR code saved successfully!", {
        description: `Your ${
          isDynamic ? "dynamic" : "static"
        } QR code has been saved.`,
      });
    } catch (error) {
      console.error("Error saving QR code:", error);
      toast("Error saving QR code", {
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

  const handleMakeDynamic = async () => {
    // If turning off dynamic mode and not saved, allow it
    if (isDynamic && !isShortcodeSaved) {
      setQRShortCode("");
      setIsDynamic(false);
      return;
    }

    // If turning off dynamic but already saved, prevent it
    if (isDynamic && isShortcodeSaved) {
      toast("Dynamic QR Code already saved", {
        description:
          "Dynamic QR codes cannot be converted back to static after saving.",
      });
      return;
    }

    // Check if the user has reached their quota for dynamic QR codes
    if (quotaInfo.currentCount >= quotaInfo.maxQuota) {
      toast("Dynamic QR quota reached", {
        description: `You've reached your limit of ${quotaInfo.maxQuota} dynamic QR codes. Upgrade your plan to create more.`,
        style: {
          backgroundColor: "rgb(254, 226, 226)",
          color: "rgb(153, 27, 27)",
        },
        action: {
          label: "Upgrade",
          onClick: () => {
            window.location.href = "/account/billing"; // Redirect to billing page
          },
        },
      });
      return;
    }

    setLoadingDynamic(true);

    try {
      // Only generate a new shortcode if we don't already have one
      if (!qrShortCode) {
        try {
          const uniqueCode = await generateUniqueShortcode();
          setQRShortCode(uniqueCode || "");

          await fetch("/api/reserve-shortcode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              shortcode: uniqueCode,
              userId: user?.id,
            }),
          });
        } catch (error) {
          console.error("Failed to generate unique shortcode:", error);
          toast("Failed to create dynamic QR code", {
            description: "Please try again",
            style: {
              backgroundColor: "rgb(254, 226, 226)",
              color: "rgb(153, 27, 27)",
            },
          });
          setLoadingDynamic(false);
          return;
        }
      }

      setIsDynamic(true);

      const dynamicUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/${qrShortCode}`;
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
        description: "Please try again later.",
        style: {
          backgroundColor: "rgb(254, 226, 226)",
          color: "rgb(153, 27, 27)",
        },
      });
    } finally {
      setTimeout(() => {
        setLoadingDynamic(false);
      }, 1000);
    }
  };

  // Update component when props change
  useEffect(() => {
    setQRTitle(initialQRTitle);
  }, [initialQRTitle]);

  useEffect(() => {
    setTextValue(initialTextValue);
  }, [initialTextValue]);

  useEffect(() => {
    setQRChanged(initialQRChanged);
  }, [initialQRChanged]);

  // Cleanup effect for released shortcodes
  useEffect(() => {
    return () => {
      if (qrShortCode && isDynamic && !isShortcodeSaved) {
        fetch("/api/release-shortcode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shortcode: qrShortCode, saved: false }),
        }).catch((err) => console.error("Failed to release shortcode:", err));
      }
    };
  }, [qrShortCode, isDynamic, isShortcodeSaved]);

  // Notify parent of state changes when local state changes
  useEffect(() => {
    // Prevent calling onUpdate during initialization
    if (
      qrTitle === initialQRTitle &&
      textValue === initialTextValue &&
      qrChanged === initialQRChanged &&
      activeSelector === initialActiveSelector &&
      qrShortCode === ""
    ) {
      return;
    }

    onUpdate({
      qrTitle,
      textValue,
      qrChanged,
      activeSelector,
      qrShortCode,
    });
  }, [qrTitle, textValue, qrChanged, activeSelector, qrShortCode]);

  // Check if quota is exceeded or nearly exceeded
  const hasReachedQuota = quotaInfo.currentCount >= quotaInfo.maxQuota;
  const isNearQuota = quotaInfo.currentCount >= quotaInfo.maxQuota - 1;

  return (
    <article
      className={`p-4 sm:p-6 lg:px-8 flex flex-col grow bg-white max-w-full ${
        shadow
          ? "sm:rounded-3xl sm:shadow-xl shadow-neutral-300/50"
          : "lg:rounded-3xl lg:shadow-xl lg:shadow-neutral-300/50"
      }`}
    >
      <div className="mb-4 pb-4 flex flex-row flex-wrap justify-start items-center content-end self-start border-b-2 border-neutral-100 transition-all">
        {Object.keys(qrControls).map((key) => (
          <article
            className={`flex gap-2 items-center ${
              activeSelector === key
                ? "bg-qrmory-purple-800 text-white"
                : "bg-white hover:bg-qrmory-purple-500 border-neutral-400 hover:border-qrmory-purple-500 text-neutral-500 hover:text-white"
            } qr-selector cursor-pointer m-1 py-2 px-5 flex justify-center items-center rounded border text-xs lg:text-sm transition-all duration-300`}
            key={`qr-control-${qrControls[key].title.toLowerCase()}`}
            data-selector={key}
            onClick={() => handleActiveSelector(key)}
          >
            {qrControls[key].icon}
            {qrControls[key].title}
          </article>
        ))}

        <p className="m-2 inline text-black text-sm italic">more coming soon</p>
      </div>

      <div className="mx-auto flex flex-col grow justify-center w-full text-left">
        <label className="control-label">
          Enter QR Title (optional):
          <input
            type="text"
            className="block py-2 control-input w-full"
            onChange={(el) => {
              setQRTitle(el.target.value);
            }}
            value={qrTitle}
          />
        </label>

        <div className="w-full flex justify-center">
          <div className="relative w-full">{qrControl}</div>
        </div>

        <section
          className={`mt-8 flex flex-col md:flex-row items-center justify-between gap-2`}
        >
          {/* Dynamic QR button section */}
          {user && (
            <article
              className={`flex flex-col md:flex-row items-center justify-between gap-2`}
            >
              <button
                className={`py-2.5 px-4 hover:enabled:translate-x-1 hover:enabled:-translate-y-1 flex items-center justify-center gap-2 border disabled:border-none border-qrmory-purple-800 ${
                  isDynamic
                    ? "bg-qrmory-purple-800 text-white"
                    : "bg-white disabled:bg-neutral-300 hover:enabled:bg-qrmory-purple-800 text-qrmory-purple-800 disabled:text-neutral-600"
                } w-48 max-w-full text-xs lg:text-sm hover:enabled:text-white rounded uppercase font-semibold transition-all duration-300`}
                onClick={handleMakeDynamic}
                disabled={
                  loadingDynamic ||
                  (isDynamic && isShortcodeSaved) ||
                  hasReachedQuota
                }
                title={
                  isDynamic && isShortcodeSaved
                    ? "Dynamic QR codes cannot be converted back to static after saving"
                    : hasReachedQuota
                      ? `You've reached your limit of ${quotaInfo.maxQuota} dynamic QR codes`
                      : "Make this QR code dynamic"
                }
              >
                <IconBolt
                  className={`${
                    loadingDynamic ? "animate-pulse duration-1000" : ""
                  }`}
                />
                <span>Make Dynamic</span>
              </button>

              <button
                className={`py-2.5 px-4 hover:enabled:translate-x-1 hover:enabled:-translate-y-1 flex items-center justify-center gap-2 border disabled:border-none border-qrmory-purple-800 hover:enabled:border-qrmory-purple-800 bg-white disabled:bg-neutral-300 hover:enabled:bg-qrmory-purple-800 text-qrmory-purple-800 disabled:text-neutral-600 w-48 max-w-full text-xs lg:text-sm hover:enabled:text-white rounded uppercase font-semibold transition-all duration-300`}
                onClick={handleSaveQR}
                disabled={
                  textValue.length === 0 ||
                  saving ||
                  (isDynamic && !isShortcodeSaved && hasReachedQuota)
                }
              >
                <IconDeviceFloppy />
                <span>{saving ? "Saving..." : "Save QR Code"}</span>
              </button>
            </article>
          )}

          <button
            className={`
              py-2.5 
              hover:enabled:translate-x-1 
              hover:enabled:-translate-y-1 
              flex items-center 
              justify-center 
              gap-2 
              border 
              disabled:border-none 
              border-qrmory-purple-800
              hover:enabled:border-qrmory-purple-800
              ${
                textValue.length === 0
                  ? "bg-neutral-300 text-neutral-600"
                  : qrChanged
                    ? "bg-qrmory-purple-800 text-white"
                    : "bg-white text-qrmory-purple-800 hover:enabled:bg-qrmory-purple-800 hover:enabled:text-white"
              }
              w-48 
              max-w-full 
              text-xs 
              lg:text-sm
              rounded 
              uppercase 
              font-semibold 
              transition-all 
              duration-300
            `}
            onClick={handleGenerateQR}
            disabled={textValue.length === 0 || !qrChanged}
            title={
              textValue.length === 0
                ? "Please enter content first"
                : !qrChanged
                  ? "QR code is already up to date"
                  : "Generate QR code with current content"
            }
          >
            <span>Generate QR</span>
            <IconRocket />
          </button>
        </section>
        {isDynamic && (
          <section className={`mt-4`}>
            <p className={`text-sm`}>
              Your Dynamic Code will be:{" "}
              <span className={`font-bold`}>
                {process.env.NEXT_PUBLIC_SITE_URL}/{qrShortCode}
              </span>
            </p>
            <p
              className={`text-sm ${
                isShortcodeSaved ? "text-green-600" : "text-amber-600"
              }`}
            >
              {isShortcodeSaved
                ? "Your dynamic QR code has been saved."
                : "Save your QR code to secure this URL."}
            </p>
          </section>
        )}

        {/* TODO: Add Articles and Blog */}
        {/*<section className={`mt-4`}>*/}
        {/*  <p className={`text-neutral-400`}>*/}
        {/*    Want to learn more about{" "}*/}
        {/*    <a*/}
        {/*      href="/learn/dynamic-qr-codes"*/}
        {/*      className="text-qrmory-purple-600 underline hover:text-qrmory-purple-800"*/}
        {/*    >*/}
        {/*      dynamic QR codes*/}
        {/*    </a>*/}
        {/*    ?*/}
        {/*  </p>*/}
        {/*</section>*/}
      </div>
    </article>
  );
}
