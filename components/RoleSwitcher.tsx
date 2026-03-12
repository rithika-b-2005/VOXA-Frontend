"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  IconBuilding,
  IconUser,
  IconSwitchHorizontal,
} from "@tabler/icons-react"

export function RoleSwitcher() {
  const pathname = usePathname()
  const isVendorPortal = pathname.startsWith("/vendor")
  const isDashboard = pathname.startsWith("/Dashboard")

  // Only show on Dashboard and Vendor portal pages
  if (!isVendorPortal && !isDashboard) {
    return null
  }

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <Link
        href={isVendorPortal ? "/Dashboard" : "/vendor"}
        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black border border-white/20 shadow-lg hover:border-purple-500/50 transition-all group"
      >
        <div className="flex items-center gap-2">
          {isVendorPortal ? (
            <IconUser className="h-5 w-5 text-blue-400" />
          ) : (
            <IconBuilding className="h-5 w-5 text-orange-400" />
          )}
          <div>
            <p className="text-xs text-muted-foreground">Switch to</p>
            <p className="text-sm font-medium">
              {isVendorPortal ? "Admin Dashboard" : "Vendor Portal"}
            </p>
          </div>
        </div>
        <IconSwitchHorizontal className="h-4 w-4 text-muted-foreground group-hover:text-purple-400 transition-colors" />
      </Link>
    </div>
  )
}
