// components/business-landing-page.tsx
"use client";

import Link from "next/link";
import { BusinessVertical } from "@/lib/business-verticals";
import {
  IconCheck,
  IconArrowRight,
  IconQrcode,
  IconChartBar,
  IconRefresh,
  IconDownload,
  // Use cases icons - imported dynamically based on vertical
  IconToolsKitchen2,
  IconBook,
  IconMessageStar,
  IconWifi,
  IconCoffee,
  IconHeart,
  IconDeviceMobile,
  IconBrandInstagram,
  IconMenuOrder,
  IconCreditCard,
  IconMapPin,
  IconShare,
  IconBed,
  IconDoorEnter,
  IconCalendarEvent,
  IconMap,
  IconHome,
  IconClipboardList,
  IconFirstAidKit,
  IconHeadphones,
  IconRoute,
  IconTicket,
  IconShield,
  IconFrame,
  IconVolume,
  IconPlayerPlay,
  IconShoppingBag,
  IconInfoCircle,
  IconBuildingCommunity,
  IconTag,
  IconStar,
  IconDiscount2,
  IconPackage,
  IconBarbell,
  IconCalendar,
  IconClipboardCheck,
  IconId,
  IconWashMachine,
  IconHelp,
  IconAlertTriangle,
  IconClipboard,
  IconCalendarPlus,
  IconReceipt,
  IconVideo,
  IconPhoneCall,
  IconMapSearch,
  IconClock,
  IconGlass,
  IconCamera,
  IconPhoto,
  IconUserPlus,
  IconGift,
  IconMicrophone,
  IconShirt,
  IconBeer,
  IconDevices,
  IconDoor,
  IconChecklist,
  IconTool,
  IconParking,
  IconChargingPile,
} from "@tabler/icons-react";

// Icon mapping
const iconMap: Record<string, React.ReactNode> = {
  IconToolsKitchen2: <IconToolsKitchen2 size={32} />,
  IconBook: <IconBook size={32} />,
  IconMessageStar: <IconMessageStar size={32} />,
  IconWifi: <IconWifi size={32} />,
  IconCoffee: <IconCoffee size={32} />,
  IconHeart: <IconHeart size={32} />,
  IconDeviceMobile: <IconDeviceMobile size={32} />,
  IconBrandInstagram: <IconBrandInstagram size={32} />,
  IconMenuOrder: <IconMenuOrder size={32} />,
  IconCreditCard: <IconCreditCard size={32} />,
  IconMapPin: <IconMapPin size={32} />,
  IconShare: <IconShare size={32} />,
  IconBed: <IconBed size={32} />,
  IconDoorEnter: <IconDoorEnter size={32} />,
  IconCalendarEvent: <IconCalendarEvent size={32} />,
  IconMap: <IconMap size={32} />,
  IconHome: <IconHome size={32} />,
  IconClipboardList: <IconClipboardList size={32} />,
  IconFirstAidKit: <IconFirstAidKit size={32} />,
  IconHeadphones: <IconHeadphones size={32} />,
  IconRoute: <IconRoute size={32} />,
  IconTicket: <IconTicket size={32} />,
  IconShield: <IconShield size={32} />,
  IconFrame: <IconFrame size={32} />,
  IconVolume: <IconVolume size={32} />,
  IconPlayerPlay: <IconPlayerPlay size={32} />,
  IconShoppingBag: <IconShoppingBag size={32} />,
  IconInfoCircle: <IconInfoCircle size={32} />,
  IconBuildingCommunity: <IconBuildingCommunity size={32} />,
  IconTag: <IconTag size={32} />,
  IconStar: <IconStar size={32} />,
  IconDiscount2: <IconDiscount2 size={32} />,
  IconPackage: <IconPackage size={32} />,
  IconBarbell: <IconBarbell size={32} />,
  IconCalendar: <IconCalendar size={32} />,
  IconClipboardCheck: <IconClipboardCheck size={32} />,
  IconId: <IconId size={32} />,
  IconWashMachine: <IconWashMachine size={32} />,
  IconHelp: <IconHelp size={32} />,
  IconAlertTriangle: <IconAlertTriangle size={32} />,
  IconClipboard: <IconClipboard size={32} />,
  IconCalendarPlus: <IconCalendarPlus size={32} />,
  IconReceipt: <IconReceipt size={32} />,
  IconVideo: <IconVideo size={32} />,
  IconPhoneCall: <IconPhoneCall size={32} />,
  IconMapSearch: <IconMapSearch size={32} />,
  IconClock: <IconClock size={32} />,
  IconGlass: <IconGlass size={32} />,
  IconCamera: <IconCamera size={32} />,
  IconPhoto: <IconPhoto size={32} />,
  IconUserPlus: <IconUserPlus size={32} />,
  IconGift: <IconGift size={32} />,
  IconMicrophone: <IconMicrophone size={32} />,
  IconShirt: <IconShirt size={32} />,
  IconBeer: <IconBeer size={32} />,
  IconDevices: <IconDevices size={32} />,
  IconDoor: <IconDoor size={32} />,
  IconChecklist: <IconChecklist size={32} />,
  IconTool: <IconTool size={32} />,
  IconParking: <IconParking size={32} />,
  IconChargingPile: <IconChargingPile size={32} />,
};

