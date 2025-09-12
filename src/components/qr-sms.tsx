// components/qr-sms.tsx
import { useState, useEffect } from "react";
import { QRControlType } from "@/types/qr-controls";

interface SMSSaveData {
  controlType: string;
  phoneNumber: string;
  message: string;
}

export default function QRSMS({
  setText,
  setChanged,
  setSaveData,
  initialData,
}: QRControlType) {
  const [phoneNumber, setPhoneNumber] = useState(
    initialData?.phoneNumber || "",
  );
  const [message, setMessage] = useState(initialData?.message || "");
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from saved data if available
  useEffect(() => {
    if (initialData && !isInitialized) {
      setPhoneNumber(initialData.phoneNumber || "");
      setMessage(initialData.message || "");
      setIsInitialized(true);

      // Update parent with initial value
      if (initialData.phoneNumber) {
        updateParentValue(initialData.phoneNumber, initialData.message || "");
      }
    }
  }, [initialData, isInitialized]);

  // Format phone number (basic formatting)
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, "");

    // Add + prefix if not present and has content
    if (cleaned.length > 0 && !cleaned.startsWith("+")) {
      return "+" + cleaned;
    }

    return cleaned.length > 0 ? "+" + cleaned : "";
  };

  // Update parent component with SMS URL
  const updateParentValue = (phone: string, msg: string) => {
    if (phone.length > 0) {
      const formattedPhone = formatPhoneNumber(phone);
      let smsUrl = `sms:${formattedPhone}`;

      // Add message if provided
      if (msg.length > 0) {
        smsUrl += `?body=${encodeURIComponent(msg)}`;
      }

      setText(smsUrl);

      if (setSaveData) {
        const saveData: SMSSaveData = {
          controlType: "sms",
          phoneNumber: formattedPhone,
          message: msg,
        };
        setSaveData(saveData);
      }
    } else {
      setText("");
      if (setSaveData) setSaveData(null);
    }
    setChanged(true);
  };

  // Handle phone number change
  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPhoneNumber(value);
    updateParentValue(value, message);
  };

  // Handle message change
  const handleMessageChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const value = event.target.value;
    setMessage(value);
    updateParentValue(phoneNumber, value);
  };

  return (
    <section className="flex flex-col">
      <label className="control-label">
        Phone Number*:
        <p className="font-sansLight italic text-neutral-400 text-sm">
          Include country code (e.g., +61 for Australia, +1 for US)
        </p>
        <input
          type="tel"
          className="control-input w-full"
          placeholder="+61412345678"
          value={phoneNumber}
          onChange={handlePhoneChange}
          maxLength={20}
        />
      </label>

      <label className="control-label">
        Message (optional):
        <p className="font-sansLight italic text-neutral-400 text-sm">
          Pre-filled message text
        </p>
        <textarea
          className="control-input w-full"
          placeholder="Hello! I wanted to share this with you..."
          value={message}
          onChange={handleMessageChange}
          rows={3}
          maxLength={160}
        />
      </label>

      {message.length > 0 && (
        <div className="text-xs text-neutral-500 mt-1">
          {message.length}/160 characters
        </div>
      )}

      {/* Preview */}
      {phoneNumber.length > 0 && (
        <div className="pt-3 rounded-lg border bg-neutral-50 border-neutral-200">
          <p className="px-3 text-xs font-medium uppercase text-neutral-500">
            Preview
          </p>
          <div className="mt-3 p-3 bg-white rounded-md mx-3 mb-3 border">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-sm">SMS Message</div>
                <div className="text-xs text-neutral-500">
                  {formatPhoneNumber(phoneNumber)}
                </div>
              </div>
            </div>
            {message && (
              <div className="text-sm text-neutral-700 bg-neutral-100 p-2 rounded">
                {message}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
