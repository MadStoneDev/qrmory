import {
  DotStyle,
  CornerStyle,
  CornerDotStyle,
  DEFAULT_SHAPE_SETTINGS,
} from "./qr-shapes";

export interface QRShapeSettings {
  dotStyle: DotStyle;
  cornerStyle: CornerStyle;
  cornerDotStyle: CornerDotStyle;
}

export interface QRFrameSettings {
  type: "none" | "simple" | "rounded" | "banner-top" | "banner-bottom" | "full-border";
  text: string;
  textColor: string;
  frameColor: string;
}

export interface UserSettings {
  qrSize: string;
  qrErrorCorrectionLevel: string;
  logoUrl?: string | null;
  colors: {
    foreground: string;
    background: string;
  };
  shapeSettings: QRShapeSettings;
  frameSettings: QRFrameSettings;
}

export const DEFAULT_FRAME_SETTINGS: QRFrameSettings = {
  type: "none",
  text: "",
  textColor: "#FFFFFF",
  frameColor: "#2A0B4D",
};

export const DEFAULT_SETTINGS: UserSettings = {
  qrSize: "medium",
  qrErrorCorrectionLevel: "M",
  logoUrl: null,
  colors: {
    foreground: "#2A0B4D",
    background: "#FFFFFF",
  },
  shapeSettings: DEFAULT_SHAPE_SETTINGS,
  frameSettings: DEFAULT_FRAME_SETTINGS,
};
