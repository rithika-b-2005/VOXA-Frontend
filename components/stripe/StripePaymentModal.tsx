"use client"

import * as React from "react"
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import {
  IconX,
  IconLoader2,
  IconCheck,
  IconAlertTriangle,
  IconCrown,
  IconShieldCheck,
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { StripeProvider } from "./StripeProvider"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

interface StripePaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  plan: 'monthly' | 'yearly'
  planName: string
  onSuccess: () => void
  onError: (error: string) => void
}

function PaymentForm({
  amount,
  plan,
  onClose,
  onSuccess,
  onError,
}: {
  amount: number
  plan: string
  onClose: () => void
  onSuccess: () => void
  onError: (error: string) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isComplete, setIsComplete] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const { error: submitError } = await elements.submit()
      if (submitError) {
        setError(submitError.message || "Payment failed")
        setIsProcessing(false)
        return
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/Dashboard/transaction?payment=success`,
        },
        redirect: "if_required",
      })

      if (confirmError) {
        setError(confirmError.message || "Payment failed")
        onError(confirmError.message || "Payment failed")
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        setIsComplete(true)
        onSuccess()
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred")
      onError(err.message || "An unexpected error occurred")
    } finally {
      setIsProcessing(false)
    }
  }

  if (isComplete) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
          <IconCheck className="h-8 w-8 text-green-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
        <p className="text-muted-foreground mb-4 text-sm">
          Welcome to Voxa Premium! Enjoy unlimited features.
        </p>
        <Button onClick={onClose} className="w-full bg-gradient-to-r from-yellow-500 to-orange-500">
          Continue
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Amount Display */}
      <div className="text-center pb-2">
        <p className="text-xs text-muted-foreground">Total Amount</p>
        <p className="text-2xl font-bold text-yellow-400">₹{amount}</p>
        <p className="text-xs text-muted-foreground">{plan === 'monthly' ? 'Monthly' : 'Yearly'} Plan</p>
      </div>

      {/* Stripe Payment Element */}
      <div className="rounded-xl overflow-hidden">
        <PaymentElement
          options={{
            layout: "accordion",
          }}
          onReady={() => console.log('PaymentElement ready')}
          onLoadError={(error) => console.error('PaymentElement load error:', error)}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2">
          <IconAlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full h-11 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
      >
        {isProcessing ? (
          <>
            <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <IconCrown className="h-4 w-4 mr-2" />
            Pay ₹{amount}
          </>
        )}
      </Button>

      {/* Security Notice */}
      <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
        <IconShieldCheck className="h-3 w-3 text-green-400" />
        <span>Secured by Stripe</span>
      </div>
    </form>
  )
}

export function StripePaymentModal({
  isOpen,
  onClose,
  amount,
  plan,
  planName,
  onSuccess,
  onError,
}: StripePaymentModalProps) {
  const [clientSecret, setClientSecret] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const hasInitialized = React.useRef(false)

  React.useEffect(() => {
    // Prevent duplicate calls
    if (!isOpen || amount <= 0 || hasInitialized.current || clientSecret) {
      return
    }

    hasInitialized.current = true
    setIsLoading(true)
    setError(null)

    const token = localStorage.getItem('token')

    console.log('Creating payment intent for amount:', amount)

    fetch(`${API_URL}/stripe/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({
        amount,
        currency: 'inr',
        metadata: { plan, type: 'premium_subscription' }
      }),
    })
      .then(res => res.json())
      .then(data => {
        console.log('Payment intent response:', data)
        if (data.clientSecret) {
          setClientSecret(data.clientSecret)
        } else {
          setError(data.message || 'Failed to initialize payment')
          onError(data.message || 'Failed to initialize payment')
        }
      })
      .catch(err => {
        console.error('Payment intent error:', err)
        setError(err.message || 'Network error')
        onError(err.message || 'Network error')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [isOpen, amount, plan]) // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (!isOpen) {
      setClientSecret(null)
      setError(null)
      hasInitialized.current = false // Reset when modal closes
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm mx-4 bg-[#1a1a2e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-yellow-500/10">
          <div className="flex items-center gap-2">
            <IconCrown className="h-5 w-5 text-yellow-400" />
            <div>
              <h2 className="text-base font-semibold">Upgrade to Premium</h2>
              <p className="text-xs text-muted-foreground">{planName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <IconX className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <IconLoader2 className="h-8 w-8 animate-spin text-yellow-400 mb-3" />
              <p className="text-sm text-muted-foreground">Initializing payment...</p>
            </div>
          ) : error && !clientSecret ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3">
                <IconAlertTriangle className="h-7 w-7 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Payment Error</h3>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button variant="outline" onClick={onClose} className="border-white/10">
                Close
              </Button>
            </div>
          ) : clientSecret ? (
            <StripeProvider
              clientSecret={clientSecret}
              loadingFallback={
                <div className="flex flex-col items-center justify-center py-8">
                  <IconLoader2 className="h-8 w-8 animate-spin text-yellow-400 mb-3" />
                  <p className="text-sm text-muted-foreground">Loading payment form...</p>
                </div>
              }
            >
              <PaymentForm
                amount={amount}
                plan={plan}
                onClose={onClose}
                onSuccess={onSuccess}
                onError={onError}
              />
            </StripeProvider>
          ) : null}
        </div>
      </div>
    </div>
  )
}
