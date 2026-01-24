// components/qr-linkedin.tsx
import { useState, useEffect } from "react";
import { QRControlType } from "@/types/qr-controls";
import { IconBrandLinkedin } from "@tabler/icons-react";

interface LinkedInSaveData {
  controlType: string;
  profileType: "personal" | "company";
  username: string;
}

export default function QRLinkedIn({
  setText,
  setChanged,
  setSaveData,
  initialData,
}: QRControlType) {
  const [profileType, setProfileType] = useState<"personal" | "company">(
    initialData?.profileType || "personal"
  );
  const [username, setUsername] = useState(initialData?.username || "");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (initialData && !isInitialized) {
      setProfileType(initialData.profileType || "personal");
      setUsername(initialData.username || "");
      setIsInitialized(true);

      if (initialData.username) {
        updateParentValue(
          initialData.profileType || "personal",
          initialData.username
        );
      }
    }
  }, [initialData, isInitialized]);

  const getLinkedInUrl = (type: "personal" | "company", user: string) => {
    if (type === "company") {
      return `https://linkedin.com/company/${user}`;
    }
    return `https://linkedin.com/in/${user}`;
  };

  const updateParentValue = (type: "personal" | "company", user: string) => {
    if (user.length > 0) {
      setText(getLinkedInUrl(type, user));

      if (setSaveData) {
        const saveData: LinkedInSaveData = {
          controlType: "linkedin",
          profileType: type,
          username: user,
        };
        setSaveData(saveData);
      }
    } else {
      setText("");
      if (setSaveData) setSaveData(null);
    }
    setChanged(true);
  };

  const handleTypeChange = (type: "personal" | "company") => {
    setProfileType(type);
    updateParentValue(type, username);
  };

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;

    // Clean up if they paste a full URL
    value = value
      .replace("https://linkedin.com/in/", "")
      .replace("https://linkedin.com/company/", "")
      .replace("https://www.linkedin.com/in/", "")
      .replace("https://www.linkedin.com/company/", "")
      .replace("http://", "")
      .replace("www.linkedin.com/in/", "")
      .replace("www.linkedin.com/company/", "");

    setUsername(value);
    updateParentValue(profileType, value);
  };

  return (
    <section className="flex flex-col">
      <label className="control-label">
        Profile Type:
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={() => handleTypeChange("personal")}
            className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
              profileType === "personal"
                ? "bg-[#0A66C2] text-white border-[#0A66C2]"
                : "bg-white text-neutral-700 border-neutral-300 hover:border-[#0A66C2]"
            }`}
          >
            Personal Profile
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("company")}
            className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
              profileType === "company"
                ? "bg-[#0A66C2] text-white border-[#0A66C2]"
                : "bg-white text-neutral-700 border-neutral-300 hover:border-[#0A66C2]"
            }`}
          >
            Company Page
          </button>
        </div>
      </label>

      <label className="control-label">
        {profileType === "personal" ? "Profile Username" : "Company Page ID"}*:
        <p className="font-sansLight italic text-neutral-400 text-sm">
          {profileType === "personal"
            ? "Your LinkedIn profile URL ending (e.g., john-smith-123456)"
            : "Your company page URL ending (e.g., my-company-name)"}
        </p>
        <div className="flex flex-row flex-nowrap items-center">
          <p className="pt-2 text-qrmory-purple-400 font-bold text-sm whitespace-nowrap">
            linkedin.com/{profileType === "personal" ? "in" : "company"}/
          </p>
          <input
            type="text"
            className="control-input flex-1"
            placeholder={
              profileType === "personal" ? "john-smith-123456" : "my-company"
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
              <div className="w-12 h-12 bg-[#0A66C2] rounded-lg flex items-center justify-center">
                <IconBrandLinkedin className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="font-medium">
                  {profileType === "personal"
                    ? "LinkedIn Profile"
                    : "LinkedIn Company Page"}
                </div>
                <div className="text-sm text-[#0A66C2]">
                  {getLinkedInUrl(profileType, username)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
