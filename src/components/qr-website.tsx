import { useRef, useState, useEffect } from "react";
import { QRControlType } from "@/types/qr-controls";
import { isValidURL } from "@/utils/general";

interface WebsiteSaveData {
  controlType: string;
  protocol: string;
  url: string;
}

const QRWebsite = ({
  setText,
  setChanged,
  setSaveData,
  initialData,
}: QRControlType) => {
  // States
  const [site, setSite] = useState(initialData?.url || "");
  const [protocol, setProtocol] = useState(initialData?.protocol || "https");
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Refs
  const protocolRef = useRef<HTMLSelectElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize from saved data if available
  useEffect(() => {
    if (initialData && !isInitialized) {
      setSite(initialData.url || "");
      setProtocol(initialData.protocol || "https");
      setIsInitialized(true);

      // If we have initial data, update the parent value
      if (initialData.url) {
        updateParentValue(initialData.url, initialData.protocol || "https");
      }
    }
  }, [initialData, isInitialized]);

  // Validate URL
  const validateUrl = (url: string) => {
    if (url.length === 0) return true;
    return isValidURL(url);
  };

  // Update the parent component with the current URL value
  const updateParentValue = (siteValue: string, protocolValue: string) => {
    if (siteValue.length === 0) {
      setText("");
      if (setSaveData) setSaveData(null);
    } else {
      setText(`${protocolValue}://${siteValue}`);
      if (setSaveData) {
        const saveData: WebsiteSaveData = {
          controlType: "website",
          protocol: protocolValue,
          url: siteValue,
        };
        setSaveData(saveData);
      }
    }
    setChanged(true);
  };

  const handleSiteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setSite(newValue);

    if (isError) {
      setIsError(false);
      setErrorMessage("");
    }

    const isValid = validateUrl(newValue);
    if (!isValid && newValue.length > 0) {
      setIsError(true);
    }

    updateParentValue(newValue, protocol);
  };

  const handleProtocolChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newProtocol = event.target.value;
    setProtocol(newProtocol);

    // Update parent with new protocol
    updateParentValue(site, newProtocol);
  };

  const handleBlur = () => {
    if (site.length === 0) return;

    // Check if URL has its own protocol specified
    if (site.match(/^http(s?):\/\//)) {
      try {
        const url = new URL(site);
        // Extract protocol without the ://
        const extractedProtocol = url.protocol.replace(":", "");
        setProtocol(extractedProtocol);

        // Remove protocol from site value
        const newSite = site.replace(/^http(s?):\/\//, "");
        setSite(newSite);

        // Update parent with extracted values
        updateParentValue(newSite, extractedProtocol);
      } catch (error) {
        // Invalid URL format, keep as is
      }
    }

    // Final validation
    const isValid = validateUrl(site);
    setIsError(!isValid && site.length > 0);
    if (!isValid && site.length > 0) {
      setErrorMessage(
        "That doesn't look like a valid URL. Are you sure it's correct?",
      );
    }
  };

  return (
    <>
      <label className="control-label">
        Enter Website:
        <div className="flex flex-row flex-nowrap">
          <select
            ref={protocolRef}
            className="mr-2 mt-1 ring-0 border-0 outline-none focus:bg-neutral-100 rounded-xl text-sm md:text-base text-qrmory-purple-800 font-bold"
            value={protocol}
            onChange={handleProtocolChange}
          >
            <option value="https">https://</option>
            <option value="http">http://</option>
          </select>
          <input
            ref={inputRef}
            type="text"
            value={site}
            className={`control-input ${isError ? "border-rose-400" : ""}`}
            placeholder="example.com"
            onKeyDown={(e) => {
              if (e.key === " ") {
                e.preventDefault();
              }
            }}
            onChange={handleSiteChange}
            onBlur={handleBlur}
          />
        </div>
        {isError && (
          <p className="mt-2 text-sm italic text-rose-600">{errorMessage}</p>
        )}
      </label>
    </>
  );
};

export default QRWebsite;
