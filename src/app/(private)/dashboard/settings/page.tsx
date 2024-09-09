"use client";

import React, { useState } from "react";
import { IconHome } from "@tabler/icons-react";
import { useQRCode } from "next-qrcode";
import SelectSwitch from "@/components/SelectSwitch";

interface Setting {
  name: string;
  icon: React.JSX.Element;
}

interface QRSizes {
  [key: string]: number;
}

export default function SettingsPage() {
  // Hooks
  const { SVG } = useQRCode();

  // States
  const [selectedSettings, setSelectedSettings] = useState<string>("general");
  const [qrSize, setQRSize] = useState<string>("medium");
  const [qrErrorCorrectionLevel, setQRErrorCorrectionLevel] =
    useState<string>("M");

  // Variables
  const qrSizeLookup: QRSizes = {
    small: 60,
    medium: 90,
    large: 180,
  };

  const availableSettings: Setting[] = [
    {
      name: "General",
      icon: <IconHome size={24} />,
    },
    {
      name: "Billing",
      icon: <IconHome size={24} />,
    },
  ];

  return (
    <div className={`flex flex-col w-full`}>
      <h1 className={`mb-4 text-xl font-bold`}>Settings</h1>
      <section className={`flex gap-3 h-full`}>
        {/*/!* TODO: Settings Navigation *!/*/}
        {/*<article className={`flex flex-col gap-2`}>*/}
        {/*  <div className={`flex items-center gap-1 font-bold`}>*/}
        {/*    <IconHome size={24} /> General*/}
        {/*  </div>*/}
        {/*</article>*/}

        {/* TODO: Settings Blocks */}
        <article className={`flex-grow flex flex-col gap-4`}>
          <div
            className={`py-4 flex flex-col md:flex-row justify-between md:items-center gap-4`}
          >
            <div className={`flex flex-col gap-4`}>
              <h4 className={`font-sans font-semibold`}>
                Default QR Code Size
              </h4>
              <SVG
                text={"It's not the size that counts!"}
                options={{
                  errorCorrectionLevel: qrErrorCorrectionLevel,
                  color: { dark: "#78716c" },
                  width: qrSizeLookup[qrSize],
                  margin: 1,
                }}
              />
            </div>
            <SelectSwitch
              options={[
                { value: "small", label: "Small" },
                { value: "medium", label: "Medium" },
                { value: "large", label: "Large" },
              ]}
              value={qrSize}
              className={`w-full max-w-[250px]`}
              onChange={(value) => setQRSize(value as string)}
            />
          </div>

          {/* Separator */}
          <div className={`w-full h-[1px] bg-stone-200`}></div>

          <div
            className={`py-4 flex flex-col md:flex-row justify-between md:items-center gap-4`}
          >
            <h4 className={`font-sans font-semibold`}>
              Error Correction Level
            </h4>
            <SelectSwitch
              options={[
                { value: "L", label: "L" },
                { value: "M", label: "M" },
                { value: "Q", label: "Q" },
                { value: "H", label: "H" },
              ]}
              value={qrErrorCorrectionLevel}
              className={`w-full max-w-[250px]`}
              onChange={(value) => setQRErrorCorrectionLevel(value as string)}
            />
          </div>

          {/* Separator */}
          <div className={`w-full h-[1px] bg-stone-200`}></div>

          <div
            className={`py-4 flex flex-col md:flex-row justify-between md:items-center gap-4`}
          >
            <h4 className={`font-sans font-semibold`}>Default Logo</h4>
          </div>
          {/*<div>Email Notifications</div>*/}
        </article>
      </section>
    </div>
  );
}
