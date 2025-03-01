import { useState } from "react";

import { QRControlType } from "@/types/qr-controls";

export default function QRInstagram({ setText, setChanged }: QRControlType) {
  // States
  const [enteredLink, setEnteredLink] = useState("");

  // Main Link
  const mainLink = `instagram.com/`;

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
            placeholder={`eg. https://instagram.com/qrmory or qrmory`}
            value={enteredLink}
            onKeyDown={(e) => {
              if (e.key === " ") {
                e.preventDefault();
              }
            }}
            onChange={(el) => {
              if (el.target.value.length > 0) {
                setText(`${mainLink}${el.target.value}`);
              } else {
                setText("");
              }

              setEnteredLink(el.target.value);
              setChanged(true);
            }}
            onBlur={() => {
              if (enteredLink.length === 0) {
                setText("");
                return;
              }

              let fixedLink = enteredLink;

              fixedLink = fixedLink
                .replace(`www.${mainLink}`, mainLink)
                .replace("http://", "")
                .replace("https://", "");

              if (fixedLink.substring(0, mainLink.length) === mainLink) {
                fixedLink = fixedLink.substring(mainLink.length);
              }

              setEnteredLink(fixedLink);
              setText(mainLink + fixedLink);
            }}
          />
        </div>
      </label>
    </>
  );
}
