import { useState, useEffect } from "react";
import { QRControlType } from "@/types/qr-controls";

interface TextSaveData {
  text: string;
}

const QRText = ({ setText, setChanged, setSaveData }: QRControlType) => {
  // State to track the entered text
  const [enteredText, setEnteredText] = useState("");

  // Handle input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setEnteredText(newValue);

    // Update parent component
    setText(newValue);
    setChanged(true);

    // Update save data
    if (setSaveData) {
      if (newValue.length > 0) {
        const saveData: TextSaveData = {
          text: newValue,
        };
        setSaveData(saveData);
      } else {
        setSaveData(null);
      }
    }
  };

  return (
    <>
      <label className="flex items-center control-label">
        Enter Text Message:
        <input
          type="text"
          className="control-input"
          placeholder="Enter your message here"
          value={enteredText}
          onChange={handleInputChange}
        />
      </label>
    </>
  );
};

export default QRText;
