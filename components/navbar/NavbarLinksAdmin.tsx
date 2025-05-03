"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import React from "react";
import { useState, useEffect } from "react";
import { FiAlignJustify } from "react-icons/fi";
import {
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlineInformationCircle,
} from "react-icons/hi2";
import { ThemeToggle } from "../ui/theme/ThemeToggle";

export default function HeaderLinks( props: { [ x: string ]: any } ) {
  const { onOpen } = props;
  const { theme, setTheme } = useTheme();
  const [ mounted, setMounted ] = useState( false );

  useEffect( () => {
    setMounted( true );
  }, [] );

  if ( !mounted ) {
    return null;
  }

  return (
    <div className="relative flex min-w-max max-w-max grow items-center justify-around gap-1 rounded-lg md:p-2 md:pl-3 xl:gap-2">
      <Button
        variant="ghost"
        className="xl:hidden"
        onClick={onOpen}
        title="Toggle Sidebar"
      >
        <FiAlignJustify className="size-4" />
      </Button>
      <ThemeToggle />

      {/* Dropdown Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
          >
            <HiOutlineInformationCircle className="size-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 p-2">
          <a
            target="blank"
            href="https://horizon-ui.com/boilerplate-shadcn#pricing"
            className="w-full"
          >
            <Button variant="outline" className="mb-2 w-full">
              Pricing
            </Button>
          </a>
          <a target="blank" href="mailto:hello@horizon-ui.com">
            <Button variant="outline" className="mb-2 w-full">
              Help & Support
            </Button>
          </a>
          <a target="blank" href="/#faqs">
            <Button variant="outline" className="w-full">
              FAQs & More
            </Button>
          </a>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
