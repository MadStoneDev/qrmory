"use client";

import AuthText from "@/components/auth-text";
import Link from "next/link";
import { ChangeEvent, useState } from "react";
import { login } from "@/app/(auth)/actions";

export const LoginBlock = () => {
  // States
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
    <section className={`grid gap-10 w-full max-w-xs`}>
      <article>
        <h1 className={`md:text-xl font-bold`}>Welcome Back!</h1>
        <h2 className={`text-sm md:text-base text-neutral-600 font-light`}>
          Let's get you back into your account
        </h2>
      </article>
      <AuthText
        type={"email"}
        name={"email"}
        label={"Email Address"}
        placeholder={"eg. geralt@rivia.com"}
        value={formData.email}
        onChange={handleChange}
      />
      <AuthText
        type={"password"}
        name={"password"}
        label={"Password"}
        placeholder={"eg. Plotka!3"}
        value={formData.password}
        onChange={handleChange}
      />
      <article className={`grid gap-3`}>
        <button
          formAction={login}
          disabled={formData.email.length < 6 || formData.password.length < 8}
          className={`py-2 w-full bg-qrmory-purple-500 disabled:bg-stone-300 rounded-md text-white text-sm md:text-base font-bold`}
        >
          Login!
        </button>
        <h4 className={`text-xs md:text-sm font-light text-center`}>
          Don't have an account yet?{" "}
          <Link href={"/sign-up"} className={`group relative font-bold`}>
            Create one here
            <div
              className={`absolute left-0 -bottom-0.5 w-0 group-hover:w-full h-[1px] bg-qrmory-purple-500 transition-all duration-300`}
            ></div>
          </Link>
          .
        </h4>
      </article>
    </section>
  );
};
