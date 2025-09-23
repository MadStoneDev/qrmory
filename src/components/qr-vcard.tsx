import { useState, useEffect } from "react";
import { QRControlType } from "@/types/qr-controls";

interface VCardSaveData {
  controlType: string;
  fullName: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  position: string;
}

export default function QRVCard({
  setText,
  setChanged,
  setSaveData,
  initialData,
}: QRControlType) {
  // States for vCard fields
  const [fullName, setFullName] = useState(initialData?.fullName || "");
  const [company, setCompany] = useState(initialData?.company || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [website, setWebsite] = useState(initialData?.website || "");
  const [position, setPosition] = useState(initialData?.position || "");
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from saved data if available
  useEffect(() => {
    if (initialData && !isInitialized) {
      setFullName(initialData.fullName || "");
      setCompany(initialData.company || "");
      setEmail(initialData.email || "");
      setPhone(initialData.phone || "");
      setWebsite(initialData.website || "");
      setPosition(initialData.position || "");
      setIsInitialized(true);

      // Only update parent if we have required fields
      if (initialData.fullName && (initialData.email || initialData.phone)) {
        // Trigger update to recreate the QR code value
        setTimeout(updateParentValue, 0);
      }
    }
  }, [initialData, isInitialized]);

  // Base64 encode JSON data for privacy
  const encodeVCardData = () => {
    const data = {
      n: fullName,
      org: company,
      email: email,
      tel: phone,
      url: website,
      title: position,
      // Add timestamp to prevent caching issues
      ts: new Date().getTime(),
    };

    // Convert to JSON and encode to Base64
    const jsonStr = JSON.stringify(data);
    // For browser compatibility, we need to first encode to UTF-8
    const encodedData = btoa(unescape(encodeURIComponent(jsonStr)));

    return encodedData;
  };

  // Update parent with vCard URL
  const updateParentValue = () => {
    // Only create QR if at least name and either email or phone is provided
    if (fullName && (email || phone)) {
      const encodedData = encodeVCardData();
      const vCardUrl = `https://qrmory.com/vcard/${encodedData}`;
      setText(vCardUrl);
      setChanged(true);

      // Update save data
      if (setSaveData) {
        const saveData: VCardSaveData = {
          controlType: "vcard",
          fullName,
          company,
          email,
          phone,
          website,
          position,
        };
        setSaveData(saveData);
      }
    } else {
      setText("");
      setChanged(true);
      if (setSaveData) setSaveData(null);
    }
  };

  // Update QR whenever form data changes
  useEffect(() => {
    // Debounce to prevent too many updates when typing
    const timer = setTimeout(() => {
      updateParentValue();
    }, 500);

    return () => clearTimeout(timer);
  }, [fullName, company, email, phone, website, position]);

  // Input change handlers
  const handleInputChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setter(event.target.value);
    };

  return (
    <>
      <label className="control-label block">
        Full Name:
        <input
          type="text"
          className="control-input w-full"
          placeholder="John Doe"
          value={fullName}
          onChange={handleInputChange(setFullName)}
        />
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="control-label block">
          Company:
          <input
            type="text"
            className="control-input w-full"
            placeholder="Company Name"
            value={company}
            onChange={handleInputChange(setCompany)}
          />
        </label>

        <label className="control-label block">
          Position:
          <input
            type="text"
            className="control-input w-full"
            placeholder="Job Title"
            value={position}
            onChange={handleInputChange(setPosition)}
          />
        </label>
      </div>

      <label className="control-label block">
        Email:
        <input
          type="email"
          className="control-input w-full"
          placeholder="email@example.com"
          value={email}
          onChange={handleInputChange(setEmail)}
        />
      </label>

      <label className="control-label block">
        Phone:
        <input
          type="tel"
          className="control-input w-full"
          placeholder="0412 345 678"
          value={phone}
          onChange={handleInputChange(setPhone)}
        />
      </label>

      <label className="control-label block">
        Website:
        <input
          type="url"
          className="control-input w-full"
          placeholder="https://example.com"
          value={website}
          onChange={handleInputChange(setWebsite)}
        />
      </label>

      <div className={`-mt-5 text-xs text-neutral-500`}>
        Rest assured that your information will be encoded in the QR code URL
        for privacy.
      </div>
    </>
  );
}
