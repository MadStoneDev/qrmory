import React from "react";

import MainNavigation from "@/components/main-navigation";
import ContactForm from "@/components/ui/contact-form";
import MainFooter from "@/components/main-footer";
import { IconForms, IconMail } from "@tabler/icons-react";
import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="mb-8 flex flex-col min-h-screen">
      <MainNavigation
        pages={[
          {
            title: "Home",
            path: "/",
          },
        ]}
      />

      <div className={`flex-grow flex flex-col`}>
        <header
          className={
            "pt-40 pb-12 px-2 sm:px-16 flex flex-col justify-center w-full max-w-60 sm:max-w-7xl min-h-fit"
          }
        >
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-5xl font-black">
            Help Center
          </h1>

          <h2 className="mt-2 font-sans text-sm sm:text-xl lg:text-2xl font-bold">
            We want to help
          </h2>
        </header>

        <section
          className={`py-10 px-2 sm:px-16 grid grid-cols-3 justify-center w-full max-w-60 sm:max-w-2xl`}
        >
          <Link
            href={`/support/contact`}
            className={`aspect-square flex flex-col gap-2 items-center justify-center border border-qrmory-purple-500 rounded-xl bg-qrmory-purple-800 text-white opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-300 ease-in-out`}
          >
            <IconMail size={30} strokeWidth={1.5} />
            <p className={`text-lg font-bold`}>Contact Us</p>
          </Link>
        </section>
      </div>

      <MainFooter />
    </main>
  );
}
