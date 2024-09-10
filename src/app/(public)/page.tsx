import HomeHero from "@/components/home-hero-section";
import QRCreator from "@/components/qr-create/qr-creator";
import HomeInfo from "@/components/home-info-section";
import MainNavigation from "@/components/main-navigation";
import React from "react";

export default function Home() {
  // User
  const user = null;

  return (
    <main className="mb-8 flex min-h-screen flex-col items-center justify-between">
      <MainNavigation />

      <HomeHero />

      <QRCreator user={user} />

      <HomeInfo />
    </main>
  );
}
