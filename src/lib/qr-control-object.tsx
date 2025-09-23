import { QRControlsObject } from "@/types/qr-controls";

import QRFacebook from "@/components/qr-facebook";
import QRInstagram from "@/components/qr-instagram";
import QRText from "@/components/qr-text";
import QRTwitter from "@/components/qr-twitter";
import QRWebsite from "@/components/qr-website";
import QRYoutube from "@/components/qr-youtube";
import QRWifi from "@/components/qr-wifi";
import QRVCard from "@/components/qr-vcard";
import QRCoupon from "@/components/qr-coupon";
import QRLocation from "@/components/qr-location";
import QRSMS from "@/components/qr-sms";
import QREmail from "@/components/qr-email";
import QRCalendar from "@/components/qr-calendar";
import QRMultiLink from "@/components/qr-multilink";
import QRPoll from "@/components/qr-poll";
import QRImageGallery from "@/components/qr-image-gallery";
import QRAudio from "@/components/qr-audio";
import {
  IconBrandFacebookFilled,
  IconBrandInstagram,
  IconBrandXFilled,
  IconBrandYoutubeFilled,
  IconCalendar,
  IconChartBar,
  IconIdBadge2,
  IconLink,
  IconMail,
  IconMapPin,
  IconNotes,
  IconPhone,
  IconPhoto,
  IconRouter,
  IconTicket,
  IconVolume,
  IconWorld,
} from "@tabler/icons-react";

export const qrControls: QRControlsObject = {
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
};
