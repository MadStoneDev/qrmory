import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Custom Domains | QRmory",
  description: "Manage your custom domains for branded QR code links.",
};

export default function DomainsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
