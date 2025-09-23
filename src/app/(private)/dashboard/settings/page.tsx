import { IconHome } from "@tabler/icons-react";

import { createClient } from "@/utils/supabase/server";

import { DEFAULT_SETTINGS } from "@/lib/default-settings";
import SettingsComponent from "@/components/settings-component";

interface Setting {
  name: string;
  icon: React.JSX.Element;
}

export const metadata = {
  title: "Settings | QRmory",
  description: "Manage your QRmory account settings",
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

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export default async function SettingsPage() {
  const user = await getUser();
  const settings = user ? await fetchUserSettings(user.id) : DEFAULT_SETTINGS;

  // Variables
  const availableSettings: Setting[] = [
    {
      name: "General",
      icon: <IconHome size={24} />,
    },
    {
      name: "Billing",
      icon: <IconHome size={24} />,
    },
  ];

  return (
    <div className="flex flex-col w-full">
      <h1 className="mb-4 text-xl font-bold">Settings</h1>
      <section className="flex gap-3 h-full">
        {/* TODO: We'll add Settings Navigation in future sprint */}
        {/*<article className="flex flex-col gap-2">*/}
        {/*  <div className="flex items-center gap-1 font-bold">*/}
        {/*    <IconHome size={24} /> General*/}
        {/*  </div>*/}
        {/*</article>*/}

        <SettingsComponent initialSettings={settings} user={user} />
      </section>
    </div>
  );
}
