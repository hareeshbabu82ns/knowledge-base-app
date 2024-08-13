"use client";

import NavLink from "@/components/link/NavLink";
import { IRoute } from "@/types/types";
import { usePathname, useRouter } from "next/navigation";
import { PropsWithChildren, useCallback } from "react";
import { FaCircle } from "react-icons/fa";

interface SidebarLinksProps extends PropsWithChildren {
  routes: IRoute[];
  [x: string]: any;
}

export function SidebarLinks(props: SidebarLinksProps) {
  const pathname = usePathname();

  const { routes, onOpen } = props;

  // verifies if routeName is the one active (in browser input)
  const activeRoute = useCallback(
    (routeName: string) => {
      return pathname?.includes(routeName) && pathname?.endsWith(routeName);
    },
    [pathname],
  );

  // this function creates the links and collapses that appear in the sidebar (left menu)
  const createLinks = (routes: IRoute[]) => {
    return routes.map((route, key) => {
      if (route.disabled) {
        return (
          <div
            key={key}
            className={`flex w-full max-w-full cursor-not-allowed items-center justify-between rounded-lg py-3 pl-8 font-medium`}
          >
            <div className="w-full items-center justify-center">
              <div className="flex w-full items-center justify-center">
                <div
                  className={`text mr-3 mt-1.5 text-zinc-950 opacity-30 dark:text-white`}
                >
                  {route.icon}
                </div>
                <p
                  className={`mr-auto text-sm text-zinc-950 opacity-30 dark:text-white`}
                >
                  {route.name}
                </p>
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <div key={key}>
            <div
              className={`flex w-full max-w-full items-center justify-between rounded-lg py-3 pl-8 ${
                activeRoute(route.path.toLowerCase())
                  ? "bg-zinc-950 font-semibold text-white dark:bg-white dark:text-zinc-950"
                  : "font-medium text-zinc-950 dark:text-zinc-400"
              }`}
            >
              <NavLink
                href={route.layout ? route.layout + route.path : route.path}
                key={key}
                styles={{ width: "100%" }}
                childNavLinks={
                  route.items ? createAccordionLinks(route.items) : null
                }
              >
                <div className="w-full items-center justify-center">
                  <div className="flex w-full items-center justify-center">
                    <div
                      className={`text mr-3 mt-1.5 ${
                        activeRoute(route.path.toLowerCase())
                          ? "font-semibold text-white dark:text-zinc-950"
                          : "text-zinc-950 dark:text-white"
                      } `}
                    >
                      {route.icon}
                    </div>
                    <p
                      className={`mr-auto text-sm ${
                        activeRoute(route.path.toLowerCase())
                          ? "font-semibold text-white dark:text-zinc-950"
                          : "font-medium text-zinc-950 dark:text-zinc-400"
                      }`}
                    >
                      {route.name}
                    </p>
                  </div>
                </div>
              </NavLink>
            </div>
          </div>
        );
      }
    });
  };
  // this function creates the links from the secondary accordions (for example auth -> sign-in -> default)
  const createAccordionLinks = (routes: IRoute[]) => {
    return routes.map((route: IRoute, key: number) => {
      return (
        <li className="ml-[16px]" key={key}>
          <div
            className={`flex w-full max-w-full items-center justify-between rounded-lg py-3 pl-3 ${
              activeRoute(route.path.toLowerCase())
                ? "bg-zinc-950 font-semibold text-white dark:bg-white dark:text-zinc-950"
                : "font-medium text-zinc-950 dark:text-zinc-400"
            }`}
          >
            <NavLink href={route.layout + route.path} key={key}>
              <div className="flex w-full items-center justify-center">
                <div
                  className={`text mr-3 mt-1.5 ${
                    activeRoute((route.layout + route.path).toLowerCase())
                      ? "font-semibold text-white dark:text-zinc-950"
                      : "text-zinc-950 dark:text-white"
                  } `}
                >
                  {route.icon}
                </div>
                <p
                  className={`mr-auto text-xs ${
                    activeRoute(route.path.toLowerCase())
                      ? "font-semibold text-white dark:text-zinc-950"
                      : "font-medium text-zinc-950 dark:text-zinc-400"
                  }`}
                >
                  {route.name}
                </p>
              </div>
            </NavLink>
          </div>
        </li>
      );
    });
  };
  //  BRAND
  return <>{createLinks(routes)}</>;
}

export default SidebarLinks;