const planDetails = {
  explorer: { name: "Explorer", price: "$9", codes: 10 },
  creator: { name: "Creator", price: "$29", codes: 50 },
  champion: { name: "Champion", price: "$79", codes: 250 },
};

interface BusinessLandingPageProps {
  vertical: BusinessVertical;
}

export default function BusinessLandingPage({
  vertical,
}: BusinessLandingPageProps) {
  const plan = planDetails[vertical.recommendedPlan];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-qrmory-purple-900 via-qrmory-purple-800 to-qrmory-purple-900 text-white">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="relative max-w-6xl mx-auto px-6 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-qrmory-purple-200 font-medium mb-4">
                QRmory for {vertical.name}
              </p>
              <h1 className="text-4xl lg:text-5xl font-bold font-serif mb-6">
                {vertical.tagline}
              </h1>
              <p className="text-xl text-qrmory-purple-100 mb-8">
                {vertical.heroDescription}
              </p>

              {/* Stats */}
              {vertical.stats && (
                <div className="flex flex-wrap gap-8 mb-8">
                  {vertical.stats.map((stat, index) => (
                    <div key={index}>
                      <p className="text-3xl font-bold text-white">
                        {stat.value}
                      </p>
                      <p className="text-sm text-qrmory-purple-200">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/login"
                  className="inline-flex items-center px-6 py-3 bg-white text-qrmory-purple-800 font-semibold rounded-lg hover:bg-qrmory-purple-50 transition-colors"
                >
                  Get Started Free
                  <IconArrowRight size={20} className="ml-2" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center px-6 py-3 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
                >
                  View Pricing
                </Link>
              </div>
            </div>

            {/* Hero Image Placeholder */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                {/*
                  PHOTO SUGGESTION:
                  {vertical.photoSuggestions.hero}
                */}
                <div className="aspect-video bg-qrmory-purple-700/50 rounded-lg flex items-center justify-center">
                  <div className="text-center p-4">
                    <IconQrcode size={64} className="mx-auto mb-4 opacity-50" />
                    <p className="text-sm text-qrmory-purple-200 max-w-xs">
                      {vertical.photoSuggestions.hero}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-6 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-qrmory-purple-800 font-serif mb-4">
              How {vertical.name} Use QRmory
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              {vertical.description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {vertical.useCases.map((useCase, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow border border-neutral-100"
              >
                <div className="w-14 h-14 bg-qrmory-purple-100 rounded-xl flex items-center justify-center text-qrmory-purple-600 mb-6">
                  {iconMap[useCase.icon] || <IconQrcode size={32} />}
                </div>
                <h3 className="text-xl font-semibold text-qrmory-purple-800 mb-3">
                  {useCase.title}
                </h3>
                <p className="text-neutral-600">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-qrmory-purple-800 font-serif mb-4">
              How It Works
            </h2>
            <p className="text-lg text-neutral-600">
              Get started in minutes, not days
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: <IconQrcode size={32} />,
                title: "Create QR Codes",
                description:
                  "Generate unique codes for each location, table, or item in your business.",
              },
              {
                icon: <IconRefresh size={32} />,
                title: "Update Anytime",
                description:
                  "Change where your codes link without reprinting. Update menus, info, or offers instantly.",
              },
              {
                icon: <IconChartBar size={32} />,
                title: "Track Scans",
                description:
                  "See which codes get scanned most. Understand customer behavior with analytics.",
              },
              {
                icon: <IconDownload size={32} />,
                title: "Download & Print",
                description:
                  "Get print-ready files in any format. Perfect for signs, table tents, and displays.",
              },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-qrmory-purple-100 rounded-full flex items-center justify-center text-qrmory-purple-600 mx-auto mb-4">
                  {step.icon}
                </div>
                <h3 className="text-lg font-semibold text-qrmory-purple-800 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-neutral-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Batch Generation Preview */}
      <section className="py-20 px-6 bg-qrmory-purple-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-qrmory-purple-800 font-serif mb-4">
                Create Multiple QR Codes at Once
              </h2>
              <p className="text-lg text-neutral-600 mb-6">
                Need codes for every table, room, or station? Our batch
                generator creates them all in seconds with your preferred naming
                pattern.
              </p>

              <div className="bg-white rounded-lg p-4 mb-6">
                <p className="text-sm text-neutral-500 mb-2">
                  Popular patterns for {vertical.name.toLowerCase()}:
                </p>
                <div className="flex flex-wrap gap-2">
                  {vertical.batchPatternSuggestions.map((pattern, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-qrmory-purple-100 text-qrmory-purple-700 rounded-full text-sm"
                    >
                      {pattern.pattern}
                    </span>
                  ))}
                </div>
              </div>

              <Link
                href="/dashboard/create?batch=true"
                className="inline-flex items-center px-6 py-3 bg-qrmory-purple-800 text-white font-semibold rounded-lg hover:bg-qrmory-purple-700 transition-colors"
              >
                Try Batch Generator
                <IconArrowRight size={20} className="ml-2" />
              </Link>
            </div>

            {/* Batch Preview Visual */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-neutral-500">
                  Preview
                </span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  10 codes ready
                </span>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <div
                    key={n}
                    className="aspect-square bg-neutral-100 rounded-lg flex flex-col items-center justify-center p-2"
                  >
                    <div className="w-full aspect-square bg-qrmory-purple-200 rounded mb-1" />
                    <span className="text-xs text-neutral-600 truncate w-full text-center">
                      {vertical.batchPatternSuggestions[0]?.pattern.replace(
                        "{n}",
                        String(n)
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Plan Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-qrmory-purple-800 to-qrmory-purple-900 rounded-2xl p-8 lg:p-12 text-white text-center">
            <p className="text-qrmory-purple-200 font-medium mb-2">
              Recommended for {vertical.name}
            </p>
            <h2 className="text-3xl font-bold font-serif mb-2">{plan.name}</h2>
            <p className="text-4xl font-bold mb-4">
              {plan.price}
              <span className="text-lg font-normal text-qrmory-purple-200">
                /month
              </span>
            </p>

            <p className="text-qrmory-purple-100 mb-8 max-w-xl mx-auto">
              {vertical.recommendedPlanReason}
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {[
                `${plan.codes} dynamic QR codes`,
                "Real-time analytics",
                "Instant updates",
                "Bulk download",
                vertical.recommendedPlan === "champion"
                  ? "Priority support"
                  : "Email support",
              ].map((feature, index) => (
                <span
                  key={index}
                  className="flex items-center text-sm text-qrmory-purple-100"
                >
                  <IconCheck size={16} className="mr-1 text-green-400" />
                  {feature}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/login"
                className="inline-flex items-center px-8 py-3 bg-white text-qrmory-purple-800 font-semibold rounded-lg hover:bg-qrmory-purple-50 transition-colors"
              >
                Start Free Trial
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center px-8 py-3 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                Compare All Plans
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-neutral-50">
        <div className="max-w-4xl mx-auto text-center">
          {/*
            PHOTO SUGGESTION:
            {vertical.photoSuggestions.cta}
          */}
          <h2 className="text-3xl font-bold text-qrmory-purple-800 font-serif mb-4">
            Ready to Transform Your {vertical.name.replace(/s$/, "")}?
          </h2>
          <p className="text-lg text-neutral-600 mb-8">
            Join thousands of businesses using QRmory to connect with customers.
            Start free, upgrade anytime.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center px-8 py-4 bg-qrmory-purple-800 text-white font-semibold rounded-lg hover:bg-qrmory-purple-700 transition-colors text-lg"
          >
            Get Started Free
            <IconArrowRight size={24} className="ml-2" />
          </Link>
          <p className="text-sm text-neutral-500 mt-4">
            No credit card required. 3 free QR codes forever.
          </p>
        </div>
      </section>
    </div>
  );
}
