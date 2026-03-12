"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconArrowLeft,
  IconTrendingUp,
  IconTrendingDown,
  IconCreditCard,
  IconBuildingBank,
  IconChartLine,
  IconTarget,
  IconAlertTriangle,
  IconCheck,
  IconSparkles,
  IconInfoCircle,
  IconArrowRight,
  IconPercentage,
  IconCalendar,
  IconCoin,
  IconWallet,
  IconScale,
  IconShieldCheck,
  IconBolt,
  IconChartBar,
  IconCash,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  RadialBarChart,
  RadialBar,
} from "recharts"

interface CreditOffer {
  id: string
  provider: string
  type: "term_loan" | "credit_line" | "invoice_financing" | "equipment_loan"
  amount: number
  interestRate: number
  tenure: number
  emi?: number
  features: string[]
  recommended?: boolean
}

const creditScore = 78
const creditScoreData = [{ name: "Score", value: creditScore, fill: "#10b981" }]

const cashFlowProjection = [
  { month: "Dec", inflow: 890000, outflow: 750000, balance: 1245000 },
  { month: "Jan", inflow: 720000, outflow: 820000, balance: 1145000 },
  { month: "Feb", inflow: 650000, outflow: 780000, balance: 1015000 },
  { month: "Mar", inflow: 950000, outflow: 700000, balance: 1265000 },
  { month: "Apr", inflow: 880000, outflow: 750000, balance: 1395000 },
  { month: "May", inflow: 920000, outflow: 720000, balance: 1595000 },
]

const paymentPatterns = [
  { month: "Jul", onTime: 95, late: 5 },
  { month: "Aug", onTime: 92, late: 8 },
  { month: "Sep", onTime: 88, late: 12 },
  { month: "Oct", onTime: 96, late: 4 },
  { month: "Nov", onTime: 90, late: 10 },
  { month: "Dec", onTime: 94, late: 6 },
]

const creditOffers: CreditOffer[] = [
  {
    id: "1",
    provider: "HDFC Bank",
    type: "credit_line",
    amount: 2500000,
    interestRate: 12.5,
    tenure: 12,
    features: ["Flexible withdrawals", "Pay interest only on utilized amount", "Quick disbursement"],
    recommended: true,
  },
  {
    id: "2",
    provider: "ICICI Bank",
    type: "term_loan",
    amount: 1500000,
    interestRate: 11.75,
    tenure: 36,
    emi: 49750,
    features: ["Fixed EMI", "No prepayment charges after 6 months", "Online account management"],
  },
  {
    id: "3",
    provider: "Tata Capital",
    type: "invoice_financing",
    amount: 800000,
    interestRate: 14.0,
    tenure: 3,
    features: ["Instant funds against invoices", "No collateral required", "Flexible repayment"],
  },
  {
    id: "4",
    provider: "Bajaj Finance",
    type: "equipment_loan",
    amount: 2000000,
    interestRate: 13.0,
    tenure: 48,
    emi: 53500,
    features: ["Finance up to 80% equipment cost", "Quick approval", "Minimal documentation"],
  },
]

const insights = [
  {
    icon: IconTrendingUp,
    title: "Cash Flow Positive",
    description: "Your business has maintained positive cash flow for 8 consecutive months",
    type: "positive",
  },
  {
    icon: IconAlertTriangle,
    title: "February Crunch Predicted",
    description: "AI predicts a potential cash crunch in February. Consider credit line.",
    type: "warning",
  },
  {
    icon: IconTarget,
    title: "Payment Pattern Improved",
    description: "Your on-time payment rate improved by 6% compared to last quarter",
    type: "positive",
  },
  {
    icon: IconCoin,
    title: "Working Capital Suggestion",
    description: "Based on your growth, consider increasing working capital by ₹5L",
    type: "suggestion",
  },
]

