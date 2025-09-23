// components/ui/QRActionButtons.tsx
import React from "react";
import { IconBolt, IconDeviceFloppy, IconRocket } from "@tabler/icons-react";

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

interface LoadingStates {
  generating: boolean;
  saving: boolean;
  makingDynamic: boolean;
}

interface QuotaInfo {
  currentCount: number;
  maxQuota: number;
  subscriptionLevel: string;
  subscriptionStatus: string;
}

interface QuotaStatus {
  hasReachedQuota: boolean;
  isNearQuota: boolean;
}

interface QRActionButtonsProps {
  user: any;
  qrState: QRState;
  loadingStates: LoadingStates;
  quotaStatus: QuotaStatus;
  quotaInfo: QuotaInfo;
  onMakeDynamic: () => void;
  onSaveQR: () => void;
  onGenerateQR: () => void;
}

export function QRActionButtons({
  user,
  qrState,
  loadingStates,
  quotaStatus,
  quotaInfo,
  onMakeDynamic,
  onSaveQR,
  onGenerateQR,
}: QRActionButtonsProps) {
  const getDynamicButtonTitle = () => {
    if (qrState.isDynamic && qrState.isShortcodeSaved) {
      return "Dynamic QR codes cannot be converted back to static after saving";
    }
    if (quotaStatus.hasReachedQuota) {
      return `You've reached your limit of ${quotaInfo.maxQuota} dynamic QR codes`;
    }
    return "Make this QR code dynamic";
  };

  const getGenerateButtonTitle = () => {
    if (qrState.textValue.length === 0) {
      return "Please enter content first";
    }
    if (!qrState.changed) {
      return "QR code is already up to date";
    }
    return "Generate QR code with current content";
  };

  return (
    <section className="mt-8 flex flex-col md:flex-row items-center justify-between gap-2">
      {/* Dynamic QR and Save buttons - only show if user is logged in */}
      {user && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-2">
          <button
            className={`py-2.5 px-4 hover:enabled:translate-x-1 hover:enabled:-translate-y-1 flex items-center justify-center gap-2 border disabled:border-none border-qrmory-purple-800 ${
              qrState.isDynamic
                ? "bg-qrmory-purple-800 text-white"
                : "bg-white disabled:bg-neutral-300 hover:enabled:bg-qrmory-purple-800 text-qrmory-purple-800 disabled:text-neutral-600"
            } w-48 max-w-full text-xs lg:text-sm hover:enabled:text-white rounded uppercase font-semibold transition-all duration-300`}
            onClick={onMakeDynamic}
            disabled={
              loadingStates.makingDynamic ||
              (qrState.isDynamic && qrState.isShortcodeSaved) ||
              quotaStatus.hasReachedQuota
            }
            title={getDynamicButtonTitle()}
            aria-label={
              qrState.isDynamic ? "Disable dynamic QR" : "Enable dynamic QR"
            }
          >
            <IconBolt
              className={
                loadingStates.makingDynamic ? "animate-pulse duration-1000" : ""
              }
            />
            <span>
              {loadingStates.makingDynamic ? "Processing..." : "Make Dynamic"}
            </span>
          </button>

          <button
            className={`py-2.5 px-4 hover:enabled:translate-x-1 hover:enabled:-translate-y-1 flex items-center justify-center gap-2 border disabled:border-none border-qrmory-purple-800 hover:enabled:border-qrmory-purple-800 bg-white disabled:bg-neutral-300 hover:enabled:bg-qrmory-purple-800 text-qrmory-purple-800 disabled:text-neutral-600 w-48 max-w-full text-xs lg:text-sm hover:enabled:text-white rounded uppercase font-semibold transition-all duration-300`}
            onClick={onSaveQR}
            disabled={
              qrState.textValue.length === 0 ||
              loadingStates.saving ||
              (qrState.isDynamic &&
                !qrState.isShortcodeSaved &&
                quotaStatus.hasReachedQuota)
            }
            aria-label="Save QR code"
          >
            <IconDeviceFloppy />
            <span>{loadingStates.saving ? "Saving..." : "Save QR Code"}</span>
          </button>
        </div>
      )}

      {/* Generate QR Button */}
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
            qrState.textValue.length === 0
              ? "bg-neutral-300 text-neutral-600 cursor-not-allowed"
              : qrState.changed
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
        onClick={onGenerateQR}
        disabled={
          qrState.textValue.length === 0 ||
          !qrState.changed ||
          loadingStates.generating
        }
        title={getGenerateButtonTitle()}
        aria-label="Generate QR code"
      >
        <span>
          {loadingStates.generating ? "Generating..." : "Generate QR"}
        </span>
        <IconRocket
          className={loadingStates.generating ? "animate-spin" : ""}
        />
      </button>
    </section>
  );
}
