"use client"

import * as React from "react"
import {
  IconX,
  IconCheck,
  IconLoader2,
  IconShieldCheck,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface QRPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  planName: string
  onPaymentComplete: () => void
}

export function QRPaymentModal({
  isOpen,
  onClose,
  amount,
  planName,
  onPaymentComplete,
}: QRPaymentModalProps) {
  const [verifying, setVerifying] = React.useState(false)

  const handlePaymentDone = () => {
    setVerifying(true)
    setTimeout(() => {
      setVerifying(false)
      onPaymentComplete()
    }, 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-xs mx-4 bg-[#1a1a2e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-yellow-500/10">
          <div>
            <h2 className="text-base font-semibold">Scan & Pay</h2>
            <p className="text-xs text-muted-foreground">{planName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <IconX className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Amount */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Amount</p>
            <p className="text-2xl font-bold text-yellow-400">₹{amount}</p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="p-2 bg-white rounded-xl">
              <Image
                src="/payment-qr.jpg"
                alt="Scan to Pay"
                width={160}
                height={160}
                className="rounded-lg"
              />
            </div>
          </div>

          {/* Simple instruction */}
          <p className="text-center text-xs text-white/50">
            Scan with any UPI app to pay
          </p>

          {/* Payment Done Button */}
          <Button
            onClick={handlePaymentDone}
            disabled={verifying}
            className="w-full h-10 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-sm"
          >
            {verifying ? (
              <>
                <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <IconCheck className="h-4 w-4 mr-2" />
                I've Paid
              </>
            )}
          </Button>

          {/* Security Notice */}
          <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
            <IconShieldCheck className="h-3 w-3 text-green-400" />
            <span>Secure Payment</span>
          </div>
        </div>
      </div>
    </div>
  )
}
