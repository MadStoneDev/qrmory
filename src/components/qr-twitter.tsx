import { useState } from "react";
import { QRControlType } from "@/types/qr-controls";

export default function QRTwitter({ setText, setChanged }: QRControlType) {
  // States
  const [enteredLink, setEnteredLink] = useState("");
  const [mainLink, setMainLink] = useState(`twitter.com/`);
  const [altLink, setAltLink] = useState(`x.com/`);

  // Update the parent component with the current value
  const updateParentValue = (value: string) => {
    if (value.length > 0) {
      setText(`${mainLink}${value}`);
    } else {
      setText("");
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
    setText(mainLink + fixedLink);
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
