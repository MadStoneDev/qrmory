"use client";

import { memo } from "react";
import MyCodeItem from "./my-code-item";
import { UserSettings } from "@/lib/default-settings";

interface QRCode {
  id: string;
  title: string;
  type: string;
  content: Record<string, unknown>;
  qr_value: string;
  shortcode?: string;
  created_at: string;
  is_active: boolean;
  user_id: string;
}

interface User {
  id: string;
  email?: string;
}

interface MyCodesListProps {
  codes: QRCode[];
  settings: UserSettings;
  user?: User;
  subscriptionLevel?: number;
}

function MyCodesList({
  codes,
  settings,
  user,
  subscriptionLevel = 0,
}: MyCodesListProps) {
  if (codes.length === 0) {
    return (
      <div className="text-center py-12 text-neutral-500">
        <p className="text-lg font-medium">No QR codes yet</p>
        <p className="text-sm mt-1">Create your first QR code to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {codes.map((code) => (
        <MyCodeItem
          key={code.id}
          id={code.id}
          title={code.title}
          type={code.type}
          content={code.content}
          qr_value={code.qr_value}
          shortcode={code.shortcode}
          created_at={code.created_at}
          is_active={code.is_active}
          settings={settings}
          user={user}
          subscriptionLevel={subscriptionLevel}
        />
      ))}
    </div>
  );
}

// Memoize the list component
export default memo(MyCodesList);
