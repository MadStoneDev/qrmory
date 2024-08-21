import "../globals.css";
import React from "react";
import MainNavigation from "@/components/main-navigation";
import MainFooter from "@/components/main-footer";

export const metadata = {
  title: "QRmory - Generate an arsenal of QR Codes",
  description: "",
};

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
