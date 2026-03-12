"use client"

import * as React from "react"
import {
  IconBrandWhatsapp,
  IconBrandSlack,
  IconArrowLeft,
  IconInfoCircle,
} from "@tabler/icons-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ChatSimulator } from "@/components/integrations/ChatSimulator"

export default function IntegrationDemoPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/Dashboard/integrations">
          <Button variant="ghost" size="icon">
            <IconArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Try Chat Integration</h1>
          <p className="text-sm text-muted-foreground">
            Test how Voxa works in WhatsApp and Slack before connecting
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* WhatsApp Demo */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconBrandWhatsapp className="h-5 w-5 text-green-500" />
              <span className="font-medium">WhatsApp Demo</span>
            </div>
            <Link href="/Dashboard/integrations/connect?platform=whatsapp">
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                Connect WhatsApp
              </Button>
            </Link>
          </div>
          <ChatSimulator platform="whatsapp" />
        </div>

        {/* Slack Demo */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconBrandSlack className="h-5 w-5 text-purple-500" />
              <span className="font-medium">Slack Demo</span>
            </div>
            <Link href="/Dashboard/integrations/connect?platform=slack">
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                Connect Slack
              </Button>
            </Link>
          </div>
          <ChatSimulator platform="slack" />
        </div>
      </div>

      {/* Instructions */}
      <Card className="bg-blue-500/10 border-blue-500/30">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <IconInfoCircle className="h-6 w-6 text-blue-400 shrink-0" />
            <div className="space-y-2">
              <h3 className="font-medium text-blue-400">Try These Commands</h3>
              <div className="grid gap-2 md:grid-cols-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Check pending approvals:</p>
                  <code className="bg-white/10 px-2 py-1 rounded">/pending</code>
                </div>
                <div>
                  <p className="text-muted-foreground">Check account balance:</p>
                  <code className="bg-white/10 px-2 py-1 rounded">/balance</code>
                </div>
                <div>
                  <p className="text-muted-foreground">Approve an expense:</p>
                  <code className="bg-white/10 px-2 py-1 rounded">/approve EXP-4523</code>
                </div>
                <div>
                  <p className="text-muted-foreground">Reject with reason:</p>
                  <code className="bg-white/10 px-2 py-1 rounded">/reject EXP-4518 missing receipt</code>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                You can also try natural language like "Approve the expense from Alex" or "What's my balance?"
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-lg">Instant Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Approve or reject expenses directly from WhatsApp or Slack. No need to log into the dashboard.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-lg">Smart Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Get real-time alerts for urgent approvals, payment confirmations, and compliance deadlines.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-lg">Natural Language</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Voxa AI understands natural language. Just ask questions like you would to a colleague.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
