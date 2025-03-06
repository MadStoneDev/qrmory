import "@/app/globals.css";

import React from "react";

import { GoogleAnalytics } from "@next/third-parties/google";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <GoogleAnalytics gaId={`G-DQR24DJNH3`} />
      </body>
    </html>
  );
}
