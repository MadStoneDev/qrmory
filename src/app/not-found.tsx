import React from "react";
import Link from "next/link";

import MainNavigation from "@/components/main-navigation";
import MainFooter from "@/components/sections/main-footer";

export const metadata = {
  title: "404 | QRmory",
  description: "Page not found - 404",
};

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-between bg-white z-50">
      <MainNavigation className={`bg-qrmory-purple-800`} />

      <section className="pt-52 pb-36 flex flex-col justify-center items-center w-full min-h-fit bg-white">
        <div className="px-2 sm:px-6 w-full sm:max-w-7xl text-center">
          <p
            className={`mb-8 font-serif text-sm sm:text-base italic text-qrmory-purple-500`}
          >
            🎶 ...meticulous planning, tenacity spanning, decades of denial is
            simply why I'll be... 🎶
          </p>
          <h1 className="font-header text-2xl sm:text-3xl lg:text-5xl hero-heading text-qrmory-purple-800">
            Woah! How'd you get in here?
          </h1>

          <h3 className="mt-1 sm:mt-2 lg:mt-4 font-serif sm:text-xl lg:text-2xl text-qrmory-purple-500 tracking-widest drop-shadow-lg">
            Is something broken?
          </h3>

          <p
            className={`mt-8 font-serif text-sm sm:text-base text-qrmory-purple-800`}
          >
            I'll get back to singing...I mean, working. <br />
            Meanwhile, try these destinations instead:
          </p>
          <ul className={`my-4 flex flex-col items-center gap-6`}>
            <Link
              href={"/"}
              className={`group relative font-bold text-qrmory-purple-500`}
            >
              Home
              <div
                className={`absolute left-0 -bottom-0.5 w-0 group-hover:w-full h-[1px] bg-qrmory-purple-500 transition-all duration-300`}
              ></div>
            </Link>

            <Link
              href={"/about"}
              className={`group relative font-bold text-qrmory-purple-500`}
            >
              About
              <div
                className={`absolute left-0 -bottom-0.5 w-0 group-hover:w-full h-[1px] bg-qrmory-purple-500 transition-all duration-300`}
              ></div>
            </Link>

            <Link
              href={"/pricing"}
              className={`group relative font-bold text-qrmory-purple-500`}
            >
              Pricing
              <div
                className={`absolute left-0 -bottom-0.5 w-0 group-hover:w-full h-[1px] bg-qrmory-purple-500 transition-all duration-300`}
              ></div>
            </Link>

            <Link
              href={"/help"}
              className={`group relative font-bold text-qrmory-purple-500`}
            >
              Help Center
              <div
                className={`absolute left-0 -bottom-0.5 w-0 group-hover:w-full h-[1px] bg-qrmory-purple-500 transition-all duration-300`}
              ></div>
            </Link>

            {/*<Link*/}
            {/*  href={"/"}*/}
            {/*  className={`group relative font-bold text-qrmory-purple-400`}*/}
            {/*>*/}
            {/*  Home*/}
            {/*  <div*/}
            {/*    className={`absolute left-0 -bottom-0.5 w-0 group-hover:w-full h-[1px] bg-qrmory-purple-400 transition-all duration-300`}*/}
            {/*  ></div>*/}
            {/*</Link>*/}
          </ul>
        </div>
      </section>

      <MainFooter />
    </main>
  );
}
