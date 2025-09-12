export interface UserSettings {
  qrSize: string;
  qrErrorCorrectionLevel: string;
  logoUrl?: string | null;
  colors: {
    foreground: string;
    background: string;
  };
}

export const DEFAULT_SETTINGS: UserSettings = {
  qrSize: "medium",
  qrErrorCorrectionLevel: "M",
  logoUrl: null,
  colors: {
    foreground: "#2A0B4D",
    background: "#FFFFFF",
  },
};
