import { QRControlsObject } from "@/types/qr-controls";

import QRFacebook from "@/components/qr-facebook";
import QRInstagram from "@/components/qr-instagram";
import QRText from "@/components/qr-text";
import QRTwitter from "@/components/qr-twitter";
import QRWebsite from "@/components/qr-website";
import QRYoutube from "@/components/qr-youtube";

export const qrControls: QRControlsObject = {
  website: {
    title: "Website",
    description: "Link to a page or site",
    component: (setText: Function, setChanged: Function) => (
      <QRWebsite setText={setText} setChanged={setChanged} />
    ),
  },
  facebook: {
    title: "Facebook",
    description: "Facebook page/group",
    component: (setText: Function, setChanged: Function) => (
      <QRFacebook setText={setText} setChanged={setChanged} />
    ),
  },
  instagram: {
    title: "Instagram",
    description: "Instagram account",
    component: (setText: Function, setChanged: Function) => (
      <QRInstagram setText={setText} setChanged={setChanged} />
    ),
  },
  twitter: {
    title: "Twitter",
    description: "Twitter account",
    component: (setText: Function, setChanged: Function) => (
      <QRTwitter setText={setText} setChanged={setChanged} />
    ),
  },
  youTube: {
    title: "YouTube",
    description: "YouTube video",
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
  // eBusinessCard: ["E-Biz Card", "The modern business card"],
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
  text: {
    title: "Text",
    description: "Display a text message",
    component: (setText: Function, setChanged: Function) => (
      <QRText setText={setText} setChanged={setChanged} />
    ),
  },
  // wifi: ["WiFi", "Share WiFi details"],
  // location: ["Location", "Share a map address"],
  // bitcoin: ["Bitcoin", "Quick Bitcoin payments"],
  // ethereum: ["Ethereum", "Quick Ethereum payments"],
};
