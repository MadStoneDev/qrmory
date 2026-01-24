// components/qr-discord.tsx
import { useState, useEffect } from "react";
import { QRControlType } from "@/types/qr-controls";
import { IconBrandDiscord } from "@tabler/icons-react";

interface DiscordSaveData {
  controlType: string;
  inviteCode: string;
  serverName?: string;
}

export default function QRDiscord({
  setText,
  setChanged,
  setSaveData,
  initialData,
}: QRControlType) {
  const [inviteCode, setInviteCode] = useState(initialData?.inviteCode || "");
  const [serverName, setServerName] = useState(initialData?.serverName || "");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (initialData && !isInitialized) {
      setInviteCode(initialData.inviteCode || "");
      setServerName(initialData.serverName || "");
      setIsInitialized(true);

      if (initialData.inviteCode) {
        updateParentValue(initialData.inviteCode);
      }
    }
  }, [initialData, isInitialized]);

  const updateParentValue = (code: string) => {
    if (code.length > 0) {
      setText(`https://discord.gg/${code}`);

      if (setSaveData) {
        const saveData: DiscordSaveData = {
          controlType: "discord",
          inviteCode: code,
          serverName: serverName,
        };
        setSaveData(saveData);
      }
    } else {
      setText("");
      if (setSaveData) setSaveData(null);
    }
    setChanged(true);
  };

  const handleCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;

    // Clean up if they paste a full URL
    value = value
      .replace("https://discord.gg/", "")
      .replace("http://discord.gg/", "")
      .replace("https://discord.com/invite/", "")
      .replace("http://discord.com/invite/", "")
      .replace("discord.gg/", "")
      .replace("discord.com/invite/", "");

    setInviteCode(value);
    updateParentValue(value);
  };

  const handleServerNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setServerName(event.target.value);
    // Update save data with server name
    if (inviteCode.length > 0 && setSaveData) {
      const saveData: DiscordSaveData = {
        controlType: "discord",
        inviteCode: inviteCode,
        serverName: event.target.value,
      };
      setSaveData(saveData);
    }
  };

  return (
    <section className="flex flex-col">
      <label className="control-label">
        Discord Invite Code*:
        <p className="font-sansLight italic text-neutral-400 text-sm">
          The invite link code (e.g., from discord.gg/ABC123)
        </p>
        <div className="flex flex-row flex-nowrap items-center">
          <p className="pt-2 text-qrmory-purple-400 font-bold text-sm md:text-lg">
            discord.gg/
          </p>
          <input
            type="text"
            className="control-input flex-1"
            placeholder="ABC123xyz"
            value={inviteCode}
            onChange={handleCodeChange}
            onKeyDown={(e) => {
              if (e.key === " ") {
                e.preventDefault();
              }
            }}
          />
        </div>
      </label>

      <label className="control-label">
        Server Name (optional):
        <p className="font-sansLight italic text-neutral-400 text-sm">
          Display name for your Discord server
        </p>
        <input
          type="text"
          className="control-input w-full"
          placeholder="My Awesome Server"
          value={serverName}
          onChange={handleServerNameChange}
          maxLength={100}
        />
      </label>

      {/* Preview */}
      {inviteCode.length > 0 && (
        <div className="pt-3 rounded-lg border bg-neutral-50 border-neutral-200">
          <p className="px-3 text-xs font-medium uppercase text-neutral-500">
            Preview
          </p>
          <div className="mt-3 p-3 bg-[#36393f] rounded-md mx-3 mb-3 border border-[#202225]">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#5865F2] rounded-2xl flex items-center justify-center">
                <IconBrandDiscord className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-white">
                  {serverName || "Discord Server"}
                </div>
                <div className="text-sm text-[#B9BBBE]">
                  discord.gg/{inviteCode}
                </div>
              </div>
              <button
                type="button"
                className="px-4 py-2 bg-[#3BA55C] text-white text-sm font-medium rounded hover:bg-[#2D7D46] transition-colors"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
