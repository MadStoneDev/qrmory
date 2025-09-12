// types/qr-controls.ts
import { ReactElement } from "react";

export interface QRControlType {
  setText: (value: string) => void;
  setChanged: (changed: boolean) => void;
  setSaveData: (data: any) => void;
  initialData?: any;
  user?: any;
  subscriptionLevel?: number;
}

export interface QRControl {
  title: string;
  description: string;
  icon: ReactElement;
  component: (
    setText: (value: string) => void,
    setChanged: (changed: boolean) => void,
    setSaveData: (data: any) => void,
    user?: any,
    subscriptionLevel?: number,
    initialData?: any,
  ) => ReactElement;
}

export interface QRControlsObject {
  [key: string]: QRControl;
}
