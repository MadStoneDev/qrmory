"use client";

import { useQRCode } from "next-qrcode";
import { IconPencil } from "@tabler/icons-react";

interface MyCodeItemProps {
  title: string;
  type: string;
  qrValue: string;
}

export default function MyCodeItem({
  title = "No Title",
  type = "Text",
  qrValue = "No Value",
}: MyCodeItemProps) {
  const { SVG } = useQRCode();

  return (
    <article
      className={`py-3 sm:py-4 flex flex-row items-center gap-4 w-full h-full [&:not(:last-of-type)]:border-b border-stone-200/70`}
    >
      <div className={`flex min-w7-12 items-center justify-center`}>
        <div className={`w-full`}>
          <SVG
            text={qrValue}
            options={{
              errorCorrectionLevel: "M",
              color: { dark: "#1E073E", light: "#FFFFFF00" },
              margin: 1,
            }}
          />
        </div>
      </div>

      <div className={`flex-grow`}>
        <h2 className={`font-serif text-sm sm:text-base font-bold`}>{title}</h2>
        <h3 className={`font-sans text-xs md:text-sm`}>{type}</h3>
      </div>

      {/* Separator */}
      <div className={`w-[1px] h-full bg-stone-300`}></div>

      <div>
        <IconPencil />
      </div>
    </article>
  );
}
