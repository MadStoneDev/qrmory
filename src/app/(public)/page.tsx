import HomeHero from "@/components/home-hero-section";
import QRCreator from "@/components/qr-creator";
import HomeInfo from "@/components/home-info-section";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <HomeHero />

      <QRCreator />

      <HomeInfo />
    </main>
  );
}
