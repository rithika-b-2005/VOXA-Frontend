"use client"

import * as React from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  IconUser,
  IconBell,
  IconPalette,
  IconShield,
  IconCurrencyDollar,
  IconCheck,
  IconX,
  IconEye,
  IconEyeOff,
  IconWallet,
  IconReceipt,
  IconCreditCard,
  IconBuildingBank,
  IconPlus,
  IconTrash,
  IconCrown,
  IconRocket,
  IconStar,
} from "@tabler/icons-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useAuth } from "@/contexts/AuthContext"
import { userApi } from "@/lib/api"

interface Settings {
  fullName: string
  email: string
  phone: string
  currency: string
  darkMode: boolean
  notifications: boolean
  emailAlerts: boolean
  budgetAlerts: boolean
  transactionAlerts: boolean
  monthlyReports: boolean
  linkedAccounts: LinkedAccount[]
  billingPlan: string
}

interface LinkedAccount {
  id: string
  type: "bank" | "card"
  name: string
  last4: string
  isDefault: boolean
}

const defaultAccounts: LinkedAccount[] = [
  { id: "1", type: "bank", name: "Chase Bank", last4: "4532", isDefault: true },
  { id: "2", type: "card", name: "Visa Credit Card", last4: "8901", isDefault: false },
]

const billingPlans = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    period: "forever",
    features: ["10 free credits", "Basic dashboard", "Manual transactions", "Standard categories"],
    icon: IconStar,
  },
  {
    id: "monthly",
    name: "Monthly",
    price: "₹99",
    period: "/month",
    features: ["Unlimited transactions", "Voice input", "Export/Import data", "Budget tracking"],
    icon: IconRocket,
    popular: true,
  },
  {
    id: "yearly",
    name: "Yearly",
    price: "₹899",
    period: "/year",
    features: ["Everything in Monthly", "AI receipt scanner", "Predictive insights", "Save 25%"],
    icon: IconCrown,
  },
]

