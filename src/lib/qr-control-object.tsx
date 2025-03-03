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
import {
  IconBrandFacebookFilled,
  IconBrandInstagram,
  IconBrandXFilled,
  IconBrandYoutubeFilled,
  IconIdBadge2,
  IconMapPin,
  IconNotes,
  IconRouter,
  IconTicket,
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
};
