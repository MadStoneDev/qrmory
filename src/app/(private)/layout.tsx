import "../globals.css";
import React from "react";
import MainFooter from "@/components/main-footer";
import MainNavigation from "@/components/main-navigation";
import PrivateNavigation from "@/components/private-navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className={`flex flex-col h-screen max-h-screen overflow-y-auto`}>
          <MainNavigation className={`bg-qrmory-purple-800`} absolute={false} />

          <main className={`flex-grow overflow-y-auto`}>
            <div className={`flex flex-row items-stretch h-full`}>
              <section className={`p-4 h-full`}>
                <PrivateNavigation />
              </section>
              <section className={`p-6 flex-grow`}>{children}</section>
            </div>
          </main>

          <footer className={`p-2 text-xs text-center opacity-50`}>
            &copy; 2024 QRmory
          </footer>
        </div>
      </body>
    </html>
  );
}
