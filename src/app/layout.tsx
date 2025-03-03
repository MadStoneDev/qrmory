import "@/app/globals.css";
import React from "react";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
      <Toaster
        position={`top-right`}
        toastOptions={{
          duration: 3000,
        }}
      />
    </html>
  );
}
