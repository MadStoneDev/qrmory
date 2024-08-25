import "../globals.css";
import React from "react";
import MainFooter from "@/components/main-footer";

export const metadata = {
  title: "QRmory - Generate an arsenal of QR Codes",
  description:
    "A simple, easy to use QR code generator for Australian small businesses.",
};
6;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <MainFooter />
      </body>
    </html>
  );
}
