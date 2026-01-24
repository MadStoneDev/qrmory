// components/qr-telegram.tsx
import { useState, useEffect } from "react";
import { QRControlType } from "@/types/qr-controls";
import { IconBrandTelegram } from "@tabler/icons-react";

interface TelegramSaveData {
  controlType: string;
  linkType: "user" | "group" | "channel";
  username: string;
}

export default function QRTelegram({
  setText,
  setChanged,
  setSaveData,
  initialData,
}: QRControlType) {
  const [linkType, setLinkType] = useState<"user" | "group" | "channel">(
    initialData?.linkType || "user"
  );
  const [username, setUsername] = useState(initialData?.username || "");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (initialData && !isInitialized) {
      setLinkType(initialData.linkType || "user");
      setUsername(initialData.username || "");
      setIsInitialized(true);

      if (initialData.username) {
        updateParentValue(initialData.linkType || "user", initialData.username);
      }
    }
  }, [initialData, isInitialized]);

  const updateParentValue = (
    type: "user" | "group" | "channel",
    value: string
  ) => {
    if (value.length > 0) {
      setText(`https://t.me/${value}`);

      if (setSaveData) {
        const saveData: TelegramSaveData = {
          controlType: "telegram",
          linkType: type,
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

  const handleTypeChange = (type: "user" | "group" | "channel") => {
    setLinkType(type);
    updateParentValue(type, username);
  };

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;

    // Clean up if they paste a full URL
    value = value
      .replace("https://t.me/", "")
      .replace("http://t.me/", "")
      .replace("t.me/", "")
      .replace("@", "");

    setUsername(value);
    updateParentValue(linkType, value);
  };

  const getLinkTypeLabel = () => {
    switch (linkType) {
      case "user":
        return "Username";
      case "group":
        return "Group Link";
      case "channel":
        return "Channel Link";
    }
  };

  return (
    <section className="flex flex-col">
      <label className="control-label">
        Link Type:
        <div className="flex gap-2 mt-2">
          {(["user", "group", "channel"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleTypeChange(type)}
              className={`flex-1 py-2 px-3 rounded-lg border transition-colors text-sm ${
                linkType === type
                  ? "bg-[#0088CC] text-white border-[#0088CC]"
                  : "bg-white text-neutral-700 border-neutral-300 hover:border-[#0088CC]"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </label>

      <label className="control-label">
        {getLinkTypeLabel()}*:
        <p className="font-sansLight italic text-neutral-400 text-sm">
          {linkType === "user"
            ? "Enter the Telegram username"
            : linkType === "group"
            ? "Enter the group invite link or username"
            : "Enter the channel username"}
        </p>
        <div className="flex flex-row flex-nowrap items-center">
          <p className="pt-2 text-qrmory-purple-400 font-bold text-sm md:text-lg">
            t.me/
          </p>
          <input
            type="text"
            className="control-input flex-1"
            placeholder={
              linkType === "user"
                ? "username"
                : linkType === "group"
                ? "joinchat/ABC123 or groupname"
                : "channelname"
            }
            value={username}
            onChange={handleUsernameChange}
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
              <div className="w-12 h-12 bg-[#0088CC] rounded-full flex items-center justify-center">
                <IconBrandTelegram className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="font-medium">
                  {linkType === "user"
                    ? "Telegram User"
                    : linkType === "group"
                    ? "Telegram Group"
                    : "Telegram Channel"}
                </div>
                <div className="text-sm text-[#0088CC]">t.me/{username}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