export default function SettingsPage() {
  const { user } = useAuth()
  const [fullName, setFullName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [currency, setCurrency] = React.useState("USD")
  const [darkMode, setDarkMode] = React.useState(true)
  const [notifications, setNotifications] = React.useState(true)
  const [emailAlerts, setEmailAlerts] = React.useState(true)
  const [budgetAlerts, setBudgetAlerts] = React.useState(true)
  const [transactionAlerts, setTransactionAlerts] = React.useState(true)
  const [monthlyReports, setMonthlyReports] = React.useState(true)

  const [linkedAccounts, setLinkedAccounts] = React.useState<LinkedAccount[]>(defaultAccounts)
  const [billingPlan, setBillingPlan] = React.useState("free")
  const [addAccountOpen, setAddAccountOpen] = React.useState(false)
  const [newAccountType, setNewAccountType] = React.useState<"bank" | "card">("bank")
  const [newAccountName, setNewAccountName] = React.useState("")
  const [newAccountNumber, setNewAccountNumber] = React.useState("")

  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false)
  const [showNewPassword, setShowNewPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

  const [saveMessage, setSaveMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null)
  const [passwordMessage, setPasswordMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null)
  const [hasChanges, setHasChanges] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)

  // Load settings from user profile and localStorage on mount
  React.useEffect(() => {
    // Load from localStorage first (as fallback)
    if (typeof window !== 'undefined') {
      const savedPrefs = localStorage.getItem('voxa_preferences')
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs)
        setDarkMode(prefs.darkMode ?? true)
        setEmailAlerts(prefs.emailAlerts ?? true)
        setBudgetAlerts(prefs.budgetAlerts ?? true)
        setMonthlyReports(prefs.monthlyReports ?? true)
      }
    }

    // Override with user data if available
    if (user) {
      setFullName(`${user.firstName || ""} ${user.lastName || ""}`.trim())
      setEmail(user.email || "")
      setPhone((user as any).phone || "")
      if ((user as any).darkMode !== undefined) setDarkMode((user as any).darkMode)
      if ((user as any).emailAlerts !== undefined) setEmailAlerts((user as any).emailAlerts)
      if ((user as any).budgetAlerts !== undefined) setBudgetAlerts((user as any).budgetAlerts)
      if ((user as any).monthlyReports !== undefined) setMonthlyReports((user as any).monthlyReports)
      setBillingPlan(user.isPremium ? "monthly" : "free")
    }
    setMounted(true)
  }, [user])

  // Track changes
  React.useEffect(() => {
    if (mounted) {
      setHasChanges(true)
    }
  }, [fullName, email, phone, currency, darkMode, notifications, emailAlerts, budgetAlerts, transactionAlerts, monthlyReports, linkedAccounts, billingPlan])

  // Apply dark mode to document and save preference changes immediately
  React.useEffect(() => {
    if (mounted) {
      if (darkMode) {
        document.documentElement.classList.add("dark")
        document.documentElement.classList.remove("light")
      } else {
        document.documentElement.classList.remove("dark")
        document.documentElement.classList.add("light")
      }
      // Auto-save preferences to localStorage when changed
      const preferences = { darkMode, budgetAlerts, emailAlerts, monthlyReports }
      localStorage.setItem('voxa_preferences', JSON.stringify(preferences))
    }
  }, [darkMode, budgetAlerts, emailAlerts, monthlyReports, mounted])

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      // Parse full name into firstName and lastName
      const nameParts = fullName.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      // Save preferences to localStorage immediately
      const preferences = { darkMode, budgetAlerts, emailAlerts, monthlyReports }
      localStorage.setItem('voxa_preferences', JSON.stringify(preferences))

      // Update profile
      const profileResult = await userApi.updateProfile({
        firstName,
        lastName,
        phone,
      })

      // Update preferences on server
      const preferencesResult = await userApi.updatePreferences({
        darkMode,
        budgetAlerts,
        emailAlerts,
        monthlyReports,
      })

      if (profileResult.error || preferencesResult.error) {
        setSaveMessage({ type: "error", text: profileResult.error || preferencesResult.error || "Failed to save settings" })
      } else {
        setHasChanges(false)
        setSaveMessage({ type: "success", text: "Settings saved successfully!" })
      }
    } catch (error) {
      // Still consider it a success if localStorage saved
      setHasChanges(false)
      setSaveMessage({ type: "success", text: "Settings saved locally!" })
    } finally {
      setIsSaving(false)
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }

  const handleUpdatePassword = () => {
    if (!currentPassword) {
      setPasswordMessage({ type: "error", text: "Please enter your current password" })
      setTimeout(() => setPasswordMessage(null), 3000)
      return
    }
    if (!newPassword) {
      setPasswordMessage({ type: "error", text: "Please enter a new password" })
      setTimeout(() => setPasswordMessage(null), 3000)
      return
    }
    if (newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "Password must be at least 8 characters" })
      setTimeout(() => setPasswordMessage(null), 3000)
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match" })
      setTimeout(() => setPasswordMessage(null), 3000)
      return
    }

    localStorage.setItem("voxa-password", newPassword)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setPasswordMessage({ type: "success", text: "Password updated successfully!" })
    setTimeout(() => setPasswordMessage(null), 3000)
  }

  const handleRequestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission()
      if (permission === "granted") {
        setNotifications(true)
        new Notification("Voxa Expense", {
          body: "Push notifications enabled!",
          icon: "/logo.svg"
        })
      } else {
        setNotifications(false)
      }
    }
  }

  const handleNotificationToggle = (checked: boolean) => {
    if (checked && "Notification" in window && Notification.permission !== "granted") {
      handleRequestNotificationPermission()
    } else {
      setNotifications(checked)
    }
  }

  const handleAddAccount = () => {
    if (!newAccountName || !newAccountNumber) return

    const newAccount: LinkedAccount = {
      id: Date.now().toString(),
      type: newAccountType,
      name: newAccountName,
      last4: newAccountNumber.slice(-4),
      isDefault: linkedAccounts.length === 0,
    }

    setLinkedAccounts([...linkedAccounts, newAccount])
    setAddAccountOpen(false)
    setNewAccountName("")
    setNewAccountNumber("")
  }

  const handleRemoveAccount = (id: string) => {
    setLinkedAccounts(linkedAccounts.filter(acc => acc.id !== id))
  }

  const handleSetDefaultAccount = (id: string) => {
    setLinkedAccounts(linkedAccounts.map(acc => ({
      ...acc,
      isDefault: acc.id === id
    })))
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const navItems = [
    { id: "profile", label: "Profile", icon: IconUser },
    { id: "billing", label: "Billing", icon: IconReceipt },
    { id: "appearance", label: "Appearance", icon: IconPalette },
    { id: "notifications", label: "Notifications", icon: IconBell },
    { id: "security", label: "Security", icon: IconShield },
  ]

  if (!mounted) {
    return (
      <div className="p-4 h-full">
        <div className="rounded-3xl bg-card border border-white/10 h-full overflow-hidden">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 !h-3" />
            <h1 className="text-lg font-semibold">Settings</h1>
          </header>
          <main className="flex-1 p-6 pt-8 px-10 overflow-auto">
            <div className="grid gap-8 max-w-3xl mx-auto">
              <div className="text-center text-muted-foreground">Loading settings...</div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 h-full">
      <div className="rounded-3xl bg-card border border-white/10 h-full overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 !h-3" />
          <h1 className="text-lg font-semibold">Settings</h1>
          {hasChanges && (
            <span className="ml-2 text-xs text-yellow-500">(unsaved changes)</span>
          )}
        </header>
        <main className="flex-1 p-6 pt-8 px-10 h-[calc(100%-4rem)] overflow-y-auto">
          <div className="flex gap-6 max-w-6xl mx-auto relative">
            {/* Content Area */}
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-6 pb-8 auto-rows-min">
            {/* Profile Section */}
            <div id="profile" className="rounded-2xl border border-white/10 bg-white/5 p-6 scroll-mt-20 col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <IconUser className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Profile</h2>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    placeholder="Enter your name"
                    className="bg-white/5 border-white/10"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="bg-white/5 border-white/10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    className="bg-white/5 border-white/10"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Billing Section */}
            <div id="billing" className="rounded-2xl border border-white/10 bg-white/5 p-6 scroll-mt-20 col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <IconReceipt className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Billing & Subscription</h2>
              </div>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {billingPlans.map((plan) => {
                    const Icon = plan.icon
                    const isCurrentPlan = billingPlan === plan.id
                    return (
                      <div
                        key={plan.id}
                        className={`relative p-4 rounded-xl border cursor-pointer transition-all ${
                          isCurrentPlan
                            ? "border-white/50 bg-white/10"
                            : "border-white/10 bg-white/5 hover:border-white/30"
                        }`}
                        onClick={() => setBillingPlan(plan.id)}
                      >
                        {plan.popular && (
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs bg-blue-500 px-2 py-0.5 rounded-full">
                            Popular
                          </span>
                        )}
                        <div className="flex items-center gap-2 mb-3">
                          <Icon className={`h-5 w-5 ${plan.id === "premium" ? "text-yellow-400" : plan.id === "pro" ? "text-blue-400" : "text-gray-400"}`} />
                          <h3 className="font-semibold">{plan.name}</h3>
                        </div>
                        <div className="mb-3">
                          <span className="text-2xl font-bold">{plan.price}</span>
                          <span className="text-sm text-muted-foreground">{plan.period}</span>
                        </div>
                        <ul className="space-y-1">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                              <IconCheck className="h-3 w-3 text-green-400" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        {isCurrentPlan && (
                          <div className="mt-3 text-center">
                            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Current Plan</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Preferences Section */}
            <div id="preferences" className="rounded-2xl border border-white/10 bg-white/5 p-6 scroll-mt-20 col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <IconPalette className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Preferences</h2>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <p className="text-sm font-medium">Dark Mode</p>
                    <p className="text-xs text-muted-foreground">Use dark theme</p>
                  </div>
                  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <p className="text-sm font-medium">Budget Alerts</p>
                    <p className="text-xs text-muted-foreground">Budget limit alerts</p>
                  </div>
                  <Switch checked={budgetAlerts} onCheckedChange={setBudgetAlerts} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <p className="text-sm font-medium">Email Alerts</p>
                    <p className="text-xs text-muted-foreground">Important alerts</p>
                  </div>
                  <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <p className="text-sm font-medium">Monthly Reports</p>
                    <p className="text-xs text-muted-foreground">Spending summary</p>
                  </div>
                  <Switch checked={monthlyReports} onCheckedChange={setMonthlyReports} />
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div id="security" className="rounded-2xl border border-white/10 bg-white/5 p-6 scroll-mt-20 col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <IconShield className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Security</h2>
              </div>
              <div className="grid gap-4">
                <div className="grid gap-3">
                  <label className="text-sm font-medium">Change Password</label>
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Current password"
                      className="bg-white/5 border-white/10 pr-10"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="New password (min 8 characters)"
                      className="bg-white/5 border-white/10 pr-10"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      className="bg-white/5 border-white/10 pr-10"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                    </button>
                  </div>
                  {newPassword && newPassword.length < 8 && (
                    <p className="text-sm text-yellow-500">Password must be at least 8 characters</p>
                  )}
                  {newPassword && confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-sm text-red-500">Passwords do not match</p>
                  )}
                  {newPassword && confirmPassword && newPassword === confirmPassword && newPassword.length >= 8 && (
                    <p className="text-sm text-green-500">Passwords match</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    className="w-fit"
                    onClick={handleUpdatePassword}
                    disabled={!currentPassword || !newPassword || newPassword !== confirmPassword || newPassword.length < 8}
                  >
                    Update Password
                  </Button>
                  {passwordMessage && (
                    <span className={`text-sm flex items-center gap-1 ${passwordMessage.type === "success" ? "text-green-500" : "text-red-500"}`}>
                      {passwordMessage.type === "success" ? <IconCheck className="h-4 w-4" /> : <IconX className="h-4 w-4" />}
                      {passwordMessage.text}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end gap-4 col-span-2">
              {saveMessage && (
                <span className={`text-sm flex items-center gap-1 ${saveMessage.type === "success" ? "text-green-500" : "text-red-500"}`}>
                  {saveMessage.type === "success" ? <IconCheck className="h-4 w-4" /> : <IconX className="h-4 w-4" />}
                  {saveMessage.text}
                </span>
              )}
              <Button
                className="bg-white text-black hover:bg-white/90 px-8"
                onClick={handleSaveSettings}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>

              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
