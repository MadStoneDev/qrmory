"use client";

import React, { ChangeEvent, FormEvent, useState, useCallback, useRef } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import AuthText from "@/components/auth-text";
import { IconCheck, IconLoader2 } from "@tabler/icons-react";

type FormStatus = "idle" | "submitting" | "success" | "error";

export default function ContactForm() {
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    setFormData({ ...formData, [target.name]: target.value });
    // Clear error when user starts typing
    if (status === "error") {
      setStatus("idle");
      setErrorMessage("");
    }
  };

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setStatus("submitting");
      setErrorMessage("");

      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...formData, turnstileToken }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Failed to send message");
        }

        setStatus("success");
        // Clear form on success
        setFormData({ name: "", email: "", message: "" });
        setTurnstileToken("");
        turnstileRef.current?.reset();
      } catch (error) {
        setStatus("error");
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to send message"
        );
        turnstileRef.current?.reset();
        setTurnstileToken("");
      }
    },
    [turnstileToken, formData]
  );

  const isValid =
    formData.name.length >= 2 &&
    formData.email.length >= 5 &&
    formData.message.length >= 10;

  // Show success state
  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 mb-6 bg-green-100 rounded-full flex items-center justify-center">
          <IconCheck className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-neutral-800 mb-2">
          Message Sent!
        </h3>
        <p className="text-neutral-600 mb-6">
          Thanks for reaching out. We'll get back to you as soon as possible.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="text-qrmory-purple-600 hover:text-qrmory-purple-800 font-medium"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <AuthText
        type="text"
        name="name"
        label="Your name"
        placeholder="eg. Donato di Niccolò"
        value={formData.name}
        onChange={handleChange}
      />

      <AuthText
        type="email"
        name="email"
        label="Your email address"
        placeholder="eg. donatello@tmnt.com"
        value={formData.email}
        onChange={handleChange}
      />

      <div className="grid gap-1">
        <label
          htmlFor="message"
          className="text-xs text-neutral-500 font-light"
        >
          Message
        </label>

        <textarea
          name="message"
          id="message"
          placeholder="Let us know how we can help make QRmory even better!"
          value={formData.message}
          onChange={handleChange}
          className="py-1 md:py-2 border-b border-b-neutral-200 focus-visible:outline-none focus-visible:border-b-qrmory-purple-500 focus-visible:ring-1 focus-visible:ring-qrmory-purple-500 h-[120px] resize-none text-sm md:text-base placeholder-neutral-300 transition-all duration-300"
        />
      </div>

      {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
        <Turnstile
          ref={turnstileRef}
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          onSuccess={setTurnstileToken}
          onError={() => setTurnstileToken("")}
          onExpire={() => setTurnstileToken("")}
        />
      )}

      {status === "error" && errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!isValid || status === "submitting" || !turnstileToken}
        className="py-2 w-full bg-qrmory-purple-500 disabled:bg-neutral-300 rounded-md text-white text-sm md:text-base font-bold flex items-center justify-center gap-2 transition-colors"
      >
        {status === "submitting" ? (
          <>
            <IconLoader2 className="w-4 h-4 animate-spin" />
            Sending...
          </>
        ) : (
          "Send"
        )}
      </button>
    </form>
  );
}
