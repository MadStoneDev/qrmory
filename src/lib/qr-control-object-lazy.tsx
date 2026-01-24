"use client";

import dynamic from "next/dynamic";
import { QRControlsObject } from "@/types/qr-controls";
import {
  IconBrandFacebookFilled,
  IconBrandInstagram,
  IconBrandXFilled,
  IconBrandYoutubeFilled,
  IconBrandWhatsapp,
  IconBrandLinkedin,
  IconBrandTiktok,
  IconBrandTelegram,
  IconBrandDiscord,
  IconApps,
  IconVideo,
  IconFileTypePdf,
  IconCalendar,
  IconChartBar,
  IconIdBadge2,
  IconLink,
  IconMail,
  IconMapPin,
  IconNotes,
  IconPhone,
  IconPhoneCall,
  IconPhoto,
  IconRouter,
  IconTicket,
  IconVolume,
  IconWorld,
} from "@tabler/icons-react";

// Loading fallback component
const LoadingFallback = () => (
  <div className="animate-pulse space-y-3 p-4">
    <div className="h-4 bg-neutral-200 rounded w-1/3"></div>
    <div className="h-10 bg-neutral-200 rounded"></div>
    <div className="h-10 bg-neutral-200 rounded"></div>
  </div>
);

// Dynamically import QR type components with code splitting
const QRWebsite = dynamic(() => import("@/components/qr-website"), {
  loading: LoadingFallback,
});
const QRFacebook = dynamic(() => import("@/components/qr-facebook"), {
  loading: LoadingFallback,
});
const QRInstagram = dynamic(() => import("@/components/qr-instagram"), {
  loading: LoadingFallback,
});
const QRTwitter = dynamic(() => import("@/components/qr-twitter"), {
  loading: LoadingFallback,
});
const QRYoutube = dynamic(() => import("@/components/qr-youtube"), {
  loading: LoadingFallback,
});
const QRVCard = dynamic(() => import("@/components/qr-vcard"), {
  loading: LoadingFallback,
});
const QRCoupon = dynamic(() => import("@/components/qr-coupon"), {
  loading: LoadingFallback,
});
const QRLocation = dynamic(() => import("@/components/qr-location"), {
  loading: LoadingFallback,
});
const QRWifi = dynamic(() => import("@/components/qr-wifi"), {
  loading: LoadingFallback,
});
const QRText = dynamic(() => import("@/components/qr-text"), {
  loading: LoadingFallback,
});
const QRSMS = dynamic(() => import("@/components/qr-sms"), {
  loading: LoadingFallback,
});
const QREmail = dynamic(() => import("@/components/qr-email"), {
  loading: LoadingFallback,
});
const QRCalendar = dynamic(() => import("@/components/qr-calendar"), {
  loading: LoadingFallback,
});
const QRMultiLink = dynamic(() => import("@/components/qr-multilink"), {
  loading: LoadingFallback,
});
const QRPoll = dynamic(() => import("@/components/qr-poll"), {
  loading: LoadingFallback,
});
const QRImageGallery = dynamic(() => import("@/components/qr-image-gallery"), {
  loading: LoadingFallback,
});
const QRAudio = dynamic(() => import("@/components/qr-audio"), {
  loading: LoadingFallback,
});
const QRPhone = dynamic(() => import("@/components/qr-phone"), {
  loading: LoadingFallback,
});
const QRWhatsApp = dynamic(() => import("@/components/qr-whatsapp"), {
  loading: LoadingFallback,
});
const QRLinkedIn = dynamic(() => import("@/components/qr-linkedin"), {
  loading: LoadingFallback,
});
const QRTikTok = dynamic(() => import("@/components/qr-tiktok"), {
  loading: LoadingFallback,
});
const QRTelegram = dynamic(() => import("@/components/qr-telegram"), {
  loading: LoadingFallback,
});
const QRDiscord = dynamic(() => import("@/components/qr-discord"), {
  loading: LoadingFallback,
});
const QRAppStore = dynamic(() => import("@/components/qr-appstore"), {
  loading: LoadingFallback,
});
const QRVideo = dynamic(() => import("@/components/qr-video"), {
  loading: LoadingFallback,
});
const QRPDF = dynamic(() => import("@/components/qr-pdf"), {
  loading: LoadingFallback,
});

