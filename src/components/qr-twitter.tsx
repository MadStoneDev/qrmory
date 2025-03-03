import { useState, useEffect } from "react";
import { QRControlType } from "@/types/qr-controls";

interface TwitterSaveData {
  username: string;
  domain: string;
}

export default function QRTwitter({
  setText,
  setChanged,
  setSaveData,
}: QRControlType) {
  // States
  const [enteredLink, setEnteredLink] = useState("");
  const [mainLink, setMainLink] = useState(`twitter.com/`);
  const [altLink, setAltLink] = useState(`x.com/`);

  // Update the parent component with the current value
  const updateParentValue = (value: string) => {
    if (value.length > 0) {
      setText(`${mainLink}${value}`);
      if (setSaveData) {
        const saveData: TwitterSaveData = {
          username: value,
          domain: mainLink.replace("/", ""),
        };
        setSaveData(saveData);
      }
    } else {
      setText("");
      if (setSaveData) setSaveData(null);
    }
    setChanged(true);
  };

  // Handle input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setEnteredLink(newValue);
    updateParentValue(newValue);
  };

  // Handle toggling between Twitter and X domains
  const handleToggleDomain = () => {
    const temp = mainLink;
    setMainLink(altLink);
    setAltLink(temp);

    // Update with new domain
    if (enteredLink.length > 0) {
      setText(`${altLink}${enteredLink}`);
      if (setSaveData) {
        const saveData: TwitterSaveData = {
          username: enteredLink,
          domain: altLink.replace("/", ""),
        };
        setSaveData(saveData);
      }
    }
  };

  // Handle input blur (when focus leaves the input)
  const handleInputBlur = () => {
    if (enteredLink.length === 0) {
      setText("");
      if (setSaveData) setSaveData(null);
      return;
    }

    // Process and format the link properly
    let fixedLink = enteredLink;

    // Clean up the URL by removing common prefixes
    fixedLink = fixedLink
      .replace(`www.${mainLink}`, mainLink)
      .replace(`www.${altLink}`, altLink)
      .replace("http://", "")
      .replace("https://", "");

    // Fix www URLs
    if (enteredLink.includes("://www.")) {
      fixedLink = fixedLink.replace("://www.", "://");
    }

    // Ensure https:// protocol
    if (enteredLink.includes("http://")) {
      fixedLink = fixedLink.replace("http://", "https://");
    }

    // Determine which domain the user entered (twitter.com or x.com)
    const [longerLink, shorterLink] =
      altLink.length > mainLink.length
        ? [altLink, mainLink]
        : [mainLink, altLink];

    // Handle if the user entered the full URL including domain
    if (fixedLink.substring(0, longerLink.length) === longerLink) {
      fixedLink = fixedLink.substring(longerLink.length);

      // Switch mainLink to the one the user used
      if (longerLink === altLink) {
        setMainLink(longerLink);
        setAltLink(shorterLink);
      }
    } else if (fixedLink.substring(0, shorterLink.length) === shorterLink) {
      fixedLink = fixedLink.substring(shorterLink.length);

      // Switch mainLink to the one the user used
      if (shorterLink === altLink) {
        setMainLink(shorterLink);
        setAltLink(longerLink);
      }
    }

    // Clean the username/path from any invalid characters
    fixedLink = fixedLink.trim().replace(/[^a-zA-Z0-9/\-._~/?#@&+;=]+/g, "");

    // Update state and parent
    setEnteredLink(fixedLink);
    updateParentValue(fixedLink);
  };

  return (
    <>
      <label className="control-label">
        Enter Twitter Username:
        <p className={`font-sansLight italic text-stone-400`}>
          (you can paste the full link{" "}
          <span className={`px-1 font-sans font-black uppercase`}>or</span> just
          the username)
        </p>
        <div className="flex flex-row flex-nowrap">
          <p
            className="pt-2 text-qrmory-purple-400 font-bold text-sm md:text-lg cursor-pointer hover:text-qrmory-purple-600"
            onClick={handleToggleDomain}
            title="Click to toggle between twitter.com and x.com"
          >
            https://{mainLink}
          </p>
          <input
            type="text"
            className="control-input"
            placeholder="e.g. username"
            value={enteredLink}
            onKeyDown={(e) => {
              if (e.key === " ") {
                e.preventDefault();
              }
            }}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
          />
        </div>
      </label>
    </>
  );
}
