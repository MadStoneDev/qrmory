import React, { useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface Props {
  options: Option[];
  className?: string;
  onChange?: (value: string) => void;
  value?: string;
}

export default function SelectSwitch({
  options = [],
  className,
  onChange,
  value: propValue,
  ...props
}: Props) {
  // States
  const [selectedOption, setSelectedOption] = useState(
    propValue || options[0]?.value,
  );
  const currentValue = propValue !== undefined ? propValue : selectedOption;

  // Functions
  const handleOptionClick = (optionValue: string) => {
    if (propValue !== undefined) {
      setSelectedOption(optionValue);
    }

    onChange?.(optionValue);
  };

  const selectedOptionIndex = options.findIndex(
    (option) => option.value === currentValue,
  );

  return (
    <article
      className={`m-2 p-1 relative grid grid-cols-${options.length} max-w-xs bg-stone-200 ${className}`}
      {...props}
    >
      {options.map((option, index) => (
        <button
          key={option.value}
          className={`p-2 text-center z-10 transition-all duration-200 text-sm tracking-wide ${
            currentValue === option.value
              ? "text-white"
              : "text-qrmory-purple-800/50"
          }`}
          onClick={() => handleOptionClick(option.value)}
        >
          {option.label} billing
        </button>
      ))}
      <div
        className={`absolute left-1.5 top-1.5 bottom-1.5 bg-qrmory-purple-800 rounded-lg transition-all duration-300`}
        style={{
          width: `calc((100% / ${options.length}) - 0.375rem)`,
          transform: `translateX(${selectedOptionIndex * 100}%)`,
        }}
      ></div>
    </article>
  );
}
