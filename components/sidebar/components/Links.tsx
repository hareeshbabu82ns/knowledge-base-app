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
      // Exact match for the route
      return pathname === routeName;
    },
    [pathname],
  );

  // Check if any child route is active
  const hasActiveChild = useCallback(
    (routes: IRoute[]) => {
      return routes.some((route) => {
        const fullPath = route.layout ? route.layout + route.path : route.path;
        return pathname === fullPath;
      });
    },
    [pathname],
  );

  // this function creates the links and collapses that appear in the sidebar (left menu)
  const createLinks = (routes: IRoute[]) => {
    return routes.map((route, key) => {
      if (route.disabled) {
        return (
          <li
            key={key}
            className={`flex w-full max-w-full cursor-not-allowed items-center justify-between rounded-lg py-3 pl-8 font-medium`}
          >
            <div className="flex w-full items-center justify-center gap-3">
              <div className={`text opacity-30`}>{route.icon}</div>
              <p className={`mr-auto text-sm opacity-30`}>{route.name}</p>
            </div>
          </li>
        );
      } else {
        const fullPath = route.layout ? route.layout + route.path : route.path;
        const isActive = activeRoute(fullPath);
        // Only highlight parent if it has NO children and is active
        // OR if it has children but we're on the parent's exact path
        const isHighlighted = route.items ? isActive : isActive;

        return (
          <li
            key={key}
            className={`flex w-full max-w-full items-center justify-between rounded-lg py-3 pl-8 ${
              isHighlighted
                ? "bg-accent text-accent-foreground font-semibold"
                : "font-medium"
            }`}
          >
            <NavLink
              href={fullPath}
              key={key}
              className="w-full"
              childNavLinks={
                route.items ? createAccordionLinks(route.items) : null
              }
            >
              <div className="flex w-full items-center justify-center gap-3">
                <div
                  className={`text ${
                    isHighlighted
                      ? "text-accent-foreground font-semibold"
                      : "font-medium"
                  } `}
                >
                  {route.icon}
                </div>
                <p
                  className={`mr-auto text-sm ${
                    isHighlighted
                      ? "text-accent-foreground font-semibold"
                      : "font-medium"
                  }`}
                >
                  {route.name}
                </p>
              </div>
            </NavLink>
          </li>
        );
      }
    });
  };
  // this function creates the links from the secondary accordions (for example auth -> sign-in -> default)
  const createAccordionLinks = (routes: IRoute[]) => {
    return routes.map((route: IRoute, key: number) => {
      const fullPath = route.layout + route.path;
      const isActive = activeRoute(fullPath);

      return (
        <li
          key={key}
          className={`flex w-full max-w-full items-center justify-between rounded-lg py-3 pl-3 ${
            isActive
              ? "bg-accent text-accent-foreground font-semibold"
              : "font-medium"
          }`}
        >
          <NavLink href={fullPath} key={key} className="w-full">
            <div className="flex w-full items-center justify-center gap-3">
              <div
                className={`${
                  isActive
                    ? "text-accent-foreground font-semibold"
                    : "font-medium"
                } `}
              >
                {route.icon}
              </div>
              <p
                className={`mr-auto text-xs ${
                  isActive
                    ? "text-accent-foreground font-semibold"
                    : "font-medium"
                }`}
              >
                {route.name}
              </p>
            </div>
          </NavLink>
        </li>
      );
    });
  };
  //  BRAND
  return <>{createLinks(routes)}</>;
}

export default SidebarLinks;
