"use client";

import Link from "next/link";
import Logo from "@/components/logo";
import { IconUser } from "@tabler/icons-react";

export default function MainNavigation({
  className = "",
  absolute = true,
  logoColour = "white",
  fullLogo = true,
  pages = [],
}: {
  className?: string;
  absolute?: boolean;
  logoColour?: string;
  fullLogo?: boolean;
  pages?: {
    title: string;
    path: string;
    specialClasses?: string;
  }[];
}) {
  return (
    <nav
      className={`${className} ${
        absolute ? "absolute" : ""
      } py-6 px-8 top-0 flex flex-col items-center justify-center w-full h-16 sm:h-20`}
    >
      <Link href="/">
        <Logo className={`w-20 sm:w-24`} logoColour={logoColour} />
      </Link>

      <section
        className={`absolute px-8 right-0 top-0 flex items-center gap-3 h-full`}
      >
        {pages.map(({ title, path, specialClasses }, index) => (
          <Link
            href={path}
            key={index}
            className={`${specialClasses} px-4 py-1 hover:bg-qrmory-purple-400 rounded-md shadow-lg shadow-qrmory-purple-900 hover:shadow-xl hover:translate-x-1 hover:-translate-y-1 text-sm hover:text-white transition-all duration-300`}
          >
            {title}
          </Link>
        ))}

        <Link
          href={`/sign-up`}
          className={`px-2 flex items-center justify-center aspect-square hover:bg-qrmory-purple-400 rounded-full shadow-lg shadow-qrmory-purple-900 hover:shadow-xl hover:translate-x-1 hover:-translate-y-1 text-sm text-white transition-all duration-300`}
        >
          <IconUser />
        </Link>
      </section>
    </nav>
  );
}
