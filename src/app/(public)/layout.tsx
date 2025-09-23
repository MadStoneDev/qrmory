import React from "react";
import MainFooter from "@/components/sections/main-footer";

export const metadata = {
  title: "QRmory - Generate an arsenal of QR Codes",
  description:
    "Create your QR code arsenal with QRmory - a simple but powerful QR code generator designed by an Australian small business for Australian small businesses.",
};

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
