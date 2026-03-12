"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  IconArrowLeft,
  IconPlus,
  IconTrash,
  IconUpload,
  IconFile,
  IconX,
  IconCheck,
  IconSparkles,
  IconAlertTriangle,
  IconInfoCircle,
  IconCalendar,
  IconReceipt,
  IconCurrencyRupee,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface LineItem {
  id: number
  description: string
  quantity: number
  rate: number
  amount: number
}

interface Attachment {
  id: number
  name: string
  size: string
  type: string
}

export default function SubmitInvoicePage() {
  const router = useRouter()
  const [invoiceNumber, setInvoiceNumber] = React.useState("")
  const [poNumber, setPONumber] = React.useState("")
  const [invoiceDate, setInvoiceDate] = React.useState(
    new Date().toISOString().split("T")[0]
  )
  const [dueDate, setDueDate] = React.useState("")
  const [lineItems, setLineItems] = React.useState<LineItem[]>([
    { id: 1, description: "", quantity: 1, rate: 0, amount: 0 },
  ])
  const [attachments, setAttachments] = React.useState<Attachment[]>([])
  const [notes, setNotes] = React.useState("")
  const [gstNumber, setGstNumber] = React.useState("27AABCU9603R1ZM")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [showPreview, setShowPreview] = React.useState(false)

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: Date.now(), description: "", quantity: 1, rate: 0, amount: 0 },
    ])
  }

  const removeLineItem = (id: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id))
    }
  }

  const updateLineItem = (
    id: number,
    field: keyof LineItem,
    value: string | number
  ) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          if (field === "quantity" || field === "rate") {
            updated.amount = Number(updated.quantity) * Number(updated.rate)
          }
          return updated
        }
        return item
      })
    )
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      const newAttachments = files.map((file) => ({
        id: Date.now() + Math.random(),
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type,
      }))
      setAttachments([...attachments, ...newAttachments])
    }
  }

  const removeAttachment = (id: number) => {
    setAttachments(attachments.filter((a) => a.id !== id))
  }

  const subtotal = lineItems.reduce((acc, item) => acc + item.amount, 0)
  const gstAmount = subtotal * 0.18
  const total = subtotal + gstAmount

  const handleSubmit = () => {
    setIsSubmitting(true)
    // Simulate submission
    setTimeout(() => {
      router.push("/vendor/invoices")
    }, 2000)
  }

  const isValid =
    invoiceNumber &&
    poNumber &&
    invoiceDate &&
    dueDate &&
    lineItems.some((item) => item.description && item.amount > 0) &&
    attachments.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/vendor/invoices">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <IconArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Submit New Invoice</h1>
            <p className="text-muted-foreground mt-1">
              Create and submit an invoice for payment
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-white/10">
            Save as Draft
          </Button>
          <Button
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <IconSparkles className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <IconCheck className="h-4 w-4 mr-2" />
                Submit Invoice
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Invoice Form */}
        <div className="col-span-8 space-y-6">
          {/* Basic Info */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="font-semibold mb-4">Invoice Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Invoice Number *
                </label>
                <Input
                  placeholder="e.g., INV-2024-001"
                  className="bg-white/5 border-white/10"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Purchase Order Number *
                </label>
                <Input
                  placeholder="e.g., PO-2024-123"
                  className="bg-white/5 border-white/10"
                  value={poNumber}
                  onChange={(e) => setPONumber(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Invoice Date *
                </label>
                <Input
                  type="date"
                  className="bg-white/5 border-white/10"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">
                  Due Date *
                </label>
                <Input
                  type="date"
                  className="bg-white/5 border-white/10"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm text-muted-foreground mb-1 block">
                  GST Number
                </label>
                <Input
                  className="bg-white/5 border-white/10"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Line Items</h3>
              <Button
                variant="outline"
                size="sm"
                className="border-white/10 gap-2"
                onClick={addLineItem}
              >
                <IconPlus className="h-4 w-4" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {/* Header */}
              <div className="grid grid-cols-12 gap-3 text-sm text-muted-foreground px-2">
                <div className="col-span-5">Description</div>
                <div className="col-span-2">Quantity</div>
                <div className="col-span-2">Rate (₹)</div>
                <div className="col-span-2 text-right">Amount</div>
                <div className="col-span-1"></div>
              </div>

              {/* Items */}
              {lineItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-3 items-center"
                >
                  <div className="col-span-5">
                    <Input
                      placeholder="Item description"
                      className="bg-white/5 border-white/10"
                      value={item.description}
                      onChange={(e) =>
                        updateLineItem(item.id, "description", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="1"
                      className="bg-white/5 border-white/10"
                      value={item.quantity}
                      onChange={(e) =>
                        updateLineItem(item.id, "quantity", parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="0"
                      className="bg-white/5 border-white/10"
                      value={item.rate}
                      onChange={(e) =>
                        updateLineItem(item.id, "rate", parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div className="col-span-2 text-right font-medium">
                    ₹{item.amount.toLocaleString()}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-red-400"
                      onClick={() => removeLineItem(item.id)}
                      disabled={lineItems.length === 1}
                    >
                      <IconTrash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
              <div className="flex justify-end gap-8">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="w-32 text-right">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-end gap-8">
                <span className="text-muted-foreground">GST (18%)</span>
                <span className="w-32 text-right">₹{gstAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-end gap-8 text-lg font-bold pt-2 border-t border-white/10">
                <span>Total</span>
                <span className="w-32 text-right">₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="font-semibold mb-4">Attachments *</h3>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFileSelect}
            />

            <div
              className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer hover:border-white/40 transition-all"
              onClick={() => fileInputRef.current?.click()}
            >
              <IconUpload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">Click to upload files</p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, JPG, PNG (Max 10MB per file)
              </p>
            </div>

            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                {attachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <IconFile className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{file.size}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeAttachment(file.id)}
                    >
                      <IconX className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="font-semibold mb-4">Additional Notes</h3>
            <textarea
              placeholder="Add any notes or special instructions..."
              className="w-full h-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-purple-500/50"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-4 space-y-6">
          {/* Summary Card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sticky top-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <IconReceipt className="h-4 w-4 text-purple-400" />
              Invoice Summary
            </h3>

            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-xs text-muted-foreground mb-1">Invoice Number</p>
                <p className="font-mono">{invoiceNumber || "—"}</p>
              </div>

              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-xs text-muted-foreground mb-1">PO Reference</p>
                <p className="font-mono">{poNumber || "—"}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs text-muted-foreground mb-1">Items</p>
                  <p className="font-semibold">{lineItems.filter((i) => i.description).length}</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs text-muted-foreground mb-1">Files</p>
                  <p className="font-semibold">{attachments.length}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                <p className="text-2xl font-bold">₹{total.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Including GST: ₹{gstAmount.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Validation Checklist */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-sm font-medium mb-3">Submission Checklist</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  {invoiceNumber ? (
                    <IconCheck className="h-4 w-4 text-green-400" />
                  ) : (
                    <IconAlertTriangle className="h-4 w-4 text-yellow-400" />
                  )}
                  <span className={invoiceNumber ? "text-green-400" : "text-muted-foreground"}>
                    Invoice number added
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {poNumber ? (
                    <IconCheck className="h-4 w-4 text-green-400" />
                  ) : (
                    <IconAlertTriangle className="h-4 w-4 text-yellow-400" />
                  )}
                  <span className={poNumber ? "text-green-400" : "text-muted-foreground"}>
                    PO number added
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {lineItems.some((i) => i.amount > 0) ? (
                    <IconCheck className="h-4 w-4 text-green-400" />
                  ) : (
                    <IconAlertTriangle className="h-4 w-4 text-yellow-400" />
                  )}
                  <span
                    className={
                      lineItems.some((i) => i.amount > 0)
                        ? "text-green-400"
                        : "text-muted-foreground"
                    }
                  >
                    Line items added
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {attachments.length > 0 ? (
                    <IconCheck className="h-4 w-4 text-green-400" />
                  ) : (
                    <IconAlertTriangle className="h-4 w-4 text-yellow-400" />
                  )}
                  <span
                    className={
                      attachments.length > 0 ? "text-green-400" : "text-muted-foreground"
                    }
                  >
                    Invoice copy attached
                  </span>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-start gap-2">
                <IconInfoCircle className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Invoices are typically processed within 3-5 business days. You'll receive an
                  email notification once approved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
