import React from "react";

import MainNavigation from "@/components/main-navigation";
import MainFooter from "@/components/sections/main-footer";
import {
  IconQrcode,
  IconShield,
  IconBolt,
  IconUsers,
} from "@tabler/icons-react";

export const metadata = {
  title: "About | QRmory",
  description:
    "Learn about QRmory - your trusted partner for creating secure, dynamic QR codes with advanced features and analytics.",
};

export default function AboutPage() {
  return (
    <main className="mb-8 flex flex-col min-h-screen">
      <MainNavigation
        pages={[
          {
            title: "Home",
            path: "/",
          },
        ]}
      />

      <div className={`flex-grow flex flex-col items-center`}>
        <header
          className={
            "pt-40 pb-12 px-8 flex flex-col justify-center w-full max-w-60 sm:max-w-7xl min-h-fit"
          }
        >
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-5xl font-black">
            About QRmory
          </h1>

          <h2 className="mt-2 font-sans text-sm sm:text-xl lg:text-2xl font-bold">
            Your trusted QR code solution
          </h2>
        </header>

        <section
          className={`pb-10 px-8 flex flex-col justify-start w-full max-w-60 sm:max-w-7xl space-y-8`}
        >
          <div className="prose prose-lg max-w-none">
            <p className="mb-4 text-lg leading-relaxed text-neutral-700">
              QRmory is a QR Code Generator made by Australians for Australians.
              Our mission is to make Dynamic QR Codes easy to generate and
              accessible to everyone, regardless of your technical expertise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <div className="flex flex-col items-center text-center p-6 bg-qrmory-purple-50 rounded-xl border border-qrmory-purple-200">
              <div className="p-3 bg-qrmory-purple-800 rounded-full mb-4">
                <IconQrcode
                  size={32}
                  strokeWidth={1.5}
                  className="text-white"
                />
              </div>
              <h3 className="text-lg font-bold text-qrmory-purple-800 mb-2">
                Dynamic QR Codes
              </h3>
              <p className="text-sm text-neutral-600">
                Create QR codes that can be updated in real-time without
                reprinting
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-qrmory-purple-50 rounded-xl border border-qrmory-purple-200">
              <div className="p-3 bg-qrmory-purple-800 rounded-full mb-4">
                <IconShield
                  size={32}
                  strokeWidth={1.5}
                  className="text-white"
                />
              </div>
              <h3 className="text-lg font-bold text-qrmory-purple-800 mb-2">
                Secure & Reliable
              </h3>
              <p className="text-sm text-neutral-600">
                Enterprise-grade security with fraud detection and safe browsing
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-qrmory-purple-50 rounded-xl border border-qrmory-purple-200">
              <div className="p-3 bg-qrmory-purple-800 rounded-full mb-4">
                <IconBolt size={32} strokeWidth={1.5} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-qrmory-purple-800 mb-2">
                Lightning Fast
              </h3>
              <p className="text-sm text-neutral-600">
                Optimized for speed with global CDN and instant code generation
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-qrmory-purple-50 rounded-xl border border-qrmory-purple-200">
              <div className="p-3 bg-qrmory-purple-800 rounded-full mb-4">
                <IconUsers size={32} strokeWidth={1.5} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-qrmory-purple-800 mb-2">
                User-Friendly
              </h3>
              <p className="text-sm text-neutral-600">
                Intuitive interface designed for both beginners and
                professionals
              </p>
            </div>
          </div>

          <div className="bg-neutral-50 rounded-xl pt-8">
            <h3 className="text-2xl font-bold text-qrmory-purple-800 mb-6">
              Our Mission
            </h3>
            <p className="text-lg leading-relaxed text-neutral-700 mb-4">
              At QRmory, we're committed to providing you with great service and
              priority support. Whether you're a small business owner looking to
              connect with customers, a marketer running campaigns, or an
              enterprise needing scalable solutions, we provide the tools and
              insights you need.
            </p>
            <p className="text-lg leading-relaxed text-neutral-700">
              We believe in transparency, security, and putting our users first.
              That's why we've built QRmory with privacy by design and are
              continually working on improving our service. If you have any
              questions, feedback or suggestions, please don't hesitate to get
              in touch.
            </p>
          </div>

          <a
            href="/help/contact"
            className="self-start mt-6 mb-12 px-6 py-3 border border-qrmory-purple-800 text-qrmory-purple-800 rounded-lg font-semibold hover:bg-qrmory-purple-50 transition-colors duration-300"
          >
            Contact Us
          </a>

          <div className={`border-t-1 border-neutral-300`} />

          {/*
            Stats Section - Uncomment when ready to show real stats

            To enable:
            1. Add import at top: import StatsDisplay from "@/components/stats-display";
            2. Uncomment the line below:

            <StatsDisplay className="mt-12" />

            The StatsDisplay component automatically:
            - Fetches real counts from the database
            - Formats numbers: 7→"5+", 23→"20+", 156→"100+", 1234→"1k+", 56789→"50k+"
            - Shows: QR Codes Generated, Active Users, QR Code Types (26+)
          */}

          <div className="mt-12 text-center">
            <h3 className="text-xl font-bold text-qrmory-purple-800 mb-4">
              Ready to get started?
            </h3>
            <p className="text-neutral-600 mb-6">
              Join thousands of users who trust QRmory for their QR code needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/"
                className="px-6 py-3 bg-qrmory-purple-800 text-white rounded-lg font-semibold hover:bg-qrmory-purple-700 transition-colors duration-300"
              >
                Create Your First QR Code
              </a>
              <a
                href="/pricing"
                className="px-6 py-3 border border-qrmory-purple-800 text-qrmory-purple-800 rounded-lg font-semibold hover:bg-qrmory-purple-50 transition-colors duration-300"
              >
                View Pricing
              </a>
            </div>
          </div>
        </section>
      </div>

      <MainFooter />
    </main>
  );
}
