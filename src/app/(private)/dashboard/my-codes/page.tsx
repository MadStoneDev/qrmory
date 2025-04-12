import MyCodeItem from "@/components/my-code-item";
import { createClient } from "@/utils/supabase/server";
import { DEFAULT_SETTINGS } from "@/lib/default-settings";

export const metadata = {
  title: "My Codes | QRmory",
  description: "Your QR Codes that you've created.",
};

async function fetchUserSettings(userId: string) {
  if (!userId) return DEFAULT_SETTINGS;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_settings")
    .select("settings")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    console.error("Error fetching user settings:", error);
    return DEFAULT_SETTINGS;
  }

  return {
    ...DEFAULT_SETTINGS,
    ...data.settings,
  };
}

async function fetchCodes() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      codes: [],
      settings: DEFAULT_SETTINGS,
    };
  }

  const { data, error } = await supabase
    .from("qr_codes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const userSettings = await fetchUserSettings(user.id);

  if (error) {
    console.error("Error fetching codes:", error);
    return {
      codes: [],
      settings: userSettings,
    };
  }

  return {
    codes: data || [],
    settings: userSettings,
  }; // Always return an object with codes and settings
}

export default async function MyCodes() {
  const { codes, settings } = await fetchCodes();

  return (
    <section className="flex flex-col w-full">
      <h1 className="mb-4 text-xl font-bold">My QR Codes</h1>
      {codes.length === 0 && (
        <div className="text-center my-10 p-8 bg-gray-50 rounded-xl">
          <h3 className="text-xl font-semibold mb-2">No QR Codes Yet</h3>
          <p className="text-gray-600 mb-4">
            You haven't created any QR codes yet. Get started by creating your
            first one!
          </p>
          <a
            href="/create"
            className="inline-block bg-qrmory-purple-800 text-white px-4 py-2 rounded-lg"
          >
            Create QR Code
          </a>
        </div>
      )}

      <div className="space-y-4">
        {codes.map((code) => (
          <MyCodeItem
            key={code.id}
            id={code.id}
            title={code.title}
            type={code.type}
            content={code.content}
            qr_value={code.qr_value}
            shortcode={code.shortcode}
            created_at={code.created_at}
            is_active={code.is_active}
            settings={settings}
          />
        ))}
      </div>
    </section>
  );
}
