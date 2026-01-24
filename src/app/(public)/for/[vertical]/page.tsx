// app/(public)/for/[vertical]/page.tsx
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  getVerticalBySlug,
  getVerticalSlugs,
  BusinessVertical,
} from "@/lib/business-verticals";
import BusinessLandingPage from "@/components/business-landing-page";
import MainNavigation from "@/components/main-navigation";
import MainFooter from "@/components/sections/main-footer";

interface PageProps {
  params: { vertical: string };
}

// Generate static params for all verticals
export async function generateStaticParams() {
  const slugs = getVerticalSlugs();
  return slugs.map((vertical) => ({ vertical }));
}

// Generate metadata for each vertical
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const vertical = getVerticalBySlug(params.vertical);

  if (!vertical) {
    return {
      title: "Not Found | QRmory",
    };
  }

  return {
    title: `QR Codes for ${vertical.name} | QRmory`,
    description: vertical.heroDescription,
    openGraph: {
      title: `QR Codes for ${vertical.name} | QRmory`,
      description: vertical.heroDescription,
      type: "website",
    },
  };
}

export default function BusinessVerticalPage({ params }: PageProps) {
  const vertical = getVerticalBySlug(params.vertical);

  if (!vertical) {
    notFound();
  }

  return (
    <>
      <MainNavigation />
      <BusinessLandingPage vertical={vertical} />
      <MainFooter />
    </>
  );
}
