import { useState } from "react";

import { QRControlType } from "@/types/qr-controls";

export default function QRTwitter({ setText, setChanged }: QRControlType) {
  // States
  const [enteredLink, setEnteredLink] = useState("");
  const [mainLink, setMainLink] = useState(`twitter.com/`);
  const [altLink, setAltLink] = useState(`x.com/`);

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
            placeholder={`eg. https://twitter.com/qrmory or https://x.com/qrmory or qrmory`}
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
                .replace(`www.${altLink}`, altLink)
                .replace("http://", "")
                .replace("https://", "");

              if (enteredLink.includes("://www.")) {
                fixedLink = fixedLink.replace("://www.", "://");
              }

              if (enteredLink.includes("http://")) {
                fixedLink = fixedLink.replace("http://", "https://");
              }

              const [longerLink, shorterLink] =
                altLink.length > mainLink.length
                  ? [altLink, mainLink]
                  : [mainLink, altLink];

              if (fixedLink.substring(0, longerLink.length) === longerLink) {
                fixedLink = fixedLink.substring(longerLink.length);

                if (longerLink === altLink) {
                  setMainLink(longerLink);
                  setAltLink(shorterLink);
                }
              } else if (
                fixedLink.substring(0, shorterLink.length) === shorterLink
              ) {
                fixedLink = fixedLink.substring(shorterLink.length);

                if (shorterLink === altLink) {
                  setMainLink(shorterLink);
                  setAltLink(longerLink);
                }
              }

              fixedLink = fixedLink
                .trim()
                .replace(/[^a-zA-Z0-9/\-._~/?#@&+;=]+/g, "");

              setEnteredLink(fixedLink);
              setText(mainLink + fixedLink);
            }}
          />
        </div>
      </label>
    </>
  );
}
