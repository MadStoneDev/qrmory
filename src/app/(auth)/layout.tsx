import "../globals.css";
import React from "react";

import Link from "next/link";
import Logo from "@/components/logo";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`bg-qrmory-purple-500 w-full h-screen overflow-y-auto`}>
        <main className={`grid md:grid-cols-2 w-full h-full`}>
          <section
            className={`px-3 absolute md:relative top-2 grid md:place-items-center w-full md:h-full z-10`}
          >
            <Link
              href={"/"}
              className={`md:hover:scale-110 transition-all duration-300`}
            >
              <Logo
                className={`fill-qrmory-purple-500 md:fill-white w-16 md:w-24`}
              />
            </Link>
          </section>
          <section
            className={`py-20 px-3 relative grid place-items-center w-full h-full bg-white`}
          >
            {children}

            <footer
              className={`absolute bottom-3 w-full text-xs text-center font-sans text-neutral-400`}
            >
              &copy; {new Date().getFullYear()}{" "}
              <Link
                href={"/"}
                className={`p-1 hover:bg-qrmory-purple-400 hover:text-white transition-all duration-300`}
              >
                QRmory
              </Link>
            </footer>
          </section>
        </main>
      </body>
    </html>
  );
}
