"use client";

import React, { useState, useEffect } from "react";

import QRPreview from "./qr-preview";
import QRSettings from "./qr-settings";
import { suggestedTitles } from "@/data/defaults/suggested-titles";

interface QRCreatorProps {
  withHeading?: boolean;
  shadow?: boolean;
  user: any;
}

export default function QRCreator({
  withHeading = true,
  shadow = false,
  user = null,
}: QRCreatorProps) {
  const [qrTitle, setQRTitle] = useState("");
  const [qrValue, setQRValue] = useState("Welcome to QRmory!");
  const [textValue, setTextValue] = useState("");
  const [qrChanged, setQRChanged] = useState(true);
  const [qrShortCode, setQRShortCode] = useState("");
  const [activeSelector, setActiveSelector] = useState("website");

  const handleQRSettingsUpdate = (updates: {
    qrTitle?: string;
    textValue?: string;
    qrChanged?: boolean;
    activeSelector?: string;
    qrValue?: string;
    qrShortCode?: string;
  }) => {
    if (updates.qrTitle !== undefined) setQRTitle(updates.qrTitle);
    if (updates.textValue !== undefined) setTextValue(updates.textValue);
    if (updates.qrChanged !== undefined) setQRChanged(updates.qrChanged);
    if (updates.activeSelector !== undefined)
      setActiveSelector(updates.activeSelector);
    if (updates.qrValue !== undefined) setQRValue(updates.qrValue);
    if (updates.qrShortCode !== undefined) setQRShortCode(updates.qrShortCode);
  };

  // Effects
  useEffect(() => {
    setQRTitle(
      suggestedTitles[Math.floor(Math.random() * suggestedTitles.length)],
    );
  }, []);

  return (
    <div
      id={`start-creating`}
      className={`${
        withHeading ? "mx-auto mt-24 px-2 lg:px-6 max-w-6xl" : ""
      } mb-16 w-full text-center text-qrmory-purple-800`}
    >
      {withHeading && (
        <>
          <h2 className="font-header text-3xl lg:text-4.5xl">Start Creating</h2>
          <h3 className="font-serif text-sm lg:text-xl font-bold uppercase">
            Go on! Give it a go
          </h3>
        </>
      )}

      <section
        className={`${
          withHeading ? "py-16" : ""
        } flex lg:flex-row flex-col items-start gap-6 min-h-qr-card w-full`}
      >
        <QRSettings
          initialQRTitle={qrTitle}
          initialTextValue={textValue}
          initialQRChanged={qrChanged}
          initialActiveSelector={activeSelector}
          shadow={shadow}
          user={user}
          onUpdate={handleQRSettingsUpdate}
        />

        <QRPreview
          qrTitle={qrTitle}
          qrValue={qrValue}
          qrShortCode={qrShortCode}
          qrChanged={qrChanged}
          shadow={shadow}
          user={user}
        />
      </section>
    </div>
  );
}
