'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Trophy, 
  Users,
  Calendar,
  MapPin,
  DollarSign,
  Plus,
  Eye,
  EyeOff,
  Edit,
  MoreHorizontal,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import { CreateMatchOverlay } from '@/components/partner/overlays'
import { useTheme } from '@/components/partner/layout/ThemeProvider'
import { getThemeColors, themeColors } from '@/lib/theme-colors'
import { getPartnerVenues } from '@/lib/supabase/venues'
import { getPartnerCourts } from '@/lib/supabase/courts'
import { createMatch, getPartnerMatches, MatchData, deleteMatch, toggleMatchStatus, updateMatch } from '@/lib/supabase/matches'
import { useToast } from '@/hooks/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
export default function MatchesPage() {
  const { theme } = useTheme()
  const colors = getThemeColors(theme)
  const [showCreateMatchOverlay, setShowCreateMatchOverlay] = useState(false)
  const [editingMatch, setEditingMatch] = useState<any>(null)
  const [matches, setMatches] = useState<any[]>([])
  const [venues, setVenues] = useState<any[]>([])
  const [courts, setCourts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [matchToDelete, setMatchToDelete] = useState<any>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { toast } = useToast()

  // Fetch venues and courts on component mount
  React.useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [partnerVenues, partnerCourts, partnerMatches] = await Promise.all([
        getPartnerVenues(),
        getPartnerCourts(),
        getPartnerMatches()
      ])
      
      // Transform venues data for the overlay
      const transformedVenues = partnerVenues.map(venue => ({
        id: venue.id,
        name: venue.name
      }))
      
      // Transform courts data for the overlay (add venueId field)
      const transformedCourts = partnerCourts.map(court => ({
        id: court.id,
        name: court.name,
        venueId: court.venue_id // Transform venue_id to venueId for overlay compatibility
      }))
      
      setVenues(transformedVenues)
      setCourts(transformedCourts)
      setMatches(partnerMatches)
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMatchSubmit = async (matchData: MatchData & { matchId?: string }) => {
    console.log('Match data:', matchData)
    
    try {
      // Format rules and requirements as JSON before submitting
      const formattedData = {
        ...matchData,
        // Don't send rules/requirements to createMatch/updateMatch as they expect the old format
      }

      let result

      if (matchData.matchId) {
        // Update existing match
        result = await updateMatch(matchData.matchId, formattedData)
      } else {
        // Create new match
        result = await createMatch(formattedData)
      }

      if (result.success) {
        toast({
          title: "Success!",
          description: matchData.matchId ? "Match updated successfully!" : "Match created successfully!",
        })
        console.log('Match operation result:', result.match)
        setShowCreateMatchOverlay(false)
        setEditingMatch(null)
        // Reload data to show the changes
        loadData()
      } else {
        toast({
          title: "Error",
          description: result.error || `Failed to ${matchData.matchId ? 'update' : 'create'} match`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error with match operation:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleToggleMatchStatus = async (match: any) => {
    try {
      const result = await toggleMatchStatus(match.id)

      if (result.success) {
        toast({
          title: "Success!",
          description: `Match ${result.match.is_active ? 'activated' : 'deactivated'} successfully!`,
        })
        // Reload matches to reflect the change
        loadData()
      } else {
        toast({
          title: "Error",
          description: result.error || 'Failed to update match status',
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error toggling match status:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleEditMatch = (match: any) => {
    setEditingMatch(match)
    setShowCreateMatchOverlay(true)
  }

  const handleCloseOverlay = () => {
    setShowCreateMatchOverlay(false)
    setEditingMatch(null)
  }

  const handleDeleteMatch = async () => {
    if (!matchToDelete) return

    try {
      const result = await deleteMatch(matchToDelete.id)

      if (result.success) {
        toast({
          title: "Success!",
          description: "Match deleted successfully!",
        })
        setShowDeleteDialog(false)
        setMatchToDelete(null)
        // Reload matches to reflect the change
        loadData()
      } else {
        toast({
          title: "Error",
          description: result.error || 'Failed to delete match',
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error deleting match:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const confirmDeleteMatch = (match: any) => {
    setMatchToDelete(match)
    setShowDeleteDialog(true)
  }

  const MatchCard = ({ match }: any) => (
    <motion.div
      className="rounded-3xl p-6 relative overflow-hidden"
      style={{
        background: 'rgba(69, 104, 130, 0.1)',
        border: '1px solid rgba(69, 104, 130, 0.2)',
        backdropFilter: 'blur(20px)'
      }}
      whileHover={{ 
        y: -4,
        scale: 1.02
      }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full" style={{
        background: 'radial-gradient(circle, rgba(69, 104, 130, 0.15) 0%, transparent 70%)',
        filter: 'blur(30px)'
      }} />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-xl font-bold" style={{ color: colors.text }}>{match.title}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                match.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {match.is_active ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
            <p className="text-sm mb-3" style={{ color: colors.textSecondary }}>{match.description}</p>
            <div className="flex items-center space-x-4 text-sm mb-3" style={{ color: colors.textSecondary }}>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{match.scheduled_date ? new Date(match.scheduled_date + 'T00:00:00').toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>{match.start_time} - {match.end_time}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm" style={{ color: colors.textSecondary }}>
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{match.venue_name}</span>
              </div>
              <span>•</span>
              <span className="capitalize">{match.sport}</span>
              <span>•</span>
              <span className="capitalize">{match.skill_level}</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-gray-900 border-gray-700"
            >
              <DropdownMenuItem
                onClick={() => confirmDeleteMatch(match)}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20 cursor-pointer"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Match
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-blue-400" />
            </div>
            <p className="text-lg font-bold" style={{ color: colors.text }}>{match.current_players}/{match.max_players}</p>
            <p className="text-xs" style={{ color: colors.textTertiary }}>Players</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <DollarSign className="h-4 w-4 text-green-400" />
            </div>
            <p className="text-lg font-bold" style={{ color: colors.text }}>${match.entry_fee}</p>
            <p className="text-xs" style={{ color: colors.textTertiary }}>Entry Fee</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Trophy className="h-4 w-4 text-yellow-400" />
            </div>
            <p className="text-lg font-bold" style={{ color: colors.text }}>${match.prize_pool}</p>
            <p className="text-xs" style={{ color: colors.textTertiary }}>Prize Pool</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-300">
            <span className="capitalize">{match.match_type}</span> • {match.courts?.name || 'Court'}
            {match.access_type && (
              <>
                <span> • </span>
                <span className="capitalize">{match.access_type}</span>
              </>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleToggleMatchStatus(match)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                match.is_active
                  ? 'text-green-400 hover:text-green-300'
                  : 'text-red-400 hover:text-red-300'
              }`}
            >
              {match.is_active ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
              <span className="text-xs font-medium">
                {match.is_active ? 'Active' : 'Inactive'}
              </span>
            </button>
            <button
              onClick={() => handleEditMatch(match)}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg"
            >
              <Edit className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Matches</h1>
        <p className="text-gray-400">Organize and manage competitive matches</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-gray-400">Loading matches...</p>
          </div>
        </div>
      ) : venues.length === 0 ? (
        /* No venues - can't create matches without venues */
        <div className="text-center py-12">
          <div className="rounded-3xl p-8 max-w-md mx-auto" style={{
            background: 'rgba(69, 104, 130, 0.1)',
            border: '1px solid rgba(69, 104, 130, 0.2)',
            backdropFilter: 'blur(20px)'
          }}>
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{
                background: 'rgba(69, 104, 130, 0.2)'
              }}>
                <MapPin className="h-8 w-8" style={{ color: '#456882' }} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Venues Found</h3>
              <p className="text-gray-400 mb-6">
                You need to create a venue first before you can organize matches. Matches are held at venues.
              </p>
              <motion.button
                onClick={() => window.location.href = '/partner/dashboard/venues'}
                className="text-white px-6 py-3 rounded-2xl flex items-center font-bold text-sm mx-auto"
                style={{
                  background: '#456882',
                  boxShadow: '0 8px 24px rgba(69, 104, 130, 0.4)'
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="h-4 w-4 mr-2" />
                CREATE VENUE FIRST
              </motion.button>
            </div>
          </div>
        </div>
      ) : matches.length === 0 ? (
        /* No matches yet */
        <div className="text-center py-12">
          <div className="rounded-3xl p-8 max-w-md mx-auto" style={{
            background: 'rgba(69, 104, 130, 0.1)',
            border: '1px solid rgba(69, 104, 130, 0.2)',
            backdropFilter: 'blur(20px)'
          }}>
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{
                background: 'rgba(69, 104, 130, 0.2)'
              }}>
                <Trophy className="h-8 w-8" style={{ color: '#456882' }} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Matches Yet</h3>
              <p className="text-gray-400 mb-6">
                Create your first match to start organizing competitive games and tournaments.
              </p>
              <motion.button
                onClick={() => {
                  setEditingMatch(null)
                  setShowCreateMatchOverlay(true)
                }}
                className="text-white px-6 py-3 rounded-2xl flex items-center font-bold text-sm mx-auto"
                style={{
                  background: '#456882',
                  boxShadow: '0 8px 24px rgba(69, 104, 130, 0.4)'
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="h-4 w-4 mr-2" />
                CREATE MATCH
              </motion.button>
            </div>
          </div>
        </div>
      ) : (
        /* Show matches */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-400">{matches.length} match{matches.length !== 1 ? 'es' : ''} found</p>
            <motion.button
              onClick={() => {
                setEditingMatch(null)
                setShowCreateMatchOverlay(true)
              }}
              className="text-white px-6 py-3 rounded-2xl flex items-center font-bold text-sm"
              style={{
                background: '#456882',
                boxShadow: '0 8px 24px rgba(69, 104, 130, 0.4)'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="h-4 w-4 mr-2" />
              CREATE MATCH
            </motion.button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      )}

      {/* Create Match Overlay */}
      <CreateMatchOverlay
        key={editingMatch ? `edit-${editingMatch.id}` : 'create'}
        isOpen={showCreateMatchOverlay}
        onClose={handleCloseOverlay}
        onSubmit={handleMatchSubmit}
        venues={venues}
        courts={courts}
        editingMatch={editingMatch}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent
          className="bg-gray-900 border-gray-700"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Remove Match - Dangerous Action
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              <div className="space-y-3">
                <p>
                  You are about to permanently remove <strong className="text-white">"{matchToDelete?.title}"</strong> scheduled for <strong className="text-white">{matchToDelete?.scheduled_date}</strong>.
                </p>
                <div
                  className="p-4 rounded-lg border-l-4 border-red-500"
                  style={{ background: 'rgba(239, 68, 68, 0.1)' }}
                >
                  <p className="text-red-400 font-semibold mb-2">⚠️ This action will permanently remove:</p>
                  <ul className="text-sm text-gray-300 space-y-1 ml-4">
                    <li>• All player registrations for this match</li>
                    <li>• Match scheduling and court booking</li>
                    <li>• All match history and data</li>
                    <li>• Entry fees and prize pool information</li>
                  </ul>
                </div>
                <p className="text-red-400 font-medium">
                  This action cannot be undone. Are you absolutely sure?
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-gray-700 text-white hover:bg-gray-600 border-gray-600"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMatch}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Yes, Remove Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}