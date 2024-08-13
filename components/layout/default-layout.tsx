"use client";

import Sidebar from "@/components/sidebar/Sidebar";
import { usePathname } from "next/navigation";
import { routes } from "@/components/routes";
import React from "react";
import Navbar from "@/components/navbar/NavbarAdmin";
import { getActiveRoute } from "@/utils/navigation";

const WithDefaultLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex size-full ">
      <Sidebar routes={routes} open={open} setOpen={() => setOpen(!open)} />
      <div className="size-full ">
        <main className={`mx-2.5 flex-none transition-all xl:ml-[316px]`}>
          <Navbar
            onOpen={() => setOpen(!open)}
            brandText={getActiveRoute(routes, pathname)}
          />
          <div className="min-h-screen overflow-y-auto p-2 pt-[80px] md:pt-[100px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default WithDefaultLayout;
