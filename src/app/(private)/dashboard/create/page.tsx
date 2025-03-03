import { createClient } from "@/utils/supabase/server";
import QRCreator from "@/components/qr-create/qr-creator";

export const metadata = {
  title: "Create a QR Code | QRmory",
  description: "Create a QR Code to share with your friends and family.",
};

async function fetchUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export default async function Create() {
  const user = await fetchUser();

  return (
    <section className={`flex flex-col overflow-y-auto`}>
      <h1 className={`mb-4 text-xl font-bold`}>Create</h1>
      <QRCreator withHeading={false} user={user} />
    </section>
  );
}
