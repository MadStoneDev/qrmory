"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useState } from "react";
import { IconEye } from "@tabler/icons-react";
import AuthText from "@/components/auth-text";
import { SignUp } from "@/app/(auth)/auth/sign-up/actions";

export default function SignUpBlock() {
  // States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordHasFocus, setPasswordHasFocus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [passwordValidation, setPasswordValidation] = useState({
    atLeast8: false,
    atLeast1Uppercase: false,
    atLeast1Lowercase: false,
    atLeast1Number: false,
    atLeast1Special: false,
  });

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Functions
  const handleChange = (event: ChangeEvent) => {
    const target = event.target as HTMLInputElement;

    setError("");

    setFormData({
      ...formData,
      [target.name]: target.value,
    });

    if (target.name === "password") {
      // Check if password meets requirements
      const passwordLength = target.value.length;
      const passwordUppercase = target.value.match(/[A-Z]/g) || [];
      const passwordLowercase = target.value.match(/[a-z]/g) || [];
      const passwordNumber = target.value.match(/[0-9]/g) || [];
      const passwordSpecial = target.value.match(/[!@#$%^&*]/g) || [];

      setPasswordValidation({
        atLeast8: passwordLength >= 8,
        atLeast1Uppercase: passwordUppercase.length >= 1,
        atLeast1Lowercase: passwordLowercase.length >= 1,
        atLeast1Number: passwordNumber.length >= 1,
        atLeast1Special: passwordSpecial.length >= 1,
      });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Client-side validation
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      console.log("Client: Submitting sign-up form...");

      // Direct approach with try/catch
      const response = await SignUp({
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      console.log("Client: Sign-up response:", response);

      // Handle response
      if (response) {
        if (response.error) {
          setError(
            response.error ||
              "There was an issue creating your account. Please try again.",
          );
        } else if (response.success) {
          // This shouldn't happen due to the redirect, but just in case
          setError(
            "Sign-up successful! Please check your email to confirm your account.",
          );
        }
      } else {
        setError("No response received from the server. Please try again.");
      }
    } catch (error: any) {
      console.error("Client: Sign up error:", error);
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Form validation
  const validateForm = () => {
    // Validate email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError("Please enter a valid email address.");
      return false;
    }

    // Validate password requirements
    let passwordError = false;
    Object.entries(passwordValidation).forEach(([key, value]) => {
      if (!value) {
        passwordError = true;
      }
    });

    if (passwordError) {
      setError("Password does not meet the minimum requirements");
      return false;
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  // Validate all password requirements are met
  const allPasswordRequirementsMet = Object.values(passwordValidation).every(
    (value) => value === true,
  );

  // Check if form is valid for submission
  const isFormValid =
    formData.email.length >= 6 &&
    allPasswordRequirementsMet &&
    formData.password === formData.confirmPassword;

  return (
    <form onSubmit={handleSubmit} className={`p-4 grid gap-10 w-full max-w-sm`}>
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

      <div className={`-mb-10 relative`}>
        <AuthText
          type={showPassword ? "text" : "password"}
          name={"password"}
          label={"Password"}
          placeholder={"eg. 1173!Ciri"}
          value={formData.password}
          onChange={handleChange}
          onFocus={() => setPasswordHasFocus(true)}
          onBlur={() => setPasswordHasFocus(false)}
        />

        <button
          type={`button`}
          className={`absolute right-2 bottom-3 text-neutral-300 hover:text-qrmory-purple-500 transition-all duration-300 ease-in-out`}
          onClick={() => setShowPassword(!showPassword)}
        >
          <IconEye size={24} strokeWidth={2} />
        </button>
      </div>

      <div
        className={`px-3 ${
          passwordHasFocus ? "mt-5 py-2 max-h-[999px]" : "max-h-0"
        } bg-neutral-200 rounded-xl text-sm text-neutral-600 font-light transition-all duration-1000 ease-in-out overflow-hidden`}
      >
        <p className={`mb-2`}>Every password must:</p>
        <ul>
          <li
            className={`mb-1 ${
              passwordValidation.atLeast8
                ? "text-qrmory-purple-500"
                : "opacity-50"
            } transition-all duration-300 ease-in-out`}
          >
            Be at least 8 characters long{" "}
            {formData.password.length < 8
              ? `(${8 - formData.password.length} to go)`
              : null}
          </li>
          <li
            className={`mb-1 ${
              passwordValidation.atLeast1Uppercase
                ? "text-qrmory-purple-500"
                : "opacity-50"
            } transition-all duration-300 ease-in-out`}
          >
            Contain at least one uppercase letter
          </li>
          <li
            className={`mb-1 ${
              passwordValidation.atLeast1Lowercase
                ? "text-qrmory-purple-500"
                : "opacity-50"
            } transition-all duration-300 ease-in-out`}
          >
            Contain at least one lowercase letter
          </li>
          <li
            className={`mb-1 ${
              passwordValidation.atLeast1Number
                ? "text-qrmory-purple-500"
                : "opacity-50"
            } transition-all duration-300 ease-in-out`}
          >
            Contain at least one number
          </li>
          <li
            className={`mb-1 ${
              passwordValidation.atLeast1Special
                ? "text-qrmory-purple-500"
                : "opacity-50"
            } transition-all duration-300 ease-in-out`}
          >
            Contain at least one special character ! @ # $ % ^ & *
          </li>
        </ul>
      </div>

      <div className={`relative`}>
        <AuthText
          type={showConfirmPassword ? "text" : "password"}
          name={"confirmPassword"}
          label={"Confirm Password"}
          placeholder={"eg. 1173!Ciri"}
          value={formData.confirmPassword}
          onChange={handleChange}
        />

        <button
          type={`button`}
          className={`absolute right-2 bottom-3 text-neutral-300 hover:text-qrmory-purple-500 transition-all duration-300 ease-in-out`}
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <IconEye size={24} strokeWidth={2} />
        </button>
      </div>

      {error && (
        <article>
          <p className={`text-red-600`}>{error}</p>
        </article>
      )}

      <article className={`grid gap-3`}>
        <button
          type="submit"
          disabled={isLoading || !isFormValid}
          className={`py-2 w-full bg-qrmory-purple-500 disabled:bg-stone-300 rounded-md text-white text-sm md:text-base font-bold`}
        >
          {isLoading ? "Creating..." : "Create!"}
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
