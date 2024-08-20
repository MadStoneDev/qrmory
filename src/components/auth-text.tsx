import { ChangeEvent } from "react";

const AuthText = ({
  id = "",
  name = "",
  label = "",
  placeholder = "",
  type = "text",
  value = "",
  onChange = (event: ChangeEvent) => {},
}) => {
  return (
    <div className={`grid gap-1`}>
      <label htmlFor={id} className={`text-xs text-neutral-500 font-light`}>
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`py-1 md:py-2 outline-none border-b-neutral-200 focus:border-b-qrmory-purple-500 text-sm md:text-base placeholder-neutral-300 transition-all duration-300`}
      />
    </div>
  );
};

export default AuthText;
