// src/app/(private)/dashboard/my-codes/page.tsx
import { createClient } from "@/utils/supabase/server";
import { DEFAULT_SETTINGS } from "@/lib/default-settings";
import { getUserQRCodes, getUserSettings } from "@/utils/supabase/queries";

import MyCodesList from "@/components/my-codes-list";
import Link from "next/link";

export const metadata = {
  title: "My Codes",
  description: "Your QR Codes that you've created.",
};

export default async function MyCodes() {
  const supabase = await createClient();

  const [codes, userSettings] = await Promise.all([
    getUserQRCodes(supabase),
    getUserSettings(supabase),
  ]);

  const settings = {
    ...DEFAULT_SETTINGS,
    ...(userSettings?.settings || {}),
  };

  return (
    <section className="flex flex-col w-full">
      <h1 className="mb-4 text-xl font-bold">My QR Codes</h1>

      {(!codes || codes.length === 0) && (
        <div className="text-center my-10 p-8 bg-neutral-50 rounded-xl">
          <h3 className="text-xl font-semibold mb-2">No QR Codes Yet</h3>
          <p className="text-neutral-600 mb-4">
            You haven't created any QR codes yet. Get started by creating your
            first one!
          </p>

          <Link
            href={"/dashboard/create"}
            className="inline-block bg-qrmory-purple-800 text-white px-4 py-2 rounded-lg"
          >
            Create QR Code
          </Link>
        </div>
      )}

      {codes && codes.length > 0 && (
        <MyCodesList codes={codes} settings={settings} />
      )}
    </section>
  );
}
