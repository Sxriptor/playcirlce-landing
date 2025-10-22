'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Clock,
  Calendar,
  MapPin,
  DollarSign,
  Plus,
  Eye,
  EyeOff,
  Edit,
  MoreHorizontal,
  GraduationCap,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import { CreateClassOverlay } from '@/components/partner/overlays'
import { useTheme } from '@/components/partner/layout/ThemeProvider'
import { getThemeColors } from '@/lib/theme-colors'
import { getPartnerVenues } from '@/lib/supabase/venues'
import { getPartnerCourts } from '@/lib/supabase/courts'
import { createEvent, getPartnerClasses, ClassData, deleteEvent, toggleEventStatus, updateEvent } from '@/lib/supabase/events'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
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

export default function ClassesPage() {
  const { theme } = useTheme()
  const colors = getThemeColors(theme)
  const [showCreateClassOverlay, setShowCreateClassOverlay] = useState(false)
  const [editingClass, setEditingClass] = useState<any>(null)
  const [classes, setClasses] = useState<any[]>([])
  const [venues, setVenues] = useState<any[]>([])
  const [courts, setCourts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [classToDelete, setClassToDelete] = useState<any>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { toast } = useToast()

  // Fetch venues, courts, and classes on component mount
  React.useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [partnerVenues, partnerCourts, partnerClasses] = await Promise.all([
        getPartnerVenues(),
        getPartnerCourts(),
        getPartnerClasses()
      ])
      
      // Transform venues data for the overlay
      const transformedVenues = partnerVenues.map((venue: any) => ({
        id: venue.id,
        name: venue.name,
        address: venue.address,
        city: venue.city,
        state: venue.state,
        postal_code: venue.postal_code
      }))
      
      // Transform courts data for the overlay (add venueId field)
      const transformedCourts = partnerCourts.map((court: any) => ({
        id: court.id,
        name: court.name,
        venueId: court.venue_id // Transform venue_id to venueId for overlay compatibility
      }))
      
      setVenues(transformedVenues)
      setCourts(transformedCourts)
      setClasses(partnerClasses)
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

  const uploadImageToStorage = async (partnerId: string, eventId: string, imageFile: File): Promise<string | null> => {
    try {
      // Create file path: {partner_id}/{event_id}/main.{extension}
      const fileExt = imageFile.name.split('.').pop()
      const filePath = `${partnerId}/${eventId}/main.${fileExt}`

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('events-images')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: true // Replace if exists
        })

      if (error) {
        console.error('Error uploading image:', error)
        throw error
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('events-images')
        .getPublicUrl(filePath)

      return publicUrlData.publicUrl
    } catch (error) {
      console.error('Error in uploadImageToStorage:', error)
      toast({
        title: "Warning",
        description: "Failed to upload image. The class will be created without an image.",
        variant: "destructive",
      })
      return null
    }
  }

  const handleClassSubmit = async (classData: any) => {
    console.log('Class data:', classData)

    try {
      // Transform the overlay data to match the database schema
      const eventData: ClassData = {
        name: classData.title,
        description: classData.description,
        sport: classData.sport,
        event_type: classData.classType, // Use the actual class type from the form
        venue_id: classData.venueId,
        court_id: classData.courtId && classData.courtId !== '' ? classData.courtId : undefined,
        instructor_name: classData.instructorName,
        instructor_bio: classData.instructorBio,
        start_date: classData.schedule.startDate,
        end_date: classData.schedule.endDate || null,
        start_time: classData.schedule.startTime,
        end_time: classData.schedule.endTime,
        capacity: parseInt(classData.maxStudents) || 10,
        price: parseFloat(classData.price) || 0,
        skill_level: classData.skillLevel,
        age_group: classData.ageGroup,
        equipment_provided: classData.equipment === 'provided',
        access_type: classData.accessType,
        location: classData.location,
        registration_closes: classData.registrationDeadline || null,
        is_recurring: classData.schedule.recurring,
        recurrence_pattern: classData.schedule.recurring ? classData.schedule.frequency : null,
        recurrence_end_date: classData.schedule.recurring ? classData.schedule.endDate : null,
        status: 'scheduled'
      }

      let result

      if (classData.classId) {
        // Update existing class
        result = await updateEvent(classData.classId, eventData)
      } else {
        // Create new class
        result = await createEvent(eventData)
      }

      if (result.success) {
        // Upload image if provided
        if (classData.selectedImage && classData.partnerId && result.event?.id) {
          const imageUrl = await uploadImageToStorage(classData.partnerId, result.event.id, classData.selectedImage)
          if (imageUrl) {
            // Update event with image URL
            await updateEvent(result.event.id, { image_url: imageUrl })
          }
        }

        toast({
          title: "Success!",
          description: classData.classId ? "Class updated successfully!" : "Class created successfully!",
        })
        console.log('Class operation result:', result.event)
        setShowCreateClassOverlay(false)
        setEditingClass(null)
        // Reload data to show the changes
        loadData()
      } else {
        toast({
          title: "Error",
          description: result.error || `Failed to ${classData.classId ? 'update' : 'create'} class`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error with class operation:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleToggleClassStatus = async (classItem: any) => {
    try {
      const result = await toggleEventStatus(classItem.id)

      if (result.success) {
        toast({
          title: "Success!",
          description: `Class ${result.event.status === 'scheduled' ? 'activated' : 'cancelled'} successfully!`,
        })
        // Reload classes to reflect the change
        loadData()
      } else {
        toast({
          title: "Error",
          description: result.error || 'Failed to update class status',
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error toggling class status:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleEditClass = (classItem: any) => {
    // Transform the database data back to overlay format
    const overlayData = {
      classId: classItem.id,
      title: classItem.name,
      description: classItem.description || '',
      classType: 'group', // Default since we don't store this
      sport: classItem.sport,
      accessType: classItem.access_type || 'reserve',
      venueId: classItem.venue_id,
      courtId: classItem.court_id || '',
      location: classItem.location || '',
      instructorName: classItem.instructor_name || '',
      instructorBio: classItem.instructor_bio || '',
      skillLevel: classItem.skill_level || 'beginner',
      ageGroup: classItem.age_group || 'adult',
      maxStudents: classItem.capacity?.toString() || '',
      duration: '60', // Default since we don't store this separately
      price: classItem.price?.toString() || '',
      packagePrice: '',
      packageSessions: '4',
      registrationDeadline: classItem.registration_closes ? classItem.registration_closes.split('T')[0] : '',
      schedule: {
        recurring: classItem.is_recurring || false,
        frequency: classItem.recurrence_pattern || 'weekly',
        dayOfWeek: 'monday', // Default since we don't store this
        startTime: classItem.start_time || '',
        endTime: classItem.end_time || '',
        startDate: classItem.start_date || '',
        endDate: classItem.end_date || '',
      },
      equipment: classItem.equipment_provided ? 'provided' : 'bring-own',
      requirements: [],
      objectives: '',
      curriculum: '',
    }
    
    setEditingClass(overlayData)
    setShowCreateClassOverlay(true)
  }

  const handleCloseOverlay = () => {
    setShowCreateClassOverlay(false)
    setEditingClass(null)
  }

  const handleDeleteClass = async () => {
    if (!classToDelete) return

    try {
      const result = await deleteEvent(classToDelete.id)

      if (result.success) {
        toast({
          title: "Success!",
          description: "Class deleted successfully!",
        })
        setShowDeleteDialog(false)
        setClassToDelete(null)
        // Reload classes to reflect the change
        loadData()
      } else {
        toast({
          title: "Error",
          description: result.error || 'Failed to delete class',
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error deleting class:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const confirmDeleteClass = (classItem: any) => {
    setClassToDelete(classItem)
    setShowDeleteDialog(true)
  }

  const ClassCard = ({ classItem }: any) => (
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
              <h3 className="text-xl font-bold" style={{ color: colors.text }}>{classItem.name}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                classItem.status === 'scheduled' ? 'bg-green-500/20 text-green-400' :
                classItem.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                classItem.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {classItem.status}
              </span>
            </div>
            <p className="text-sm mb-3" style={{ color: colors.textSecondary }}>{classItem.description}</p>
            <div className="flex items-center space-x-4 text-sm mb-3" style={{ color: colors.textSecondary }}>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(classItem.start_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{classItem.start_time} - {classItem.end_time}</span>
              </div>
            </div>
            {classItem.registration_closes && classItem.access_type === 'reserve' && (
              <div className="text-xs mb-3" style={{ color: colors.textSecondary }}>
                Registration closes: {new Date(classItem.registration_closes).toLocaleDateString()}
              </div>
            )}
            <div className="flex items-center space-x-4 text-sm" style={{ color: colors.textSecondary }}>
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{classItem.venue_name}</span>
              </div>
              <span>•</span>
              <span className="capitalize">{classItem.sport}</span>
              <span>•</span>
              <span className="capitalize">{classItem.skill_level}</span>
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
                onClick={() => confirmDeleteClass(classItem)}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20 cursor-pointer"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Class
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {classItem.instructor_name && (
          <div className="mb-4 p-3 rounded-2xl" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-4 w-4 text-purple-400" />
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                <span className="font-semibold">Instructor:</span> {classItem.instructor_name}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-blue-400" />
            </div>
            <p className="text-lg font-bold" style={{ color: colors.text }}>{classItem.current_registrations}/{classItem.capacity}</p>
            <p className="text-xs" style={{ color: colors.textTertiary }}>Enrolled</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <DollarSign className="h-4 w-4 text-green-400" />
            </div>
            <p className="text-lg font-bold" style={{ color: colors.text }}>${classItem.price}</p>
            <p className="text-xs" style={{ color: colors.textTertiary }}>Price</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold" style={{ color: colors.text }}>
              {classItem.capacity > 0 ? Math.round((classItem.current_registrations / classItem.capacity) * 100) : 0}%
            </p>
            <p className="text-xs" style={{ color: colors.textTertiary }}>Full</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-300">
            <span className="capitalize">{classItem.event_type}</span>
            {classItem.court_name && (
              <>
                <span> • </span>
                <span>{classItem.court_name}</span>
              </>
            )}
            {classItem.age_group && (
              <>
                <span> • </span>
                <span className="capitalize">{classItem.age_group}</span>
              </>
            )}
            {classItem.access_type && (
              <>
                <span> • </span>
                <span className="capitalize">{classItem.access_type === 'reserve' ? 'Mobile Booking' : 'Walk-in'}</span>
              </>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleToggleClassStatus(classItem)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                classItem.status === 'scheduled'
                  ? 'text-green-400 hover:text-green-300'
                  : 'text-red-400 hover:text-red-300'
              }`}
            >
              {classItem.status === 'scheduled' ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
              <span className="text-xs font-medium">
                {classItem.status === 'scheduled' ? 'Active' : 'Cancelled'}
              </span>
            </button>
            <button
              onClick={() => handleEditClass(classItem)}
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
        <h1 className="text-3xl font-bold text-white">Classes</h1>
        <p className="text-gray-400">Manage instructional classes and training sessions</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-gray-400">Loading classes...</p>
          </div>
        </div>
      ) : classes.length === 0 ? (
        /* No classes yet */
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
                <GraduationCap className="h-8 w-8" style={{ color: '#456882' }} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Classes Yet</h3>
              <p className="text-gray-400 mb-6">
                Create your first class to start offering lessons, clinics, and training sessions.
              </p>
              <motion.button
                onClick={() => {
                  if (venues.length === 0) {
                    toast({
                      title: "No Venues Found",
                      description: "You need to create a venue first before you can organize classes.",
                      variant: "destructive",
                    })
                    return
                  }
                  setEditingClass(null)
                  setShowCreateClassOverlay(true)
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
                CREATE CLASS
              </motion.button>
            </div>
          </div>
        </div>
      ) : (
        /* Show classes */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-400">{classes.length} class{classes.length !== 1 ? 'es' : ''} found</p>
            <motion.button
              onClick={() => {
                if (venues.length === 0) {
                  toast({
                    title: "No Venues Found",
                    description: "You need to create a venue first before you can organize classes.",
                    variant: "destructive",
                  })
                  return
                }
                setEditingClass(null)
                setShowCreateClassOverlay(true)
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
              CREATE CLASS
            </motion.button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {classes.map((classItem) => (
              <ClassCard key={classItem.id} classItem={classItem} />
            ))}
          </div>
        </div>
      )}

      {/* Create Class Overlay */}
      <CreateClassOverlay
        key={editingClass ? `edit-${editingClass.classId}` : 'create'}
        isOpen={showCreateClassOverlay}
        onClose={handleCloseOverlay}
        onSubmit={handleClassSubmit}
        venues={venues}
        courts={courts}
        editingClass={editingClass}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent
          className="bg-gray-900 border-gray-700"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Remove Class - Dangerous Action
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              <div className="space-y-3">
                <p>
                  You are about to permanently remove <strong className="text-white">"{classToDelete?.name}"</strong> scheduled for <strong className="text-white">{classToDelete?.start_date}</strong>.
                </p>
                <div
                  className="p-4 rounded-lg border-l-4 border-red-500"
                  style={{ background: 'rgba(239, 68, 68, 0.1)' }}
                >
                  <p className="text-red-400 font-semibold mb-2">⚠️ This action will permanently remove:</p>
                  <ul className="text-sm text-gray-300 space-y-1 ml-4">
                    <li>• All student registrations for this class</li>
                    <li>• Class scheduling and venue booking</li>
                    <li>• All class history and data</li>
                    <li>• Payment and pricing information</li>
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
              onClick={handleDeleteClass}
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