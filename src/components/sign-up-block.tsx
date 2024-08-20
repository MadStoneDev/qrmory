"use client";

import Link from "next/link";
import { ChangeEvent, EventHandler, useState } from "react";

import { signup } from "@/app/(auth)/actions";
import AuthText from "@/components/auth-text";

export default function SignUpBlock() {
  // States
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Functions
  const handleChange = (event: ChangeEvent) => {
    const target = event.target as HTMLInputElement;

    setFormData({
      ...formData,
      [target.name]: target.value,
    });
  };

  return (
    <form className={`grid gap-10 w-full max-w-xs`}>
      <article>
        <h1 className={`md:text-xl font-bold`}>Welcome to QRmory!</h1>
        <h2 className={`text-sm md:text-base text-neutral-600 font-light`}>
          Let's create a new account
        </h2>
      </article>
      <AuthText
        type={"email"}
        name={"email"}
        label={"Email Address"}
        placeholder={"eg. yennefer@Vengerberg.com"}
        value={formData.email}
        onChange={handleChange}
      />
      <AuthText
        type={"password"}
        name={"password"}
        label={"Password"}
        placeholder={"eg. 1173!Ciri"}
        value={formData.password}
        onChange={handleChange}
      />
      <AuthText
        type={"password"}
        name={"confirmPassword"}
        label={"Confirm Password"}
        placeholder={"eg. 1173!Ciri"}
        value={formData.confirmPassword}
        onChange={handleChange}
      />
      <article className={`grid gap-3`}>
        <button
          formAction={signup}
          disabled={
            formData.email.length < 6 ||
            formData.password.length < 8 ||
            formData.password !== formData.confirmPassword
          }
          className={`py-2 w-full bg-qrmory-purple-500 disabled:bg-stone-300 rounded-md text-white text-sm md:text-base font-bold`}
        >
          Create!
        </button>
        <h4 className={`text-xs md:text-sm font-light text-center`}>
          Already have an account?{" "}
          <Link href={"/login"} className={`group relative font-bold`}>
            Login here
            <div
              className={`absolute left-0 -bottom-0.5 w-0 group-hover:w-full h-[1px] bg-qrmory-purple-500 transition-all duration-300`}
            ></div>
          </Link>
          .
        </h4>
      </article>
    </form>
  );
}
