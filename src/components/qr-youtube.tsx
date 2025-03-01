import { useState } from "react";
import { QRControlType } from "@/types/qr-controls";

export default function QRYoutube({ setText, setChanged }: QRControlType) {
  // States
  const [enteredLink, setEnteredLink] = useState("");
  const [mainLink, setMainLink] = useState(`https://www.youtube.com/`);
  const [altLink, setAltLink] = useState(`https://www.youtube.com/watch?v=`);

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
            title={`Click/Tap to swtich to ${
              altLink.length > mainLink.length ? "video link" : "standard link"
            }`}
            className="pt-2 text-qrmory-purple-400 font-bold text-sm md:text-lg"
            onClick={() => {
              const currentMain = mainLink;

              setMainLink(altLink);
              setAltLink(currentMain);
            }}
          >
            {mainLink}
          </p>
          <input
            type="text"
            className="control-input"
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
