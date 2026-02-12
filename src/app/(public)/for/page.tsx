// app/(public)/for/page.tsx
import Link from "next/link";
import { Metadata } from "next";
import { getAllVerticals } from "@/lib/business-verticals";
import MainNavigation from "@/components/main-navigation";
import MainFooter from "@/components/sections/main-footer";
import { IconArrowRight, IconBuilding } from "@tabler/icons-react";

export const metadata: Metadata = {
  title: "QR Codes for Business",
  description:
    "Dynamic QR codes for restaurants, hotels, retail, events, and more. See how businesses in your industry use QRmory.",
};

// Group verticals by category
const categories = {
  "Food & Beverage": ["restaurants", "cafes", "food-trucks"],
  "Hospitality & Tourism": [
    "hotels",
    "vacation-rentals",
    "tour-operators",
    "museums-galleries",
    "tourist-attractions",
  ],
  "Retail & Services": ["retail-stores", "gyms-fitness", "laundromats"],
  Healthcare: ["dental-offices"],
  "Real Estate": ["real-estate"],
  "Events & Venues": ["wedding-venues", "wedding-expos", "concert-venues"],
  "Community & Education": ["libraries"],
  "Industrial & Logistics": ["warehouses", "parking-facilities"],
};

export default function BusinessIndexPage() {
  const allVerticals = getAllVerticals();

  return (
    <>
      <MainNavigation />

      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-qrmory-purple-900 via-qrmory-purple-800 to-qrmory-purple-900 text-white py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-qrmory-purple-200 font-medium mb-4">
              QRmory for Business
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold font-serif mb-6">
              QR Codes for Every Industry
            </h1>
            <p className="text-xl text-qrmory-purple-100 mb-8 max-w-2xl mx-auto">
              From restaurants to warehouses, see how businesses like yours use
              dynamic QR codes to connect with customers and streamline
              operations.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center px-8 py-4 bg-white text-qrmory-purple-800 font-semibold rounded-lg hover:bg-qrmory-purple-50 transition-colors"
            >
              Get Started Free
              <IconArrowRight size={20} className="ml-2" />
            </Link>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            {Object.entries(categories).map(([category, slugs]) => (
              <div key={category} className="mb-16">
                <h2 className="text-2xl font-bold text-qrmory-purple-800 font-serif mb-6">
                  {category}
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {slugs.map((slug) => {
                    const vertical = allVerticals.find((v) => v.slug === slug);
                    if (!vertical) return null;

                    return (
                      <Link
                        key={slug}
                        href={`/for/${slug}`}
                        className="group bg-white border border-neutral-200 rounded-xl p-6 hover:shadow-lg hover:border-qrmory-purple-200 transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 bg-qrmory-purple-100 rounded-lg flex items-center justify-center text-qrmory-purple-600">
                            <IconBuilding size={24} />
                          </div>
                          <IconArrowRight
                            size={20}
                            className="text-neutral-300 group-hover:text-qrmory-purple-600 transition-colors"
                          />
                        </div>
                        <h3 className="text-lg font-semibold text-qrmory-purple-800 mb-2">
                          {vertical.name}
                        </h3>
                        <p className="text-sm text-neutral-600 mb-4">
                          {vertical.description}
                        </p>
                        {vertical.stats && (
                          <div className="flex gap-4 pt-4 border-t border-neutral-100">
                            {vertical.stats.slice(0, 2).map((stat, index) => (
                              <div key={index}>
                                <p className="text-lg font-bold text-qrmory-purple-700">
                                  {stat.value}
                                </p>
                                <p className="text-xs text-neutral-500">
                                  {stat.label}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 bg-neutral-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-qrmory-purple-800 font-serif mb-4">
              Don&apos;t See Your Industry?
            </h2>
            <p className="text-lg text-neutral-600 mb-8">
              QRmory works for any business that wants to connect physical
              spaces with digital experiences. Start with our flexible plans and
              customise for your needs.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/login"
                className="inline-flex items-center px-8 py-4 bg-qrmory-purple-800 text-white font-semibold rounded-lg hover:bg-qrmory-purple-700 transition-colors"
              >
                Start Free Trial
              </Link>
              <Link
                href="/help/contact"
                className="inline-flex items-center px-8 py-4 border-2 border-qrmory-purple-800 text-qrmory-purple-800 font-semibold rounded-lg hover:bg-qrmory-purple-50 transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MainFooter />
    </>
  );
}
