"use client";

import { useEffect, useState, JSX } from "react";

import d3ToPng from "d3-svg-to-png";
import { useQRCode } from "next-qrcode";
import { downloadToSVG } from "@/utils/qr-save";

import { qrControls } from "@/libs/qr-control-object";

export default function QRCreator() {
  // States
  const [qrTitle, setQRTitle] = useState("Made with QRmory!");
  const [qrValue, setQRValue] = useState("Welcome to QRmory!");
  const [textValue, setTextValue] = useState("");
  const [newQR, setNewQR] = useState(true);

  const [activeSelector, setActiveSelector] = useState("website");
  const [qrChanged, setQRChanged] = useState(true);

  const [qrSVG, setQRSVG] = useState<Element | null>(null);
  const [qrControl, setQRControl] = useState<JSX.Element | null>(
    qrControls["website"].component(setTextValue, setQRChanged, setNewQR),
  );

  const { SVG } = useQRCode();

  // Data
  const suggestedTitles = [
    "New QRmory Code",
    "Made with QRmory",
    "QRmory is Awesome",
    "QRmory Code",
    "My New QR Code",
    "QR Codes are fun",
    "I Love QRmory",
  ];

  // Functions
  const handleDownload = (format: "png" | "jpg") => {
    const svgData = document.querySelector("#final-qr div svg");
    if (!svgData) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgData);

    // Pass SVG string to d3ToPng
    d3ToPng(svgString, qrTitle, {
      format: format,
    }).then((r) => console.log(r));
  };

  // Effects
  useEffect(() => {
    setQRSVG(document.querySelector("#final-qr.div.svg"));
  }, []);

  return (
    <div
      id={`start-creating`}
      className="mx-auto mt-24 mb-16 px-2 lg:px-6 w-full max-w-6xl text-center text-qrmory-purple-800"
    >
      <h2 className="font-header text-3xl sm:text-4.5xl">Start Creating</h2>
      <h3 className="font-serif text-sm sm:text-xl font-bold uppercase">
        Go on! Give it a go
      </h3>

      <section className="py-16 flex lg:flex-row flex-col lg:items-stretch items-center gap-6 min-h-qr-card w-full">
        <article className="p-8 flex flex-col grow bg-white rounded-3xl shadow-xl shadow-stone-300">
          {/* QR Control Select */}
          <div className="mb-4 pb-4 flex flex-row flex-wrap justify-start items-center content-end self-start border-b-2 border-b-stone-100 transition-all">
            {Object.keys(qrControls).map((key) => (
              <article
                className={`${
                  activeSelector === key
                    ? "bg-qrmory-purple-800 text-white"
                    : "bg-white hover:bg-qrmory-purple-400 border-qrmory-purple-500 hover:border-qrmory-purple-400 hover:text-white"
                } qr-selector cursor-pointer m-1 py-2 px-5 flex justify-center items-center rounded border text-xs sm:text-sm transition-all duration-300`}
                key={`qr-control-${qrControls[key].title.toLowerCase()}`}
                data-selector={key}
                onClick={() => {
                  setTextValue("");
                  setActiveSelector(key);
                  setQRControl(
                    qrControls[key].component(
                      setTextValue,
                      setQRChanged,
                      setNewQR,
                    ),
                  );
                  setQRChanged(true);
                }}
              >
                {qrControls[key].title}
              </article>
            ))}

            <p className="m-2 inline text-black text-sm italic">
              more coming soon
            </p>
          </div>

          {/* Active QR Control */}
          <div className="mx-auto flex flex-col grow justify-center w-full text-left">
            <label className="control-label">
              Enter QR Title (optional):
              <input
                type="text"
                className="block py-2 control-input"
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

            <button
              className="mt-8 py-2.5 px-8 hover:enabled:translate-x-1 hover:enabled:-translate-y-1 border disabled:border-none border-qrmory-purple-800 hover:enabled:border-qrmory-purple-400 bg-white disabled:bg-stone-300 hover:enabled:bg-qrmory-purple-400 w-full md:w-44 text-xs sm:text-sm text-qrmory-purple-800 disabled:text-stone-600 hover:enabled:text-white rounded uppercase font-semibold transition-all duration-300"
              onClick={() => {
                if (textValue.length > 0) {
                  setQRValue(textValue);
                  setQRChanged(false);
                }
              }}
              disabled={textValue.length === 0}
            >
              Generate QR
            </button>

            {qrChanged && !newQR ? (
              <p className="mt-4 text-rose-500 text-sm">
                {/*Click the button above to apply the new changes*/}
              </p>
            ) : null}
          </div>
        </article>

        {/* QR Block */}
        <article className="pt-8 pb-10 px-10 flex flex-col justify-between w-qr-preview max-w-full bg-white rounded-3xl shadow-xl shadow-stone-300 text-center">
          <div className="">
            <h4 className="text-xs text-stone-400">Your QR Code Title</h4>

            <h5 className="text-base text-qrmory-purple-800 font-bold">
              {qrTitle || null}
            </h5>
          </div>

          <div
            id={`final-qr`}
            className="my-16 mx-auto text-gray-600 dark:text-gray-600 text-sm"
          >
            <SVG
              text={qrValue}
              options={{
                errorCorrectionLevel: "M",
                color: { dark: qrChanged ? "#78716c" : "#000000" },
                width: 180,
                margin: 1,
              }}
            />
          </div>

          <button
            className={
              "mx-auto py-2.5 px-4 grow w-full rounded uppercase font-bold text-xs sm:text-base transition-all" +
              " duration-300" +
              (qrChanged
                ? " bg-stone-300 text-white"
                : " cursor-pointer bg-white hover:bg-qrmory-purple-400 border" +
                  " border-qrmory-purple-800 text-qrmory-purple-800 hover:text-white" +
                  " hover:-translate-y-1 hover:translate-x-1")
            }
            id="download-button"
            onClick={() => {
              const svgData = document.querySelector("#final-qr div svg");
              downloadToSVG(svgData, qrTitle);
            }}
            disabled={qrChanged}
          >
            Download SVG
          </button>

          <div className="my-2 flex flex-row flex-nowrap gap-2 items-center w-full">
            <button
              className={
                "py-2.5 px-4 grow rounded uppercase font-bold text-xs sm:text-base transition-all" +
                " duration-300" +
                (qrChanged
                  ? " bg-stone-300 text-white"
                  : " cursor-pointer bg-white hover:bg-qrmory-purple-400 border" +
                    " border-qrmory-purple-500 text-qrmory-purple-800 hover:text-white" +
                    " hover:-translate-y-1 hover:translate-x-1")
              }
              id="download-button"
              onClick={() => handleDownload("png")}
              disabled={qrChanged}
            >
              png
            </button>

            <button
              className={
                "py-2.5 px-4 grow rounded uppercase font-bold text-xs sm:text-base transition-all" +
                " duration-300" +
                (qrChanged
                  ? " bg-stone-300 text-white"
                  : " cursor-pointer bg-white hover:bg-qrmory-purple-400 border" +
                    " border-qrmory-purple-500 text-qrmory-purple-800 hover:text-white" +
                    " hover:-translate-y-1 hover:translate-x-1")
              }
              id="download-button"
              onClick={() => handleDownload("jpg")}
              disabled={qrChanged}
            >
              jpg
            </button>
          </div>
        </article>
      </section>
    </div>
  );
}
