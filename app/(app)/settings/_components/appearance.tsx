"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DesktopIcon } from "@radix-ui/react-icons";
import { CheckIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const [ mounted, setMounted ] = useState( false )

  // Only render UI after mounted to avoid hydration issues
  useEffect( () => {
    setMounted( true )
  }, [] )

  if ( !mounted ) {
    return null
  }

  return (
    <div>
      <div className="my-4 space-y-4">
        <div>
          <h3 className="text-lg font-medium">Appearance</h3>
          <p className="text-muted-foreground text-sm">
            Customize the appearance of the app. Automatically switch between
            day and night themes.
          </p>
        </div>
        <Button
          asChild
          variant={"ghost"}
          className="size-fit"
          onClick={() => setTheme( "light" )}
        >
          <div className="flex flex-col gap-3">
            <div className="border-muted hover:border-accent items-center rounded-md border-2 p-1">
              <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
                <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                  <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                  <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                </div>
                <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                  <div className="size-4 rounded-full bg-[#ecedef]" />
                  <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                </div>
                <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                  <div className="size-4 rounded-full bg-[#ecedef]" />
                  <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                </div>
              </div>
            </div>
            <div className="gap-2 flex items-center justify-center rounded-md">
              <SunIcon className={cn( "size-4", theme === 'light' ? 'text-primary text-2xl' : 'text-muted' )} />
              Light
            </div>
          </div>
        </Button>
        <Button
          asChild
          variant={"ghost"}
          onClick={() => setTheme( "dark" )}
          className="size-fit"
        >
          <div className="flex flex-col gap-3">
            <div className="border-muted bg-popover hover:bg-accent hover:text-accent-foreground items-center rounded-md border-2 p-1">
              <div className="space-y-2 rounded-sm bg-neutral-950 p-2">
                <div className="space-y-2 rounded-md bg-neutral-800 p-2 shadow-sm">
                  <div className="h-2 w-[80px] rounded-lg bg-neutral-400" />
                  <div className="h-2 w-[100px] rounded-lg bg-neutral-400" />
                </div>
                <div className="flex items-center space-x-2 rounded-md bg-neutral-800 p-2 shadow-sm">
                  <div className="size-4 rounded-full bg-neutral-400" />
                  <div className="h-2 w-[100px] rounded-lg bg-neutral-400" />
                </div>
                <div className="flex items-center space-x-2 rounded-md bg-neutral-800 p-2 shadow-sm">
                  <div className="size-4 rounded-full bg-neutral-400" />
                  <div className="h-2 w-[100px] rounded-lg bg-neutral-400" />
                </div>
              </div>
            </div>
            <div className="gap-2 flex items-center justify-center rounded-md">
              <MoonIcon className={cn( "size-4", theme === 'dark' ? 'text-primary text-2xl' : 'text-muted' )} />
              Dark
            </div>
          </div>
        </Button>
        <Button
          asChild
          variant={"ghost"}
          onClick={() => setTheme( "system" )}
          className="size-fit"
        >
          <div className="flex flex-col">
            <div className="border-muted bg-popover hover:bg-accent hover:text-accent-foreground items-center rounded-md border-2 p-1">
              <div className="space-y-2 rounded-sm bg-neutral-300 p-2">
                <div className="space-y-2 rounded-md bg-neutral-600 p-2 shadow-sm">
                  <div className="h-2 w-[80px] rounded-lg bg-neutral-400" />
                  <div className="h-2 w-[100px] rounded-lg bg-neutral-400" />
                </div>
                <div className="flex items-center space-x-2 rounded-md bg-neutral-600 p-2 shadow-sm">
                  <div className="size-4 rounded-full bg-neutral-400" />
                  <div className="h-2 w-[100px] rounded-lg bg-neutral-400" />
                </div>
                <div className="flex items-center space-x-2 rounded-md bg-neutral-600 p-2 shadow-sm">
                  <div className="size-4 rounded-full bg-neutral-400" />
                  <div className="h-2 w-[100px] rounded-lg bg-neutral-400" />
                </div>
              </div>
            </div>
            <div className="gap-2 flex items-center justify-center rounded-md">
              <DesktopIcon className={cn( "size-4", theme === 'system' ? 'text-primary text-2xl' : 'text-muted' )} />
              System
            </div>
          </div>
        </Button>
      </div>
    </div>
  );
}
