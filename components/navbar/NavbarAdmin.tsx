"use client";

import AdminNavbarLinks from "./NavbarLinksAdmin";
import NavLink from "@/components/link/NavLink";
import { isWindowAvailable } from "@/utils/navigation";
import { useState, useEffect } from "react";

export default function AdminNavbar(props: {
  brandText: string;
  onOpen: (...args: any[]) => any;
  [x: string]: any;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    isWindowAvailable() && window.addEventListener("scroll", changeNavbar);

    return () => {
      isWindowAvailable() && window.removeEventListener("scroll", changeNavbar);
    };
  });

  const { brandText, userDetails, onOpen } = props;
  const changeNavbar = () => {
    if (isWindowAvailable() && window.scrollY > 1) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };

  return (
    <nav
      className={`bg-muted fixed left-0 top-0 z-0 flex w-svw flex-row items-center justify-between px-4 py-2 backdrop-blur-sm transition-all xl:left-[300px] xl:w-[calc(100vw_-_300px)]`}
      // className={`fixed right-3 top-3 z-[0] flex w-[calc(100vw_-_6%)] flex-row items-center justify-between rounded-lg bg-white/30 py-2 backdrop-blur-xl transition-all dark:bg-transparent md:right-[30px] md:top-4 md:w-[calc(100vw_-_8%)] md:p-2 lg:w-[calc(100vw_-_6%)] xl:top-[20px] xl:w-[calc(100vw_-_365px)] 2xl:w-[calc(100vw_-_380px)]`}
    >
      <div className="ml-[6px]">
        <div className="h-6 md:mb-2 md:w-[224px] md:pt-1">
          <a
            className="hidden text-xs font-normal text-zinc-950 hover:underline md:inline dark:text-white dark:hover:text-white"
            href=""
          >
            Pages
            <span className="mx-1 text-xs text-zinc-950 hover:text-zinc-950 dark:text-white">
              {" "}
              /{" "}
            </span>
          </a>
          <NavLink
            className="text-xs font-normal capitalize text-zinc-950 hover:underline dark:text-white dark:hover:text-white"
            href="#"
          >
            {brandText}
          </NavLink>
        </div>
        <p className="text-md shrink capitalize md:text-3xl">
          <NavLink href="#" className="font-bold capitalize">
            {brandText}
          </NavLink>
        </p>
      </div>
      <div className="">
        {/* <div className="w-[154px] min-w-max md:ml-auto md:w-[unset]"> */}
        <AdminNavbarLinks onOpen={onOpen} />
      </div>
    </nav>
  );
}
