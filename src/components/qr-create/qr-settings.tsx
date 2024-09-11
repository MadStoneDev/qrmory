import React, { useState, useEffect } from "react";
import { qrControls } from "@/libs/qr-control-object";
import { generateShortCode } from "@/utils/general";
import { IconDeviceFloppy } from "@tabler/icons-react";

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
  const [newQR, setNewQR] = useState(true);

  const [isDynamic, setIsDynamic] = useState(false);

  // Update internal state when props changed
  useEffect(() => {
    setQRTitle(initialQRTitle);
  }, [initialQRTitle]);

  useEffect(() => {
    setTextValue(initialTextValue);
  }, [initialTextValue]);

  useEffect(() => {
    setQRChanged(initialQRChanged);
  }, [initialQRChanged]);

  useEffect(() => {
    onUpdate({
      qrTitle,
      textValue,
      qrChanged,
      activeSelector,
    });
  }, [qrTitle, textValue, qrChanged, activeSelector]);

  const [qrControl, setQRControl] = useState(() =>
    qrControls[activeSelector].component(
      (value: string) => {
        setTextValue(value);
        setQRChanged(false);
        setNewQR(false);
      },
      setQRChanged,
      setNewQR,
    ),
  );

  // Functions
  const handleActiveSelector = (key: string) => {
    setTextValue("");
    setActiveSelector(key);
    setQRControl(
      qrControls[key].component(
        (value: string) => {
          setTextValue(value);
          setQRChanged(false);
          setNewQR(false);
        },
        setQRChanged,
        setNewQR,
      ),
    );
    setQRChanged(true);
  };

  const handleGenerateQR = () => {
    if (textValue.length > 0) {
      onUpdate({
        qrValue: textValue,
        qrChanged: false,
      });
      setQRChanged(false);
    }
  };

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
              setNewQR(false);
            }}
            value={qrTitle}
          />
        </label>

        <div className="w-full flex justify-center">
          <div className="relative w-full">{qrControl}</div>
        </div>

        <section className={`mt-8 flex flex-col sm:flex-row gap-2`}>
          <button
            className="py-2.5 px-8 hover:enabled:translate-x-1 hover:enabled:-translate-y-1 border disabled:border-none border-qrmory-purple-800 hover:enabled:border-qrmory-purple-400 bg-white disabled:bg-stone-300 hover:enabled:bg-qrmory-purple-400 w-full md:w-44 text-xs lg:text-sm text-qrmory-purple-800 disabled:text-stone-600 hover:enabled:text-white rounded uppercase font-semibold transition-all duration-300"
            onClick={handleGenerateQR}
            disabled={textValue.length === 0}
          >
            Generate QR
          </button>

          {!user && (
            <button
              className={`py-2.5 px-8 hover:enabled:translate-x-1 hover:enabled:-translate-y-1 border disabled:border-none border-qrmory-purple-800 hover:enabled:border-qrmory-purple-400 ${
                isDynamic
                  ? "bg-qrmory-purple-800 text-white"
                  : "bg-white disabled:bg-stone-300 hover:enabled:bg-qrmory-purple-400 text-qrmory-purple-800 disabled:text-stone-600"
              } w-full md:w-44 text-xs lg:text-sm hover:enabled:text-white rounded uppercase font-semibold transition-all duration-300`}
              onClick={() => setIsDynamic(!isDynamic)}
              disabled={false}
            >
              Make Dynamic
            </button>
          )}
        </section>

        {!user && (
          <section>
            <button
              className={`mt-2 py-2.5 px-2.5 flex items-center justify-center gap-1 hover:enabled:translate-x-1 hover:enabled:-translate-y-1 border disabled:border-none border-qrmory-purple-800 hover:enabled:border-qrmory-purple-400 ${
                isDynamic
                  ? "bg-qrmory-purple-800 text-white"
                  : "bg-white disabled:bg-stone-300 hover:enabled:bg-qrmory-purple-400 text-qrmory-purple-800 disabled:text-stone-600"
              } w-full md:w-44 text-xs lg:text-sm hover:enabled:text-white rounded uppercase font-semibold transition-all duration-300`}
              onClick={() => setIsDynamic(!isDynamic)}
              disabled={!qrChanged || textValue.length === 0}
            >
              <IconDeviceFloppy /> Save QR Code
            </button>
          </section>
        )}

        {qrChanged && !newQR && (
          <p className="mt-4 text-rose-500 text-sm">
            {/*Click the button above to apply the new changes*/}
          </p>
        )}
      </div>
    </article>
  );
}
