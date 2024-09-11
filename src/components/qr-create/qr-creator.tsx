"use client";

import React, { useState, useEffect } from "react";
import QRSettings from "./qr-settings";
import QRPreview from "./qr-preview";

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
  const [activeSelector, setActiveSelector] = useState("website");

  const handleQRSettingsUpdate = (updates: {
    qrTitle?: string;
    textValue?: string;
    qrChanged?: boolean;
    activeSelector?: string;
    qrValue?: string;
  }) => {
    if (updates.qrTitle !== undefined) setQRTitle(updates.qrTitle);
    if (updates.textValue !== undefined) setTextValue(updates.textValue);
    if (updates.qrChanged !== undefined) setQRChanged(updates.qrChanged);
    if (updates.activeSelector !== undefined)
      setActiveSelector(updates.activeSelector);
    if (updates.qrValue !== undefined) setQRValue(updates.qrValue);
  };

  // Data
  const suggestedTitles = [
    "New QRmory Code",
    "Made with QRmory",
    "QRmory is Awesome",
    "QRmory Code",
    "My New QR Code",
    "QR Codes are fun",
    "I Love QRmory",
    "Scan Me, Maybe?",
    "QR Code Magic",
    "Unlock the Fun!",
    "QR-tastic!",
    "Your QR Adventure Begins",
    "Code of Wonders",
    "Dive into QRmory",
    "Scan and Be Amazed",
    "QR Code Extravaganza",
    "The QR Code Chronicles",
    "Discover the QR Secret",
    "Your QR Code Awaits!",
    "Scan for a Surprise!",
    "QR Code Quest",
    "Get QR Smart!",
    "The QR Code Treasure",
    "QR Codes: The New Black",
    "The Code That Rocks!",
    "Join the QR Revolution",
    "The Ultimate QR Code Experience",
    "Finding QRmory",
    "QRmory Begins",
    "QR Code Knight Rises",
    "The One with the Scan",
    "Stranger QR Things",
  ];

  // Effects
  useEffect(() => {
    setQRTitle(
      suggestedTitles[Math.floor(Math.random() * suggestedTitles.length)],
    );
  }, []);

  useEffect(() => {
    // This effect can be used to perform actions when certain states change
    // For example, you might want to save the current state to local storage
  }, [qrTitle, qrValue, textValue, qrChanged, activeSelector]);

  return (
    <div
      id={`start-creating`}
      className={`${
        withHeading ? "mx-auto mt-24 px-2 lg:px-6 max-w-6xl" : "px-2"
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
        } flex lg:flex-row flex-col lg:items-stretch items-center gap-6 min-h-qr-card w-full`}
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
          qrChanged={qrChanged}
          shadow={shadow}
          user={user}
        />
      </section>
    </div>
  );
}
