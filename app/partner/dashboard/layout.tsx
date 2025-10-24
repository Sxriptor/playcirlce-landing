'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, supabaseUrl } from '@/lib/supabase'
import { validatePartnerAccess } from '@/lib/auth-utils'
import { Navbar } from '@/components/partner/layout/Navbar'
import { Sidebar } from '@/components/partner/layout/Sidebar'
import { ThemeProvider, useTheme } from '@/components/partner/layout/ThemeProvider'
import { SubscriptionPaywall } from '@/components/partner/overlays/SubscriptionPaywall'
import { getThemeColors } from '@/lib/theme-colors'
import type { Partner } from '@/lib/types'
import { Loader2 } from 'lucide-react'

function DashboardContent({ children }: { children: React.ReactNode }) {
  const [partner, setPartner] = useState<Partner | null>(null)
  const [loading, setLoading] = useState(true)
  const [needsSubscription, setNeedsSubscription] = useState(false)
  const [subscriptionVerified, setSubscriptionVerified] = useState(false)
  const router = useRouter()
  const { theme } = useTheme()
  const colors = getThemeColors(theme)


  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if Supabase is properly configured
        if (supabaseUrl === 'https://placeholder.supabase.co') {
          // Demo mode - create mock partner data
          const mockPartner: Partner = {
            id: 'demo-partner-1',
            company_name: 'Demo Sports Center',
            email: 'demo@playcircle.com',
            phone: '+1 (555) 123-4567',
            address: '123 Sports Ave, Demo City, DC 12345',
            logo_url: undefined,
            website: 'https://demosportscenter.com',
            description: 'A premier sports facility offering tennis, pickleball, and more.',
            status: 'approved',
            user_id: 'demo-user-1',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
          setPartner(mockPartner)
          setLoading(false)
          return
        }

        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/partner/entry')
          return
        }

        // Get partner data
        const { data: partnerData, error } = await supabase
          .from('partners')
          .select('*')
          .eq('user_id', session.user.id)
          .single()

        if (error || !partnerData) {
          router.push('/partner/entry')
          return
        }

        // Validate partner access
        const { hasAccess } = validatePartnerAccess(partnerData)
        
        if (!hasAccess) {
          await supabase.auth.signOut()
          router.push('/partner/entry')
          return
        }

        setPartner(partnerData)

        // Check if just completed checkout
        const urlParams = new URLSearchParams(window.location.search)
        const subscriptionParam = urlParams.get('subscription')

        if (subscriptionParam === 'success') {
          // Manually sync subscription from Stripe (in case webhook hasn't fired yet)
          try {
            const syncResponse = await fetch('/partner/api/billing/sync-subscription', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                partnerId: partnerData.id,
              }),
            })

            if (syncResponse.ok) {
              console.log('Subscription synced successfully')
            }
          } catch (error) {
            console.error('Error syncing subscription:', error)
          }

          // Clear the URL parameter
          window.history.replaceState({}, '', '/partner/dashboard')
        }

        // Check subscription status
        const { data: subscription } = await supabase
          .from('partner_subscriptions')
          .select('status')
          .eq('partner_id', partnerData.id)
          .single()

        // Show paywall if no active subscription
        if (!subscription || subscription.status !== 'active') {
          setNeedsSubscription(true)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        // In demo mode, don't redirect on error
        if (supabaseUrl !== 'https://placeholder.supabase.co') {
          router.push('/partner/entry')
        }
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Only set up auth listener if Supabase is properly configured
    if (supabaseUrl !== 'https://placeholder.supabase.co') {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event: string, session: any) => {
          if (event === 'SIGNED_OUT' || !session) {
            router.push('/partner/entry')
          }
        }
      )

      return () => subscription.unsubscribe()
    }
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Show subscription paywall if needed
  if (needsSubscription && partner) {
    return (
      <SubscriptionPaywall
        partnerId={partner.id}
        onSubscribed={() => {
          setNeedsSubscription(false)
          // Reload to refresh subscription status
          window.location.reload()
        }}
      />
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{
      background: colors.background
    }}>
      <Navbar partner={partner} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8" style={{
          background: colors.background
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <DashboardContent>{children}</DashboardContent>
    </ThemeProvider>
  )
}