export const qrControlsLazy: QRControlsObject = {
  website: {
    title: "Website",
    description: "Link to a page or site",
    icon: <IconWorld size={24} strokeWidth={1.5} />,
    component: (setText, setChanged, setSaveData) => (
      <QRWebsite
        setText={setText}
        setChanged={setChanged}
        setSaveData={setSaveData}
      />
    ),
  },
  facebook: {
    title: "Facebook",
    description: "Facebook page/group",
    icon: <IconBrandFacebookFilled size={24} strokeWidth={1.5} />,
    component: (setText, setChanged, setSaveData) => (
      <QRFacebook
        setText={setText}
        setChanged={setChanged}
        setSaveData={setSaveData}
      />
    ),
  },
  instagram: {
    title: "Instagram",
    description: "Instagram account",
    icon: <IconBrandInstagram size={24} strokeWidth={1.5} />,
    component: (setText, setChanged, setSaveData) => (
      <QRInstagram
        setText={setText}
        setChanged={setChanged}
        setSaveData={setSaveData}
      />
    ),
  },
  twitter: {
    title: "X / Twitter",
    description: "X account",
    icon: <IconBrandXFilled size={24} strokeWidth={1.5} />,
    component: (setText, setChanged, setSaveData) => (
      <QRTwitter
        setText={setText}
        setChanged={setChanged}
        setSaveData={setSaveData}
      />
    ),
  },
  youTube: {
    title: "YouTube",
    description: "YouTube video",
    icon: <IconBrandYoutubeFilled size={24} strokeWidth={1.5} />,
    component: (setText, setChanged, setSaveData) => (
      <QRYoutube
        setText={setText}
        setChanged={setChanged}
        setSaveData={setSaveData}
      />
    ),
  },
  eBusinessCard: {
    title: "E-Business Card",
    description: "The modern business card",
    icon: <IconIdBadge2 size={24} strokeWidth={1.5} />,
    component: (setText, setChanged, setSaveData) => (
      <QRVCard
        setText={setText}
        setChanged={setChanged}
        setSaveData={setSaveData}
      />
    ),
  },
  coupon: {
    title: "Coupon",
    description: "Create a coupon or special offer",
    icon: <IconTicket size={24} strokeWidth={1.5} />,
    component: (setText, setChanged, setSaveData) => (
      <QRCoupon
        setText={setText}
        setChanged={setChanged}
        setSaveData={setSaveData}
      />
    ),
  },
  location: {
    title: "Location",
    description: "Share a map address",
    icon: <IconMapPin size={24} strokeWidth={1.5} />,
    component: (setText, setChanged, setSaveData) => (
      <QRLocation
        setText={setText}
        setChanged={setChanged}
        setSaveData={setSaveData}
      />
    ),
  },
  wifi: {
    title: "WiFi",
    description: "Share WiFi details",
    icon: <IconRouter size={24} strokeWidth={1.5} />,
    component: (setText, setChanged, setSaveData) => (
      <QRWifi
        setText={setText}
        setChanged={setChanged}
        setSaveData={setSaveData}
      />
    ),
  },
  text: {
    title: "Text",
    description: "Display a text message",
    icon: <IconNotes size={24} strokeWidth={1.5} />,
    component: (setText, setChanged, setSaveData) => (
      <QRText
        setText={setText}
        setChanged={setChanged}
        setSaveData={setSaveData}
      />
    ),
  },
  sms: {
    title: "SMS",
    description: "Send a text message",
    icon: <IconPhone size={24} strokeWidth={1.5} />,
    component: (setText, setChanged, setSaveData) => (
      <QRSMS
        setText={setText}
        setChanged={setChanged}
        setSaveData={setSaveData}
      />
    ),
  },
  email: {
    title: "Email",
    description: "Compose an email",
    icon: <IconMail size={24} strokeWidth={1.5} />,
    component: (setText, setChanged, setSaveData) => (
      <QREmail
        setText={setText}
        setChanged={setChanged}
        setSaveData={setSaveData}
      />
    ),
  },
  calendar: {
    title: "Calendar Event",
    description: "Add to calendar",
    icon: <IconCalendar size={24} strokeWidth={1.5} />,
    component: (setText, setChanged, setSaveData) => (
      <QRCalendar
        setText={setText}
        setChanged={setChanged}
        setSaveData={setSaveData}
      />
    ),
  },
  multilink: {
    title: "Multi-Link",
    description: "Multiple links in one place",
    icon: <IconLink size={24} strokeWidth={1.5} />,
    component: (setText, setChanged, setSaveData) => (
      <QRMultiLink
        setText={setText}
        setChanged={setChanged}
        setSaveData={setSaveData}
      />
    ),
  },
  poll: {
    title: "Poll",
    description: "Create a poll or survey",
    icon: <IconChartBar size={24} strokeWidth={1.5} />,
    component: (setText, setChanged, setSaveData) => (
      <QRPoll
        setText={setText}
        setChanged={setChanged}
        setSaveData={setSaveData}
      />
    ),
  },
  imageGallery: {
    title: "Image Gallery",
    description: "Share multiple photos",
    icon: <IconPhoto size={24} strokeWidth={1.5} />,
    component: (setText, setChanged, setSaveData, user, subscriptionLevel) => (
      <QRImageGallery
        setText={setText}
        setChanged={setChanged}
        setSaveData={setSaveData}
        user={user}
        subscriptionLevel={subscriptionLevel || 0}
      />
    ),
  },
  audio: {
    title: "Audio",
    description: "Share audio files",
    icon: <IconVolume size={24} strokeWidth={1.5} />,
    component: (setText, setChanged, setSaveData, user, subscriptionLevel) => (
      <QRAudio
        setText={setText}
        setChanged={setChanged}
        setSaveData={setSaveData}
        user={user}
        subscriptionLevel={subscriptionLevel || 0}
      />
    ),
  },
  phone: {
    title: "Phone",
    description: "Quick dial phone number",
    icon: <IconPhoneCall size={24} strokeWidth={1.5} />,
    component: (setText, setChanged, setSaveData) => (
      <QRPhone
        setText={setText}
        setChanged={setChanged}
        setSaveData={setSaveData}
      />
    ),
  },
  whatsapp: {
    title: "WhatsApp",
    description: "Start a WhatsApp chat",
    icon: <IconBrandWhatsapp size={24} strokeWidth={1.5} />,
    component: (setText, setChanged, setSaveData) => (
      <QRWhatsApp
        setText={setText}
        setChanged={setChanged}
        setSaveData={setSaveData}
      />
    ),
  },
  linkedin: {
    title: "LinkedIn",
    description: "LinkedIn profile or company",
    icon: <IconBrandLinkedin size={24} strokeWidth={1.5} />,
    component: (setText, setChanged, setSaveData) => (
      <QRLinkedIn
        setText={setText}
        setChanged={setChanged}
        setSaveData={setSaveData}
      />
    ),
  },
  tiktok: {
    title: "TikTok",
    description: "TikTok profile",
    icon: <IconBrandTiktok size={24} strokeWidth={1.5} />,
    component: (setText, setChanged, setSaveData) => (
      <QRTikTok
        setText={setText}
        setChanged={setChanged}
        setSaveData={setSaveData}
      />
    ),
  },
  telegram: {
    title: "Telegram",
    description: "Telegram user, group or channel",
    icon: <IconBrandTelegram size={24} strokeWidth={1.5} />,
    component: (setText, setChanged, setSaveData) => (
      <QRTelegram
        setText={setText}
        setChanged={setChanged}
        setSaveData={setSaveData}
      />
    ),
  },
  discord: {
    title: "Discord",
    description: "Discord server invite",
    icon: <IconBrandDiscord size={24} strokeWidth={1.5} />,
    component: (setText, setChanged, setSaveData) => (
      <QRDiscord
        setText={setText}
        setChanged={setChanged}
        setSaveData={setSaveData}
      />
    ),
  },
  appstore: {
    title: "App Download",
    description: "iOS & Android app links",
    icon: <IconApps size={24} strokeWidth={1.5} />,
    component: (setText, setChanged, setSaveData) => (
      <QRAppStore
        setText={setText}
        setChanged={setChanged}
        setSaveData={setSaveData}
      />
    ),
  },
  video: {
    title: "Video",
    description: "Share video content",
    icon: <IconVideo size={24} strokeWidth={1.5} />,
    component: (setText, setChanged, setSaveData, user, subscriptionLevel) => (
      <QRVideo
        setText={setText}
        setChanged={setChanged}
        setSaveData={setSaveData}
        user={user}
        subscriptionLevel={subscriptionLevel || 0}
      />
    ),
  },
  pdf: {
    title: "PDF Document",
    description: "Share PDF files",
    icon: <IconFileTypePdf size={24} strokeWidth={1.5} />,
    component: (setText, setChanged, setSaveData, user, subscriptionLevel) => (
      <QRPDF
        setText={setText}
        setChanged={setChanged}
        setSaveData={setSaveData}
        user={user}
        subscriptionLevel={subscriptionLevel || 0}
      />
    ),
  },
};
