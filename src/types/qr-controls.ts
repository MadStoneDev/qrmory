// In @/types/qr-controls.ts
import { ReactNode } from "react";

export interface QRControlType {
  setText: (text: string) => void;
  setChanged: (changed: boolean) => void;
  setSaveData?: (data: any) => void;
  initialData?: any;
}

export interface QRControlInfo {
  title: string;
  description: string;
  icon: ReactNode;
  component: (
    setText: (text: string) => void,
    setChanged: (changed: boolean) => void,
    setSaveData?: (data: any) => void,
  ) => ReactNode;
}

export interface QRControlsObject {
  [key: string]: QRControlInfo;
}
