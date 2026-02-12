import { LoginBlock } from "@/components/login-block";
import RecaptchaProvider from "@/components/providers/RecaptchaProvider";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Login to your account",
  description:
    "Access your arsenal of QR Codes to create, manage, and customise dynamic QR codes with ease.",
};

export default async function SignUpPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <RecaptchaProvider>
      <LoginBlock />
    </RecaptchaProvider>
  );
}
