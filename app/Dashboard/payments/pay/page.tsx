"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  IconArrowLeft,
  IconSearch,
  IconBuildingBank,
  IconCreditCard,
  IconDeviceMobile,
  IconCheck,
  IconShieldCheck,
  IconLoader2,
  IconAlertTriangle,
  IconReceipt,
  IconUsers,
  IconBolt,
  IconRefresh,
  IconFileInvoice,
  IconPlus,
  IconChevronRight,
  IconLock,
  IconInfoCircle,
  IconWallet,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { QRPaymentModal } from "@/components/QRPaymentModal"

interface Payee {
  id: string
  name: string
  type: "vendor" | "employee" | "utility" | "government" | "other"
  accountNumber?: string
  ifsc?: string
  upiId?: string
  bankName?: string
  lastPaid?: Date
  totalPaid?: number
}

interface PendingBill {
  id: string
  payeeId: string
  payeeName: string
  description: string
  amount: number
  dueDate: Date
  invoiceNumber?: string
}

const savedPayees: Payee[] = [
  {
    id: "1",
    name: "TechSupplies Ltd",
    type: "vendor",
    accountNumber: "****4521",
    ifsc: "HDFC0001234",
    bankName: "HDFC Bank",
    lastPaid: new Date(2024, 10, 15),
    totalPaid: 450000,
  },
  {
    id: "2",
    name: "Marketing Agency XYZ",
    type: "vendor",
    accountNumber: "****7892",
    ifsc: "ICIC0001234",
    bankName: "ICICI Bank",
    lastPaid: new Date(2024, 10, 10),
    totalPaid: 225000,
  },
  {
    id: "3",
    name: "MSEB Electricity",
    type: "utility",
    upiId: "mseb@ybl",
    lastPaid: new Date(2024, 10, 5),
    totalPaid: 85000,
  },
  {
    id: "4",
    name: "AWS Services",
    type: "vendor",
    accountNumber: "****3456",
    bankName: "Citi Bank",
    totalPaid: 180000,
  },
]

const pendingBills: PendingBill[] = [
  {
    id: "1",
    payeeId: "1",
    payeeName: "TechSupplies Ltd",
    description: "IT Hardware Supply - November",
    amount: 45000,
    dueDate: new Date(2024, 11, 10),
    invoiceNumber: "INV-2024-089",
  },
  {
    id: "2",
    payeeId: "3",
    payeeName: "MSEB Electricity",
    description: "Office electricity bill - November",
    amount: 12500,
    dueDate: new Date(2024, 11, 5),
  },
  {
    id: "3",
    payeeId: "2",
    payeeName: "Marketing Agency XYZ",
    description: "Digital marketing services",
    amount: 75000,
    dueDate: new Date(2024, 11, 20),
    invoiceNumber: "INV-MA-2024-156",
  },
]

type PaymentMethod = "bank" | "upi" | "card" | "qr"

