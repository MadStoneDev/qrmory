// components/qr-tiktok.tsx
import { useState, useEffect } from "react";
import { QRControlType } from "@/types/qr-controls";
import { IconBrandTiktok } from "@tabler/icons-react";

interface TikTokSaveData {
  controlType: string;
  username: string;
}

export default function QRTikTok({
  setText,
  setChanged,
  setSaveData,
  initialData,
}: QRControlType) {
  const [username, setUsername] = useState(initialData?.username || "");
  const [isInitialized, setIsInitialized] = useState(false);

  const mainLink = "tiktok.com/@";

  useEffect(() => {
    if (initialData && !isInitialized) {
      setUsername(initialData.username || "");
      setIsInitialized(true);

      if (initialData.username) {
        updateParentValue(initialData.username);
      }
    }
  }, [initialData, isInitialized]);

  const updateParentValue = (value: string) => {
    if (value.length > 0) {
      setText(`https://${mainLink}${value}`);

      if (setSaveData) {
        const saveData: TikTokSaveData = {
          controlType: "tiktok",
          username: value,
        };
        setSaveData(saveData);
      }
    } else {
      setText("");
      if (setSaveData) setSaveData(null);
    }
    setChanged(true);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;

    // Clean up if they paste a full URL
    value = value
      .replace("https://www.tiktok.com/@", "")
      .replace("https://tiktok.com/@", "")
      .replace("http://www.tiktok.com/@", "")
      .replace("http://tiktok.com/@", "")
      .replace("www.tiktok.com/@", "")
      .replace("tiktok.com/@", "")
      .replace("@", "");

    setUsername(value);
    updateParentValue(value);
  };

  return (
    <section className="flex flex-col">
      <label className="control-label">
        TikTok Username:
        <p className="font-sansLight italic text-neutral-400 text-sm">
          Enter your TikTok username (without the @)
        </p>
        <div className="flex flex-row flex-nowrap items-center">
          <p className="pt-2 text-qrmory-purple-400 font-bold text-sm md:text-lg">
            {mainLink}
          </p>
          <input
            type="text"
            className="control-input flex-1"
            placeholder="username"
            value={username}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === " ") {
                e.preventDefault();
              }
            }}
          />
        </div>
      </label>

      {/* Preview */}
      {username.length > 0 && (
        <div className="pt-3 rounded-lg border bg-neutral-50 border-neutral-200">
          <p className="px-3 text-xs font-medium uppercase text-neutral-500">
            Preview
          </p>
          <div className="mt-3 p-3 bg-white rounded-md mx-3 mb-3 border">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                <IconBrandTiktok className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="font-medium">@{username}</div>
                <div className="text-sm text-neutral-500">TikTok Profile</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
