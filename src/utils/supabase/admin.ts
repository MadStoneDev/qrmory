import { toDateTime } from "@/utils/helpers";

import { stripe } from "@/utils/stripe/config";
import { createClient } from "@supabase/supabase-js";

import Stripe from "stripe";
import { Database } from "database.types";

export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);
