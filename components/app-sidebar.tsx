"use client"

import * as React from "react"
import {
  IconDashboard,
  IconTicket,
  IconUser,
  IconUsersGroup,
  IconChartBarPopular,
  IconUserShield,
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
import { Ticket } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useFetchUsers } from "@/hooks/useFetchUsers"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Performance",
      url: "/dashboard/performance",
      icon: IconChartBarPopular,
    },
    {
      title: "Ticket",
      url: "/dashboard/ticket",
      icon: IconTicket,
    },
    {
      title: "Admin",
      url: "/dashboard/admin",
      icon: IconUserShield,
      onlyAdmin: true,
    },
    {
      title: "Engineer",
      url: "/dashboard/engineer",
      icon: IconUsersGroup,
      onlyAdmin: true,
    },
    {
      title: "User",
      url: "/dashboard/user",
      icon: IconUser,
      onlyAdmin: true,
    },
    // {
    //   title: "Category",
    //   url: "/dashboard/category",
    //   icon: IconCategory,
    // },
    // {
    //   title: "Department",
    //   url: "/dashboard/department",
    //   icon: IconBuilding,
    // },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const { user: userAuth, isAdmin } = useAuth()

  const { users: user, mutate } = useFetchUsers(userAuth?.id)

  if (!user) return null // atau loader

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Ticket className="h-6 w-6 text-white" />
                </div>
                {/* <IconInnerShadowTop className="!size-5" /> */}
                <span className="text-base font-semibold">Capstone</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain.filter(item => !item.onlyAdmin || isAdmin)} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} mutate={mutate} />
      </SidebarFooter>
    </Sidebar>
  )
}
