// components/qr-appstore.tsx
import { useState, useEffect } from "react";
import { QRControlType } from "@/types/qr-controls";
import { IconBrandApple, IconBrandGooglePlay, IconApps } from "@tabler/icons-react";

interface AppStoreSaveData {
  controlType: string;
  linkType: "landing" | "ios" | "android";
  appName: string;
  iosUrl?: string;
  androidUrl?: string;
  appIcon?: string;
  appDescription?: string;
}

export default function QRAppStore({
  setText,
  setChanged,
  setSaveData,
  initialData,
}: QRControlType) {
  const [linkType, setLinkType] = useState<"landing" | "ios" | "android">(
    initialData?.linkType || "landing"
  );
  const [appName, setAppName] = useState(initialData?.appName || "");
  const [iosUrl, setIosUrl] = useState(initialData?.iosUrl || "");
  const [androidUrl, setAndroidUrl] = useState(initialData?.androidUrl || "");
  const [appDescription, setAppDescription] = useState(
    initialData?.appDescription || ""
  );
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (initialData && !isInitialized) {
      setLinkType(initialData.linkType || "landing");
      setAppName(initialData.appName || "");
      setIosUrl(initialData.iosUrl || "");
      setAndroidUrl(initialData.androidUrl || "");
      setAppDescription(initialData.appDescription || "");
      setIsInitialized(true);

      if (initialData.appName) {
        updateParentValue({
          linkType: initialData.linkType || "landing",
          appName: initialData.appName,
          iosUrl: initialData.iosUrl || "",
          androidUrl: initialData.androidUrl || "",
          appDescription: initialData.appDescription || "",
        });
      }
    }
  }, [initialData, isInitialized]);

  const updateParentValue = (data: {
    linkType: "landing" | "ios" | "android";
    appName: string;
    iosUrl: string;
    androidUrl: string;
    appDescription: string;
  }) => {
    const { linkType: type, appName: name, iosUrl: ios, androidUrl: android } = data;

    // Determine if we have valid URLs based on link type
    let isValid = false;
    let directUrl = "";

    switch (type) {
      case "ios":
        isValid = ios.length > 0;
        directUrl = ios;
        break;
      case "android":
        isValid = android.length > 0;
        directUrl = android;
        break;
      case "landing":
        isValid = name.length > 0 && (ios.length > 0 || android.length > 0);
        break;
    }

    if (isValid) {
      if (type === "landing") {
        // For landing page, we'll create an encoded URL
        const encodedData = btoa(
          unescape(
            encodeURIComponent(
              JSON.stringify({
                appName: name,
                iosUrl: ios,
                androidUrl: android,
                appDescription: data.appDescription,
                ts: Date.now(),
              })
            )
          )
        );
        setText(`${process.env.NEXT_PUBLIC_SITE_URL || "https://qrmory.com"}/app/${encodedData}`);
      } else {
        setText(directUrl);
      }

      if (setSaveData) {
        const saveData: AppStoreSaveData = {
          controlType: "appstore",
          linkType: type,
          appName: name,
          iosUrl: ios,
          androidUrl: android,
          appDescription: data.appDescription,
        };
        setSaveData(saveData);
      }
    } else {
      setText("");
      if (setSaveData) setSaveData(null);
    }
    setChanged(true);
  };

  const handleUpdate = () => {
    updateParentValue({
      linkType,
      appName,
      iosUrl,
      androidUrl,
      appDescription,
    });
  };

  const handleLinkTypeChange = (type: "landing" | "ios" | "android") => {
    setLinkType(type);
    updateParentValue({
      linkType: type,
      appName,
      iosUrl,
      androidUrl,
      appDescription,
    });
  };

  return (
    <section className="flex flex-col">
      {/* Link Type Selection */}
      <label className="control-label">
        Link Type:
        <p className="font-sansLight italic text-neutral-400 text-sm mb-2">
          Choose how users access your app
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => handleLinkTypeChange("landing")}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
              linkType === "landing"
                ? "bg-qrmory-purple-100 border-qrmory-purple-500 text-qrmory-purple-800"
                : "bg-white border-neutral-300 hover:border-qrmory-purple-300"
            }`}
          >
            <IconApps size={24} />
            <div className="text-left">
              <div className="font-medium">Landing Page (Recommended)</div>
              <div className="text-xs text-neutral-500">
                Shows both iOS and Android options on a branded page
              </div>
            </div>
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleLinkTypeChange("ios")}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                linkType === "ios"
                  ? "bg-black text-white border-black"
                  : "bg-white border-neutral-300 hover:border-black"
              }`}
            >
              <IconBrandApple size={20} />
              <span>iOS Only</span>
            </button>

            <button
              type="button"
              onClick={() => handleLinkTypeChange("android")}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                linkType === "android"
                  ? "bg-[#01875F] text-white border-[#01875F]"
                  : "bg-white border-neutral-300 hover:border-[#01875F]"
              }`}
            >
              <IconBrandGooglePlay size={20} />
              <span>Android Only</span>
            </button>
          </div>
        </div>
      </label>

      {/* App Name */}
      <label className="control-label">
        App Name{linkType === "landing" ? "*" : " (optional)"}:
        <input
          type="text"
          className="control-input w-full"
          placeholder="My Awesome App"
          value={appName}
          onChange={(e) => {
            setAppName(e.target.value);
            handleUpdate();
          }}
          onBlur={handleUpdate}
          maxLength={100}
        />
      </label>

      {/* App Description - only for landing page */}
      {linkType === "landing" && (
        <label className="control-label">
          App Description (optional):
          <textarea
            className="control-input w-full"
            placeholder="A brief description of your app..."
            value={appDescription}
            onChange={(e) => {
              setAppDescription(e.target.value);
              handleUpdate();
            }}
            onBlur={handleUpdate}
            rows={2}
            maxLength={200}
          />
        </label>
      )}

      {/* iOS URL */}
      {(linkType === "landing" || linkType === "ios") && (
        <label className="control-label">
          App Store URL (iOS){linkType === "ios" ? "*" : ""}:
          <p className="font-sansLight italic text-neutral-400 text-sm">
            Link from the Apple App Store
          </p>
          <input
            type="url"
            className="control-input w-full"
            placeholder="https://apps.apple.com/app/..."
            value={iosUrl}
            onChange={(e) => {
              setIosUrl(e.target.value);
              handleUpdate();
            }}
            onBlur={handleUpdate}
          />
        </label>
      )}

      {/* Android URL */}
      {(linkType === "landing" || linkType === "android") && (
        <label className="control-label">
          Google Play URL (Android){linkType === "android" ? "*" : ""}:
          <p className="font-sansLight italic text-neutral-400 text-sm">
            Link from the Google Play Store
          </p>
          <input
            type="url"
            className="control-input w-full"
            placeholder="https://play.google.com/store/apps/..."
            value={androidUrl}
            onChange={(e) => {
              setAndroidUrl(e.target.value);
              handleUpdate();
            }}
            onBlur={handleUpdate}
          />
        </label>
      )}

      {/* Preview */}
      {(appName.length > 0 || iosUrl.length > 0 || androidUrl.length > 0) && (
        <div className="pt-3 rounded-lg border bg-neutral-50 border-neutral-200">
          <p className="px-3 text-xs font-medium uppercase text-neutral-500">
            Preview
          </p>
          <div className="mt-3 p-4 bg-white rounded-md mx-3 mb-3 border">
            {linkType === "landing" ? (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-qrmory-purple-500 to-qrmory-purple-700 rounded-2xl flex items-center justify-center mb-3">
                  <IconApps className="w-8 h-8 text-white" />
                </div>
                <div className="font-bold text-lg">{appName || "Your App"}</div>
                {appDescription && (
                  <div className="text-sm text-neutral-500 mt-1">
                    {appDescription}
                  </div>
                )}
                <div className="flex justify-center gap-2 mt-4">
                  {iosUrl && (
                    <div className="flex items-center gap-1 px-3 py-2 bg-black text-white rounded-lg text-sm">
                      <IconBrandApple size={16} />
                      App Store
                    </div>
                  )}
                  {androidUrl && (
                    <div className="flex items-center gap-1 px-3 py-2 bg-[#01875F] text-white rounded-lg text-sm">
                      <IconBrandGooglePlay size={16} />
                      Google Play
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    linkType === "ios" ? "bg-black" : "bg-[#01875F]"
                  }`}
                >
                  {linkType === "ios" ? (
                    <IconBrandApple className="w-6 h-6 text-white" />
                  ) : (
                    <IconBrandGooglePlay className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <div className="font-medium">
                    {appName || (linkType === "ios" ? "App Store" : "Google Play")}
                  </div>
                  <div className="text-sm text-neutral-500">
                    Direct link to {linkType === "ios" ? "iOS" : "Android"} app
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
