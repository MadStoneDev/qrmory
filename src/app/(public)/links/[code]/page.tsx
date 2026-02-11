// app/links/[code]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

interface LinkItem {
  id: string;
  title: string;
  url: string;
}

interface MultiLinkData {
  pageTitle: string;
  description: string;
  links: LinkItem[];
  backgroundColour: string;
  titleColour: string;
  textColour: string;
  buttonColour: string;
  ts: number;
  creatorId?: string; // Track who created this
}

interface Props {
  params: Promise<{
    code: string;
  }>;
}

function decodeData(encoded: string): MultiLinkData | null {
  try {
    const decoded = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Failed to decode multi-link data:", error);
    return null;
  }
}

async function validateAccess(data: MultiLinkData | null): Promise<boolean> {
  if (!data) return false;

  // If no creator ID, it's from before we tracked this - allow it
  if (!data.creatorId) return true;

  try {
    const supabase = await createClient();

    // Check if the creator still has an active subscription
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_level, subscription_status")
      .eq("id", data.creatorId)
      .single();

    // Allow if creator has active subscription (level > 0) or if they're still active
    if (
      profile &&
      (profile.subscription_level > 0 ||
        profile.subscription_status === "active")
    ) {
      return true;
    }

    // For free users, limit to 5 links max and basic functionality
    if (profile && profile.subscription_level === 0) {
      return data.links.length <= 5;
    }

    return false;
  } catch (error) {
    console.error("Error validating access:", error);
    // On error, allow access but limit functionality
    return data.links.length <= 5;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const data = decodeData(code);

  if (!data) {
    return {
      title: "Multi-Link Page | QRmory",
      description: "A collection of links shared via QR code",
    };
  }

  return {
    title: `${data.pageTitle} | QRmory`,
    description: data.description || `Links shared by ${data.pageTitle}`,
    openGraph: {
      title: data.pageTitle,
      description:
        data.description || `Check out these links from ${data.pageTitle}`,
      type: "website",
    },
  };
}

export default async function MultiLinkViewer({ params }: Props) {
  const { code } = await params;
  const data = decodeData(code);

  if (!data || !data.links?.length) {
    notFound();
  }

  const hasAccess = await validateAccess(data);

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Access Restricted
          </h1>
          <p className="text-gray-600 mb-4">
            This multi-link page requires an active subscription to view.
          </p>
          <a
            href="https://qrmory.com/subscription"
            className="inline-block bg-qrmory-purple-600 text-white px-6 py-2 rounded-lg hover:bg-qrmory-purple-700 transition-colors"
          >
            Upgrade to View
          </a>
        </div>
      </div>
    );
  }

  // Limit links for free users
  const displayLinks =
    data.creatorId && data.links.length > 5
      ? data.links.slice(0, 5)
      : data.links;
  const isLimited = data.links.length > displayLinks.length;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: data.backgroundColour }}
    >
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-8" style={{ color: data.textColour }}>
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: data.titleColour }}
          >
            {data.pageTitle}
          </h1>
          {data.description && (
            <p className="text-sm opacity-80">{data.description}</p>
          )}
        </div>

        <div className="space-y-3">
          {displayLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-4 px-6 rounded-lg text-white font-medium text-center hover:opacity-90 transition-all duration-200 active:scale-95 transform"
              style={{ backgroundColor: data.buttonColour }}
            >
              {link.title}
            </a>
          ))}
        </div>

        {/* Limited access notice */}
        {isLimited && (
          <div
            className="mt-6 p-4 bg-black bg-opacity-20 rounded-lg text-center"
            style={{ color: data.textColour }}
          >
            <p className="text-sm opacity-80 mb-2">
              {data.links.length - displayLinks.length} more links available
            </p>
            <a
              href="https://qrmory.com/subscription"
              className="text-xs underline opacity-70 hover:opacity-90"
            >
              Upgrade to see all links
            </a>
          </div>
        )}

        {/* QRmory branding */}
        <div className="text-center mt-12">
          <a
            href="https://qrmory.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs opacity-60 hover:opacity-80 transition-opacity"
            style={{ color: data.textColour }}
          >
            Powered by QRmory
          </a>
        </div>
      </div>
    </div>
  );
}
