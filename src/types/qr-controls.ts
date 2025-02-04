import { JSX } from "react";

export interface QRControlType {
  setText: Function;
  setChanged: Function;
}

export interface QRType {
  title: string;
  description: string;
  component: (
    setText: (value: string) => void,
    setChange: (change: boolean) => void,
  ) => JSX.Element;
}

export interface QRControlsObject {
  [key: string]: QRType;
}
