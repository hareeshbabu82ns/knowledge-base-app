"use client";

import { Button } from "../ui/button";
import Links from "@/components/sidebar/components/Links";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { IRoute } from "@/types/types";
import { useRouter } from "next/navigation";
import React, { PropsWithChildren } from "react";
import { HiX } from "react-icons/hi";
import { HiHomeModern as HiBolt } from "react-icons/hi2";
import { HiOutlineArrowRightOnRectangle } from "react-icons/hi2";
import { useSession } from "next-auth/react";
import { signOut } from "@/lib/auth/actions";

export interface SidebarProps extends PropsWithChildren {
  routes: IRoute[];
  [x: string]: any;
}
interface SidebarLinksProps extends PropsWithChildren {
  routes: IRoute[];
  [x: string]: any;
}

function Sidebar(props: SidebarProps) {
  const router = useRouter();
  const session = useSession();
  const { routes } = props;

  // SIDEBAR
  return (
    <div
      // eslint-disable-next-line tailwindcss/enforces-negative-arbitrary-values
      className={`lg:!z-99 fixed !z-[99] min-h-full w-[300px] transition-all md:!z-[99] xl:!z-0 ${
        props.variant === "auth" ? "xl:hidden" : "xl:block"
      } ${props.open ? "" : "-translate-x-[120%] xl:translate-x-[unset]"}`}
    >
      <Card className={`h-svh w-full overflow-y-auto rounded-none pe-4`}>
        <div className="flex h-full flex-col justify-between">
          <div>
            <span
              className="absolute right-4 top-4 block cursor-pointer xl:hidden"
              onClick={() => props.setOpen(false)}
            >
              <HiX className="size-5" />
            </span>
            <div className={`mt-8 flex items-center justify-center`}>
              <div className="me-2 flex size-[40px] items-center justify-center rounded-md bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                <HiBolt className="size-5" />
              </div>
              <h5 className="me-2 text-2xl font-bold leading-5 text-zinc-950 dark:text-white">
                Knowledge Base
              </h5>
            </div>
            <div className="my-8 h-px bg-zinc-200 dark:bg-white/10" />
            {/* Nav item */}
            <ul>
              <Links routes={routes} />
            </ul>
          </div>
          {/* Free Horizon Card    */}
          <div className="mb-2 mt-4">
            {/* <div className="flex justify-center">
              <SidebarCard />
            </div> */}
            {/* Sidebar profile info */}
            <div className="mt-5 flex w-full items-center rounded-none border-t p-4">
              <a href="/dashboard/settings">
                <Avatar className="min-h-10 min-w-10">
                  <AvatarImage src={session?.data?.user.image ?? ""} />
                  <AvatarFallback className="font-bold">US</AvatarFallback>
                </Avatar>
              </a>
              <a href="/dashboard/settings">
                <p className="ml-2 mr-3 flex items-center text-sm font-semibold leading-none">
                  {session?.data?.user.name
                    ? session?.data?.user.name
                    : "User Not Found"}
                </p>
              </a>
              <Button
                variant="outline"
                className="ml-auto flex size-[40px] cursor-pointer items-center justify-center rounded-full p-0 text-center text-sm font-medium"
                onClick={async () => {
                  await signOut();
                  router.push("/");
                }}
              >
                <HiOutlineArrowRightOnRectangle
                  className="size-4 stroke-2"
                  width="16px"
                  height="16px"
                  color="inherit"
                />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// PROPS

export default Sidebar;
