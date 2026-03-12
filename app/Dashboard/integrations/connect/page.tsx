"use client"

import * as React from "react"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import {
  IconBrandWhatsapp,
  IconBrandSlack,
  IconBrandTeams,
  IconCheck,
  IconChevronRight,
  IconArrowLeft,
  IconQrcode,
  IconDeviceMobile,
  IconShieldCheck,
  IconBell,
  IconSettings,
  IconCopy,
  IconExternalLink,
  IconLoader2,
} from "@tabler/icons-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

const platforms = {
  whatsapp: {
    name: "WhatsApp Business",
    icon: IconBrandWhatsapp,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    steps: [
      {
        title: "Scan QR Code",
        description: "Open WhatsApp on your phone and scan the QR code",
        icon: IconQrcode,
      },
      {
        title: "Verify Phone Number",
        description: "Enter the verification code sent to your phone",
        icon: IconDeviceMobile,
      },
      {
        title: "Authorize Permissions",
        description: "Allow Voxa to send messages on behalf of your business",
        icon: IconShieldCheck,
      },
      {
        title: "Configure Notifications",
        description: "Choose which notifications to receive via WhatsApp",
        icon: IconBell,
      },
    ],
  },
  slack: {
    name: "Slack",
    icon: IconBrandSlack,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    steps: [
      {
        title: "Connect Workspace",
        description: "Sign in to your Slack workspace",
        icon: IconBrandSlack,
      },
      {
        title: "Select Channel",
        description: "Choose a channel for finance notifications",
        icon: IconSettings,
      },
      {
        title: "Authorize App",
        description: "Allow Voxa bot to post messages and receive commands",
        icon: IconShieldCheck,
      },
      {
        title: "Configure Notifications",
        description: "Choose which notifications to send to Slack",
        icon: IconBell,
      },
    ],
  },
  teams: {
    name: "Microsoft Teams",
    icon: IconBrandTeams,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    steps: [
      {
        title: "Sign in with Microsoft",
        description: "Use your Microsoft 365 account",
        icon: IconBrandTeams,
      },
      {
        title: "Select Team",
        description: "Choose a team and channel for notifications",
        icon: IconSettings,
      },
      {
        title: "Authorize Permissions",
        description: "Allow Voxa to send adaptive cards and messages",
        icon: IconShieldCheck,
      },
      {
        title: "Configure Notifications",
        description: "Choose which notifications to send to Teams",
        icon: IconBell,
      },
    ],
  },
}

