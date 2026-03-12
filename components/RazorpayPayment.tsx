"use client"

import * as React from "react"
import { razorpayApi } from "@/lib/api"
import { IconLoader2, IconCrown } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayPaymentProps {
  amount: number
  plan: 'monthly' | 'yearly'
  planName: string
  userEmail?: string
  userName?: string
  onSuccess: () => void
  onError: (error: string) => void
  onClose: () => void
}

export function RazorpayPayment({
  amount,
  plan,
  planName,
  userEmail,
  userName,
  onSuccess,
  onError,
  onClose,
}: RazorpayPaymentProps) {
  const [loading, setLoading] = React.useState(false)
  const [scriptLoaded, setScriptLoaded] = React.useState(false)

  // Load Razorpay script
  React.useEffect(() => {
    if (typeof window !== 'undefined' && !window.Razorpay) {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      script.onload = () => setScriptLoaded(true)
      document.body.appendChild(script)
    } else {
      setScriptLoaded(true)
    }
  }, [])

  const handlePayment = async () => {
    if (!scriptLoaded) {
      onError('Payment system is loading. Please try again.')
      return
    }

    setLoading(true)

    try {
      // Create order on backend
      const response = await razorpayApi.createOrder({ amount, plan })

      if (response.error) {
        onError(response.error)
        setLoading(false)
        return
      }

      const { orderId, keyId } = response.data!

      // Open Razorpay checkout
      const options = {
        key: keyId,
        amount: amount * 100,
        currency: 'INR',
        name: 'Voxa',
        description: planName,
        order_id: orderId,
        handler: async function (response: any) {
          // Verify payment on backend
          try {
            const verifyResponse = await razorpayApi.verifyPayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              plan,
            })

            if (verifyResponse.error) {
              onError(verifyResponse.error)
            } else {
              onSuccess()
            }
          } catch (err) {
            onError('Payment verification failed')
          }
        },
        prefill: {
          email: userEmail || '',
          name: userName || '',
        },
        theme: {
          color: '#8b5cf6',
          backdrop_color: 'rgba(0, 0, 0, 0.8)',
        },
        modal: {
          ondismiss: function () {
            setLoading(false)
            onClose()
          },
          escape: true,
          animation: true,
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.on('payment.failed', function (response: any) {
        onError(response.error.description || 'Payment failed')
        setLoading(false)
      })
      razorpay.open()
    } catch (err: any) {
      onError(err.message || 'Failed to initiate payment')
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={loading || !scriptLoaded}
      className="w-full py-3 font-semibold bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-xl"
    >
      {loading ? (
        <>
          <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <IconCrown className="h-4 w-4 mr-2" />
          Pay ₹{amount} - Upgrade Now
        </>
      )}
    </Button>
  )
}
