import { JSX } from "react";
import Link from "next/link";
import {
  IconDashboard,
  IconInfoHexagon,
  IconPencilPlus,
  IconQrcode,
  IconSettings,
  IconUsersGroup,
} from "@tabler/icons-react";

export default function PrivateNavigation({
  className = "",
}: {
  className?: string;
}) {
  return (
    <nav className={`h-full ${className}`}>
      <section
        className={`flex flex-col items-start sm:justify-between h-full text-qrmory-purple-800 hover:opacity-100 transition-all duration-300 ease-in-out`}
      >
        <article className={`flex flex-col items-start`}>
          <NavItem href={"/dashboard/"} title={"Dashboard"}>
            <IconDashboard size={30} strokeWidth={1.75} />
          </NavItem>

          <div
            className={`ml-2.5 sm:ml-6 w-8 h-[1px] border-b border-stone-200/60`}
          ></div>

          <NavItem href={"/dashboard/create"} title={"Create"}>
            <IconPencilPlus size={30} strokeWidth={1.75} />
          </NavItem>

          <div
            className={`ml-2.5 sm:ml-6 w-8 h-[1px] border-b border-stone-200/60`}
          ></div>

          <NavItem href={"/dashboard/my-codes"} title={"My Codes"}>
            <IconQrcode size={30} strokeWidth={1.75} />
          </NavItem>

          {/*<div*/}
          {/*  className={`ml-2.5 sm:ml-6 w-8 h-[1px] border-b border-stone-200/60`}*/}
          {/*></div>*/}

          {/*<NavItem href={"/dashboard/my-teams"} title={"My Teams"}>*/}
          {/*  <IconUsersGroup size={30} strokeWidth={1.75} />*/}
          {/*</NavItem>*/}

          <div
            className={`sm:hidden ml-2.5 sm:ml-6 w-8 h-[1px] border-b border-stone-200/60`}
          ></div>
        </article>

        <article className={`flex flex-col`}>
          <NavItem href={"/dashboard/account"} title={"Account Info"}>
            <IconInfoHexagon size={30} strokeWidth={1.75} />
          </NavItem>

          <div
            className={`ml-2.5 sm:ml-6 w-8 h-[1px] border-b border-stone-200/60`}
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
  return (
    <Link
      href={href}
      className={`group px-3 sm:px-6 py-3 sm:py-4 hover:bg-qrmory-purple-800 hover:text-white relative flex transition-all duration-500 ease-in-out`}
    >
      {children}
      <div
        className={`md:group-hover:px-2 flex items-center h-full w-fit max-w-0 md:group-hover:max-w-lg text-white whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out`}
      >
        {title}
      </div>
    </Link>
  );
}
