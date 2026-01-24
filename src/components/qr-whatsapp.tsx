// components/qr-whatsapp.tsx
import { useState, useEffect } from "react";
import { QRControlType } from "@/types/qr-controls";
import { IconBrandWhatsapp } from "@tabler/icons-react";

interface WhatsAppSaveData {
  controlType: string;
  phoneNumber: string;
  message?: string;
}

export default function QRWhatsApp({
  setText,
  setChanged,
  setSaveData,
  initialData,
}: QRControlType) {
  const [phoneNumber, setPhoneNumber] = useState(
    initialData?.phoneNumber || ""
  );
  const [message, setMessage] = useState(initialData?.message || "");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (initialData && !isInitialized) {
      setPhoneNumber(initialData.phoneNumber || "");
      setMessage(initialData.message || "");
      setIsInitialized(true);

      if (initialData.phoneNumber) {
        updateParentValue(initialData.phoneNumber, initialData.message || "");
      }
    }
  }, [initialData, isInitialized]);

  // Format phone number (remove all non-digits)
  const formatPhoneNumber = (value: string) => {
    return value.replace(/\D/g, "");
  };

  // Update parent component with WhatsApp URL
  const updateParentValue = (phone: string, msg: string) => {
    if (phone.length > 0) {
      const formattedPhone = formatPhoneNumber(phone);
      let waUrl = `https://wa.me/${formattedPhone}`;

      if (msg.length > 0) {
        waUrl += `?text=${encodeURIComponent(msg)}`;
      }

      setText(waUrl);

      if (setSaveData) {
        const saveData: WhatsAppSaveData = {
          controlType: "whatsapp",
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

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPhoneNumber(value);
    updateParentValue(value, message);
  };

  const handleMessageChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setMessage(value);
    updateParentValue(phoneNumber, value);
  };

  return (
    <section className="flex flex-col">
      <label className="control-label">
        WhatsApp Number*:
        <p className="font-sansLight italic text-neutral-400 text-sm">
          Include country code without + or spaces (e.g., 61412345678)
        </p>
        <input
          type="tel"
          className="control-input w-full"
          placeholder="61412345678"
          value={phoneNumber}
          onChange={handlePhoneChange}
          maxLength={20}
        />
      </label>

      <label className="control-label">
        Pre-filled Message (optional):
        <p className="font-sansLight italic text-neutral-400 text-sm">
          Message that will appear when chat opens
        </p>
        <textarea
          className="control-input w-full"
          placeholder="Hi! I scanned your QR code and would like to..."
          value={message}
          onChange={handleMessageChange}
          rows={3}
          maxLength={500}
        />
      </label>

      {message.length > 0 && (
        <div className="text-xs text-neutral-500 mt-1">
          {message.length}/500 characters
        </div>
      )}

      {/* Preview */}
      {phoneNumber.length > 0 && (
        <div className="pt-3 rounded-lg border bg-neutral-50 border-neutral-200">
          <p className="px-3 text-xs font-medium uppercase text-neutral-500">
            Preview
          </p>
          <div className="mt-3 p-3 bg-white rounded-md mx-3 mb-3 border">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center">
                <IconBrandWhatsapp className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-medium">WhatsApp Chat</div>
                <div className="text-sm text-neutral-500">
                  +{formatPhoneNumber(phoneNumber)}
                </div>
              </div>
            </div>
            {message && (
              <div className="mt-3 p-2 bg-[#DCF8C6] rounded-lg text-sm">
                {message}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
