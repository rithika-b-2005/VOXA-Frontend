"use client"

import * as React from "react"
import {
  IconFileText,
  IconCalendar,
  IconDownload,
  IconEye,
  IconCheck,
  IconClock,
  IconAlertTriangle,
  IconSignature,
  IconRefresh,
  IconChevronRight,
  IconCurrencyRupee,
  IconBuilding,
  IconUser,
  IconMail,
  IconPhone,
  IconFileDescription,
  IconHistory,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

interface Contract {
  id: string
  title: string
  type: "service" | "supply" | "maintenance" | "consulting"
  status: "active" | "expired" | "pending_renewal" | "draft"
  startDate: Date
  endDate: Date
  value: number
  terms: string
  autoRenewal: boolean
  signatories: {
    vendor: string
    company: string
  }
  documents: {
    name: string
    type: string
    size: string
  }[]
  milestones?: {
    title: string
    date: Date
    status: "completed" | "upcoming" | "overdue"
  }[]
}

const contracts: Contract[] = [
  {
    id: "1",
    title: "IT Hardware Supply Agreement",
    type: "supply",
    status: "active",
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 11, 31),
    value: 500000,
    terms: "Annual supply contract for IT hardware and peripherals. Includes delivery within 7 business days.",
    autoRenewal: true,
    signatories: {
      vendor: "Rajesh Kumar (Director)",
      company: "Amit Sharma (Procurement Head)",
    },
    documents: [
      { name: "Contract_2024_Signed.pdf", type: "PDF", size: "2.4 MB" },
      { name: "Terms_Conditions.pdf", type: "PDF", size: "1.1 MB" },
      { name: "Price_List_2024.xlsx", type: "Excel", size: "345 KB" },
    ],
    milestones: [
      { title: "Q1 Review", date: new Date(2024, 2, 31), status: "completed" },
      { title: "Q2 Review", date: new Date(2024, 5, 30), status: "completed" },
      { title: "Q3 Review", date: new Date(2024, 8, 30), status: "completed" },
      { title: "Q4 Review & Renewal", date: new Date(2024, 11, 15), status: "upcoming" },
    ],
  },
  {
    id: "2",
    title: "Monthly Maintenance Service",
    type: "maintenance",
    status: "active",
    startDate: new Date(2024, 3, 1),
    endDate: new Date(2025, 2, 31),
    value: 390000,
    terms: "Monthly IT maintenance and support services. 24/7 helpdesk, on-site support within 4 hours.",
    autoRenewal: false,
    signatories: {
      vendor: "Rajesh Kumar (Director)",
      company: "Priya Singh (IT Manager)",
    },
    documents: [
      { name: "Service_Agreement.pdf", type: "PDF", size: "1.8 MB" },
      { name: "SLA_Document.pdf", type: "PDF", size: "890 KB" },
    ],
  },
  {
    id: "3",
    title: "Software License Reseller Agreement",
    type: "service",
    status: "pending_renewal",
    startDate: new Date(2023, 6, 1),
    endDate: new Date(2024, 5, 30),
    value: 250000,
    terms: "Authorized reseller agreement for enterprise software licenses.",
    autoRenewal: false,
    signatories: {
      vendor: "Rajesh Kumar (Director)",
      company: "Vikram Joshi (CTO)",
    },
    documents: [
      { name: "Reseller_Agreement.pdf", type: "PDF", size: "3.2 MB" },
    ],
  },
]

