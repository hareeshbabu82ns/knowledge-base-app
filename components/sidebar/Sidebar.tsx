"use client";

import { Button } from "../ui/button";
import Links from "@/components/sidebar/components/Links";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { IRoute } from "@/types/types";
import { useRouter } from "next/navigation";
import React, { PropsWithChildren, useEffect } from "react";
import { HiOutlineArrowRightOnRectangle } from "react-icons/hi2";
import { useSession } from "next-auth/react";
import { signOut } from "@/lib/auth/actions";
import { Icons } from "../shared/icons";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";

export interface SidebarProps extends PropsWithChildren {
  routes: IRoute[];
  [ x: string ]: any;
}
interface SidebarLinksProps extends PropsWithChildren {
  routes: IRoute[];
  [ x: string ]: any;
}

function Sidebar( props: SidebarProps ) {
  const { routes } = props;

  const fixedSidebar = useMediaQuery( "(min-width: 1280px)" );
  const [ open, setOpen ] = React.useState( props.open );

  useEffect( () => {
    setOpen( props.open );
  }, [ props.open ] );

  // SIDEBAR
  return fixedSidebar ? (
    // <div
    //   // eslint-disable-next-line tailwindcss/enforces-negative-arbitrary-values
    //   className={`lg:!z-99 fixed !z-[99] min-h-full w-[300px] transition-all md:!z-[99] xl:!z-0 ${
    //     props.variant === "auth" ? "xl:hidden" : "xl:block"
    //   } ${props.open ? "" : "-translate-x-[120%] xl:translate-x-[unset]"}`}
    // >
    <div className="fixed left-0 top-0 min-h-full w-80">
      <SidebarContent {...props} routes={routes} />
    </div>
  ) : (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="p-0">
        <SheetHeader className="hidden">
          <SheetTitle>Knowledge Base</SheetTitle>
        </SheetHeader>
        <SidebarContent {...props} routes={routes} />
      </SheetContent>
    </Sheet>
  );
}

function SidebarContent( props: SidebarProps ) {
  const router = useRouter();
  const session = useSession();
  const { routes } = props;

  // SIDEBAR
  return (
    <Card className={`h-svh w-full overflow-y-auto rounded-none pe-4 py-0`}>
      <div className="flex h-full flex-col justify-between">
        <div>
          <div className={`ml-4 mt-8 flex items-center`}>
            <div className="bg-primary text-primary-foreground me-2 flex size-10 items-center justify-center rounded-md">
              <Icons.logo className="size-5" />
            </div>
            <h5 className="text-card-foreground me-2 text-2xl font-bold leading-5">
              Knowledge Base
            </h5>
          </div>
          {/* Nav item */}
          <ul className="mt-8">
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
            <a href="/settings">
              <Avatar className="min-h-10 min-w-10">
                <AvatarImage src={session?.data?.user.image ?? ""} />
                <AvatarFallback className="font-bold">US</AvatarFallback>
              </Avatar>
            </a>
            <a href="/settings">
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
                router.push( "/" );
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
  );
}

export default Sidebar;
