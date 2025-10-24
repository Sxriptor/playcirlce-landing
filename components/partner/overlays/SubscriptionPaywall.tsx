'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Check, Loader2 } from 'lucide-react'
import { useTheme } from '@/components/partner/layout/ThemeProvider'
import { getThemeColors } from '@/lib/theme-colors'

interface SubscriptionPaywallProps {
  partnerId: string
  onSubscribed?: () => void
}

export function SubscriptionPaywall({ partnerId, onSubscribed }: SubscriptionPaywallProps) {
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly')
  const { theme } = useTheme()
  const colors = getThemeColors(theme)

  // Prevent closing paywall by making body non-scrollable and blocking interactions
  useEffect(() => {
    // Disable scrolling on body
    document.body.style.overflow = 'hidden'

    // Prevent right-click context menu
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    // Prevent certain keyboard shortcuts
    const preventShortcuts = (e: KeyboardEvent) => {
      // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault()
        return false
      }
    }

    document.addEventListener('contextmenu', preventContextMenu)
    document.addEventListener('keydown', preventShortcuts)

    // Cleanup
    return () => {
      document.body.style.overflow = 'unset'
      document.removeEventListener('contextmenu', preventContextMenu)
      document.removeEventListener('keydown', preventShortcuts)
    }
  }, [])

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      const priceId = selectedPlan === 'monthly'
        ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY
        : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY

      const response = await fetch('/partner/api/billing/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          partnerId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('Failed to start checkout. Please try again.')
      setLoading(false)
    }
  }

  const features = [
    'Unlimited venue and court management',
    'Create unlimited matches and events',
    'Player registration and management',
    'Real-time match updates',
    'Event scheduling and recurring classes',
    'Analytics and insights dashboard',
    'Email notifications',
    '24/7 customer support',
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.75)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden"
        style={{ background: colors.card }}
      >
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2" style={{ color: colors.text }}>
              Subscribe to PlayCircle Partner
            </h2>
            <p className="text-lg" style={{ color: colors.mutedText }}>
              Manage your sports venues and engage with players
            </p>
          </div>

          {/* Plan Toggle */}
          <div className="flex justify-center mb-8">
            <div
              className="inline-flex rounded-lg p-1"
              style={{ background: colors.background }}
            >
              <button
                onClick={() => setSelectedPlan('monthly')}
                className="px-6 py-2 rounded-md font-medium transition-all"
                style={{
                  background: selectedPlan === 'monthly' ? '#456882' : 'transparent',
                  color: selectedPlan === 'monthly' ? 'white' : colors.text,
                }}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedPlan('yearly')}
                className="px-6 py-2 rounded-md font-medium transition-all relative"
                style={{
                  background: selectedPlan === 'yearly' ? '#456882' : 'transparent',
                  color: selectedPlan === 'yearly' ? 'white' : colors.text,
                }}
              >
                Yearly
                <span className="absolute -top-2 -right-2 text-white text-xs px-2 py-0.5 rounded-full" style={{ background: '#456882' }}>
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing */}
          <div className="text-center mb-8">
            <div className="text-5xl font-bold mb-2" style={{ color: colors.text }}>
              ${selectedPlan === 'monthly' ? '99' : '800'}
              <span className="text-2xl font-normal" style={{ color: colors.mutedText }}>
                /{selectedPlan === 'monthly' ? 'month' : 'year'}
              </span>
            </div>
            {selectedPlan === 'yearly' && (
              <p className="text-sm" style={{ color: colors.mutedText }}>
                That's just $66.67/month, billed annually
              </p>
            )}
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <Check
                  className="h-5 w-5 mt-0.5 flex-shrink-0"
                  style={{ color: colors.primary }}
                />
                <span style={{ color: colors.text }}>{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full py-4 rounded-2xl font-bold text-lg transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
            style={{
              background: '#456882',
              color: 'white',
            }}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                Subscribe Now
              </>
            )}
          </button>

          {/* Footer */}
          <p className="text-center text-sm mt-6" style={{ color: colors.mutedText }}>
            Cancel anytime. No questions asked. 🔒 Secure payment via Stripe
          </p>
        </div>
      </motion.div>
    </div>
  )
}
