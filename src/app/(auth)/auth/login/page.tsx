import { LoginBlock } from "@/components/login-block";
import { createClient } from "@/utils/supabase/server";

export const metadata = {
  title: "Login to your account | QRmory",
  description:
    "Access your arsenal of QR Codes to create, manage, and customize dynamic QR codes with ease.",
};

export async function fetchUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export default async function SignUpPage() {
  console.log(await fetchUser());

  return <LoginBlock />;
}
