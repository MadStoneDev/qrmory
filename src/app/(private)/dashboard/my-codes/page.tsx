import MyCodeItem from "@/components/my-code-item";
import { createClient } from "@/utils/supabase/server";

export const metadata = {
  title: "My Codes | QRmory",
  description: "Your QR Codes that you've created.",
};

async function fetchCodes() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("qr_codes")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching codes:", error);
    return [];
  }

  return data || [];
}

export default async function MyCodes() {
  const codes = await fetchCodes();

  return (
    <section className={`flex flex-col w-full`}>
      <h1 className={`mb-4 text-xl font-bold`}>My Codes</h1>
      {codes.length === 0 && (
        <p className={`text-neutral-400`}>You haven't created any codes yet.</p>
      )}

      {codes.map((code) => (
        <MyCodeItem
          key={code.id}
          title={code.name}
          type={code.type}
          qrValue={code.content}
        />
      ))}
    </section>
  );
}
