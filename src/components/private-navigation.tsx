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

export default function PrivateNavigation() {
  return (
    <nav className={`h-full`}>
      <section className={`flex flex-col items-start justify-between h-full`}>
        <article className={`flex flex-col items-start gap-4`}>
          <NavItem href={"/dashboard/"} title={"Dashboard"}>
            <IconDashboard size={30} strokeWidth={1.75} />
          </NavItem>

          <div className={`ml-2 w-8 h-[1px] border-b border-stone-200`}></div>

          <NavItem href={"/dashboard/new"} title={"Create"}>
            <IconPencilPlus size={30} strokeWidth={1.75} />
          </NavItem>

          <div className={`ml-2 w-8 h-[1px] border-b border-stone-200`}></div>

          <NavItem href={"/dashboard/my-codes"} title={"My Codes"}>
            <IconQrcode size={30} strokeWidth={1.75} />
          </NavItem>

          <div className={`ml-2 w-8 h-[1px] border-b border-stone-200`}></div>

          <NavItem href={"/dashboard/my-teams"} title={"My Teams"}>
            <IconUsersGroup size={30} strokeWidth={1.75} />
          </NavItem>
        </article>

        <article className={`flex flex-col gap-4`}>
          <NavItem href={"/dashboard/account"} title={"Account Info"}>
            <IconInfoHexagon size={30} strokeWidth={1.75} />
          </NavItem>

          <div className={`ml-2 w-8 h-[1px] border-b border-stone-200`}></div>

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
      className={`group p-2 relative flex hover:bg-qrmory-purple-800 hover:text-white transition-all duration-300 ease-in-out`}
    >
      {children}
      <div
        className={`group-hover:px-2 flex items-center h-full w-fit max-w-0 group-hover:max-w-lg text-white whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out`}
      >
        {title}
      </div>
    </Link>
  );
}
