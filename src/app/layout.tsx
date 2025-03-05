import "@/app/globals.css";

import React from "react";

import { GoogleAnalytics } from "@next/third-parties/google";
import { Toaster } from "@/components/ui/sonner";

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
        <Toaster
          position={`top-right`}
          toastOptions={{
            duration: 3000,
          }}
        />
      </body>
    </html>
  );
}
