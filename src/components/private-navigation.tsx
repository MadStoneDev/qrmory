"use client";

import { JSX } from "react";
import Link from "next/link";

import {
  IconDashboard,
  IconInfoHexagon,
  IconPencilPlus,
  IconQrcode,
  IconSettings,
} from "@tabler/icons-react";
import { usePathname } from "next/navigation";

export default function PrivateNavigation({
  className = "",
}: {
  className?: string;
}) {
  return (
    <nav className={`sm:h-full bg-white ${className}`}>
      <section
        className={`flex sm:flex-col items-center sm:items-start justify-center sm:justify-between gap-3 w-full sm:w-auto h-16 sm:h-full text-qrmory-purple-800 shadow-2xl shadow-neutral-800 sm:shadow-none hover:opacity-100 transition-all duration-300 ease-in-out`}
      >
        <article
          className={`flex flex-row sm:flex-col items-center justify-around gap-3`}
        >
          <NavItem href={"/dashboard"} title={"Dashboard"}>
            <IconDashboard size={30} strokeWidth={1.75} />
          </NavItem>

          <div
            className={`hidden sm:block w-8 h-[1px] border-b border-stone-200/60`}
          ></div>

          <NavItem href={"/dashboard/create"} title={"Create"}>
            <IconPencilPlus size={30} strokeWidth={1.75} />
          </NavItem>

          <div
            className={`hidden sm:block w-8 h-[1px] border-b border-stone-200/60`}
          ></div>

          <NavItem href={"/dashboard/my-codes"} title={"My Codes"}>
            <IconQrcode size={30} strokeWidth={1.75} />
          </NavItem>

          {/*<div*/}
          {/*  className={`hidden sm:block w-8 h-[1px] border-b border-stone-200/60`}*/}
          {/*></div>*/}

          {/*<NavItem href={"/dashboard/my-teams"} title={"My Teams"}>*/}
          {/*  <IconUsersGroup size={30} strokeWidth={1.75} />*/}
          {/*</NavItem>*/}

          <div
            className={`hidden sm:block w-8 h-[1px] border-b border-stone-200/60`}
          ></div>
        </article>

        <article className={`flex flex-row sm:flex-col items-center gap-3`}>
          <NavItem href={"/dashboard/account"} title={"Account Info"}>
            <IconInfoHexagon size={30} strokeWidth={1.75} />
          </NavItem>

          <div
            className={`hidden sm:block w-8 h-[1px] border-b border-stone-200/60`}
          ></div>

          <NavItem href={"/dashboard/settings"} title={"Settings"}>
            <IconSettings size={30} strokeWidth={1.75} />
          </NavItem>
        </article>
      </section>
    </nav>
  );
}

interface NavItemType {
  href: string;
  title: string;
  children?: JSX.Element;
}

function NavItem({ href, title, children }: NavItemType) {
  // Hooks
  const pathname = usePathname();
  console.log(pathname);

  return (
    <Link
      href={href}
      className={`group nav-item px-1 sm:px-4 py-1 sm:py-2 hover:bg-qrmory-purple-800 hover:text-white relative flex transition-all duration-500 ease-in-out`}
    >
      <div
        className={`p-2 ${
          href === pathname
            ? "bg-qrmory-purple-400 group-hover:bg-transparent rounded-full text-white transition-all duration-300 ease-in-out"
            : ""
        }`}
      >
        {children}
      </div>
      {/*<div*/}
      {/*  className={`md:group-hover:px-2 flex items-center h-full w-fit max-w-0 md:group-hover:max-w-lg text-white whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out`}*/}
      {/*>*/}
      {/*  {title}*/}
      {/*</div>*/}
    </Link>
  );
}
