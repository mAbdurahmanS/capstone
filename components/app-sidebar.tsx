"use client"

import * as React from "react"
import {
  IconDashboard,
  IconInnerShadowTop,
  IconTicket,
  IconUser,
  IconCategory,
  IconBuilding,
  IconUsersGroup,
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
      title: "Ticket",
      url: "/dashboard/ticket",
      icon: IconTicket,
    },
    {
      title: "Engineer",
      url: "/dashboard/engineer",
      icon: IconUsersGroup,
    },
    {
      title: "User",
      url: "/dashboard/user",
      icon: IconUser,
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
  const [user, setUser] = React.useState<any>(null)

  React.useEffect(() => {
    const getUser = async () => {
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        console.error("Unauthorized")
      }
    }

    getUser()
  }, [])

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
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Capstone</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