export default function CreditInsightsPage() {
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "term_loan":
        return "Term Loan"
      case "credit_line":
        return "Credit Line"
      case "invoice_financing":
        return "Invoice Financing"
      case "equipment_loan":
        return "Equipment Loan"
      default:
        return type
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/Dashboard/payments">
            <Button variant="ghost" size="icon">
              <IconArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Credit & Financial Insights</h1>
            <p className="text-muted-foreground">
              AI-powered financing recommendations based on your expense patterns
            </p>
          </div>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-purple-500 to-blue-500">
          <IconSparkles className="h-4 w-4" />
          Get Pre-Approved
        </Button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-12 gap-6">
        {/* Credit Score */}
        <div className="col-span-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <IconShieldCheck className="h-4 w-4 text-green-400" />
            Business Credit Score
          </h3>
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="70%"
                  outerRadius="100%"
                  data={creditScoreData}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar
                    dataKey="value"
                    cornerRadius={10}
                    background={{ fill: "rgba(255,255,255,0.1)" }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-green-400">{creditScore}</span>
                <span className="text-xs text-muted-foreground">out of 100</span>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
              Excellent
            </span>
            <p className="text-xs text-muted-foreground mt-2">
              Top 15% of similar businesses
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="col-span-9 grid grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-white/10 bg-white/5">
            <div className="flex items-center gap-2 mb-2">
              <IconWallet className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-muted-foreground">Available Credit</span>
            </div>
            <p className="text-2xl font-bold">₹25L</p>
            <p className="text-xs text-green-400 mt-1">Pre-approved limit</p>
          </div>
          <div className="p-4 rounded-xl border border-white/10 bg-white/5">
            <div className="flex items-center gap-2 mb-2">
              <IconPercentage className="h-4 w-4 text-green-400" />
              <span className="text-sm text-muted-foreground">Best Rate</span>
            </div>
            <p className="text-2xl font-bold">11.75%</p>
            <p className="text-xs text-muted-foreground mt-1">Annual interest</p>
          </div>
          <div className="p-4 rounded-xl border border-white/10 bg-white/5">
            <div className="flex items-center gap-2 mb-2">
              <IconTarget className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-muted-foreground">Payment Score</span>
            </div>
            <p className="text-2xl font-bold">92%</p>
            <p className="text-xs text-muted-foreground mt-1">On-time payments</p>
          </div>
          <div className="p-4 rounded-xl border border-white/10 bg-white/5">
            <div className="flex items-center gap-2 mb-2">
              <IconScale className="h-4 w-4 text-orange-400" />
              <span className="text-sm text-muted-foreground">Debt Ratio</span>
            </div>
            <p className="text-2xl font-bold">28%</p>
            <p className="text-xs text-green-400 mt-1">Healthy range</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Cash Flow Projection */}
        <div className="col-span-8 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Cash Flow Projection</h3>
              <p className="text-sm text-muted-foreground">AI-predicted 6-month forecast</p>
            </div>
            <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm">
              <option className="bg-black">Next 6 months</option>
              <option className="bg-black">Next 12 months</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowProjection}>
                <defs>
                  <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="outflowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickFormatter={(v) => `${v/100000}L`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, ""]}
                />
                <Area type="monotone" dataKey="inflow" stroke="#10b981" fill="url(#inflowGrad)" name="Inflow" />
                <Area type="monotone" dataKey="outflow" stroke="#ef4444" fill="url(#outflowGrad)" name="Outflow" />
                <Line type="monotone" dataKey="balance" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Balance" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-green-500" /> Inflow
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-red-500" /> Outflow
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-purple-500" /> Balance
            </span>
          </div>
        </div>

        {/* AI Insights */}
        <div className="col-span-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <IconSparkles className="h-4 w-4 text-purple-400" />
            AI Financial Insights
          </h3>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-3 rounded-xl border ${
                  insight.type === "positive"
                    ? "bg-green-500/5 border-green-500/20"
                    : insight.type === "warning"
                    ? "bg-yellow-500/5 border-yellow-500/20"
                    : "bg-purple-500/5 border-purple-500/20"
                }`}
              >
                <div className="flex items-start gap-2">
                  <insight.icon
                    className={`h-4 w-4 mt-0.5 ${
                      insight.type === "positive"
                        ? "text-green-400"
                        : insight.type === "warning"
                        ? "text-yellow-400"
                        : "text-purple-400"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium">{insight.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Credit Offers */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <IconCreditCard className="h-4 w-4 text-blue-400" />
              Personalized Credit Offers
            </h3>
            <p className="text-sm text-muted-foreground">
              Based on your financial profile and business patterns
            </p>
          </div>
          <Button variant="outline" className="border-white/10">
            Compare All
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {creditOffers.map((offer) => (
            <div
              key={offer.id}
              className={`p-4 rounded-xl border transition-all relative ${
                offer.recommended
                  ? "bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30"
                  : "bg-white/5 border-white/10 hover:border-white/20"
              }`}
            >
              {offer.recommended && (
                <span className="absolute -top-2 -right-2 px-2 py-0.5 text-[10px] font-medium rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                  Recommended
                </span>
              )}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <IconBuildingBank className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{offer.provider}</span>
                </div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10">
                {getTypeLabel(offer.type)}
              </span>
              <div className="mt-4">
                <p className="text-2xl font-bold">₹{(offer.amount / 100000).toFixed(0)}L</p>
                <div className="flex items-center gap-2 mt-1 text-sm">
                  <span className="text-green-400">{offer.interestRate}% p.a.</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{offer.tenure} months</span>
                </div>
                {offer.emi && (
                  <p className="text-xs text-muted-foreground mt-1">
                    EMI: ₹{offer.emi.toLocaleString()}/month
                  </p>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 space-y-1">
                {offer.features.slice(0, 2).map((feature, i) => (
                  <div key={i} className="flex items-center gap-1 text-xs text-muted-foreground">
                    <IconCheck className="h-3 w-3 text-green-400" />
                    {feature}
                  </div>
                ))}
              </div>
              <Button
                className={`w-full mt-4 ${
                  offer.recommended
                    ? "bg-gradient-to-r from-purple-500 to-blue-500"
                    : "bg-white/10 hover:bg-white/20"
                }`}
                size="sm"
              >
                Apply Now
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Pattern */}
      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <IconChartBar className="h-4 w-4 text-blue-400" />
            Payment Pattern Analysis
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentPatterns}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="onTime" stackId="a" fill="#10b981" name="On Time" radius={[4, 4, 0, 0]} />
                <Bar dataKey="late" stackId="a" fill="#ef4444" name="Late" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <IconBolt className="h-4 w-4 text-yellow-400" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all text-left">
              <IconCash className="h-5 w-5 text-green-400 mb-2" />
              <p className="text-sm font-medium">Working Capital</p>
              <p className="text-xs text-muted-foreground">Get instant funds</p>
            </button>
            <button className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/30 transition-all text-left">
              <IconCreditCard className="h-5 w-5 text-blue-400 mb-2" />
              <p className="text-sm font-medium">Credit Line</p>
              <p className="text-xs text-muted-foreground">Flexible borrowing</p>
            </button>
            <button className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-orange-500/30 transition-all text-left">
              <IconChartLine className="h-5 w-5 text-orange-400 mb-2" />
              <p className="text-sm font-medium">Invoice Financing</p>
              <p className="text-xs text-muted-foreground">Cash against invoices</p>
            </button>
            <button className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all text-left">
              <IconShieldCheck className="h-5 w-5 text-purple-400 mb-2" />
              <p className="text-sm font-medium">Credit Report</p>
              <p className="text-xs text-muted-foreground">Download full report</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
