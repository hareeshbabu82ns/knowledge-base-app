"use client";

import Sidebar from "@/components/sidebar/Sidebar";
import { usePathname } from "next/navigation";
import { routes } from "@/components/routes";
import React from "react";
import Footer from "@/components/footer/FooterAdmin";
import Navbar from "@/components/navbar/NavbarAdmin";
import { getActiveRoute } from "@/utils/navigation";

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex h-full w-full ">
      <Sidebar routes={routes} open={open} setOpen={() => setOpen(!open)} />
      <div className="h-full w-full ">
        <main
          className={`mx-2.5 flex-none transition-all md:pr-2 xl:ml-[328px]`}
        >
          <div className="mx-auto min-h-screen p-2 !pt-[90px] md:p-2 md:!pt-[118px]">
            {children}
          </div>
          <Navbar
            onOpen={() => setOpen(!open)}
            brandText={getActiveRoute(routes, pathname)}
          />
          <div className="p-3">
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
