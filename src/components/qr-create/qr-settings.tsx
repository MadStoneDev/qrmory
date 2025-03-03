import React, { useState, useEffect } from "react";

import { qrControls } from "@/lib/qr-control-object";
import { IconBolt, IconDeviceFloppy, IconRocket } from "@tabler/icons-react";

import { generateShortCode } from "@/utils/general";

interface Props {
  initialQRTitle: string;
  initialTextValue: string;
  initialQRChanged: boolean;
  initialActiveSelector: string;
  shadow?: boolean;
  user: any;
  onUpdate: (updates: {
    qrTitle?: string;
    textValue?: string;
    qrChanged?: boolean;
    activeSelector?: string;
    qrShortCode?: string;
    qrValue?: string;
  }) => void;
}

export default function QRSettings({
  initialQRTitle,
  initialTextValue,
  initialQRChanged,
  initialActiveSelector,
  shadow = false,
  user,
  onUpdate,
}: Props) {
  // States
  const [qrTitle, setQRTitle] = useState(initialQRTitle);
  const [textValue, setTextValue] = useState(initialTextValue);
  const [qrChanged, setQRChanged] = useState(initialQRChanged);
  const [activeSelector, setActiveSelector] = useState(initialActiveSelector);

  const [isDynamic, setIsDynamic] = useState(false);
  const [loadingDynamic, setLoadingDynamic] = useState(false);
  const [qrShortCode, setQRShortCode] = useState("");

  // Functions
  const updateTextValue = (value: string) => {
    setTextValue(value);
  };

  const updateQRChanged = (changed: boolean) => {
    setQRChanged(changed);
  };

  // Initialize the QR control component with correct callbacks
  const [qrControl, setQRControl] = useState(() =>
    qrControls[activeSelector].component(updateTextValue, updateQRChanged),
  );

  // Function to handle selector change
  const handleActiveSelector = (key: string) => {
    setTextValue("");
    setActiveSelector(key);
    setQRControl(qrControls[key].component(updateTextValue, updateQRChanged));
    setQRChanged(true);
  };

  // Function to generate the QR code
  const handleGenerateQR = () => {
    if (textValue.length > 0) {
      onUpdate({
        qrValue: textValue,
        qrChanged: false,
        qrShortCode,
      });

      setQRChanged(false);
    }
  };

  const handleMakeDynamic = () => {
    if (isDynamic) {
      setQRShortCode("");
      setIsDynamic(false);
      return;
    }

    setLoadingDynamic(true);

    try {
      const shortCode = generateShortCode(8);
      setQRShortCode(shortCode);
      setIsDynamic(true);
    } catch (error) {
      console.error(error);
    }

    setTimeout(() => {
      setLoadingDynamic(false);
    }, 1000);
  };

  // Update component when props change
  useEffect(() => {
    setQRTitle(initialQRTitle);
  }, [initialQRTitle]);

  useEffect(() => {
    setTextValue(initialTextValue);
  }, [initialTextValue]);

  useEffect(() => {
    setQRChanged(initialQRChanged);
  }, [initialQRChanged]);

  // Notify parent of state changes when local state changes
  useEffect(() => {
    // Prevent calling onUpdate during initialization
    if (
      qrTitle === initialQRTitle &&
      textValue === initialTextValue &&
      qrChanged === initialQRChanged &&
      activeSelector === initialActiveSelector &&
      qrShortCode === ""
    ) {
      return;
    }

    onUpdate({
      qrTitle,
      textValue,
      qrChanged,
      activeSelector,
      qrShortCode,
    });
  }, [qrTitle, textValue, qrChanged, activeSelector, qrShortCode]);

  return (
    <article
      className={`p-4 sm:p-6 lg:px-8 flex flex-col grow bg-white max-w-full ${
        shadow
          ? "sm:rounded-3xl sm:shadow-xl shadow-stone-300/50"
          : "lg:rounded-3xl lg:shadow-xl lg:shadow-stone-300/50"
      }`}
    >
      <div className="mb-4 pb-4 flex flex-row flex-wrap justify-start items-center content-end self-start border-b-2 border-stone-100 transition-all">
        {Object.keys(qrControls).map((key) => (
          <article
            className={`${
              activeSelector === key
                ? "bg-qrmory-purple-800 text-white"
                : "bg-white hover:bg-qrmory-purple-500 border-stone-400 hover:border-qrmory-purple-500 text-stone-500 hover:text-white"
            } qr-selector cursor-pointer m-1 py-2 px-5 flex justify-center items-center rounded border text-xs lg:text-sm transition-all duration-300`}
            key={`qr-control-${qrControls[key].title.toLowerCase()}`}
            data-selector={key}
            onClick={() => handleActiveSelector(key)}
          >
            {qrControls[key].title}
          </article>
        ))}

        <p className="m-2 inline text-black text-sm italic">more coming soon</p>
      </div>

      <div className="mx-auto flex flex-col grow justify-center w-full text-left">
        <label className="control-label">
          Enter QR Title (optional):
          <input
            type="text"
            className="block py-2 control-input w-full"
            onChange={(el) => {
              setQRTitle(el.target.value);
            }}
            value={qrTitle}
          />
        </label>

        <div className="w-full flex justify-center">
          <div className="relative w-full">{qrControl}</div>
        </div>

        <section
          className={`mt-8 flex flex-col md:flex-row items-center justify-between gap-2`}
        >
          {/* Dynamic QR button section (commented out in original) */}
          {/* {!user && (
            <article className={`flex flex-col md:flex-row items-center justify-between gap-2`}>
              <button
                className={`py-2.5 px-4 hover:enabled:translate-x-1 hover:enabled:-translate-y-1 flex items-center justify-center gap-2 border disabled:border-none border-qrmory-purple-800 ${
                  isDynamic
                    ? "bg-qrmory-purple-800 text-white"
                    : "bg-white disabled:bg-stone-300 hover:enabled:bg-qrmory-purple-400 text-qrmory-purple-800 disabled:text-stone-600"
                } w-48 max-w-full text-xs lg:text-sm hover:enabled:text-white rounded uppercase font-semibold transition-all duration-300`}
                onClick={handleMakeDynamic}
                disabled={loadingDynamic}
              >
                <IconBolt
                  className={`${
                    loadingDynamic ? "animate-pulse duration-1000" : ""
                  }`}
                />
                <span>Make Dynamic</span>
              </button>

              <button
                className={`py-2.5 px-4 hover:enabled:translate-x-1 hover:enabled:-translate-y-1 flex items-center justify-center gap-2 border disabled:border-none border-qrmory-purple-800 hover:enabled:border-qrmory-purple-400 bg-white disabled:bg-stone-300 hover:enabled:bg-qrmory-purple-400 text-qrmory-purple-800 disabled:text-stone-600 w-48 max-w-full text-xs lg:text-sm hover:enabled:text-white rounded uppercase font-semibold transition-all duration-300`}
                onClick={handleSaveQR}
                disabled={textValue.length === 0}
              >
                <IconDeviceFloppy />
                <span>Save QR Code</span>
              </button>
            </article>
          )} */}

          <button
            className={`
              py-2.5 
              hover:enabled:translate-x-1 
              hover:enabled:-translate-y-1 
              flex items-center 
              justify-center 
              gap-2 
              border 
              disabled:border-none 
              border-qrmory-purple-800
              hover:enabled:border-qrmory-purple-400
              ${
                textValue.length === 0
                  ? "bg-stone-300 text-stone-600"
                  : qrChanged
                    ? "bg-qrmory-purple-800 text-white"
                    : "bg-white text-qrmory-purple-800 hover:enabled:bg-qrmory-purple-400 hover:enabled:text-white"
              }
              w-48 
              max-w-full 
              text-xs 
              lg:text-sm
              rounded 
              uppercase 
              font-semibold 
              transition-all 
              duration-300
            `}
            onClick={handleGenerateQR}
            disabled={textValue.length === 0 || !qrChanged}
            title={
              textValue.length === 0
                ? "Please enter content first"
                : !qrChanged
                  ? "QR code is already up to date"
                  : "Generate QR code with current content"
            }
          >
            <span>Generate QR</span>
            <IconRocket />
          </button>
        </section>
        {isDynamic && (
          <section className={`mt-4`}>
            <p className={`text-sm`}>
              Your Dynamic Code will be:{" "}
              <span className={`font-bold`}>
                https://qrmory.com/{qrShortCode}
              </span>
            </p>
            <p className={`text-sm`}>Save to secure this code.</p>
          </section>
        )}
      </div>
    </article>
  );
}
