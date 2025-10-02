// src/app/(private)/dashboard/settings/page.tsx
import { createClient } from "@/utils/supabase/server";
import { getUser, getUserSettings } from "@/utils/supabase/queries";

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

export default async function SettingsPage() {
  const supabase = await createClient();
  const user = await getUser(supabase);
  const userSettings = await getUserSettings(supabase);

  const settings = {
    ...DEFAULT_SETTINGS,
    ...(userSettings?.settings || {}),
  };

  return (
    <div className="flex flex-col w-full">
      <h1 className="mb-4 text-xl font-bold">Settings</h1>
      <section className="flex gap-3 h-full">
        <SettingsComponent initialSettings={settings} user={user} />
      </section>
    </div>
  );
}
