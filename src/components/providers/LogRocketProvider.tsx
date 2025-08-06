// components/providers/LogRocketProvider.tsx
"use client";

import { useEffect } from "react";
import LogRocket from "logrocket";

interface LogRocketProviderProps {
  children: React.ReactNode;
  user?: {
    id: string;
    email?: string;
    subscription_level?: number;
  } | null;
}

export function LogRocketProvider({ children, user }: LogRocketProviderProps) {
  useEffect(() => {
    // Initialize LogRocket only in production and in the browser
    if (
      typeof window !== "undefined" &&
      process.env.NEXT_PUBLIC_LOGROCKET_APP_ID
    ) {
      LogRocket.init(process.env.NEXT_PUBLIC_LOGROCKET_APP_ID);

      // Set up error reporting integration
      LogRocket.getSessionURL((sessionURL) => {
        // You can integrate this with your error reporting
        console.log("LogRocket session:", sessionURL);
      });
    }
  }, []);

  // Identify user when they log in
  useEffect(() => {
    if (user && typeof window !== "undefined") {
      LogRocket.identify(user.id, {
        name: user.email?.split("@")[0] || "Unknown",
        email: user.email as string,
        subscriptionLevel: user.subscription_level || 0,
        // Add other user properties you want to track
      });
    }
  }, [user]);

  return <>{children}</>;
}
