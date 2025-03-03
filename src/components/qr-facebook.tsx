import { useState } from "react";
import { QRControlType } from "@/types/qr-controls";

export default function QRFacebook({ setText, setChanged }: QRControlType) {
  // States
  const [enteredLink, setEnteredLink] = useState("");

  // Main Link
  const mainLink = `facebook.com/`;

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

    // Remove any prefixes like www., http://, https://
    fixedLink = fixedLink
      .replace(`www.${mainLink}`, "")
      .replace("http://", "")
      .replace("https://", "");

    // If the user pasted the full Facebook URL, extract just the username/path
    if (fixedLink.substring(0, mainLink.length) === mainLink) {
      fixedLink = fixedLink.substring(mainLink.length);
    }

    // Update state and parent
    setEnteredLink(fixedLink);
    setText(mainLink + fixedLink);
  };

  return (
    <>
      <label className="control-label">
        Enter Facebook Username:
        <p className={`font-sansLight italic text-stone-400`}>
          (you can paste the full link{" "}
          <span className={`px-1 font-sans font-black uppercase`}>or</span> you
          can omit the domain)
        </p>
        <div className="flex flex-row flex-nowrap">
          <p className="pt-2 text-qrmory-purple-400 font-bold text-sm md:text-lg">
            https://{mainLink}
          </p>
          <input
            type="text"
            className="control-input"
            placeholder={`e.g. qrmory`}
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
