import React, {
  useRef,
  useState,
  useEffect,
  KeyboardEvent,
  ClipboardEvent,
  forwardRef,
  useImperativeHandle,
} from "react";

interface OTPInputProps {
  length: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
}

export interface OTPInputHandle {
  focus: () => void;
  clear: () => void;
  setValue: (value: string) => void;
}

const OTPInput = forwardRef<OTPInputHandle, OTPInputProps>(
  (
    {
      length,
      value,
      onChange,
      disabled = false,
      className = "",
      inputClassName = "",
      autoFocus = false,
    },
    ref,
  ) => {
    const [activeInput, setActiveInput] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Initialize refs array with the correct length
    useEffect(() => {
      // Make sure we have the right number of elements in the refs array
      inputRefs.current = Array(length).fill(null);
    }, [length]);

    // Focus on the first input when component mounts
    useEffect(() => {
      if (autoFocus && inputRefs.current[0]) {
        inputRefs.current[0]?.focus();
      }
    }, [autoFocus]);

    // Ensure proper focus when active input changes
    useEffect(() => {
      if (inputRefs.current[activeInput]) {
        inputRefs.current[activeInput]?.focus();
      }
    }, [activeInput]);

    // Split value string into array to fill inputs
    const valueArray = value.split("").slice(0, length);

    // Get value at specific index
    const getOtpValue = (index: number) => {
      return valueArray[index] || "";
    };

    // Handle input change
    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement>,
      index: number,
    ) => {
      const input = e.target.value;

      // Only allow single digit
      if (input.length > 1) {
        return;
      }

      // Update value through parent's onChange
      const newValue = value.split("");

      // Only accept digits
      if (/^\d*$/.test(input)) {
        newValue[index] = input;
        onChange(newValue.join(""));

        // Move to next input if a digit was entered
        if (input && index < length - 1) {
          setActiveInput(index + 1);
        }
      }
    };

    // Handle key presses
    const handleKeyDown = (
      e: KeyboardEvent<HTMLInputElement>,
      index: number,
    ) => {
      // Handle backspace
      if (e.key === "Backspace") {
        if (getOtpValue(index)) {
          // If current input has a value, clear it
          const newValue = value.split("");
          newValue[index] = "";
          onChange(newValue.join(""));
        } else if (index > 0) {
          // If current input is empty, go to previous input
          setActiveInput(index - 1);
        }
        e.preventDefault();
      }
      // Move left
      else if (e.key === "ArrowLeft" && index > 0) {
        setActiveInput(index - 1);
        e.preventDefault();
      }
      // Move right
      else if (e.key === "ArrowRight" && index < length - 1) {
        setActiveInput(index + 1);
        e.preventDefault();
      }
    };

    // Handle paste
    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasteData = e.clipboardData.getData("text/plain").trim();

      // Only process if the pasted data contains only digits
      if (/^\d+$/.test(pasteData)) {
        // Take only the needed length
        const digitsToUse = pasteData.slice(0, length);

        // Fill in the inputs with the pasted digits
        onChange(
          digitsToUse.padEnd(value.length, value.slice(digitsToUse.length)),
        );

        // Focus on the next empty input or last input
        const nextEmptyIndex =
          digitsToUse.length < length ? digitsToUse.length : length - 1;
        setActiveInput(nextEmptyIndex);
      }
    };

    // Handle focus on click
    const handleFocus = (index: number) => {
      setActiveInput(index);
    };

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      focus: () => {
        const firstEmptyIndex = valueArray.findIndex((val) => !val);
        const indexToFocus = firstEmptyIndex !== -1 ? firstEmptyIndex : 0;
        setActiveInput(indexToFocus);
        inputRefs.current[indexToFocus]?.focus();
      },
      clear: () => {
        onChange("");
        setActiveInput(0);
        inputRefs.current[0]?.focus();
      },
      setValue: (newValue: string) => {
        onChange(newValue);
        const nextEmptyIndex = Math.min(newValue.length, length - 1);
        setActiveInput(nextEmptyIndex);
        inputRefs.current[nextEmptyIndex]?.focus();
      },
    }));

    return (
      <div className={`flex gap-2 ${className}`}>
        {Array.from({ length }, (_, index) => (
          <input
            key={index}
            ref={(element) => {
              inputRefs.current[index] = element;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={getOtpValue(index)}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            onFocus={() => handleFocus(index)}
            disabled={disabled}
            className={`w-12 h-12 text-center text-xl border rounded-md focus:outline-none focus:border-2 ${inputClassName}`}
            aria-label={`OTP digit ${index + 1}`}
          />
        ))}
      </div>
    );
  },
);

export default OTPInput;
