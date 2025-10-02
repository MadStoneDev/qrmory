import React from "react";

import MainNavigation from "@/components/main-navigation";
import PrivateNavigation from "@/components/private-navigation";
import { Toaster } from "@/components/ui/sonner";
import { createClient } from "@/utils/supabase/server";
import { ensureUserProfile } from "@/utils/supabase/queries";

export default async function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  await ensureUserProfile(supabase);

  return (
    <div className={`flex flex-col h-dvh max-h-dvh overflow-hidden`}>
      <MainNavigation
        className={`fixed top-0 left-0 right-0 bg-qrmory-purple-800 z-50`}
        absolute={false}
      />

      {/* Block Space for Nav */}
      <div className={`min-h-16 sm:min-h-20 w-full`}></div>

      <main className={`mb-10 flex-grow flex flex-row h-full overflow-y-auto`}>
        <PrivateNavigation
          className={`fixed sm:relative bottom-10 sm:bottom-auto w-full sm:w-auto z-50`}
        />

        {/* Main Block */}
        <div
          className={`mb-16 sm:mb-0 flex-grow flex flex-row justify-center items-stretch`}
        >
          <section
            className={`py-4 sm:py-6 px-2 pr-4 sm:px-6 flex-grow bg-neutral-100 shadow-2xl shadow-neutral-400 overflow-y-auto`}
          >
            {children}
          </section>
        </div>
      </main>

      <footer
        className={`px-4 fixed bottom-0 grid place-content-center w-full h-10 bg-qrmory-purple-900 text-xs text-center text-neutral-100/50`}
      >
        <p className={``}>&copy; 2024 QRmory</p>
      </footer>
      <Toaster
        position={`top-right`}
        toastOptions={{
          duration: 3000,
        }}
      />
    </div>
  );
}
