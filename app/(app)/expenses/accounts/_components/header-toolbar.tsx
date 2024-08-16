"use client";

import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const HeaderToolbar = () => {
  const router = useRouter();
  return (
    <div className="flex flex-row">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          router.push("/expenses/accounts/new");
        }}
      >
        <Icons.add className="size-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          console.log("Import");
        }}
      >
        <Icons.download className="size-5" />
      </Button>
    </div>
  );
};

export default HeaderToolbar;
