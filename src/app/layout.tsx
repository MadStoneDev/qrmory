import "@/app/globals.css";

import React from "react";

import { GoogleAnalytics } from "@next/third-parties/google";
import { createClient } from "@/utils/supabase/server";
import { LogRocketProvider } from "@/components/providers/LogRocketProvider";

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
