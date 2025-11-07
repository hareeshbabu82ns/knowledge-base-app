/* eslint-disable tailwindcss/enforces-negative-arbitrary-values */
import { IRoute } from "@/types/types";
import {
  HiOutlineHome,
  HiOutlineCpuChip,
  HiOutlineUsers,
  HiOutlineUser,
  HiOutlineCog8Tooth,
  HiOutlineCreditCard,
  HiOutlineDocumentText,
  HiOutlineCurrencyDollar,
} from "react-icons/hi2";
import { Icons } from "./shared/icons";

export const routes: IRoute[] = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: <HiOutlineHome className="size-4 stroke-2 text-inherit" />,
    collapse: false,
  },
  {
    name: "Expenses",
    path: "/expenses",
    icon: <Icons.expenses className="size-4 stroke-2 text-inherit" />,
    collapse: false,
    items: [
      {
        name: "Accounts",
        layout: "/expenses",
        path: "/accounts",
        icon: <Icons.accounts className="size-4 stroke-2 text-inherit" />,
        collapse: false,
      },
      {
        name: "Transactions",
        layout: "/expenses",
        path: "/transactions",
        icon: <Icons.transactions className="size-4 stroke-2 text-inherit" />,
        collapse: false,
      },
      {
        name: "Upload",
        layout: "/expenses",
        path: "/upload",
        icon: <Icons.upload className="size-4 stroke-2 text-inherit" />,
        collapse: false,
      },
    ],
  },
  {
    name: "Loans",
    path: "/loans",
    icon: <Icons.expenses className="size-4 stroke-2 text-inherit" />,
    collapse: false,
    items: [
      {
        name: "Dashboard",
        layout: "/loans",
        path: "/dashboard",
        icon: <Icons.accounts className="size-4 stroke-2 text-inherit" />,
        collapse: false,
      },
      {
        name: "Accounts",
        layout: "/loans",
        path: "/accounts",
        icon: <Icons.transactions className="size-4 stroke-2 text-inherit" />,
        collapse: false,
      },
    ],
  },
  {
    name: "AI Chat",
    path: "/dashboard/ai-chat",
    icon: <HiOutlineCpuChip className="size-4 stroke-2 text-inherit" />,
    collapse: false,
  },
  {
    name: "AI Generator",
    path: "/dashboard/ai-generator",
    icon: <HiOutlineDocumentText className="size-4 stroke-2 text-inherit" />,
    collapse: false,
    disabled: true,
  },
  {
    name: "AI Assistant",
    path: "/dashboard/ai-assistant",
    icon: <HiOutlineUser className="size-4 stroke-2 text-inherit" />,
    collapse: false,
    disabled: true,
  },
  {
    name: "Users",
    path: "/users",
    icon: <HiOutlineUsers className="size-4 stroke-2 text-inherit" />,
    collapse: false,
    requiredRole: "ADMIN",
  },
  {
    name: "Profile",
    path: "/profile",
    icon: <HiOutlineUser className="size-4 stroke-2 text-inherit" />,
    collapse: false,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: <HiOutlineCog8Tooth className="size-4 stroke-2 text-inherit" />,
    collapse: false,
  },
  {
    name: "Subscription",
    path: "/dashboard/subscription",
    icon: <HiOutlineCreditCard className="size-4 stroke-2 text-inherit" />,
    collapse: false,
    disabled: true,
  },
  {
    name: "Landing Page",
    path: "/home",
    icon: <HiOutlineDocumentText className="size-4 stroke-2 text-inherit" />,
    collapse: false,
    disabled: true,
  },
  {
    name: "Pricing Page",
    path: "/pricing",
    icon: <HiOutlineCurrencyDollar className="size-4 stroke-2 text-inherit" />,
    collapse: false,
    disabled: true,
  },
];
