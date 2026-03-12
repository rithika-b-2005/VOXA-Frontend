"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  IconUpload,
  IconScan,
  IconPhoto,
  IconFileInvoice,
  IconReceipt,
  IconCheck,
  IconX,
  IconLoader2,
  IconSparkles,
  IconEdit,
  IconTrash,
  IconPlus,
  IconCamera,
  IconRefresh,
  IconDownload,
  IconCategory,
  IconCalendar,
  IconCurrencyDollar,
  IconBuilding,
  IconFileText,
} from "@tabler/icons-react"

interface ScannedItem {
  id: number
  type: "receipt" | "invoice"
  image: string
  status: "scanning" | "processing" | "completed" | "failed"
  data?: {
    vendor: string
    amount: number
    currency: string
    date: string
    category: string
    items: { description: string; amount: number }[]
    gstNumber?: string
    gstAmount?: number
    invoiceNumber?: string
  }
}

const categories = [
  "Food & Dining",
  "Travel",
  "Office Supplies",
  "Utilities",
  "Software & Services",
  "Marketing",
  "Professional Services",
  "Other",
]

export function SmartOCR() {
  const [scannedItems, setScannedItems] = React.useState<ScannedItem[]>([])
  const [isDragging, setIsDragging] = React.useState(false)
  const [selectedItem, setSelectedItem] = React.useState<ScannedItem | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      handleFiles(files)
    }
  }

  const handleFiles = (files: File[]) => {
    files.forEach((file) => {
      if (file.type.startsWith("image/") || file.type === "application/pdf") {
        const reader = new FileReader()
        reader.onload = (e) => {
          const newItem: ScannedItem = {
            id: Date.now() + Math.random(),
            type: file.name.toLowerCase().includes("invoice") ? "invoice" : "receipt",
            image: e.target?.result as string,
            status: "scanning",
          }
          setScannedItems((prev) => [...prev, newItem])
          processImage(newItem)
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const processImage = (item: ScannedItem) => {
    // Simulate scanning phase
    setTimeout(() => {
      setScannedItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, status: "processing" } : i
        )
      )

      // Simulate AI processing
      setTimeout(() => {
        const mockData = generateMockOCRData(item.type)
        setScannedItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? { ...i, status: "completed", data: mockData }
              : i
          )
        )
      }, 2000)
    }, 1500)
  }

  const generateMockOCRData = (type: "receipt" | "invoice") => {
    const vendors = ["Amazon Business", "Uber Eats", "Microsoft", "Adobe", "WeWork", "Staples"]
    const vendor = vendors[Math.floor(Math.random() * vendors.length)]
    const amount = Math.floor(Math.random() * 10000) + 100
    const gstAmount = Math.floor(amount * 0.18)

    return {
      vendor,
      amount: amount + gstAmount,
      currency: "INR",
      date: new Date().toISOString().split("T")[0],
      category: categories[Math.floor(Math.random() * categories.length)],
      items: [
        { description: "Product/Service", amount: amount },
        { description: "GST (18%)", amount: gstAmount },
      ],
      gstNumber: type === "invoice" ? "27AABCU9603R1ZM" : undefined,
      gstAmount,
      invoiceNumber: type === "invoice" ? `INV-${Date.now().toString().slice(-6)}` : undefined,
    }
  }

  const removeItem = (id: number) => {
    setScannedItems((prev) => prev.filter((i) => i.id !== id))
    if (selectedItem?.id === id) {
      setSelectedItem(null)
    }
  }

  const saveToExpenses = (item: ScannedItem) => {
    // In a real app, this would save to the database
    alert(`Saved ${item.type} from ${item.data?.vendor} to expenses!`)
  }

  return (
    <div className="flex-1 flex rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      {/* Left Panel - Upload & List */}
      <div className="w-1/2 flex flex-col border-r border-white/10">
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500">
              <IconScan className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Smart OCR Scanner</h3>
              <p className="text-xs text-muted-foreground">
                Auto-scan & categorize receipts/invoices
              </p>
            </div>
          </div>
        </div>

        {/* Upload Zone */}
        <div className="p-4">
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              isDragging
                ? "border-blue-500 bg-blue-500/10"
                : "border-white/20 hover:border-white/40"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />

            <div className="space-y-4">
              <div className="flex justify-center gap-4">
                <div className="p-3 rounded-full bg-white/5">
                  <IconPhoto className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="p-3 rounded-full bg-white/5">
                  <IconFileInvoice className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="p-3 rounded-full bg-white/5">
                  <IconReceipt className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>

              <div>
                <p className="font-medium mb-1">Drop files here or click to upload</p>
                <p className="text-sm text-muted-foreground">
                  Supports images and PDFs. AI will auto-extract data.
                </p>
              </div>

              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/10"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <IconUpload className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/10"
                >
                  <IconCamera className="h-4 w-4 mr-2" />
                  Take Photo
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Scanned Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {scannedItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <IconFileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No documents scanned yet</p>
              <p className="text-sm">Upload or drag receipts/invoices above</p>
            </div>
          ) : (
            scannedItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedItem?.id === item.id
                    ? "bg-white/10 border-blue-500/50"
                    : "bg-white/5 border-white/10 hover:border-white/20"
                }`}
                onClick={() => setSelectedItem(item)}
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-lg bg-white/10 overflow-hidden flex items-center justify-center">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt="Scanned document"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <IconReceipt className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium uppercase px-2 py-0.5 rounded-full bg-white/10">
                      {item.type}
                    </span>
                    {item.status === "scanning" && (
                      <span className="flex items-center gap-1 text-xs text-yellow-400">
                        <IconScan className="h-3 w-3 animate-pulse" />
                        Scanning...
                      </span>
                    )}
                    {item.status === "processing" && (
                      <span className="flex items-center gap-1 text-xs text-blue-400">
                        <IconSparkles className="h-3 w-3 animate-pulse" />
                        Processing...
                      </span>
                    )}
                    {item.status === "completed" && (
                      <span className="flex items-center gap-1 text-xs text-green-400">
                        <IconCheck className="h-3 w-3" />
                        Ready
                      </span>
                    )}
                  </div>
                  {item.data && (
                    <p className="text-sm truncate mt-1">
                      {item.data.vendor} - {item.data.currency} {item.data.amount.toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeItem(item.id)
                  }}
                >
                  <IconTrash className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Preview & Details */}
      <div className="w-1/2 flex flex-col">
        {selectedItem ? (
          <>
            {/* Preview Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-semibold">Document Details</h3>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <IconRefresh className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <IconDownload className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Image Preview */}
            <div className="p-4 border-b border-white/10">
              <div className="aspect-video rounded-lg bg-white/5 overflow-hidden">
                {selectedItem.image && (
                  <img
                    src={selectedItem.image}
                    alt="Document preview"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            </div>

            {/* Extracted Data */}
            {selectedItem.status === "completed" && selectedItem.data ? (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Vendor & Amount */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                      <IconBuilding className="h-3 w-3" />
                      Vendor
                    </p>
                    <p className="font-medium">{selectedItem.data.vendor}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                      <IconCurrencyDollar className="h-3 w-3" />
                      Amount
                    </p>
                    <p className="font-medium">
                      {selectedItem.data.currency} {selectedItem.data.amount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Date & Category */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                      <IconCalendar className="h-3 w-3" />
                      Date
                    </p>
                    <p className="font-medium">{selectedItem.data.date}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                      <IconCategory className="h-3 w-3" />
                      Category
                    </p>
                    <select className="w-full bg-transparent text-sm font-medium focus:outline-none">
                      {categories.map((cat) => (
                        <option
                          key={cat}
                          value={cat}
                          selected={cat === selectedItem.data?.category}
                          className="bg-black"
                        >
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* GST Details */}
                {selectedItem.data.gstNumber && (
                  <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                    <p className="text-xs text-green-400 mb-2">GST Details Detected</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">GSTIN:</span>{" "}
                        <span className="font-mono">{selectedItem.data.gstNumber}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">GST Amount:</span>{" "}
                        <span>₹{selectedItem.data.gstAmount?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Line Items */}
                <div>
                  <p className="text-sm font-medium mb-2">Line Items</p>
                  <div className="space-y-2">
                    {selectedItem.data.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded-lg bg-white/5"
                      >
                        <span className="text-sm">{item.description}</span>
                        <span className="text-sm font-medium">
                          ₹{item.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    onClick={() => saveToExpenses(selectedItem)}
                  >
                    <IconCheck className="h-4 w-4 mr-2" />
                    Save to Expenses
                  </Button>
                  <Button variant="outline" className="border-white/10">
                    <IconEdit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <IconLoader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-blue-400" />
                  <p className="text-sm text-muted-foreground">
                    {selectedItem.status === "scanning"
                      ? "Scanning document..."
                      : "AI is extracting data..."}
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <IconFileInvoice className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No document selected</p>
              <p className="text-sm">Upload and select a document to see details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
