// types/qr-types.ts
export interface QRState {
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

export interface LoadingStates {
  generating: boolean;
  saving: boolean;
  makingDynamic: boolean;
}

export interface QuotaStatus {
  hasReachedQuota: boolean;
  isNearQuota: boolean;
}

// Re-export from quota-validation for convenience
export type {
  QuotaInfo,
  QuotaValidationResult,
} from "@/utils/quota-validation";
