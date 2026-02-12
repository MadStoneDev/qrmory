import "@/app/globals.css";

import React from "react";
import type { Metadata } from "next";

import { GoogleAnalytics } from "@next/third-parties/google";
import { createClient } from "@/utils/supabase/server";
import { LogRocketProvider } from "@/components/providers/LogRocketProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://qrmory.com"),
  title: {
    default: "QRmory - Generate an arsenal of QR Codes",
    template: "%s | QRmory",
  },
  description:
    "Create your QR code arsenal with QRmory - a simple but powerful QR code generator designed by an Australian small business for Australian small businesses.",
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "https://qrmory.com",
    siteName: "QRmory",
    title: "QRmory - Generate an arsenal of QR Codes",
    description:
      "Create your QR code arsenal with QRmory - a simple but powerful QR code generator designed by an Australian small business for Australian small businesses.",
  },
  twitter: {
    card: "summary_large_image",
    title: "QRmory - Generate an arsenal of QR Codes",
    description:
      "Create your QR code arsenal with QRmory - a simple but powerful QR code generator designed by an Australian small business for Australian small businesses.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("subscription_level")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  const userData = user
    ? {
        id: user.id,
        email: user.email,
        subscription_level: profile?.subscription_level,
      }
    : null;

  return (
    <html lang="en">
      <body>
        <LogRocketProvider user={userData}>
          {children}
          <GoogleAnalytics gaId={`G-DQR24DJNH3`} />
        </LogRocketProvider>
      </body>
    </html>
  );
}
