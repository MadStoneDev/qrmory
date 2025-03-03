import { useState, useEffect } from "react";
import { QRControlType } from "@/types/qr-controls";

interface InstagramSaveData {
  username: string;
}

export default function QRInstagram({
  setText,
  setChanged,
  setSaveData,
}: QRControlType) {
  // States
  const [enteredLink, setEnteredLink] = useState("");

  // Main Link
  const mainLink = `instagram.com/`;

  // Update the parent component with the current value
  const updateParentValue = (value: string) => {
    if (value.length > 0) {
      setText(`${mainLink}${value}`);
      if (setSaveData) {
        const saveData: InstagramSaveData = {
          username: value,
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

  // Handle input blur (when focus leaves the input)
  const handleInputBlur = () => {
    if (enteredLink.length === 0) {
      setText("");
      if (setSaveData) setSaveData(null);
      return;
    }

    // Process and format the link properly
    let fixedLink = enteredLink;

    // Remove any prefixes like www., http://, https://
    fixedLink = fixedLink
      .replace(`www.${mainLink}`, mainLink)
      .replace("http://", "")
      .replace("https://", "");

    // If the user pasted the full Instagram URL, extract just the username/path
    if (fixedLink.substring(0, mainLink.length) === mainLink) {
      fixedLink = fixedLink.substring(mainLink.length);
    }

    // Update state and parent
    setEnteredLink(fixedLink);
    updateParentValue(fixedLink);
  };

  return (
    <>
      <label className="control-label">
        Enter Instagram Username:
        <p className={`font-sansLight italic text-stone-400`}>
          (you can paste the full link{" "}
          <span className={`px-1 font-sans font-black uppercase`}>or</span> just
          the username)
        </p>
        <div className="flex flex-row flex-nowrap">
          <p className="pt-2 text-qrmory-purple-400 font-bold text-sm md:text-lg">
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