export default function VendorContractsPage() {
  const [selectedContract, setSelectedContract] = React.useState<Contract | null>(contracts[0])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      case "expired":
        return "bg-gray-500/10 text-gray-400 border-gray-500/20"
      case "pending_renewal":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      case "draft":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      default:
        return "bg-white/10 text-white border-white/20"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <IconCheck className="h-3 w-3" />
      case "expired":
        return <IconClock className="h-3 w-3" />
      case "pending_renewal":
        return <IconAlertTriangle className="h-3 w-3" />
      case "draft":
        return <IconFileText className="h-3 w-3" />
      default:
        return null
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending_renewal":
        return "Pending Renewal"
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "supply":
        return "bg-purple-500/10 text-purple-400"
      case "service":
        return "bg-blue-500/10 text-blue-400"
      case "maintenance":
        return "bg-green-500/10 text-green-400"
      case "consulting":
        return "bg-orange-500/10 text-orange-400"
      default:
        return "bg-white/10 text-white"
    }
  }

  const getDaysRemaining = (endDate: Date) => {
    const today = new Date()
    const diff = endDate.getTime() - today.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const activeContracts = contracts.filter((c) => c.status === "active").length
  const totalValue = contracts.reduce((acc, c) => acc + c.value, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contracts</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your agreements with Voxa Expense
          </p>
        </div>
        <Button variant="outline" className="gap-2 border-white/10">
          <IconHistory className="h-4 w-4" />
          Contract History
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <IconFileText className="h-5 w-5 text-green-400" />
            </div>
          </div>
          <p className="text-2xl font-bold">{activeContracts}</p>
          <p className="text-sm text-muted-foreground">Active Contracts</p>
        </div>

        <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <IconCurrencyRupee className="h-5 w-5 text-purple-400" />
            </div>
          </div>
          <p className="text-2xl font-bold">₹{(totalValue / 100000).toFixed(1)}L</p>
          <p className="text-sm text-muted-foreground">Total Value</p>
        </div>

        <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <IconRefresh className="h-5 w-5 text-yellow-400" />
            </div>
          </div>
          <p className="text-2xl font-bold">1</p>
          <p className="text-sm text-muted-foreground">Pending Renewal</p>
        </div>

        <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <IconCalendar className="h-5 w-5 text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold">27</p>
          <p className="text-sm text-muted-foreground">Days to Next Renewal</p>
        </div>
      </div>

      {/* Contract List & Detail */}
      <div className="grid grid-cols-12 gap-6">
        {/* Contract List */}
        <div className="col-span-5 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h3 className="font-semibold">Your Contracts</h3>
          </div>
          <div className="divide-y divide-white/10">
            {contracts.map((contract) => {
              const daysRemaining = getDaysRemaining(contract.endDate)
              return (
                <div
                  key={contract.id}
                  onClick={() => setSelectedContract(contract)}
                  className={`p-4 hover:bg-white/5 cursor-pointer transition-all ${
                    selectedContract?.id === contract.id ? "bg-white/5" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(contract.type)}`}>
                          {contract.type}
                        </span>
                        <span
                          className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${getStatusBadge(
                            contract.status
                          )}`}
                        >
                          {getStatusIcon(contract.status)}
                          {getStatusLabel(contract.status)}
                        </span>
                      </div>
                      <p className="font-medium">{contract.title}</p>
                    </div>
                    <IconChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>₹{contract.value.toLocaleString()}</span>
                    <span
                      className={
                        daysRemaining <= 30
                          ? "text-yellow-400"
                          : daysRemaining <= 0
                          ? "text-red-400"
                          : ""
                      }
                    >
                      {daysRemaining > 0 ? `${daysRemaining} days remaining` : "Expired"}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Contract Detail */}
        <div className="col-span-7">
          {selectedContract ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden h-full flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(selectedContract.type)}`}>
                        {selectedContract.type}
                      </span>
                      <span
                        className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${getStatusBadge(
                          selectedContract.status
                        )}`}
                      >
                        {getStatusIcon(selectedContract.status)}
                        {getStatusLabel(selectedContract.status)}
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold">{selectedContract.title}</h2>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-white/10">
                      <IconEye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="border-white/10">
                      <IconDownload className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Contract Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <IconCalendar className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-muted-foreground">Contract Period</span>
                    </div>
                    <p className="font-medium">
                      {selectedContract.startDate.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      -{" "}
                      {selectedContract.endDate.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <IconCurrencyRupee className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-muted-foreground">Contract Value</span>
                    </div>
                    <p className="font-medium">₹{selectedContract.value.toLocaleString()}</p>
                  </div>
                </div>

                {/* Terms */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Terms & Conditions</h4>
                  <p className="text-sm text-muted-foreground p-3 rounded-xl bg-white/5 border border-white/10">
                    {selectedContract.terms}
                  </p>
                </div>

                {/* Auto Renewal */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <IconRefresh className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Auto Renewal</span>
                  </div>
                  <span
                    className={`text-sm px-2 py-0.5 rounded-full ${
                      selectedContract.autoRenewal
                        ? "bg-green-500/10 text-green-400"
                        : "bg-gray-500/10 text-gray-400"
                    }`}
                  >
                    {selectedContract.autoRenewal ? "Enabled" : "Disabled"}
                  </span>
                </div>

                {/* Signatories */}
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <IconSignature className="h-4 w-4 text-purple-400" />
                    Signatories
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs text-muted-foreground mb-1">Vendor Representative</p>
                      <p className="text-sm font-medium">{selectedContract.signatories.vendor}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs text-muted-foreground mb-1">Company Representative</p>
                      <p className="text-sm font-medium">{selectedContract.signatories.company}</p>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <IconFileDescription className="h-4 w-4 text-blue-400" />
                    Contract Documents
                  </h4>
                  <div className="space-y-2">
                    {selectedContract.documents.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-red-500/10">
                            <IconFileText className="h-4 w-4 text-red-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {doc.type} • {doc.size}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <IconDownload className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Milestones */}
                {selectedContract.milestones && (
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <IconCalendar className="h-4 w-4 text-yellow-400" />
                      Contract Milestones
                    </h4>
                    <div className="space-y-2">
                      {selectedContract.milestones.map((milestone, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                milestone.status === "completed"
                                  ? "bg-green-500"
                                  : milestone.status === "upcoming"
                                  ? "bg-blue-500"
                                  : "bg-red-500"
                              }`}
                            />
                            <span className="text-sm">{milestone.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {milestone.date.toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                milestone.status === "completed"
                                  ? "bg-green-500/10 text-green-400"
                                  : milestone.status === "upcoming"
                                  ? "bg-blue-500/10 text-blue-400"
                                  : "bg-red-500/10 text-red-400"
                              }`}
                            >
                              {milestone.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              {selectedContract.status === "pending_renewal" && (
                <div className="p-4 border-t border-white/10">
                  <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 mb-3">
                    <div className="flex items-center gap-2">
                      <IconAlertTriangle className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm text-yellow-400">Contract renewal pending</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Please contact your account manager to renew this contract.
                    </p>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500">
                    Request Renewal
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <IconFileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="font-medium">Select a contract</p>
                <p className="text-sm">Click on a contract to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
