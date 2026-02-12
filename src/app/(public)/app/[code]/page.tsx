// app/(public)/app/[code]/page.tsx
import { Metadata } from "next";
import { IconBrandApple, IconBrandGooglePlay, IconApps } from "@tabler/icons-react";

interface AppData {
  appName: string;
  iosUrl?: string;
  androidUrl?: string;
  appDescription?: string;
  ts?: number;
}

function decodeAppData(code: string): AppData | null {
  try {
    const decoded = decodeURIComponent(escape(atob(code)));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const data = decodeAppData(code);

  if (!data) {
    return {
      title: "App Not Found",
    };
  }

  return {
    title: `Download ${data.appName}`,
    description: data.appDescription || `Get ${data.appName} on iOS and Android`,
    openGraph: {
      title: `Download ${data.appName}`,
      description: data.appDescription || `Get ${data.appName} on iOS and Android`,
    },
  };
}

export default async function AppDownloadPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const data = decodeAppData(code);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
        <div className="text-center p-8">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <IconApps className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-800 mb-2">
            App Not Found
          </h1>
          <p className="text-neutral-500">
            This QR code link is invalid or has expired.
          </p>
        </div>
      </div>
    );
  }

  const hasIos = data.iosUrl && data.iosUrl.length > 0;
  const hasAndroid = data.androidUrl && data.androidUrl.length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-qrmory-purple-50 via-white to-qrmory-purple-50 p-4">
      <div className="w-full max-w-md">
        {/* App Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-qrmory-purple-200/30 p-8 text-center">
          {/* App Icon */}
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-qrmory-purple-500 to-qrmory-purple-700 rounded-[28px] flex items-center justify-center mb-6 shadow-lg shadow-qrmory-purple-300/50">
            <IconApps className="w-12 h-12 text-white" />
          </div>

          {/* App Name */}
          <h1 className="text-2xl font-bold text-qrmory-purple-900 mb-2">
            {data.appName}
          </h1>

          {/* Description */}
          {data.appDescription && (
            <p className="text-neutral-600 mb-8">{data.appDescription}</p>
          )}

          {/* Download Buttons */}
          <div className="space-y-3">
            {hasIos && (
              <a
                href={data.iosUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-black hover:bg-neutral-800 text-white rounded-xl transition-colors group"
              >
                <IconBrandApple size={28} />
                <div className="text-left">
                  <div className="text-xs text-neutral-400 group-hover:text-neutral-300">
                    Download on the
                  </div>
                  <div className="text-lg font-semibold -mt-1">App Store</div>
                </div>
              </a>
            )}

            {hasAndroid && (
              <a
                href={data.androidUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 px-6 bg-[#01875F] hover:bg-[#016D4D] text-white rounded-xl transition-colors group"
              >
                <IconBrandGooglePlay size={28} />
                <div className="text-left">
                  <div className="text-xs text-green-200 group-hover:text-green-100">
                    Get it on
                  </div>
                  <div className="text-lg font-semibold -mt-1">Google Play</div>
                </div>
              </a>
            )}
          </div>
        </div>

        {/* QRmory Branding */}
        <div className="mt-6 text-center">
          <a
            href="https://qrmory.com"
            className="text-sm text-neutral-400 hover:text-qrmory-purple-600 transition-colors"
          >
            Powered by <span className="font-semibold">QRmory</span>
          </a>
        </div>
      </div>
    </div>
  );
}
