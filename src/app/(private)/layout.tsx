import React from "react";

import MainNavigation from "@/components/main-navigation";
import PrivateNavigation from "@/components/private-navigation";

export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`flex flex-col h-dvh max-h-dvh overflow-hidden`}>
      <MainNavigation
        className={`fixed top-0 left-0 right-0 bg-qrmory-purple-800 z-50`}
        absolute={false}
      />

      {/* Block Space for Nav */}
      <div className={`min-h-20 w-full`}></div>

      <main className={`mb-10 flex-grow flex flex-row gap-2 overflow-y-auto`}>
        <PrivateNavigation className={`py-2 z-50`} />

        {/* Main Block */}
        <div className={`flex-grow flex flex-row items-stretch`}>
          <section
            className={`py-4 sm:py-6 px-2 pr-4 sm:px-6 flex-grow overflow-y-auto`}
          >
            {children}
          </section>
        </div>
      </main>

      <footer
        className={`px-4 fixed bottom-0 grid place-content-center w-full h-10 bg-qrmory-purple-900 text-xs text-center text-stone-100/50`}
      >
        <p className={``}>&copy; 2024 QRmory</p>
      </footer>
    </div>
  );
}
