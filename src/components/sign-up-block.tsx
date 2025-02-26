"use client";

import Link from "next/link";
import { ChangeEvent, EventHandler, useState } from "react";

import { signup } from "@/app/(auth)/actions";
import AuthText from "@/components/auth-text";
import { IconEye } from "@tabler/icons-react";

export default function SignUpBlock() {
  // States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordHasFocus, setPasswordHasFocus] = useState(false);
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

    // Check if password meets requirements
    const passwordLength = target.value.length;
    const passwordUppercase = target.value.match(/[A-Z]/g) || [];
    const passwordLowercase = target.value.match(/[a-z]/g) || [];
    const passwordNumber = target.value.match(/[0-9]/g) || [];
    const passwordSpecial = target.value.match(/[!@#$%^&*]/g) || [];

    setPasswordValidation((prevState) => ({
      ...prevState,
      atLeast8: passwordLength >= 8,
      atLeast1Uppercase: passwordUppercase.length >= 1,
      atLeast1Lowercase: passwordLowercase.length >= 1,
      atLeast1Number: passwordNumber.length >= 1,
      atLeast1Special: passwordSpecial.length >= 1,
    }));
  };

  const handleSubmit = async () => {
    setError("");

    Object.keys(passwordValidation).forEach((key: string) => {
      if (!passwordValidation[key as keyof typeof passwordValidation]) {
        setError("Password does not meet the minimum requirements");
        return;
      }
    });
  };

  return (
    <form className={`grid gap-10 w-full max-w-sm`}>
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
          <p className={`text-red-600`}>Oops</p>
        </article>
      )}

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
