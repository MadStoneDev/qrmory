"use client";

import { useEffect, useState, JSX } from "react";

import d3ToPng from "d3-svg-to-png";
import { useQRCode } from "next-qrcode";
import { downloadToSVG } from "@/utils/qr-save";

import { qrControls } from "@/lib/qr-control-object";

export default function QRCreator({
  withHeading = true,
}: {
  withHeading?: boolean;
}) {
  // States
  const [qrTitle, setQRTitle] = useState("");
  const [qrValue, setQRValue] = useState("Welcome to QRmory!");
  const [textValue, setTextValue] = useState("");
  const [newQR, setNewQR] = useState(true);

  const [activeSelector, setActiveSelector] = useState("website");
  const [qrChanged, setQRChanged] = useState(true);

  const [qrControl, setQRControl] = useState<JSX.Element | null>(
    qrControls["website"].component(setTextValue, setQRChanged, setNewQR),
  );

  // Hooks
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

  // Functions
  const handleDownload = (format: "png" | "jpg") => {
    const svgData = document.querySelector("#final-qr div svg");
    if (!svgData) return;

    // Pass SVG string to d3ToPng
    d3ToPng(`#final-qr div svg`, qrTitle, {
      format: format,
    }).then((r) => console.log(`Downloaded ${format} file`));
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
        withHeading ? "mx-auto mt-24 px-2 lg:px-6 max-w-6xl" : "px-2"
      } mb-16 w-full text-center text-qrmory-purple-800`}
    >
      {withHeading ? (
        <>
          <h2 className="font-header text-3xl lg:text-4.5xl">Start Creating</h2>
          <h3 className="font-serif text-sm lg:text-xl font-bold uppercase">
            Go on! Give it a go
          </h3>
        </>
      ) : null}

      {/* QR Settings */}
      <section
        className={`${
          withHeading ? "py-16" : ""
        } flex lg:flex-row flex-col lg:items-stretch items-center gap-6 min-h-qr-card w-full`}
      >
        <article
          className={`${
            withHeading ? "px-4 py-16" : "px-4 py-4"
          } lg:px-8 flex flex-col grow bg-stone-100 max-w-full lg:rounded-3xl lg:shadow-xl lg:shadow-stone-300`}
        >
          {/* QR Control Select */}
          <div className="mb-4 pb-4 flex flex-row flex-wrap justify-start items-center content-end self-start border-b-2 border-stone-100 transition-all">
            {Object.keys(qrControls).map((key) => (
              <article
                className={`${
                  activeSelector === key
                    ? "bg-qrmory-purple-800 text-white"
                    : "bg-white hover:bg-qrmory-purple-400 border-qrmory-purple-500 hover:border-qrmory-purple-400 hover:text-white"
                } qr-selector cursor-pointer m-1 py-2 px-5 flex justify-center items-center rounded border text-xs lg:text-sm transition-all duration-300`}
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
              className="mt-8 py-2.5 px-8 hover:enabled:translate-x-1 hover:enabled:-translate-y-1 border disabled:border-none border-qrmory-purple-800 hover:enabled:border-qrmory-purple-400 bg-white disabled:bg-stone-300 hover:enabled:bg-qrmory-purple-400 w-full md:w-44 text-xs lg:text-sm text-qrmory-purple-800 disabled:text-stone-600 hover:enabled:text-white rounded uppercase font-semibold transition-all duration-300"
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

        <article
          className={`block lg:hidden my-4 w-full h-[1px] bg-stone-300`}
        ></article>

        {/* QR Block */}
        <article className="p-4 lg:pt-8 lg:pb-10 lg:px-10 self-start lg:self-auto flex flex-col items-start lg:items-auto justify-between lg:w-qr-preview w-full max-w-xs bg-stone-100 lg:rounded-3xl lg:shadow-xl lg:shadow-stone-300 text-center">
          <div className="w-full">
            <h4 className="text-xs text-stone-400">Your QR Code Title</h4>

            <h5 className="text-base text-qrmory-purple-800 font-bold">
              {qrTitle || null}
            </h5>
          </div>

          <div
            id={`final-qr`}
            className="my-6 lg:my-16 lg:mx-auto flex-grow grid place-content-center text-gray-600 dark:text-gray-600 text-sm"
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
              "mx-auto py-2.5 px-4 grow w-full max-h-12 rounded uppercase font-bold text-xs lg:text-base" +
              " transition-all" +
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
                "py-2.5 px-4 grow rounded uppercase font-bold text-xs lg:text-base transition-all" +
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
                "py-2.5 px-4 grow rounded uppercase font-bold text-xs lg:text-base transition-all" +
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
