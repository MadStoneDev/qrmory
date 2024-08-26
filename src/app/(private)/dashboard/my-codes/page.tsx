"use client";

import { useQRCode } from "next-qrcode";

export default function MyCodes() {
  return (
    <section className={`flex flex-col overflow-y-auto`}>
      <h1 className={`mb-4 text-xl font-bold`}>My Codes</h1>
      <MyCodeItem title={"Sample QR Code"} type={"Text"} qrValue={"Hello"} />
      <MyCodeItem title={"Sample QR Code"} type={"Text"} qrValue={"Richard"} />
      <MyCodeItem title={"Sample QR Code"} type={"Text"} qrValue={"Hello"} />
      <MyCodeItem title={"Sample QR Code"} type={"Text"} qrValue={"Richard"} />
      <MyCodeItem title={"Sample QR Code"} type={"Text"} qrValue={"Hello"} />
      <MyCodeItem title={"Sample QR Code"} type={"Text"} qrValue={"Richard"} />
      <MyCodeItem title={"Sample QR Code"} type={"Text"} qrValue={"Hello"} />
      <MyCodeItem title={"Sample QR Code"} type={"Text"} qrValue={"Richard"} />
      <MyCodeItem title={"Sample QR Code"} type={"Text"} qrValue={"Hello"} />
      <MyCodeItem title={"Sample QR Code"} type={"Text"} qrValue={"Richard"} />
      <MyCodeItem title={"Sample QR Code"} type={"Text"} qrValue={"Hello"} />
      <MyCodeItem title={"Sample QR Code"} type={"Text"} qrValue={"Richard"} />
      <MyCodeItem title={"Sample QR Code"} type={"Text"} qrValue={"Hello"} />
      <MyCodeItem title={"Sample QR Code"} type={"Text"} qrValue={"Richard"} />
    </section>
  );
}

interface MyCodeItemProps {
  title: string;
  type: string;
  qrValue: string;
}

function MyCodeItem({
  title = "No Title",
  type = "Text",
  qrValue = "No Value",
}: MyCodeItemProps) {
  const { SVG } = useQRCode();

  return (
    <article
      className={`py-3 flex flex-row items-center w-full h-full [&:not(:last-of-type)]:border-b border-stone-300`}
    >
      <div className={`flex-grow`}>
        <h2 className={`font-sans text-lg md:text-xl`}>{title}</h2>
        <h3 className={`font-sans text-xs`}>{type}</h3>
      </div>

      {/* Separator */}
      <div className={`w-[1px] h-full bg-stone-300`}></div>

      <div className={`flex w-12 md:w-20 items-center justify-center`}>
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
    </article>
  );
}
