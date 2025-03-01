"use client";

import React, { ChangeEvent, FormEvent } from "react";
import AuthText from "@/components/auth-text";

export default function ContactForm() {
  // Hooks
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    message: "",
  });

  // Functions
  const handleChange = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    setFormData({ ...formData, [target.name]: target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-8`}>
      <AuthText
        type={"text"}
        name={"name"}
        label={"Your name"}
        placeholder={"eg. Donatero"}
        value={formData.name}
        onChange={handleChange}
      />

      <AuthText
        type={"email"}
        name={"email"}
        label={"Your email address"}
        placeholder={"eg. donatello@tmnt.com"}
        value={formData.name}
        onChange={handleChange}
      />

      <div className={`grid gap-1`}>
        <label
          htmlFor={"message"}
          className={`text-xs text-neutral-500 font-light`}
        >
          Message
        </label>

        <textarea
          name={"message"}
          placeholder={"Let us know how we can help make QRmory even better!"}
          value={formData.message}
          onChange={handleChange}
          className={`py-1 md:py-2 outline-none border-b border-b-neutral-200 focus:border-b-qrmory-purple-500 h-[120px] resize-none text-sm md:text-base placeholder-neutral-300 transition-all duration-300`}
        />
      </div>

      <button
        type={"submit"}
        disabled={
          formData.name.length < 3 ||
          formData.email.length < 6 ||
          formData.message.length < 20
        }
        className={`py-2 w-full bg-qrmory-purple-500 disabled:bg-stone-300 rounded-md text-white text-sm md:text-base font-bold`}
      >
        Send
      </button>
    </form>
  );
}