function ConnectIntegrationContent() {
  const searchParams = useSearchParams()
  const platformKey = (searchParams.get("platform") || "whatsapp") as keyof typeof platforms
  const platform = platforms[platformKey]

  const [currentStep, setCurrentStep] = React.useState(0)
  const [isConnecting, setIsConnecting] = React.useState(false)
  const [isConnected, setIsConnected] = React.useState(false)
  const [verificationCode, setVerificationCode] = React.useState("")

  const Icon = platform.icon

  const handleConnect = async () => {
    setIsConnecting(true)
    // Simulate connection process
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsConnecting(false)
    setCurrentStep(prev => prev + 1)
  }

  const handleComplete = async () => {
    setIsConnecting(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsConnecting(false)
    setIsConnected(true)
  }

  if (isConnected) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="max-w-2xl mx-auto w-full">
          <Card className={`${platform.bgColor} border ${platform.borderColor}`}>
            <CardContent className="pt-12 pb-12 text-center">
              <div className={`inline-flex rounded-full p-4 ${platform.bgColor} mb-4`}>
                <IconCheck className={`h-12 w-12 ${platform.color}`} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Successfully Connected!</h2>
              <p className="text-muted-foreground mb-6">
                {platform.name} is now connected to your Voxa account. You can start receiving
                notifications and using chat commands.
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/Dashboard/integrations">
                  <Button variant="outline">
                    <IconArrowLeft className="mr-2 h-4 w-4" />
                    Back to Integrations
                  </Button>
                </Link>
                <Button className={platform.color === "text-green-500" ? "bg-green-600 hover:bg-green-700" : platform.color === "text-purple-500" ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"}>
                  <IconBell className="mr-2 h-4 w-4" />
                  Configure Notifications
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/Dashboard/integrations">
          <Button variant="ghost" size="icon">
            <IconArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className={`rounded-lg p-2 ${platform.bgColor}`}>
            <Icon className={`h-6 w-6 ${platform.color}`} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Connect {platform.name}</h1>
            <p className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {platform.steps.length}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto w-full">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {platform.steps.map((step, idx) => {
            const StepIcon = step.icon
            const isActive = idx === currentStep
            const isCompleted = idx < currentStep

            return (
              <React.Fragment key={idx}>
                <div className="flex flex-col items-center">
                  <div
                    className={`rounded-full p-3 ${
                      isCompleted
                        ? "bg-green-500"
                        : isActive
                        ? platform.bgColor
                        : "bg-white/5"
                    } ${isActive ? `border-2 ${platform.borderColor}` : ""}`}
                  >
                    {isCompleted ? (
                      <IconCheck className="h-5 w-5 text-white" />
                    ) : (
                      <StepIcon className={`h-5 w-5 ${isActive ? platform.color : "text-muted-foreground"}`} />
                    )}
                  </div>
                  <span className={`text-xs mt-2 ${isActive ? "text-white" : "text-muted-foreground"}`}>
                    {step.title}
                  </span>
                </div>
                {idx < platform.steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${isCompleted ? "bg-green-500" : "bg-white/10"}`} />
                )}
              </React.Fragment>
            )
          })}
        </div>

        {/* Step Content */}
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle>{platform.steps[currentStep].title}</CardTitle>
            <CardDescription>{platform.steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* WhatsApp Step 0: QR Code */}
            {platformKey === "whatsapp" && currentStep === 0 && (
              <div className="flex flex-col items-center gap-6">
                <div className="bg-white p-4 rounded-lg">
                  {/* Simulated QR Code */}
                  <div className="w-48 h-48 bg-black grid grid-cols-8 gap-0.5 p-2">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div
                        key={i}
                        className={`aspect-square ${Math.random() > 0.5 ? "bg-white" : "bg-black"}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Open WhatsApp on your phone → Settings → Linked Devices → Link a Device
                  </p>
                  <Badge variant="outline" className="border-green-500/50 text-green-500">
                    Waiting for scan...
                  </Badge>
                </div>
              </div>
            )}

            {/* WhatsApp Step 1: Verification */}
            {platformKey === "whatsapp" && currentStep === 1 && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <p className="text-muted-foreground">
                    Enter the 6-digit code sent to your WhatsApp
                  </p>
                </div>
                <div className="flex justify-center gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Input
                      key={i}
                      className="w-12 h-12 text-center text-xl bg-white/5 border-white/10"
                      maxLength={1}
                      value={verificationCode[i] || ""}
                      onChange={(e) => {
                        const newCode = verificationCode.split("")
                        newCode[i] = e.target.value
                        setVerificationCode(newCode.join(""))
                        // Auto-focus next input
                        if (e.target.value && i < 5) {
                          const nextInput = e.target.parentElement?.children[i + 1] as HTMLInputElement
                          nextInput?.focus()
                        }
                      }}
                    />
                  ))}
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Didn't receive code? <button className="text-green-500 hover:underline">Resend</button>
                </p>
              </div>
            )}

            {/* Slack Step 0: Connect Workspace */}
            {platformKey === "slack" && currentStep === 0 && (
              <div className="space-y-4">
                <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-center">
                  <IconBrandSlack className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Connect to Slack</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click below to sign in with Slack and authorize Voxa
                  </p>
                  <Button className="bg-[#4a154b] hover:bg-[#4a154b]/80">
                    <IconBrandSlack className="mr-2 h-5 w-5" />
                    Add to Slack
                    <IconExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Slack Step 1: Select Channel */}
            {platformKey === "slack" && currentStep === 1 && (
              <div className="space-y-4">
                <Label>Select Channel</Label>
                <div className="space-y-2">
                  {["#finance-alerts", "#expense-approvals", "#general", "#accounting"].map((channel) => (
                    <div
                      key={channel}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4 cursor-pointer hover:bg-white/10"
                    >
                      <span>{channel}</span>
                      <input type="radio" name="channel" className="h-4 w-4" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Teams Step 0: Microsoft Sign-in */}
            {platformKey === "teams" && currentStep === 0 && (
              <div className="space-y-4">
                <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-center">
                  <IconBrandTeams className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Sign in with Microsoft</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Use your Microsoft 365 account to connect Teams
                  </p>
                  <Button className="bg-[#0078d4] hover:bg-[#0078d4]/80">
                    <IconBrandTeams className="mr-2 h-5 w-5" />
                    Sign in with Microsoft
                    <IconExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Authorization Step (Step 2 for all platforms) */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="rounded-lg border border-white/10 bg-white/5 p-6">
                  <h3 className="font-medium mb-4">Voxa will be able to:</h3>
                  <ul className="space-y-3">
                    {[
                      "Send expense approval requests",
                      "Receive approval/rejection commands",
                      "Send payment notifications",
                      "Process quick commands",
                      "Send weekly summaries",
                    ].map((permission, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <IconCheck className={`h-5 w-5 ${platform.color}`} />
                        <span className="text-sm">{permission}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-xs text-muted-foreground">
                  By continuing, you agree to allow Voxa to access your {platform.name} account
                  for the purposes listed above. You can revoke access at any time.
                </p>
              </div>
            )}

            {/* Notification Configuration Step (Step 3 for all platforms) */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-3">
                  {[
                    { label: "Expense approval requests", enabled: true },
                    { label: "Payment confirmations", enabled: true },
                    { label: "Compliance alerts", enabled: true },
                    { label: "Weekly summary reports", enabled: false },
                    { label: "Budget warnings", enabled: true },
                  ].map((notif, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
                    >
                      <span className="text-sm">{notif.label}</span>
                      <input type="checkbox" defaultChecked={notif.enabled} className="h-4 w-4" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator className="bg-white/10" />

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                disabled={currentStep === 0 || isConnecting}
              >
                <IconArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              {currentStep < platform.steps.length - 1 ? (
                <Button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className={platform.color === "text-green-500" ? "bg-green-600 hover:bg-green-700" : platform.color === "text-purple-500" ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"}
                >
                  {isConnecting ? (
                    <>
                      <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      Continue
                      <IconChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={isConnecting}
                  className={platform.color === "text-green-500" ? "bg-green-600 hover:bg-green-700" : platform.color === "text-purple-500" ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"}
                >
                  {isConnecting ? (
                    <>
                      <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <IconCheck className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded" />
        <div>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="max-w-3xl mx-auto w-full">
        <Skeleton className="h-16 w-full mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  )
}

export default function ConnectIntegrationPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ConnectIntegrationContent />
    </Suspense>
  )
}
