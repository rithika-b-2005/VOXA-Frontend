"use client"

import { Elements } from "@stripe/react-stripe-js"
import { loadStripe, Stripe } from "@stripe/stripe-js"
import { useEffect, useState } from "react"

let stripePromise: Promise<Stripe | null> | null = null

const getStripe = () => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    console.log('Stripe key exists:', !!key)
    if (!key) {
      console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured')
      return null
    }
    stripePromise = loadStripe(key)
  }
  return stripePromise
}

interface StripeProviderProps {
  children: React.ReactNode
  clientSecret?: string
  loadingFallback?: React.ReactNode
}

export function StripeProvider({ children, clientSecret, loadingFallback }: StripeProviderProps) {
  const [stripe, setStripe] = useState<Stripe | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initStripe = async () => {
      try {
        const promise = getStripe()
        if (!promise) {
          setError('Stripe key not configured')
          setIsLoading(false)
          return
        }
        const stripeInstance = await promise
        console.log('Stripe loaded:', !!stripeInstance)
        setStripe(stripeInstance)
      } catch (err) {
        console.error('Failed to load Stripe:', err)
        setError('Failed to load payment system')
      } finally {
        setIsLoading(false)
      }
    }
    initStripe()
  }, [])

  if (error) {
    return <div className="text-red-400 text-center py-4">{error}</div>
  }

  if (isLoading || !stripe || !clientSecret) {
    return <>{loadingFallback || null}</>
  }

  return (
    <Elements
      stripe={stripe}
      options={{
        clientSecret,
        appearance: {
          theme: 'night',
          variables: {
            colorPrimary: '#eab308',
            colorBackground: '#1a1a2e',
            colorText: '#ffffff',
            colorDanger: '#ef4444',
            fontFamily: 'system-ui, sans-serif',
            borderRadius: '8px',
          },
          rules: {
            '.Input': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            },
            '.Input:focus': {
              border: '1px solid #eab308',
              boxShadow: '0 0 0 1px #eab308',
            },
            '.Label': {
              color: 'rgba(255, 255, 255, 0.7)',
            },
            '.PoweredBy': {
              display: 'none',
            },
          },
        },
      }}
    >
      {children}
    </Elements>
  )
}
