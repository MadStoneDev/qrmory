"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useState } from "react";

import { login } from "@/app/(auth)/actions";
import AuthText from "@/components/auth-text";
import {
  loginWithMagicLink,
  loginWithPassword,
} from "@/app/(auth)/auth/login/actions";

export const LoginBlock = () => {
  // States
  const [showPassword, setShowPassword] = useState(false);
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    try {
      if (useMagicLink) {
        const response = await loginWithMagicLink({
          email: formData.email.trim(),
        });

        if (response.success) {
          setMagicLinkSent(true);
        } else {
          setError(response.error || "Failed to send magic link");
        }
      } else {
        if (!formData.password) {
          setError("Password is required");
          setIsLoading(false);
          return;
        }

        const loginResponse = await loginWithPassword({
          email: formData.email.trim(),
          password: formData.password,
        });

        if (loginResponse?.error) {
          setError(loginResponse.error);
          setIsLoading(false);
          return;
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
        return;
      }

      console.error("Unexpected error during login:", error);
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className={`grid gap-10 w-full max-w-sm`}>
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

      {!useMagicLink && (
        <AuthText
          type={"password"}
          name={"password"}
          label={"Password"}
          placeholder={"eg. 1173!Ciri"}
          value={formData.password}
          onChange={handleChange}
        />
      )}

      {useMagicLink ? (
        <button
          className={`-my-4 mx-auto w-fit text-qrmory-purple-500 font-bold text-sm`}
          onClick={() => setUseMagicLink(false)}
        >
          Login with password instead?
        </button>
      ) : (
        <button
          className={`-my-4 mx-auto w-fit text-qrmory-purple-500 font-bold text-sm`}
          onClick={() => setUseMagicLink(true)}
        >
          Login with magic link instead?
        </button>
      )}

      <article className={`grid gap-3`}>
        <button
          formAction={login}
          disabled={formData.email.length < 6}
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
