"use client";

import MyCodeItem from "./my-code-item";
import { UserSettings } from "@/lib/default-settings";

interface MyCodesListProps {
  codes: any[];
  settings: UserSettings;
}

export default function MyCodesList({ codes, settings }: MyCodesListProps) {
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
        />
      ))}
    </div>
  );
}