export default function MakePaymentPage() {
  const router = useRouter()
  const [step, setStep] = React.useState(1)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedPayee, setSelectedPayee] = React.useState<Payee | null>(null)
  const [selectedBill, setSelectedBill] = React.useState<PendingBill | null>(null)
  const [amount, setAmount] = React.useState("")
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>("qr")
  const [description, setDescription] = React.useState("")
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)
  const [selectedAccount, setSelectedAccount] = React.useState("hdfc")
  const [showStripeModal, setShowStripeModal] = React.useState(false)
  const [transactionId, setTransactionId] = React.useState<string | null>(null)

  const filteredPayees = savedPayees.filter((payee) =>
    payee.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const payeeBills = selectedPayee
    ? pendingBills.filter((bill) => bill.payeeId === selectedPayee.id)
    : []

  const handleSelectBill = (bill: PendingBill) => {
    setSelectedBill(bill)
    setAmount(bill.amount.toString())
    setDescription(bill.description)
  }

  const handleProceed = () => {
    if (step === 1 && selectedPayee) {
      setStep(2)
    } else if (step === 2 && amount) {
      setStep(3)
    }
  }

  const handlePayment = () => {
    if (paymentMethod === "qr") {
      setShowStripeModal(true)
    } else {
      // Legacy payment handling for other methods
      setIsProcessing(true)
      setTimeout(() => {
        setIsProcessing(false)
        setIsSuccess(true)
        setTransactionId(`TXN-${Date.now()}`)
      }, 3000)
    }
  }

  const handleQRPaymentComplete = () => {
    setShowStripeModal(false)
    setTransactionId(`TXN-${Date.now()}`)
    setIsSuccess(true)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "vendor":
        return IconFileInvoice
      case "employee":
        return IconUsers
      case "utility":
        return IconBolt
      case "government":
        return IconShieldCheck
      default:
        return IconCreditCard
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <IconCheck className="h-10 w-10 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground mb-6">
            Your payment of ₹{Number(amount).toLocaleString()} to {selectedPayee?.name} has been processed successfully.
          </p>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6 text-left">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">Transaction ID</span>
              <span className="text-sm font-mono">{transactionId || "N/A"}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">Date & Time</span>
              <span className="text-sm">{new Date().toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Payment Method</span>
              <span className="text-sm">{paymentMethod.toUpperCase()}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 border-white/10" onClick={() => router.push("/Dashboard/payments")}>
              Back to Payments
            </Button>
            <Button className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500">
              <IconReceipt className="h-4 w-4 mr-2" />
              Download Receipt
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/Dashboard/payments">
          <Button variant="ghost" size="icon">
            <IconArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Make Payment</h1>
          <p className="text-muted-foreground">Pay vendors, bills, and utilities</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4">
        {[
          { num: 1, label: "Select Payee" },
          { num: 2, label: "Enter Amount" },
          { num: 3, label: "Confirm & Pay" },
        ].map((s, index) => (
          <React.Fragment key={s.num}>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= s.num
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                    : "bg-white/10 text-muted-foreground"
                }`}
              >
                {step > s.num ? <IconCheck className="h-4 w-4" /> : s.num}
              </div>
              <span className={step >= s.num ? "text-white" : "text-muted-foreground"}>
                {s.label}
              </span>
            </div>
            {index < 2 && (
              <div className={`w-16 h-0.5 ${step > s.num ? "bg-purple-500" : "bg-white/10"}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main Content */}
        <div className="col-span-8">
          {step === 1 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search payees..."
                      className="pl-10 bg-white/5 border-white/10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" className="border-white/10 gap-2">
                    <IconPlus className="h-4 w-4" />
                    Add New Payee
                  </Button>
                </div>
              </div>

              <div className="p-4">
                <p className="text-sm text-muted-foreground mb-3">Saved Payees</p>
                <div className="grid grid-cols-2 gap-3">
                  {filteredPayees.map((payee) => {
                    const Icon = getTypeIcon(payee.type)
                    return (
                      <div
                        key={payee.id}
                        onClick={() => setSelectedPayee(payee)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          selectedPayee?.id === payee.id
                            ? "bg-purple-500/10 border-purple-500/50"
                            : "bg-white/5 border-white/10 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-white/10">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">{payee.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{payee.type}</p>
                            {payee.bankName && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {payee.bankName} • {payee.accountNumber}
                              </p>
                            )}
                            {payee.upiId && (
                              <p className="text-xs text-muted-foreground mt-1">
                                UPI: {payee.upiId}
                              </p>
                            )}
                          </div>
                          {selectedPayee?.id === payee.id && (
                            <IconCheck className="h-5 w-5 text-purple-400" />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {selectedPayee && payeeBills.length > 0 && (
                <div className="p-4 border-t border-white/10">
                  <p className="text-sm text-muted-foreground mb-3">Pending Bills</p>
                  <div className="space-y-2">
                    {payeeBills.map((bill) => (
                      <div
                        key={bill.id}
                        onClick={() => handleSelectBill(bill)}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedBill?.id === bill.id
                            ? "bg-blue-500/10 border-blue-500/50"
                            : "bg-white/5 border-white/10 hover:border-white/20"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium">{bill.description}</p>
                          <p className="text-xs text-muted-foreground">
                            Due: {bill.dueDate.toLocaleDateString()}
                            {bill.invoiceNumber && ` • ${bill.invoiceNumber}`}
                          </p>
                        </div>
                        <p className="font-semibold">₹{bill.amount.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 border-t border-white/10">
                <Button
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500"
                  onClick={handleProceed}
                  disabled={!selectedPayee}
                >
                  Continue
                  <IconChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-6">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-muted-foreground">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-16 pl-10 pr-4 text-3xl font-bold bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Description</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Payment description"
                  className="bg-white/5 border-white/10"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "qr", label: "Scan & Pay", icon: IconWallet, recommended: true },
                    { id: "upi", label: "UPI", icon: IconDeviceMobile },
                    { id: "card", label: "Credit Card", icon: IconCreditCard },
                    { id: "bank", label: "Bank Transfer", icon: IconBuildingBank },
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                      className={`p-4 rounded-xl border text-center transition-all relative ${
                        paymentMethod === method.id
                          ? "bg-purple-500/10 border-purple-500/50"
                          : "bg-white/5 border-white/10 hover:border-white/20"
                      }`}
                    >
                      {'recommended' in method && method.recommended && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-gradient-to-r from-purple-500 to-blue-500 text-[10px] font-medium rounded-full">
                          Recommended
                        </span>
                      )}
                      <method.icon className="h-6 w-6 mx-auto mb-2" />
                      <p className="text-sm font-medium">{method.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Pay From</label>
                <div className="space-y-2">
                  {[
                    { id: "hdfc", name: "HDFC Bank", account: "****4521", balance: 1245000 },
                    { id: "icici", name: "ICICI Bank", account: "****7892", balance: 325000 },
                  ].map((acc) => (
                    <div
                      key={acc.id}
                      onClick={() => setSelectedAccount(acc.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedAccount === acc.id
                          ? "bg-blue-500/10 border-blue-500/50"
                          : "bg-white/5 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconBuildingBank className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{acc.name}</p>
                          <p className="text-xs text-muted-foreground">{acc.account}</p>
                        </div>
                      </div>
                      <p className="text-sm">₹{acc.balance.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1 border-white/10" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500"
                  onClick={handleProceed}
                  disabled={!amount || Number(amount) <= 0}
                >
                  Review Payment
                  <IconChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-6">
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-2">You are paying</p>
                <p className="text-4xl font-bold">₹{Number(amount).toLocaleString()}</p>
                <p className="text-muted-foreground mt-2">to {selectedPayee?.name}</p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Payee</span>
                  <span className="text-sm font-medium">{selectedPayee?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="text-sm font-medium">₹{Number(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Payment Method</span>
                  <span className="text-sm font-medium">{paymentMethod.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">From Account</span>
                  <span className="text-sm font-medium">HDFC Bank ****4521</span>
                </div>
                {description && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Description</span>
                    <span className="text-sm font-medium">{description}</span>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-start gap-2">
                  <IconInfoCircle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    Please review the payment details carefully. Once confirmed, this transaction cannot be reversed.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 border-white/10" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <IconLock className="h-4 w-4 mr-2" />
                      Confirm & Pay
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Summary */}
        <div className="col-span-4 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sticky top-6">
            <h3 className="font-semibold mb-4">Payment Summary</h3>

            {selectedPayee && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 mb-4">
                <p className="text-xs text-muted-foreground mb-1">Paying to</p>
                <p className="font-medium">{selectedPayee.name}</p>
                {selectedPayee.bankName && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedPayee.bankName} • {selectedPayee.accountNumber}
                  </p>
                )}
              </div>
            )}

            {amount && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 mb-4">
                <p className="text-xs text-muted-foreground mb-1">Amount</p>
                <p className="text-2xl font-bold">₹{Number(amount).toLocaleString()}</p>
              </div>
            )}

            {selectedBill && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 mb-4">
                <p className="text-xs text-muted-foreground mb-1">For Invoice</p>
                <p className="text-sm">{selectedBill.invoiceNumber || selectedBill.description}</p>
              </div>
            )}

            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <IconShieldCheck className="h-4 w-4" />
                <span>Secure Payment</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Your payment is protected with bank-grade encryption
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* QR Payment Modal */}
      <QRPaymentModal
        isOpen={showStripeModal}
        onClose={() => setShowStripeModal(false)}
        amount={Number(amount) || 0}
        planName={description || `Payment to ${selectedPayee?.name || 'Vendor'}`}
        onPaymentComplete={handleQRPaymentComplete}
      />
    </div>
  )
}
