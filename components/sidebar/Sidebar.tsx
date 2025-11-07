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
  [x: string]: any;
}
interface SidebarLinksProps extends PropsWithChildren {
  routes: IRoute[];
  [x: string]: any;
}

function Sidebar(props: SidebarProps) {
  const { routes } = props;

  const fixedSidebar = useMediaQuery("(min-width: 1280px)");
  const [open, setOpen] = React.useState(props.open);

  useEffect(() => {
    setOpen(props.open);
  }, [props.open]);

  // SIDEBAR
  return fixedSidebar ? (
    <div className="fixed left-0 top-0 z-40 h-screen w-80">
      <SidebarContent {...props} routes={routes} />
    </div>
  ) : (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="hidden">
          <SheetTitle>Knowledge Base</SheetTitle>
        </SheetHeader>
        <SidebarContent {...props} routes={routes} />
      </SheetContent>
    </Sheet>
  );
}

function SidebarContent(props: SidebarProps) {
  const router = useRouter();
  const session = useSession();
  const { routes } = props;

  // SIDEBAR
  return (
    <Card
      className={`h-screen w-full overflow-hidden rounded-none border-r py-0`}
    >
      <div className="flex h-full flex-col justify-between">
        <div className="flex min-h-0 flex-1 flex-col">
          <div className={`ml-4 mt-8 flex items-center px-4`}>
            <img
              src="/icon-512.png"
              alt="HKBase Logo"
              className="mr-2 size-8"
            />
            <h5 className="me-2 text-2xl font-bold leading-5 text-card-foreground">
              Knowledge Base
            </h5>
          </div>
          {/* Nav item */}
          <nav className="mt-8 flex-1 overflow-y-auto overflow-x-hidden px-4">
            <ul>
              <Links routes={routes} />
            </ul>
          </nav>
        </div>
        {/* Sidebar profile info */}
        <div className="mt-4 flex-shrink-0 border-t">
          <div className="flex w-full items-center p-4">
            <a href="/profile" className="flex-shrink-0">
              <Avatar className="size-10">
                <AvatarImage src={session?.data?.user.image ?? ""} />
                <AvatarFallback className="font-bold">US</AvatarFallback>
              </Avatar>
            </a>
            <a href="/profile" className="min-w-0 flex-1">
              <p className="ml-2 mr-3 truncate text-sm font-semibold leading-none">
                {session?.data?.user.name
                  ? session?.data?.user.name
                  : "User Not Found"}
              </p>
            </a>
            <Button
              variant="outline"
              className="ml-auto flex size-[40px] flex-shrink-0 cursor-pointer items-center justify-center rounded-full p-0 text-center text-sm font-medium"
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
  );
}

export default Sidebar;
