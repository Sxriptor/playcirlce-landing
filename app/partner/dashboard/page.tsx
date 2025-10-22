'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Building2,
  MapPin,
  Trophy,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  MoreHorizontal
} from 'lucide-react'
import { useTheme } from '@/components/partner/layout/ThemeProvider'
import { getThemeColors, themeColors } from '@/lib/theme-colors'
import { supabase } from '@/lib/supabase'
import { getCurrentPartner } from '@/lib/supabase/venues'

export default function PartnerDashboard() {
  const { theme } = useTheme()
  const colors = getThemeColors(theme)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalVenues: 0,
    totalCourts: 0,
    totalMatches: 0,
    totalEvents: 0,
    activeMatches: 0,
    upcomingEvents: 0,
    monthlyRevenue: 0,
    totalParticipants: 0
  })
  const [matches, setMatches] = useState<any[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const partner = await getCurrentPartner()

      if (!partner) {
        console.log('No partner found')
        setLoading(false)
        return
      }

      console.log('Partner ID:', partner.id)

      // Get total venues
      const { count: venuesCount, error: venuesError } = await supabase
        .from('venues')
        .select('*', { count: 'exact', head: true })
        .eq('partner_id', partner.id)

      console.log('Venues count:', venuesCount, 'Error:', venuesError)

      // Get venue IDs for courts
      const { data: venues } = await supabase
        .from('venues')
        .select('id')
        .eq('partner_id', partner.id)

      const venueIds = venues?.map(v => v.id) || []
      console.log('Venue IDs:', venueIds)

      // Get total courts
      let courtsCount = 0
      if (venueIds.length > 0) {
        const { count, error: courtsError } = await supabase
          .from('courts')
          .select('*', { count: 'exact', head: true })
          .in('venue_id', venueIds)
        console.log('Courts count:', count, 'Error:', courtsError)
        courtsCount = count || 0
      }

      // Get matches count (may not exist yet)
      let matchesCount = 0
      let activeMatchesCount = 0
      let totalParticipants = 0
      let recentMatches: any[] = []

      try {
        const { count } = await supabase
          .from('matches')
          .select('*', { count: 'exact', head: true })
          .eq('partner_id', partner.id)
        matchesCount = count || 0

        // Get active matches
        const { count: activeCount } = await supabase
          .from('matches')
          .select('*', { count: 'exact', head: true })
          .eq('partner_id', partner.id)
          .eq('status', 'scheduled')
        activeMatchesCount = activeCount || 0

        // Get total participants
        const { data: matchesData } = await supabase
          .from('matches')
          .select('current_players')
          .eq('partner_id', partner.id)
        totalParticipants = matchesData?.reduce((sum, match) => sum + (match.current_players || 0), 0) || 0

        // Get recent matches
        const { data } = await supabase
          .from('matches')
          .select('*')
          .eq('partner_id', partner.id)
          .order('scheduled_date', { ascending: false })
          .limit(5)
        recentMatches = data || []
      } catch (error) {
        console.log('Matches table not available or no access:', error)
      }

      // Get events count (may not exist yet)
      let eventsCount = 0
      let upcomingEventsCount = 0

      try {
        const { count } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('partner_id', partner.id)
        eventsCount = count || 0

        // Get upcoming events
        const { count: upcomingCount } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('partner_id', partner.id)
          .eq('status', 'scheduled')
        upcomingEventsCount = upcomingCount || 0
      } catch (error) {
        console.log('Events table not available or no access:', error)
      }

      setStats({
        totalVenues: venuesCount || 0,
        totalCourts: courtsCount,
        totalMatches: matchesCount,
        totalEvents: eventsCount,
        activeMatches: activeMatchesCount,
        upcomingEvents: upcomingEventsCount,
        monthlyRevenue: 0,
        totalParticipants
      })

      setMatches(recentMatches)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, description, icon: Icon, trend }: any) => (
    <motion.div
      className="rounded-3xl p-6 relative overflow-hidden"
      style={{
        background: theme === 'dark' ? 'rgba(69, 104, 130, 0.1)' : 'rgba(255, 255, 255, 0.9)',
        border: `1px solid ${colors.cardBorder}`,
        backdropFilter: 'blur(20px)'
      }}
      whileHover={{
        y: -4,
        scale: 1.02
      }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full" style={{
        background: theme === 'dark' ? 'radial-gradient(circle, rgba(69, 104, 130, 0.15) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(69, 104, 130, 0.08) 0%, transparent 70%)',
        filter: 'blur(30px)'
      }} />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>{title}</p>
            <p className="text-4xl font-bold" style={{ color: colors.text }}>{value}</p>
          </div>
          {Icon && (
            <div className="p-3 rounded-2xl" style={{
              background: theme === 'dark' ? 'rgba(69, 104, 130, 0.2)' : 'rgba(69, 104, 130, 0.1)'
            }}>
              <Icon className="h-6 w-6" style={{ color: themeColors.accent }} />
            </div>
          )}
        </div>
        {description && <p className="text-xs mb-3" style={{ color: colors.textTertiary }}>{description}</p>}
        {trend && (
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
              trend.isPositive ? 'text-green-400' : 'text-red-400'
            }`} style={{
              background: trend.isPositive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'
            }}>
              <svg className={`w-3 h-3 ${trend.isPositive ? 'rotate-0' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
            </div>
            <span className="text-xs" style={{ color: colors.textTertiary }}>{trend.label}</span>
          </div>
        )}
      </div>
    </motion.div>
  )

  const TableRow = ({ data, columns, actions }: any) => (
    <tr
      className="transition-colors"
      style={{ borderBottom: `1px solid ${colors.borderLight}` }}
      onMouseEnter={(e) => e.currentTarget.style.background = colors.hover}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      {columns.map((col: any, idx: number) => (
        <td key={idx} className="px-8 py-5 whitespace-nowrap text-sm font-medium" style={{ color: colors.textSecondary }}>
          {col.render ? col.render(data[col.key], data) : data[col.key]}
        </td>
      ))}
      {actions && (
        <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
          <button
            className="p-2 transition-colors rounded-lg"
            style={{ color: colors.textSecondary }}
            onMouseEnter={(e) => e.currentTarget.style.color = colors.text}
            onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </td>
      )}
    </tr>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: colors.text }}>Dashboard</h1>
        <p style={{ color: colors.textSecondary }}>Welcome back! Here&apos;s what&apos;s happening with your venues.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Venues"
          value={stats.totalVenues}
          description="Active venues"
          icon={Building2}
        />
        <StatCard
          title="Total Courts"
          value={stats.totalCourts}
          description="Available courts"
          icon={MapPin}
        />
        <StatCard
          title="Active Matches"
          value={stats.activeMatches}
          description="Scheduled matches"
          icon={Trophy}
        />
        <StatCard
          title="Upcoming Events"
          value={stats.upcomingEvents}
          description="Events this month"
          icon={Calendar}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Participants"
          value={stats.totalParticipants}
          description="Across all matches"
          icon={Users}
        />
        <StatCard
          title="Monthly Revenue"
          value={stats.monthlyRevenue > 0 ? `$${stats.monthlyRevenue.toLocaleString()}` : 'N/A'}
          description="This month"
          icon={DollarSign}
        />
        <StatCard
          title="Court Utilization"
          value="N/A"
          description="Average this month"
          icon={Activity}
        />
        <StatCard
          title="Growth Rate"
          value="N/A"
          description="Monthly growth"
          icon={TrendingUp}
        />
      </div>

      <div className="rounded-3xl overflow-hidden" style={{
        background: theme === 'dark' ? 'rgba(69, 104, 130, 0.1)' : 'rgba(255, 255, 255, 0.9)',
        border: `1px solid ${colors.cardBorder}`,
        backdropFilter: 'blur(20px)'
      }}>
        <div className="px-8 py-6" style={{ borderBottom: `1px solid ${colors.border}` }}>
          <h3 className="text-xl font-bold" style={{ color: colors.text }}>Recent Matches</h3>
          <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>Latest matches at your venues</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                <th className="px-8 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: colors.textSecondary }}>Match</th>
                <th className="px-8 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: colors.textSecondary }}>Sport</th>
                <th className="px-8 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: colors.textSecondary }}>Date</th>
                <th className="px-8 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: colors.textSecondary }}>Players</th>
                <th className="px-8 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: colors.textSecondary }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {matches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-8 text-center text-sm" style={{ color: colors.textSecondary }}>
                    No matches found
                  </td>
                </tr>
              ) : (
                matches.map((match) => (
                  <TableRow
                    key={match.id}
                    data={{
                      title: match.title,
                      sport: match.sport,
                      date: match.scheduled_date ? new Date(match.scheduled_date + 'T00:00:00').toLocaleDateString() : 'N/A',
                      players: `${match.current_players}/${match.max_players}`,
                      status: match.status
                    }}
                    columns={[
                      { key: 'title' },
                      { key: 'sport' },
                      { key: 'date' },
                      { key: 'players' },
                      {
                        key: 'status',
                        render: (value: string) => (
                          <span className={`px-4 py-2 rounded-xl text-xs font-bold uppercase ${
                            value === 'scheduled' ? 'text-blue-400' :
                            value === 'completed' ? 'text-green-400' :
                            'text-gray-400'
                          }`} style={{
                            background: value === 'scheduled' ? 'rgba(69, 104, 130, 0.2)' :
                                      value === 'completed' ? 'rgba(34, 197, 94, 0.2)' :
                                      'rgba(107, 114, 128, 0.2)'
                          }}>
                            {value}
                          </span>
                        )
                      }
                    ]}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
