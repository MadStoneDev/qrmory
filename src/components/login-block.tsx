"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState, useEffect } from "react";

import { handleAuth, verifyOtp } from "@/app/(auth)/login/actions";
import AuthText from "@/components/auth-text";
import OTPInput from "@/components/otp-input";

export const LoginBlock = () => {
  // Hooks
  const router = useRouter();

  // States
  const [magicCodeSent, setMagicCodeSent] = useState(false);
  const [otp, setOtp] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [isEmailDirty, setIsEmailDirty] = useState(false);

  const [countdownTime, setCountdownTime] = useState(60);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSentTimestamp, setLastSentTimestamp] = useState<number | null>(
    null,
  );

  const [formData, setFormData] = useState({
    email: "",
  });

  // Functions
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length < 6) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append("email", formData.email);
      formDataObj.append("otp", otp);

      const response = await verifyOtp(formDataObj);

      if (!response.success) {
        setIsSubmitting(false);
        return;
      }

      if (response.redirectTo) {
        router.push(response.redirectTo);
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;

    if (target.name === "email") {
      // Prevent spaces completely by removing any space the user tries to type
      const noSpacesValue = target.value.replace(/\s/g, "");

      // Update the form data with the no-spaces value
      setFormData({
        ...formData,
        [target.name]: noSpacesValue,
      });

      if (!isEmailDirty) setIsEmailDirty(true);
      validateEmail(noSpacesValue);
    } else {
      setFormData({
        ...formData,
        [target.name]: target.value,
      });
    }
  };

  const validateEmail = (value: string) => {
    // More comprehensive email regex that prevents consecutive dots and requires proper domain format
    const emailRegex =
      /^[a-zA-Z0-9](?:[a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/;
    setIsValidEmail(emailRegex.test(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidEmail) return;

    setIsLoading(true);
    setIsSubmitting(true);
    setError(null);

    // Create FormData object
    const formDataObj = new FormData();
    formDataObj.append("email", formData.email);

    try {
      const response = await handleAuth(formDataObj);

      if (!response.success) {
        setError(response.error || "Something went wrong");
        setIsSubmitting(false);
        return;
      }

      // Show OTP input
      setMagicCodeSent(true);
      // Store email in session storage for potential recovery
      try {
        sessionStorage.setItem("authEmail", formData.email);
      } catch (e) {
        console.error("Storage error:", e);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

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
          setMagicCodeSent(true);
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

    if (magicCodeSent && countdownTime > 0) {
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
  }, [magicCodeSent, countdownTime]);

  // Render magic link sent confirmation
  if (magicCodeSent) {
    return (
      <form
        onSubmit={handleVerifyOtp}
        className={`p-4 grid gap-10 w-full lg:max-w-sm`}
      >
        <article>
          <h1 className={`text-xl font-bold`}>Magic Code Sent!</h1>
          <h2 className={`text-base text-neutral-600 font-light max-w-sm`}>
            We've sent you a magic code to your email address. Remember to check
            your junk folder too just in case.
          </h2>
        </article>

        <OTPInput
          length={6}
          value={otp}
          onChange={(value) => setOtp(value)}
          className={`flex w-full`}
          inputClassName={`h-12 w-12 bg-transparent text-xl text-qrmory-purple-600 border-neutral-300 focus:border-qrmory-purple-600 font-bold`}
          autoFocus
        />

        <button
          type={`submit`}
          className={`p-3 rounded-lg bg-qrmory-purple-500 text-neutral-50 font-bold ${
            isSubmitting ? "opacity-70" : ""
          }`}
          disabled={otp.length !== 6 || isSubmitting}
        >
          {isSubmitting ? "Verifying..." : "Verify Code"}
        </button>

        <span className="mt-2 text-sm text-neutral-600 ">
          {countdownTime > 0
            ? `You can request another link in ${countdownTime} seconds`
            : "You can now request another link"}
        </span>
        {countdownTime === 0 && (
          <button
            type={`button`}
            onClick={() => setMagicCodeSent(false)}
            className="mt-2 self-center px-4 py-1 bg-white text-emerald-600 rounded-md text-sm font-semibold"
          >
            Send a new link
          </button>
        )}
      </form>
    );
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className={`p-4 grid gap-10 w-full lg:max-w-sm`}
      >
        <article>
          <h1 className={`text-xl font-bold`}>Welcome Back!</h1>
          <h2 className={`text-base text-neutral-600 font-light`}>
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

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <article className={`grid gap-3`}>
          <button
            type="submit"
            disabled={
              (magicCodeSent && countdownTime > 0) ||
              formData.email.length < 6 ||
              isLoading
            }
            className={`py-2 w-full bg-qrmory-purple-500 disabled:bg-stone-300 rounded-md text-white text-base font-bold`}
          >
            {isLoading
              ? "Logging you in..."
              : magicCodeSent && countdownTime > 0
                ? `You can retry in (${countdownTime})`
                : "Send Magic Code"}
          </button>
        </article>
      </form>
    </>
  );
};
