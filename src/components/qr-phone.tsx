// components/qr-phone.tsx
import { useState, useEffect } from "react";
import { QRControlType } from "@/types/qr-controls";
import { IconPhone } from "@tabler/icons-react";

interface PhoneSaveData {
  controlType: string;
  phoneNumber: string;
  label?: string;
}

export default function QRPhone({
  setText,
  setChanged,
  setSaveData,
  initialData,
}: QRControlType) {
  const [phoneNumber, setPhoneNumber] = useState(
    initialData?.phoneNumber || ""
  );
  const [label, setLabel] = useState(initialData?.label || "");
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from saved data if available
  useEffect(() => {
    if (initialData && !isInitialized) {
      setPhoneNumber(initialData.phoneNumber || "");
      setLabel(initialData.label || "");
      setIsInitialized(true);

      if (initialData.phoneNumber) {
        updateParentValue(initialData.phoneNumber, initialData.label || "");
      }
    }
  }, [initialData, isInitialized]);

  // Format phone number
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length > 0) {
      return "+" + cleaned;
    }
    return "";
  };

  // Update parent component with tel: URL
  const updateParentValue = (phone: string, labelValue: string) => {
    if (phone.length > 0) {
      const formattedPhone = formatPhoneNumber(phone);
      setText(`tel:${formattedPhone}`);

      if (setSaveData) {
        const saveData: PhoneSaveData = {
          controlType: "phone",
          phoneNumber: formattedPhone,
          label: labelValue,
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
    updateParentValue(value, label);
  };

  const handleLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setLabel(value);
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
        Label (optional):
        <p className="font-sansLight italic text-neutral-400 text-sm">
          A name or description for this number
        </p>
        <input
          type="text"
          className="control-input w-full"
          placeholder="e.g. Customer Support"
          value={label}
          onChange={handleLabelChange}
          maxLength={50}
        />
      </label>

      {/* Preview */}
      {phoneNumber.length > 0 && (
        <div className="pt-3 rounded-lg border bg-neutral-50 border-neutral-200">
          <p className="px-3 text-xs font-medium uppercase text-neutral-500">
            Preview
          </p>
          <div className="mt-3 p-3 bg-white rounded-md mx-3 mb-3 border">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <IconPhone className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-medium">
                  {label || "Phone Call"}
                </div>
                <div className="text-sm text-neutral-500">
                  {formatPhoneNumber(phoneNumber)}
                </div>
                <div className="text-xs text-green-600 mt-1">
                  Tap to call
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
