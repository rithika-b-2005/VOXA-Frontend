"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function StripeCleanup() {
  const pathname = usePathname()

  useEffect(() => {
    // Remove Stripe elements when not on payment pages
    const cleanupStripe = () => {
      // Remove Stripe iframes and badges
      const stripeElements = document.querySelectorAll(
        'iframe[name*="stripe"], iframe[title*="Stripe"], iframe[src*="stripe"], [class*="__PrivateStripe"], #stripe-link-loader, #stripe-link-frame'
      )
      stripeElements.forEach((el) => {
        if (el.parentNode) {
          el.parentNode.removeChild(el)
        }
      })

      // Remove fixed position elements at bottom right (Stripe badge)
      const fixedElements = document.querySelectorAll('body > div, body > iframe')
      fixedElements.forEach((el) => {
        const style = window.getComputedStyle(el)
        if (
          style.position === 'fixed' &&
          (style.bottom === '0px' || parseInt(style.bottom) < 100) &&
          (style.right === '0px' || parseInt(style.right) < 100) &&
          parseInt(style.zIndex) > 1000
        ) {
          const htmlEl = el as HTMLElement
          htmlEl.style.display = 'none'
        }
      })
    }

    // Run cleanup
    cleanupStripe()

    // Run again after a delay to catch dynamically added elements
    const timer = setTimeout(cleanupStripe, 1000)

    return () => clearTimeout(timer)
  }, [pathname])

  return null
}
