import { useState } from "react";
import { QRControlType } from "@/types/qr-controls";

const QRText = ({ setText, setChanged }: QRControlType) => {
  // State to track the entered text
  const [enteredText, setEnteredText] = useState("");

  // Handle input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setEnteredText(newValue);

    // Update parent component
    setText(newValue);
    setChanged(true);
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
