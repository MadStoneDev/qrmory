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
    component: (setText: Function, setChanged: Function) => (
      <QRWebsite setText={setText} setChanged={setChanged} />
    ),
  },
  facebook: {
    title: "Facebook",
    description: "Facebook page/group",
    icon: <IconBrandFacebookFilled size={24} strokeWidth={1.5} />,
    component: (setText: Function, setChanged: Function) => (
      <QRFacebook setText={setText} setChanged={setChanged} />
    ),
  },
  instagram: {
    title: "Instagram",
    description: "Instagram account",
    icon: <IconBrandInstagram size={24} strokeWidth={1.5} />,
    component: (setText: Function, setChanged: Function) => (
      <QRInstagram setText={setText} setChanged={setChanged} />
    ),
  },
  twitter: {
    title: "X / Twitter",
    description: "X account",
    icon: <IconBrandXFilled size={24} strokeWidth={1.5} />,
    component: (setText: Function, setChanged: Function) => (
      <QRTwitter setText={setText} setChanged={setChanged} />
    ),
  },
  youTube: {
    title: "YouTube",
    description: "YouTube video",
    icon: <IconBrandYoutubeFilled size={24} strokeWidth={1.5} />,
    component: (setText: Function, setChanged: Function) => (
      <QRYoutube setText={setText} setChanged={setChanged} />
    ),
  },
  // email: [
  //     "Email",
  //     "Preset an email",
  //     <QREmail setText={setTextValue}  setChanged={setQRChanged} setNewQR={setNewQR} />,
  // ],
  // socialMedia: [
  //     "Social Media",
  //     "Share your profiles",
  //     <QRSocialMedia setText={setTextValue}  setChanged={setQRChanged} setNewQR={setNewQR} />,
  // ],
  eBusinessCard: {
    title: "E-Business Card",
    description: "The modern business card",
    icon: <IconIdBadge2 size={24} strokeWidth={1.5} />,
    component: (setText: Function, setChanged: Function) => (
      <QRVCard setText={setText} setChanged={setChanged} />
    ),
  },
  // poll: ["Poll", "Run a quick poll"],
  // reviews: ["Reviews", "Collect customer reviews"],
  // event: ["Event", "Promote an event"],
  // document: ["Document", "Share a PDF document"],
  // audio: ["Audio", "Share an sound file"],
  // video: ["Video", "Share a quick video"],
  // phone: [
  //     "Phone",
  //     "Set up an easy call",
  //     <QRPhone setText={setTextValue}  setChanged={setQRChanged} setNewQR={setNewQR} />,
  // ],
  // sms: [
  //     "SMS",
  //     "Preset an SMS",
  //     <QRSms setText={setTextValue}  setChanged={setQRChanged} setNewQR={setNewQR} />,
  // ],
  coupon: {
    title: "Coupon",
    description: "Create a coupon or special offer",
    icon: <IconTicket size={24} strokeWidth={1.5} />,
    component: (setText: Function, setChanged: Function) => (
      <QRCoupon setText={setText} setChanged={setChanged} />
    ),
  },
  location: {
    title: "Location",
    description: "Share a map address",
    icon: <IconMapPin size={24} strokeWidth={1.5} />,
    component: (setText: Function, setChanged: Function) => (
      <QRLocation setText={setText} setChanged={setChanged} />
    ),
  },
  wifi: {
    title: "WiFi",
    description: "Share WiFi details",
    icon: <IconRouter size={24} strokeWidth={1.5} />,
    component: (setText: Function, setChanged: Function) => (
      <QRWifi setText={setText} setChanged={setChanged} />
    ),
  },
  text: {
    title: "Text",
    description: "Display a text message",
    icon: <IconNotes size={24} strokeWidth={1.5} />,
    component: (setText: Function, setChanged: Function) => (
      <QRText setText={setText} setChanged={setChanged} />
    ),
  },
  // bitcoin: ["Bitcoin", "Quick Bitcoin payments"],
  // ethereum: ["Ethereum", "Quick Ethereum payments"],
};
