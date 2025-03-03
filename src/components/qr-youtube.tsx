import { useState, useEffect } from "react";
import { QRControlType } from "@/types/qr-controls";

interface YoutubeSaveData {
  videoId: string;
  linkFormat: string;
}

export default function QRYoutube({
  setText,
  setChanged,
  setSaveData,
}: QRControlType) {
  // States
  const [enteredLink, setEnteredLink] = useState("");
  const [mainLink, setMainLink] = useState(`https://www.youtube.com/`);
  const [altLink, setAltLink] = useState(`https://www.youtube.com/watch?v=`);

  // Update the parent component with the current value
  const updateParentValue = (value: string) => {
    if (value.length > 0) {
      const fullLink = `${mainLink}${value}`;
      setText(fullLink);

      // Update save data
      if (setSaveData) {
        const saveData: YoutubeSaveData = {
          videoId: value,
          linkFormat: mainLink,
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

  // Handle toggling between different YouTube link formats
  const handleLinkToggle = () => {
    const currentMain = mainLink;
    setMainLink(altLink);
    setAltLink(currentMain);

    // Update the parent with the new format if there's existing input
    if (enteredLink.length > 0) {
      const fullLink = `${altLink}${enteredLink}`;
      setText(fullLink);

      // Update save data with new format
      if (setSaveData && enteredLink.length > 0) {
        const saveData: YoutubeSaveData = {
          videoId: enteredLink,
          linkFormat: altLink,
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

    // Determine which link format the user may have entered
    const [longerLink, shorterLink] =
      altLink.length > mainLink.length
        ? [altLink, mainLink]
        : [mainLink, altLink];

    // Check if the user entered a full YouTube URL and extract just the ID/path
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

    // Clean the ID/path from any invalid characters
    fixedLink = fixedLink.trim().replace(/[^a-zA-Z0-9/\-._~/?#@&+;=]+/g, "");

    // Update state and parent
    setEnteredLink(fixedLink);

    const fullLink = mainLink + fixedLink;
    setText(fullLink);

    // Update save data
    if (setSaveData) {
      const saveData: YoutubeSaveData = {
        videoId: fixedLink,
        linkFormat: mainLink,
      };
      setSaveData(saveData);
    }
  };

  return (
    <>
      <label className="control-label">
        Enter YouTube Link:
        <p className={`font-sansLight italic text-stone-400`}>
          (you can paste the full link{" "}
          <span className={`px-1 font-sans font-black uppercase`}>or</span> your
          username{" "}
          <span className={`px-1 font-sans font-black uppercase`}>or</span> just
          the video ID)
        </p>
        <div className="flex flex-col sm:flex-row flex-nowrap">
          <p
            title={`Click/Tap to switch to ${
              altLink.length > mainLink.length ? "video link" : "standard link"
            }`}
            className="pt-2 text-qrmory-purple-400 font-bold text-sm md:text-lg cursor-pointer hover:text-qrmory-purple-600"
            onClick={handleLinkToggle}
          >
            {mainLink}
          </p>
          <input
            type="text"
            className="control-input"
            placeholder={
              mainLink.includes("watch?v=")
                ? "e.g. dQw4w9WgXcQ"
                : "e.g. channel/UCxxxxxxxx"
            }
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
