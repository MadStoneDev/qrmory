import { useState } from "react";
import { QRControlType } from "@/types/qr-controls";

export default function QRWifi({ setText, setChanged }: QRControlType) {
  // States
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [encryption, setEncryption] = useState("WPA");
  const [hidden, setHidden] = useState(false);

  // Update the parent component with the WiFi string
  const updateParentValue = () => {
    // Format according to WiFi QR code standard: WIFI:T:WPA;S:MySsid;P:MyPassword;H:true;
    const wifiString = `WIFI:T:${encryption};S:${ssid};P:${password}${
      hidden ? ";H:true" : ""
    };`;
    setText(wifiString);
    setChanged(true);
  };

  // Handle SSID change
  const handleSsidChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSsid(event.target.value);
    setTimeout(updateParentValue, 0); // Run after state update
  };

  // Handle password change
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    setTimeout(updateParentValue, 0); // Run after state update
  };

  // Handle encryption change
  const handleEncryptionChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setEncryption(event.target.value);
    setTimeout(updateParentValue, 0); // Run after state update
  };

  // Handle hidden network toggle
  const handleHiddenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHidden(event.target.checked);
    setTimeout(updateParentValue, 0); // Run after state update
  };

  return (
    <>
      <div className="space-y-4">
        <label className="control-label block">
          Network Name (SSID):
          <input
            type="text"
            className="control-input w-full"
            placeholder="Enter WiFi network name"
            value={ssid}
            onChange={handleSsidChange}
          />
        </label>

        <label className="control-label block">
          Password:
          <input
            type="password"
            className="control-input w-full"
            placeholder="Enter WiFi password"
            value={password}
            onChange={handlePasswordChange}
          />
        </label>

        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <label className="control-label block md:w-1/2">
            Encryption Type:
            <select
              className="control-input w-full text-qrmory-purple-800"
              value={encryption}
              onChange={handleEncryptionChange}
            >
              <option value="WPA">WPA/WPA2/WPA3</option>
              <option value="WEP">WEP</option>
              <option value="nopass">None</option>
            </select>
          </label>

          <div className="control-label flex items-center md:w-1/2">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-qrmory-purple-800 rounded"
                checked={hidden}
                onChange={handleHiddenChange}
              />
              <span className="ml-2">Hidden Network</span>
            </label>
          </div>
        </div>
      </div>
    </>
  );
}
