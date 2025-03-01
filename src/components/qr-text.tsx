import { QRControlType } from "@/types/qr-controls";

const QRText = ({ setText, setChanged }: QRControlType) => {
  return (
    <>
      <label className="flex items-center control-label">
        Enter Text Message:
        <input
          type="text"
          className="control-input"
          onChange={(el) => {
            setText(el.target.value);
            setChanged(true);
          }}
        />
      </label>
    </>
  );
};

export default QRText;
