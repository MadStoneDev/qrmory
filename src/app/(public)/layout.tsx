import React from "react";
import MainFooter from "@/components/main-footer";

export const metadata = {
  title: "QRmory - Generate an arsenal of QR Codes",
  description:
    "A simple, easy to use QR code generator for Australian small businesses.",
};

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <MainFooter />
    </>
  );
}
