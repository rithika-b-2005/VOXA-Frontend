"use client"

import * as React from "react"
import {
  IconLayoutDashboard,
  IconArrowsExchange,
  IconFolder,
  IconInnerShadowTop,
  IconRefresh,
  IconBell,
  IconTargetArrow,
  IconChartLine,
  IconCreditCard,
  IconBulb,
  IconUsers,
  IconBook,
  IconReceipt2,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext"

const navSections = [
  {
    label: "Core",
    items: [
      {
        title: "Overview",
        url: "/Dashboard",
        icon: IconLayoutDashboard,
      },
      {
        title: "Transaction",
        url: "/Dashboard/transaction",
        icon: IconArrowsExchange,
      },
      {
        title: "Categories",
        url: "/Dashboard/categories",
        icon: IconFolder,
      },
    ],
  },
  {
    label: "Financial Planning",
    items: [
      {
        title: "Goals",
        url: "/Dashboard/goals",
        icon: IconTargetArrow,
      },
      {
        title: "Net Worth",
        url: "/Dashboard/net-worth",
        icon: IconChartLine,
      },
      {
        title: "Debt Planner",
        url: "/Dashboard/debt-planner",
        icon: IconCreditCard,
      },
      {
        title: "Tax Estimation",
        url: "/Dashboard/tax-estimation",
        icon: IconReceipt2,
      },
    ],
  },
  {
    label: "Insights",
    items: [
      {
        title: "Saving Tips",
        url: "/Dashboard/saving-tips",
        icon: IconBulb,
      },
      {
        title: "Benchmarks",
        url: "/Dashboard/benchmarks",
        icon: IconUsers,
      },
      {
        title: "Learn",
        url: "/Dashboard/recommendations",
        icon: IconBook,
      },
    ],
  },
  {
    label: "Management",
    items: [
      {
        title: "Subscriptions",
        url: "/Dashboard/subscriptions",
        icon: IconRefresh,
      },
      {
        title: "Reminders",
        url: "/Dashboard/reminders",
        icon: IconBell,
      },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  const userData = {
    name: user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName || user?.email?.split('@')[0] || 'User',
    email: user?.email || '',
    avatar: '',
  }

  return (
    <Sidebar collapsible="offcanvas" className="bg-sidebar border-r border-sidebar-border" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Voxa Expense</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain sections={navSections} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
