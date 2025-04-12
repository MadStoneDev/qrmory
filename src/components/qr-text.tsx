import { useState, useEffect } from "react";
import { QRControlType } from "@/types/qr-controls";

interface TextSaveData {
  controlType: string;
  text: string;
}

const QRText = ({
  setText,
  setChanged,
  setSaveData,
  initialData,
}: QRControlType) => {
  // State to track the entered text
  const [enteredText, setEnteredText] = useState(initialData?.text || "");
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from saved data if available
  useEffect(() => {
    if (initialData && !isInitialized) {
      setEnteredText(initialData.text || "");
      setIsInitialized(true);

      // Update parent with initial value
      if (initialData.text) {
        setText(initialData.text);
      }
    }
  }, [initialData, isInitialized, setText]);

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
          controlType: "text",
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
