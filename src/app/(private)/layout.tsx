import "../globals.css";
import React from "react";

import MainNavigation from "@/components/main-navigation";
import PrivateNavigation from "@/components/private-navigation";

export default function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`flex flex-col h-screen max-h-screen overflow-y-auto`}>
      <MainNavigation className={`bg-qrmory-purple-800`} absolute={false} />

      <main className={`flex-grow overflow-hidden`}>
        <div className={`flex flex-row items-stretch h-full`}>
          <section className={`p-4 h-full`}>
            <PrivateNavigation />
          </section>
          <section
            className={`py-4 sm:py-6 px-2 pr-4 sm:px-6 flex-grow overflow-y-auto`}
          >
            {children}
          </section>
        </div>
      </main>

      <footer className={`p-2 text-xs text-center opacity-50`}>
        &copy; 2024 QRmory
      </footer>
    </div>
  );
}
