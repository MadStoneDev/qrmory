"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useState, useEffect } from "react";

import {
  loginWithMagicLink,
  loginWithPassword,
} from "@/app/(auth)/auth/login/actions";
import AuthText from "@/components/auth-text";
import { IconEye } from "@tabler/icons-react";

export const LoginBlock = () => {
  // States
  const [showPassword, setShowPassword] = useState(false);
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [countdownTime, setCountdownTime] = useState(60);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastSentTimestamp, setLastSentTimestamp] = useState<number | null>(
    null,
  );

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Effects
  useEffect(() => {
    const savedData = localStorage.getItem("magicLinkData");

    if (savedData) {
      try {
        const { timestamp, email } = JSON.parse(savedData);
        const currentTime = new Date().getTime();
        const elapsedSeconds = Math.floor((currentTime - timestamp) / 1000);

        // If the countdown is still active
        if (elapsedSeconds < 60) {
          setLastSentTimestamp(timestamp);
          setMagicLinkSent(true);
          setCountdownTime(60 - elapsedSeconds);

          if (email) {
            setFormData((prev) => ({ ...prev, email }));
          }
        } else {
          localStorage.removeItem("magicLinkData");
        }
      } catch (e) {
        console.error("Error parsing stored magic link data:", e);
        localStorage.removeItem("magicLinkData");
      }
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (magicLinkSent && countdownTime > 0) {
      timer = setInterval(() => {
        setCountdownTime((prevTime) => {
          const newTime = prevTime - 1;
          if (newTime <= 0) {
            clearInterval(timer);
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [magicLinkSent, countdownTime]);

  // Functions
  const handleChange = (event: ChangeEvent) => {
    const target = event.target as HTMLInputElement;
    setError("");

    setFormData({
      ...formData,
      [target.name]: target.value,
    });
  };

  const toggleLoginMethod = () => {
    setUseMagicLink(!useMagicLink);
    setError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    if (useMagicLink) {
      // Check if we're still in cooldown
      if (magicLinkSent && countdownTime > 0) {
        setError(
          `Please wait ${countdownTime} seconds before requesting another magic link.`,
        );
        setIsLoading(false);
        return;
      }

      const response = await loginWithMagicLink({
        email: formData.email.trim(),
      });

      if (response.success) {
        // Store timestamp and email in localStorage
        const timestamp = new Date().getTime();
        localStorage.setItem(
          "magicLinkData",
          JSON.stringify({
            timestamp,
            email: formData.email.trim(),
          }),
        );

        setLastSentTimestamp(timestamp);
        setMagicLinkSent(true);
        setCountdownTime(60);
      } else {
        setError(response.error || "Failed to send magic link");
      }
    } else {
      if (!formData.password) {
        setError("Password is required");
        setIsLoading(false);
        return;
      }

      try {
        await loginWithPassword({
          email: formData.email.trim(),
          password: formData.password,
        });
      } catch (error) {
        if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
          // This is expected during redirect - do nothing
          return;
        }

        console.error("Login error:", error);
        setError("An unexpected error occurred. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Determine if login button should be enabled
  const isLoginButtonEnabled = () => {
    const isEmailValid = formData.email.length >= 6;

    if (useMagicLink) {
      // For magic link, only need valid email and not be in a cooldown period
      return isEmailValid && (!magicLinkSent || countdownTime === 0);
    } else {
      // For password login, need valid email and non-empty password
      return isEmailValid && formData.password.trim().length > 0;
    }
  };

  // Render magic link sent confirmation
  if (magicLinkSent) {
    return (
      <div className="mt-16 flex flex-col w-full max-w-full lg:max-w-2xl bg-emerald-500 p-4 rounded-2xl text-white">
        <span className="text-lg font-bold">
          Check your email for the login link.
        </span>
        <span className="text-sm italic text-center">
          We've sent you a magic link to{" "}
          <span className={"font-bold"}>{formData.email}</span>
        </span>
        <span className="mt-2 text-sm">
          {countdownTime > 0
            ? `You can request another link in ${countdownTime} seconds`
            : "You can now request another link"}
        </span>
        {countdownTime === 0 && (
          <button
            onClick={() => setMagicLinkSent(false)}
            className="mt-2 self-center px-4 py-1 bg-white text-emerald-600 rounded-md text-sm font-semibold"
          >
            Send a new link
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`p-4 grid gap-10 w-full max-w-sm`}>
      <article>
        <h1 className={`md:text-xl font-bold`}>Welcome Back!</h1>
        <h2 className={`text-sm md:text-base text-neutral-600 font-light`}>
          Let's get you back into your account
        </h2>
      </article>

      <button
        type="button"
        className={`-my-4 w-fit text-qrmory-purple-500 font-bold text-xs`}
        onClick={toggleLoginMethod}
      >
        {useMagicLink
          ? "Login with password instead?"
          : "Login with magic link instead?"}
      </button>

      <AuthText
        type={"email"}
        name={"email"}
        label={"Email Address"}
        placeholder={"eg. geralt@rivia.com"}
        value={formData.email}
        onChange={handleChange}
      />

      {!useMagicLink && (
        <div className={`relative`}>
          <AuthText
            type={showPassword ? "text" : "password"}
            name={"password"}
            label={"Password"}
            placeholder={"eg. 1173!Ciri"}
            value={formData.password}
            onChange={handleChange}
          />

          <button
            type={`button`}
            className={`absolute right-2 bottom-3 text-neutral-300 hover:text-qrmory-purple-500 transition-all duration-300 ease-in-out`}
            onClick={() => setShowPassword(!showPassword)}
          >
            <IconEye size={24} strokeWidth={2} />
          </button>
        </div>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <article className={`grid gap-3`}>
        <button
          type="submit"
          disabled={!isLoginButtonEnabled() || isLoading}
          className={`py-2 w-full bg-qrmory-purple-500 disabled:bg-stone-300 rounded-md text-white text-sm md:text-base font-bold`}
        >
          {isLoading
            ? "Logging you in..."
            : useMagicLink
              ? "Send Magic Link"
              : "Login"}
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
    </form>
  );
};
