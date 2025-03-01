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

      <QRCreator shadow={true} user={user} />

      <HomeInfo />

      <p className="mx-auto mt-5 pt-2 px-4 sm:px-8 max-w-4xl font-light text-sm leading-6 text-center opacity-80 hover:opacity-100 transition-all duration-300">
        Spotted a QR code that looks fishy? Not sure if it's one of ours? No
        worries! Drop us a line on our{" "}
        <a
          href="/contact"
          className={`px-1 py-0.5 hover:bg-qrmory-purple-800 text-qrmory-purple-300 hover:text-stone-100 transition-all duration-300`}
        >
          contact page
        </a>
        . We're always happy to chat! Oh, and while you're here, why not take a
        quick peek at our{" "}
        <a
          href="/terms-and-conditions"
          className={`px-1 py-0.5 hover:bg-qrmory-purple-800 text-qrmory-purple-300 hover:text-stone-100 transition-all duration-300`}
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href="/privacy-policy"
          className={`px-1 py-0.5 hover:bg-qrmory-purple-800 text-qrmory-purple-300 hover:text-stone-100 transition-all duration-300`}
        >
          Privacy Policy
        </a>
        ? They're packed with juicy details on how to use QRmory safely and
        smartly. Trust us, it's riveting stuff! 😉
      </p>

      <section>{/* TODO Sprint#3: Add a FAQ Section */}</section>
    </main>
  );
}
