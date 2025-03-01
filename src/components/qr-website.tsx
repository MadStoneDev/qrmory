import { useRef, useState } from "react";
import { QRControlType } from "@/types/qr-controls";
import { isValidURL } from "@/utils/general";

const QRWebsite = ({ setText, setChanged }: QRControlType) => {
  // States
  const [site, setSite] = useState("");
  const [protocol, setProtocol] = useState("https");
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Refs
  const protocolRef = useRef<HTMLSelectElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <label className="control-label">
        Enter Website:
        <div className="flex flex-row flex-nowrap">
          <select
            ref={protocolRef}
            className="mr-2 mt-1 ring-0 border-0 outline-none focus:bg-stone-100 rounded-xl text-sm md:text-base text-qrmory-purple-800 font-bold"
            onChange={(event) => {
              const siteProtocol = event.target.value;

              setProtocol(siteProtocol);
              setText(siteProtocol + "://" + site);

              setChanged(true);
            }}
          >
            <option value="https">https://</option>
            <option value="http">http://</option>
          </select>
          <input
            ref={inputRef}
            type="text"
            value={site}
            className="control-input"
            onKeyDown={(e) => {
              if (e.key === " ") {
                e.preventDefault();
              }
            }}
            onChange={(event) => {
              setIsError(false);
              setErrorMessage("");

              if (event.target.value.length === 0) {
                setText("");
              } else {
                setText(protocol + "://" + site);
              }

              setSite(event.target.value);
              setChanged(true);
            }}
            onBlur={() => {
              if (site.length === 0) {
                setText("");
                return;
              }

              let siteUrl = site;

              if (isValidURL(siteUrl)) {
                const checkProtocol = siteUrl.match(/^http(s?):\/\//);
                const siteProtocol = checkProtocol
                  ? checkProtocol[0].replace("://", "")
                  : protocol;

                if (checkProtocol) {
                  setProtocol(siteProtocol);
                  protocolRef.current!.value = siteProtocol;
                }

                siteUrl = siteUrl.replace(/^http(s?):\/\//, "");
                setSite(siteUrl);
              } else {
                setIsError(true);
                setErrorMessage(
                  "That doesn't look like a valid URL. Are you it's correct?",
                );
              }

              setText(protocol + "://" + siteUrl);
            }}
          />
        </div>
        <p className="mt-2 text-sm italic text-rose-600">
          {isError ? errorMessage : null}
        </p>
      </label>
    </>
  );
};

export default QRWebsite;
