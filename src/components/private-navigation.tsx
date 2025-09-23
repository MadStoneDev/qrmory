"use client";

import { JSX } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

import {
  IconChartBar,
  IconCirclePlus,
  IconDashboard,
  IconInfoHexagon,
  IconPower,
  IconQrcode,
  IconSettings,
} from "@tabler/icons-react";
import { createClient } from "@/utils/supabase/client";

export default function PrivateNavigation({
  className = "",
}: {
  className?: string;
}) {
  // Hooks
  const router = useRouter();
  const supabase = createClient();

  return (
    <nav className={`sm:h-full bg-white ${className}`}>
      <section
        className={`flex sm:flex-col items-center sm:items-start justify-center sm:justify-between gap-3 w-full sm:w-auto h-16 sm:h-full text-qrmory-purple-800 shadow-2xl shadow-neutral-800 sm:shadow-none hover:opacity-100 transition-all duration-300 ease-in-out`}
      >
        <article
          className={`flex flex-row sm:flex-col items-center justify-around`}
        >
          <NavItem href={"/dashboard"} title={"Dashboard"}>
            <IconDashboard size={30} strokeWidth={1.75} />
          </NavItem>

          <div
            className={`hidden sm:block w-8 h-[1px] border-b border-neutral-200/60`}
          ></div>

          <NavItem href={"/dashboard/create"} title={"Create"}>
            <IconCirclePlus size={30} strokeWidth={1.75} />
          </NavItem>

          <div
            className={`hidden sm:block w-8 h-[1px] border-b border-neutral-200/60`}
          ></div>

          <NavItem href={"/dashboard/my-codes"} title={"My Codes"}>
            <IconQrcode size={30} strokeWidth={1.75} />
          </NavItem>

          <NavItem href={"/dashboard/analytics"} title={"Analytics"}>
            <IconChartBar size={30} strokeWidth={1.75} />
          </NavItem>

          {/*<div*/}
          {/*  className={`hidden sm:block w-8 h-[1px] border-b border-neutral-200/60`}*/}
          {/*></div>*/}

          {/*<NavItem href={"/dashboard/my-teams"} title={"My Teams"}>*/}
          {/*  <IconUsersGroup size={30} strokeWidth={1.75} />*/}
          {/*</NavItem>*/}

          <div
            className={`hidden sm:block w-8 h-[1px] border-b border-neutral-200/60`}
          ></div>
        </article>

        <article className={`flex flex-row sm:flex-col items-center`}>
          <NavItem href={"/dashboard/account"} title={"Account Info"}>
            <IconInfoHexagon size={30} strokeWidth={1.75} />
          </NavItem>

          <div
            className={`hidden sm:block w-8 h-[1px] border-b border-neutral-200/60`}
          ></div>

          <NavItem href={"/dashboard/settings"} title={"Settings"}>
            <IconSettings size={30} strokeWidth={1.75} />
          </NavItem>

          <div
            className={`hidden sm:block w-8 h-[1px] border-b border-neutral-200/60`}
          ></div>

          <NavItem
            action={async () => {
              const { error } = await supabase.auth.signOut();
              if (error) console.error(error);

              router.push("/");
            }}
            title={"Logout"}
          >
            <IconPower size={30} strokeWidth={1.75} />
          </NavItem>
        </article>
      </section>
    </nav>
  );
}

interface NavItemType {
  href?: string;
  action?: () => void;
  title: string;
  children?: JSX.Element;
}

function NavItem({ href, action, title, children }: NavItemType) {
  // Hooks
  const pathname = usePathname();

  // Common styles for both link and button
  const baseClassName = `group nav-item px-1 sm:px-4 py-1 sm:py-2 hover:bg-qrmory-purple-800 hover:text-white relative flex transition-all duration-500 ease-in-out`;

  const iconClassName = `p-2 aspect-square ${
    href && href === pathname
      ? "bg-qrmory-purple-800 group-hover:bg-transparent rounded-full text-white transition-all duration-300" +
        " ease-in-out"
      : ""
  }`;

  if (href) {
    return (
      <Link href={href} className={baseClassName} title={title}>
        <div className={iconClassName}>{children}</div>
      </Link>
    );
  }

  return (
    <button
      onClick={action}
      className={baseClassName}
      type="button"
      title={title}
    >
      <div className={iconClassName}>{children}</div>
    </button>
  );
}
