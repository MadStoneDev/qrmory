"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { IconCheck, IconX } from "@tabler/icons-react";

interface SuccessNotificationProps {
  searchParams: {
    success?: string;
    booster_success?: string;
    canceled?: string;
  };
}

export default function SuccessNotification({
  searchParams,
}: SuccessNotificationProps) {
  useEffect(() => {
    if (searchParams.success === "true") {
      toast("Subscription successful!", {
        description:
          "Your subscription has been activated. You can now create more QR codes!",
        icon: <IconCheck size={16} />,
        style: {
          backgroundColor: "rgb(220, 252, 231)",
          color: "rgb(22, 101, 52)",
        },
      });

      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete("success");
      window.history.replaceState({}, "", url.toString());
    }

    if (searchParams.booster_success === "true") {
      toast("Booster package purchased!", {
        description:
          "Your additional QR codes have been added to your account.",
        icon: <IconCheck size={16} />,
        style: {
          backgroundColor: "rgb(220, 252, 231)",
          color: "rgb(22, 101, 52)",
        },
      });

      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete("booster_success");
      window.history.replaceState({}, "", url.toString());
    }

    if (searchParams.canceled === "true") {
      toast("Payment canceled", {
        description: "No worries! You can upgrade your subscription anytime.",
        icon: <IconX size={16} />,
        style: {
          backgroundColor: "rgb(254, 242, 242)",
          color: "rgb(153, 27, 27)",
        },
      });

      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete("canceled");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  return null; // This component only shows toasts
}
