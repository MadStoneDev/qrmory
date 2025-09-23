import React, { useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface Props {
  options: Option[];
  className?: string;
  onChange?: (value: string) => void;
  prefix?: string;
  suffix?: string;
  value?: string;
}

export default function SelectSwitch({
  options = [],
  className,
  onChange,
  prefix = "",
  suffix = "",
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
      className={`m-2 p-1 relative grid max-w-xs bg-neutral-200 ${className}`}
      style={{
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
      }}
      {...props}
    >
      {options.map((option, index) => (
        <button
          key={option.value}
          className={`p-2 col-span-1 text-center z-10 transition-all duration-200 text-sm tracking-wide ${
            currentValue === option.value
              ? "text-white"
              : "text-qrmory-purple-800/50"
          }`}
          onClick={() => handleOptionClick(option.value)}
        >
          {prefix}
          {option.label}
          {suffix}
        </button>
      ))}
      <div
        className={`absolute left-1 top-1 bottom-1 bg-qrmory-purple-800 rounded-lg transition-all duration-300`}
        style={{
          width: `calc((100% / ${options.length}) - 0.125rem)`,
          transform: `translateX(${selectedOptionIndex * 100}%)`,
        }}
      ></div>
    </article>
  );
}
