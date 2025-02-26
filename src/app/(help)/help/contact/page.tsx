import React from "react";

import MainNavigation from "@/components/main-navigation";

export default function ContactPage() {
  return (
    <main className="mb-8 flex min-h-screen flex-col items-center justify-between">
      <MainNavigation />

      <header
        className={"py-40 px-10 flex flex-col items-center w-full min-h-fit"}
      >
        <div className="px-2 sm:px-6 w-full max-w-60 sm:max-w-7xl">
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-5xl font-black">
            Contact Us
          </h1>

          <h2 className="mt-2 font-sans text-sm sm:text-xl lg:text-2xl font-bold">
            How can we help?
          </h2>
        </div>
      </header>
    </main>
  );
}
