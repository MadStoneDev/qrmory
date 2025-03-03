﻿import { useState, useEffect } from "react";
import { QRControlType } from "@/types/qr-controls";

export default function QRVCard({ setText, setChanged }: QRControlType) {
  // States for vCard fields
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [position, setPosition] = useState("");

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
    } else {
      setText("");
      setChanged(true);
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

      <div className={`-mt-5 text-xs text-gray-500`}>
        Rest assured that your information will be encoded in the QR code URL
        for privacy.
      </div>
    </>
  );
}
