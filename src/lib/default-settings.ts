export interface UserSettings {
  qrSize: string;
  qrErrorCorrectionLevel: string;
  logoUrl?: string | null;
}

export const DEFAULT_SETTINGS: UserSettings = {
  qrSize: "medium",
  qrErrorCorrectionLevel: "M",
  logoUrl: null,
};
