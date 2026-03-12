"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  IconLayoutDashboard,
  IconFileInvoice,
  IconCreditCard,
  IconFileText,
  IconSettings,
  IconBell,
  IconMessage,
  IconLogout,
  IconChevronDown,
  IconBuilding,
  IconUser,
  IconMenu2,
  IconX,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

interface NavItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/vendor",
    icon: IconLayoutDashboard,
  },
  {
    title: "My Invoices",
    url: "/vendor/invoices",
    icon: IconFileInvoice,
    badge: 3,
  },
  {
    title: "Payments",
    url: "/vendor/payments",
    icon: IconCreditCard,
  },
  {
    title: "Contracts",
    url: "/vendor/contracts",
    icon: IconFileText,
  },
  {
    title: "Messages",
    url: "/vendor/messages",
    icon: IconMessage,
    badge: 2,
  },
  {
    title: "Settings",
    url: "/vendor/settings",
    icon: IconSettings,
  },
]

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [notificationsOpen, setNotificationsOpen] = React.useState(false)

  const notifications = [
    { id: 1, title: "Invoice #INV-2024-089 approved", time: "2 hours ago", read: false },
    { id: 2, title: "Payment of ₹45,000 processed", time: "1 day ago", read: false },
    { id: 3, title: "Contract renewal reminder", time: "3 days ago", read: true },
  ]

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-black border-r border-white/10 transform transition-transform duration-300 lg:translate-x-0 lg:static ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <Link href="/vendor" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <IconBuilding className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="font-semibold">Voxa</span>
                <span className="text-xs text-muted-foreground block">Vendor Portal</span>
              </div>
            </Link>
            <button
              className="lg:hidden p-1 hover:bg-white/10 rounded"
              onClick={() => setSidebarOpen(false)}
            >
              <IconX className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Vendor Info */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-semibold">
              TS
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">TechSupplies Ltd</p>
              <p className="text-xs text-muted-foreground">Vendor ID: VND-0042</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-2 flex-1">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.url
              return (
                <li key={item.url}>
                  <Link
                    href={item.url}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-muted-foreground hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.title}</span>
                    </span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-purple-500 text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Help Section */}
        <div className="p-4 border-t border-white/10">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
            <p className="text-sm font-medium mb-1">Need Help?</p>
            <p className="text-xs text-muted-foreground mb-3">
              Contact your account manager or browse FAQs.
            </p>
            <Button size="sm" variant="outline" className="w-full border-white/10 text-xs">
              <IconMessage className="h-3 w-3 mr-2" />
              Contact Support
            </Button>
          </div>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-all"
          >
            <IconLogout className="h-4 w-4" />
            <span className="text-sm">Back to Main Site</span>
          </Link>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-30 border-b border-white/10 bg-black/80 backdrop-blur-lg">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <IconMenu2 className="h-5 w-5" />
            </button>

            {/* Search - hidden on mobile */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <input
                type="text"
                placeholder="Search invoices, payments..."
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-purple-500/50"
              />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <div className="relative">
                <button
                  className="p-2 hover:bg-white/10 rounded-lg relative"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                >
                  <IconBell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl border border-white/10 bg-black shadow-xl">
                    <div className="p-3 border-b border-white/10">
                      <p className="font-medium">Notifications</p>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 border-b border-white/5 hover:bg-white/5 cursor-pointer ${
                            !notif.read ? "bg-purple-500/5" : ""
                          }`}
                        >
                          <p className="text-sm">{notif.title}</p>
                          <p className="text-xs text-muted-foreground">{notif.time}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-2">
                      <Button variant="ghost" size="sm" className="w-full text-xs">
                        View All Notifications
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <button className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-sm font-medium">
                  TS
                </div>
                <span className="hidden md:block text-sm">TechSupplies</span>
                <IconChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 px-6 py-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <p>© 2024 Voxa Expense. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="#" className="hover:text-white">Privacy Policy</Link>
              <Link href="#" className="hover:text-white">Terms of Service</Link>
              <Link href="#" className="hover:text-white">Help Center</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
