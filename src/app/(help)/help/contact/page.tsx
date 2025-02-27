import React from "react";

import MainNavigation from "@/components/main-navigation";
import ContactForm from "@/components/ui/contact-form";
import MainFooter from "@/components/main-footer";

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
            Contact Us
          </h1>

          <h2 className="mt-2 font-sans text-sm sm:text-xl lg:text-2xl font-bold">
            How can we help?
          </h2>
        </header>

        <section
          className={`py-10 px-2 sm:px-16 flex flex-col justify-center w-full max-w-60 sm:max-w-2xl`}
        >
          <ContactForm />
        </section>
      </div>

      <MainFooter />
    </main>
  );
}
