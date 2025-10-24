'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Building2, 
  User,
  Bell,
  CreditCard,
  Shield,
  Globe,
  Save,
  Edit,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('company')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [partnerId, setPartnerId] = useState<string | null>(null)

  const [settings, setSettings] = useState({
    company_name: '',
    email: '',
    phone: '',
    website: '',
    description: '',
    address: '',
  })

  // Store original settings for cancel functionality
  const [originalSettings, setOriginalSettings] = useState({
    company_name: '',
    email: '',
    phone: '',
    website: '',
    description: '',
    address: '',
  })

  // Account/Profile settings
  const [accountSettings, setAccountSettings] = useState({
    username: '',
    full_name: '',
    first_name: '',
    last_name: '',
    phone: '',
    bio: '',
    location: '',
  })

  // Store original account settings for cancel functionality
  const [originalAccountSettings, setOriginalAccountSettings] = useState({
    username: '',
    full_name: '',
    first_name: '',
    last_name: '',
    phone: '',
    bio: '',
    location: '',
  })

  const [profileId, setProfileId] = useState<string | null>(null)
  const [isFrozen, setIsFrozen] = useState(false)

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    notifications_enabled: true,
    email_notifications: true,
    sms_notifications: true,
    court_notifications: true,
    class_notifications: true,
    event_notifications: true,
    match_notifications: true,
    venue_notifications: true,
  })

  // Store original notification settings for cancel functionality
  const [originalNotificationSettings, setOriginalNotificationSettings] = useState({
    notifications_enabled: true,
    email_notifications: true,
    sms_notifications: true,
    court_notifications: true,
    class_notifications: true,
    event_notifications: true,
    match_notifications: true,
    venue_notifications: true,
  })

  // Reset editing mode when switching tabs
  useEffect(() => {
    setIsEditing(false)
    setMessage(null)
  }, [activeTab])

  // Fetch partner and profile data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Get current user session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !session) {
          setMessage({ type: 'error', text: 'Not authenticated' })
          return
        }

        // Fetch partner data
        const { data: partnerData, error: partnerError } = await supabase
          .from('partners')
          .select('*')
          .eq('user_id', session.user.id)
          .single()

        if (partnerError) {
          console.error('Error fetching partner:', partnerError)
          setMessage({ type: 'error', text: 'Failed to load partner data' })
        } else if (partnerData) {
          setPartnerId(partnerData.id)
          const fetchedSettings = {
            company_name: partnerData.company_name || '',
            email: partnerData.email || '',
            phone: partnerData.phone || '',
            website: partnerData.website || '',
            description: partnerData.description || '',
            address: partnerData.address || '',
          }
          setSettings(fetchedSettings)
          setOriginalSettings(fetchedSettings)

          // Fetch notification settings
          const fetchedNotificationSettings = {
            notifications_enabled: partnerData.notifications_enabled ?? true,
            email_notifications: partnerData.email_notifications ?? true,
            sms_notifications: partnerData.sms_notifications ?? true,
            court_notifications: partnerData.court_notifications ?? true,
            class_notifications: partnerData.class_notifications ?? true,
            event_notifications: partnerData.event_notifications ?? true,
            match_notifications: partnerData.match_notifications ?? true,
            venue_notifications: partnerData.venue_notifications ?? true,
          }
          setNotificationSettings(fetchedNotificationSettings)
          setOriginalNotificationSettings(fetchedNotificationSettings)
        }

        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileError) {
          console.error('Error fetching profile:', profileError)
        } else if (profileData) {
          setProfileId(profileData.id)
          setIsFrozen(profileData.is_frozen || false)
          const fetchedAccountSettings = {
            username: profileData.username || '',
            full_name: profileData.full_name || '',
            first_name: profileData.first_name || '',
            last_name: profileData.last_name || '',
            phone: profileData.phone || '',
            bio: profileData.bio || '',
            location: profileData.location || '',
          }
          setAccountSettings(fetchedAccountSettings)
          setOriginalAccountSettings(fetchedAccountSettings)
        }
      } catch (error) {
        console.error('Error:', error)
        setMessage({ type: 'error', text: 'An unexpected error occurred' })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Handle field changes
  const handleFieldChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle account field changes
  const handleAccountFieldChange = (field: string, value: string) => {
    setAccountSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle notification toggle changes
  const handleNotificationToggle = (field: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev]
    }))
  }

  // Handle password change
  const handlePasswordChange = async () => {
    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Please fill in all password fields' })
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters long' })
      return
    }

    try {
      setSaving(true)
      setMessage(null)

      // Update password using Supabase auth
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) {
        console.error('Error updating password:', error)
        setMessage({ type: 'error', text: 'Failed to update password. Please try again.' })
        return
      }

      // Clear form and hide it
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setShowPasswordForm(false)
      setMessage({ type: 'success', text: 'Password updated successfully!' })
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Error:', error)
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setSaving(false)
    }
  }

  // Handle account freeze/unfreeze toggle
  const handleToggleFreezeAccount = async () => {
    if (!profileId) {
      setMessage({ type: 'error', text: 'Profile ID not found' })
      return
    }

    const action = isFrozen ? 'unfreeze' : 'freeze'
    const confirmed = confirm(
      isFrozen 
        ? 'Are you sure you want to unfreeze your account? This will restore full access to your account.'
        : 'Are you sure you want to freeze your account? You can reactivate it at any time by unfreezing it.'
    )

    if (!confirmed) return

    try {
      setSaving(true)
      setMessage(null)

      // Toggle is_frozen status in profiles table
      const updateData: { is_frozen: boolean; frozen_at?: string | null } = {
        is_frozen: !isFrozen
      }

      // Set frozen_at timestamp when freezing, clear it when unfreezing
      if (!isFrozen) {
        updateData.frozen_at = new Date().toISOString()
      } else {
        updateData.frozen_at = null
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profileId)

      if (error) {
        console.error(`Error ${action}ing account:`, error)
        setMessage({ type: 'error', text: `Failed to ${action} account` })
        return
      }

      // Update local state
      setIsFrozen(!isFrozen)
      
      setMessage({ 
        type: 'success', 
        text: isFrozen 
          ? 'Account unfrozen successfully!' 
          : 'Account frozen successfully. You can unfreeze it anytime.' 
      })
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Error:', error)
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setSaving(false)
    }
  }

  // Save changes to database
  const handleSaveChanges = async () => {
    if (!partnerId) {
      setMessage({ type: 'error', text: 'Partner ID not found' })
      return
    }

    // Check if account is frozen
    if (isFrozen) {
      setMessage({ type: 'error', text: 'Cannot save changes while account is frozen. Please unfreeze your account first.' })
      return
    }

    try {
      setSaving(true)
      setMessage(null)

      const { error } = await supabase
        .from('partners')
        .update({
          company_name: settings.company_name,
          email: settings.email,
          phone: settings.phone,
          website: settings.website,
          description: settings.description,
          address: settings.address,
        })
        .eq('id', partnerId)

      if (error) {
        console.error('Error updating partner:', error)
        // Check if error is due to frozen account
        if (error.message?.includes('frozen')) {
          setMessage({ type: 'error', text: 'Cannot update data while account is frozen. Please unfreeze your account first.' })
        } else {
        setMessage({ type: 'error', text: 'Failed to save changes' })
        }
        return
      }

      // Update original settings to current settings after successful save
      setOriginalSettings(settings)
      setMessage({ type: 'success', text: 'Changes saved successfully!' })
      setIsEditing(false)
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Error:', error)
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setSaving(false)
    }
  }

  // Save account changes to database
  const handleSaveAccountChanges = async () => {
    if (!profileId) {
      setMessage({ type: 'error', text: 'Profile ID not found' })
      return
    }

    // Check if account is frozen
    if (isFrozen) {
      setMessage({ type: 'error', text: 'Cannot save changes while account is frozen. Please unfreeze your account first.' })
      return
    }

    try {
      setSaving(true)
      setMessage(null)

      const { error } = await supabase
        .from('profiles')
        .update({
          username: accountSettings.username,
          full_name: accountSettings.full_name,
          first_name: accountSettings.first_name,
          last_name: accountSettings.last_name,
          phone: accountSettings.phone,
          bio: accountSettings.bio,
          location: accountSettings.location,
        })
        .eq('id', profileId)

      if (error) {
        console.error('Error updating profile:', error)
        // Check if error is due to frozen account
        if (error.message?.includes('frozen')) {
          setMessage({ type: 'error', text: 'Cannot update data while account is frozen. Please unfreeze your account first.' })
        } else {
        setMessage({ type: 'error', text: 'Failed to save changes' })
        }
        return
      }

      // Update original account settings to current settings after successful save
      setOriginalAccountSettings(accountSettings)
      setMessage({ type: 'success', text: 'Account updated successfully!' })
      setIsEditing(false)
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Error:', error)
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setSaving(false)
    }
  }

  // Save notification changes to database
  const handleSaveNotificationChanges = async () => {
    if (!partnerId) {
      setMessage({ type: 'error', text: 'Partner ID not found' })
      return
    }

    // Check if account is frozen
    if (isFrozen) {
      setMessage({ type: 'error', text: 'Cannot save changes while account is frozen. Please unfreeze your account first.' })
      return
    }

    try {
      setSaving(true)
      setMessage(null)

      const { error } = await supabase
        .from('partners')
        .update({
          notifications_enabled: notificationSettings.notifications_enabled,
          email_notifications: notificationSettings.email_notifications,
          sms_notifications: notificationSettings.sms_notifications,
          court_notifications: notificationSettings.court_notifications,
          class_notifications: notificationSettings.class_notifications,
          event_notifications: notificationSettings.event_notifications,
          match_notifications: notificationSettings.match_notifications,
          venue_notifications: notificationSettings.venue_notifications,
        })
        .eq('id', partnerId)

      if (error) {
        console.error('Error updating notifications:', error)
        // Check if error is due to frozen account
        if (error.message?.includes('frozen')) {
          setMessage({ type: 'error', text: 'Cannot update data while account is frozen. Please unfreeze your account first.' })
        } else {
        setMessage({ type: 'error', text: 'Failed to save notification settings' })
        }
        return
      }

      // Update original notification settings to current settings after successful save
      setOriginalNotificationSettings(notificationSettings)
      setMessage({ type: 'success', text: 'Notification settings saved successfully!' })
      setIsEditing(false)
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Error:', error)
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'company', label: 'Company Info', icon: Building2 },
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Globe },
  ]

  const renderCompanyInfo = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#456882]" />
        </div>
      )
    }

    return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Company Information</h2>
        <motion.button 
            onClick={() => {
              if (isFrozen && !isEditing) {
                setMessage({ type: 'error', text: 'Cannot edit while account is frozen. Please unfreeze your account in the Security tab.' })
                return
              }
              if (isEditing) {
                // Revert to original settings
                setSettings(originalSettings)
                setIsEditing(false)
                setMessage(null)
              } else {
                setIsEditing(true)
              }
            }}
          className={`px-6 py-3 rounded-2xl flex items-center font-bold text-sm transition-all ${
            isEditing ? 'bg-neutral-600 text-white' : (isFrozen ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed' : 'bg-[#456882] hover:bg-[#3a5670] text-white')
          }`}
        >
          <Edit className="h-4 w-4 mr-2" />
          {isEditing ? 'CANCEL' : 'EDIT'}
        </motion.button>
      </div>

      {/* Frozen Account Warning */}
      {isFrozen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400"
        >
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">Your account is frozen. Unfreeze it in the Security tab to make changes.</span>
        </motion.div>
      )}

        {/* Success/Error Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-2 p-4 rounded-2xl ${
              message.type === 'success' 
                ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span className="font-medium">{message.text}</span>
          </motion.div>
        )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Company Name</label>
            <input
              type="text"
              value={settings.company_name}
                onChange={(e) => handleFieldChange('company_name', e.target.value)}
              disabled={!isEditing}
              className="w-full px-4 py-3 rounded-2xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-[#456882] focus:ring-1 focus:ring-[#456882] transition-all disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Email</label>
            <input
              type="email"
              value={settings.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
              disabled={!isEditing}
              className="w-full px-4 py-3 rounded-2xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-[#456882] focus:ring-1 focus:ring-[#456882] transition-all disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Phone</label>
            <input
              type="tel"
              value={settings.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
              disabled={!isEditing}
              className="w-full px-4 py-3 rounded-2xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-[#456882] focus:ring-1 focus:ring-[#456882] transition-all disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Website</label>
            <input
              type="url"
              value={settings.website}
                onChange={(e) => handleFieldChange('website', e.target.value)}
              disabled={!isEditing}
              className="w-full px-4 py-3 rounded-2xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-[#456882] focus:ring-1 focus:ring-[#456882] transition-all disabled:opacity-50"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">Address</label>
            <input
              type="text"
              value={settings.address}
                onChange={(e) => handleFieldChange('address', e.target.value)}
              disabled={!isEditing}
              className="w-full px-4 py-3 rounded-2xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-[#456882] focus:ring-1 focus:ring-[#456882] transition-all disabled:opacity-50"
            />
          </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Description</label>
              <textarea
                value={settings.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                disabled={!isEditing}
                rows={8}
                className="w-full px-4 py-3 rounded-2xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-[#456882] focus:ring-1 focus:ring-[#456882] transition-all disabled:opacity-50 resize-none"
              />
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end">
            <motion.button 
              onClick={handleSaveChanges}
              disabled={saving}
              className="text-white bg-[#456882] hover:bg-[#3a5670] disabled:bg-neutral-600 disabled:cursor-not-allowed px-8 py-3 rounded-2xl flex items-center font-bold text-sm transition-colors"
              whileHover={!saving ? { scale: 1.05 } : {}}
              whileTap={!saving ? { scale: 0.95 } : {}}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  SAVING...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  SAVE CHANGES
                </>
              )}
            </motion.button>
          </div>
        )}
      </div>
    )
  }

  const renderAccountInfo = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#456882]" />
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Account Settings</h2>
          <motion.button 
            onClick={() => {
              if (isFrozen && !isEditing) {
                setMessage({ type: 'error', text: 'Cannot edit while account is frozen. Please unfreeze your account in the Security tab.' })
                return
              }
              if (isEditing) {
                // Revert to original account settings
                setAccountSettings(originalAccountSettings)
                setIsEditing(false)
                setMessage(null)
              } else {
                setIsEditing(true)
              }
            }}
            className={`px-6 py-3 rounded-2xl flex items-center font-bold text-sm transition-all ${
              isEditing ? 'bg-neutral-600 text-white' : (isFrozen ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed' : 'bg-[#456882] hover:bg-[#3a5670] text-white')
            }`}
          >
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? 'CANCEL' : 'EDIT'}
          </motion.button>
        </div>

        {/* Frozen Account Warning */}
        {isFrozen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400"
          >
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Your account is frozen. Unfreeze it in the Security tab to make changes.</span>
          </motion.div>
        )}

        {/* Success/Error Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-2 p-4 rounded-2xl ${
              message.type === 'success' 
                ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span className="font-medium">{message.text}</span>
          </motion.div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Username</label>
              <input
                type="text"
                value={accountSettings.username}
                onChange={(e) => handleAccountFieldChange('username', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-3 rounded-2xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-[#456882] focus:ring-1 focus:ring-[#456882] transition-all disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Full Name</label>
              <input
                type="text"
                value={accountSettings.full_name}
                onChange={(e) => handleAccountFieldChange('full_name', e.target.value)}
              disabled={!isEditing}
              className="w-full px-4 py-3 rounded-2xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-[#456882] focus:ring-1 focus:ring-[#456882] transition-all disabled:opacity-50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">First Name</label>
              <input
                type="text"
                  value={accountSettings.first_name}
                  onChange={(e) => handleAccountFieldChange('first_name', e.target.value)}
                disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-2xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-[#456882] focus:ring-1 focus:ring-[#456882] transition-all disabled:opacity-50"
              />
            </div>
            <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Last Name</label>
              <input
                type="text"
                  value={accountSettings.last_name}
                  onChange={(e) => handleAccountFieldChange('last_name', e.target.value)}
                disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-2xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-[#456882] focus:ring-1 focus:ring-[#456882] transition-all disabled:opacity-50"
              />
            </div>
          </div>
          <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Phone</label>
              <input
                type="tel"
                value={accountSettings.phone}
                onChange={(e) => handleAccountFieldChange('phone', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-3 rounded-2xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-[#456882] focus:ring-1 focus:ring-[#456882] transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Location</label>
              <input
                type="text"
                value={accountSettings.location}
                onChange={(e) => handleAccountFieldChange('location', e.target.value)}
                disabled={!isEditing}
                placeholder="City, State, Country"
                className="w-full px-4 py-3 rounded-2xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-[#456882] focus:ring-1 focus:ring-[#456882] transition-all disabled:opacity-50"
              />
          </div>
          <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Bio</label>
            <textarea
                value={accountSettings.bio}
                onChange={(e) => handleAccountFieldChange('bio', e.target.value)}
              disabled={!isEditing}
                rows={8}
                placeholder="Tell us about yourself..."
              className="w-full px-4 py-3 rounded-2xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-[#456882] focus:ring-1 focus:ring-[#456882] transition-all disabled:opacity-50 resize-none"
            />
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="flex justify-end">
          <motion.button 
              onClick={handleSaveAccountChanges}
              disabled={saving}
              className="text-white bg-[#456882] hover:bg-[#3a5670] disabled:bg-neutral-600 disabled:cursor-not-allowed px-8 py-3 rounded-2xl flex items-center font-bold text-sm transition-colors"
              whileHover={!saving ? { scale: 1.05 } : {}}
              whileTap={!saving ? { scale: 0.95 } : {}}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  SAVING...
                </>
              ) : (
                <>
            <Save className="h-4 w-4 mr-2" />
            SAVE CHANGES
                </>
              )}
          </motion.button>
        </div>
      )}
    </div>
  )
  }

  const renderNotifications = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#456882]" />
        </div>
      )
    }

    // Toggle Switch Component
    const ToggleSwitch = ({ 
      enabled, 
      onChange, 
      disabled = false 
    }: { 
      enabled: boolean
      onChange: () => void
      disabled?: boolean
    }) => (
      <button
        onClick={onChange}
        disabled={disabled || !isEditing}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#456882] focus:ring-offset-2 focus:ring-offset-neutral-900 ${
          enabled ? 'bg-[#456882]' : 'bg-neutral-700'
        } ${(disabled || !isEditing) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    )

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Notification Settings</h2>
          <motion.button 
            onClick={() => {
              if (isFrozen && !isEditing) {
                setMessage({ type: 'error', text: 'Cannot edit while account is frozen. Please unfreeze your account in the Security tab.' })
                return
              }
              if (isEditing) {
                // Revert to original notification settings
                setNotificationSettings(originalNotificationSettings)
                setIsEditing(false)
                setMessage(null)
              } else {
                setIsEditing(true)
              }
            }}
            className={`px-6 py-3 rounded-2xl flex items-center font-bold text-sm transition-all ${
              isEditing ? 'bg-neutral-600 text-white' : (isFrozen ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed' : 'bg-[#456882] hover:bg-[#3a5670] text-white')
            }`}
          >
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? 'CANCEL' : 'EDIT'}
          </motion.button>
        </div>

        {/* Frozen Account Warning */}
        {isFrozen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400"
          >
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Your account is frozen. Unfreeze it in the Security tab to make changes.</span>
          </motion.div>
        )}

        {/* Success/Error Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-2 p-4 rounded-2xl ${
              message.type === 'success' 
                ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span className="font-medium">{message.text}</span>
          </motion.div>
        )}

        {/* General Notifications Section */}
        <div className="rounded-3xl p-6 bg-neutral-800/50 border border-neutral-700">
          <h3 className="text-lg font-semibold text-white mb-4">General Notifications</h3>
          <div className="space-y-4">
            {/* Master Toggle */}
            <div className="flex items-center justify-between py-3 border-b border-neutral-700">
              <div>
                <h4 className="text-white font-medium">All Notifications</h4>
                <p className="text-sm text-neutral-400">Master switch for all notifications</p>
              </div>
              <ToggleSwitch
                enabled={notificationSettings.notifications_enabled}
                onChange={() => handleNotificationToggle('notifications_enabled')}
              />
            </div>

            {/* Email Notifications */}
            <div className="flex items-center justify-between py-3 border-b border-neutral-700">
              <div>
                <h4 className="text-white font-medium">Email Notifications</h4>
                <p className="text-sm text-neutral-400">Receive notifications via email</p>
              </div>
              <ToggleSwitch
                enabled={notificationSettings.email_notifications}
                onChange={() => handleNotificationToggle('email_notifications')}
                disabled={!notificationSettings.notifications_enabled}
              />
            </div>

            {/* SMS Notifications */}
            <div className="flex items-center justify-between py-3">
              <div>
                <h4 className="text-white font-medium">SMS Notifications</h4>
                <p className="text-sm text-neutral-400">Receive notifications via SMS</p>
              </div>
              <ToggleSwitch
                enabled={notificationSettings.sms_notifications}
                onChange={() => handleNotificationToggle('sms_notifications')}
                disabled={!notificationSettings.notifications_enabled}
              />
            </div>
          </div>
        </div>

        {/* Category-Specific Notifications Section */}
        <div className="rounded-3xl p-6 bg-neutral-800/50 border border-neutral-700">
          <h3 className="text-lg font-semibold text-white mb-4">Notification Categories</h3>
          <div className="space-y-4">
            {/* Court Notifications */}
            <div className="flex items-center justify-between py-3 border-b border-neutral-700">
              <div>
                <h4 className="text-white font-medium">Court Notifications</h4>
                <p className="text-sm text-neutral-400">Updates about court bookings and availability</p>
              </div>
              <ToggleSwitch
                enabled={notificationSettings.court_notifications}
                onChange={() => handleNotificationToggle('court_notifications')}
                disabled={!notificationSettings.notifications_enabled}
              />
            </div>

            {/* Class Notifications */}
            <div className="flex items-center justify-between py-3 border-b border-neutral-700">
              <div>
                <h4 className="text-white font-medium">Class Notifications</h4>
                <p className="text-sm text-neutral-400">Updates about classes and registrations</p>
              </div>
              <ToggleSwitch
                enabled={notificationSettings.class_notifications}
                onChange={() => handleNotificationToggle('class_notifications')}
                disabled={!notificationSettings.notifications_enabled}
              />
            </div>

            {/* Event Notifications */}
            <div className="flex items-center justify-between py-3 border-b border-neutral-700">
              <div>
                <h4 className="text-white font-medium">Event Notifications</h4>
                <p className="text-sm text-neutral-400">Updates about events and tournaments</p>
              </div>
              <ToggleSwitch
                enabled={notificationSettings.event_notifications}
                onChange={() => handleNotificationToggle('event_notifications')}
                disabled={!notificationSettings.notifications_enabled}
              />
            </div>

            {/* Match Notifications */}
            <div className="flex items-center justify-between py-3 border-b border-neutral-700">
              <div>
                <h4 className="text-white font-medium">Match Notifications</h4>
                <p className="text-sm text-neutral-400">Updates about matches and results</p>
              </div>
              <ToggleSwitch
                enabled={notificationSettings.match_notifications}
                onChange={() => handleNotificationToggle('match_notifications')}
                disabled={!notificationSettings.notifications_enabled}
              />
            </div>

            {/* Venue Notifications */}
            <div className="flex items-center justify-between py-3">
              <div>
                <h4 className="text-white font-medium">Venue Notifications</h4>
                <p className="text-sm text-neutral-400">Updates about venue operations and status</p>
              </div>
              <ToggleSwitch
                enabled={notificationSettings.venue_notifications}
                onChange={() => handleNotificationToggle('venue_notifications')}
                disabled={!notificationSettings.notifications_enabled}
              />
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end">
            <motion.button 
              onClick={handleSaveNotificationChanges}
              disabled={saving}
              className="text-white bg-[#456882] hover:bg-[#3a5670] disabled:bg-neutral-600 disabled:cursor-not-allowed px-8 py-3 rounded-2xl flex items-center font-bold text-sm transition-colors"
              whileHover={!saving ? { scale: 1.05 } : {}}
              whileTap={!saving ? { scale: 0.95 } : {}}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  SAVING...
                </>
              ) : (
                <>
            <Save className="h-4 w-4 mr-2" />
            SAVE CHANGES
                </>
              )}
          </motion.button>
        </div>
      )}
    </div>
  )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'company':
        return renderCompanyInfo()
      case 'account':
        return renderAccountInfo()
      case 'notifications':
        return renderNotifications()
      case 'billing':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Billing & Payments</h2>
              <p className="text-neutral-400 mt-2">Manage your subscription, payment methods, and billing history</p>
            </div>

            <div className="rounded-3xl p-8 bg-neutral-800/50 border border-neutral-700">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="p-4 rounded-full bg-[#456882]/10">
                  <CreditCard className="h-12 w-12 text-[#456882]" />
                </div>
                
                <div className="max-w-md space-y-2">
                  <h3 className="text-xl font-bold text-white">Billing Management</h3>
                  <p className="text-neutral-400">
                    Access your billing dashboard to manage your subscription, update payment methods, view invoices, and download receipts.
                  </p>
                </div>

                <motion.button
                  onClick={async () => {
                    try {
                      const response = await fetch('/partner/api/billing/create-portal-session', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          partnerId: partnerId,
                        }),
                      })

                      const data = await response.json()

                      if (response.ok && data.url) {
                        window.location.href = data.url
                      } else {
                        setMessage({ type: 'error', text: data.error || 'Failed to open billing portal' })
                      }
                    } catch (error) {
                      console.error('Error opening billing portal:', error)
                      setMessage({ type: 'error', text: 'Failed to open billing portal' })
                    }
                  }}
                  className="px-8 py-4 rounded-2xl bg-[#456882] hover:bg-[#3a5670] text-white font-bold text-base transition-all flex items-center gap-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <CreditCard className="h-5 w-5" />
                  Manage Billing with Stripe
                </motion.button>

                <p className="text-sm text-neutral-500">
                  You'll be securely redirected to Stripe's billing portal
                </p>
              </div>
            </div>

            {/* Billing Info Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl p-6 bg-neutral-800/30 border border-neutral-700">
                <h4 className="text-sm font-medium text-neutral-400 mb-1">Current Plan</h4>
                <p className="text-2xl font-bold text-white">Professional</p>
              </div>
              <div className="rounded-2xl p-6 bg-neutral-800/30 border border-neutral-700">
                <h4 className="text-sm font-medium text-neutral-400 mb-1">Billing Cycle</h4>
                <p className="text-2xl font-bold text-white">Monthly</p>
              </div>
              <div className="rounded-2xl p-6 bg-neutral-800/30 border border-neutral-700">
                <h4 className="text-sm font-medium text-neutral-400 mb-1">Next Billing Date</h4>
                <p className="text-2xl font-bold text-white">Nov 15, 2024</p>
              </div>
            </div>
          </div>
        )
      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Security Settings</h2>
              <p className="text-neutral-400 mt-2">Manage your account security and preferences</p>
            </div>

            {/* Success/Error Message */}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-2 p-4 rounded-2xl ${
                  message.type === 'success' 
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <span className="font-medium">{message.text}</span>
              </motion.div>
            )}

            <div className="space-y-4">
              {/* Change Password */}
              <div className="rounded-3xl p-6 bg-neutral-800/50 border border-neutral-700 backdrop-blur-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-xl bg-[#456882]/10">
                        <Shield className="h-5 w-5 text-[#456882]" />
                      </div>
                      <h3 className="text-lg font-bold text-white">Change Password</h3>
                    </div>
                    <p className="text-neutral-400 text-sm">
                      Update your password to keep your account secure
                    </p>
                  </div>
                  {!showPasswordForm && (
                    <motion.button
                      onClick={() => setShowPasswordForm(true)}
                      className="px-6 py-3 rounded-2xl bg-[#456882] hover:bg-[#3a5670] text-white font-bold text-sm transition-all whitespace-nowrap"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Change Password
                    </motion.button>
                  )}
                </div>

                {showPasswordForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 mt-4 pt-4 border-t border-neutral-700"
                  >
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full px-4 py-3 rounded-2xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-[#456882] focus:ring-1 focus:ring-[#456882] transition-all"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-4 py-3 rounded-2xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-[#456882] focus:ring-1 focus:ring-[#456882] transition-all"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-4 py-3 rounded-2xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-[#456882] focus:ring-1 focus:ring-[#456882] transition-all"
                        placeholder="Confirm new password"
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <motion.button
                        onClick={() => {
                          setShowPasswordForm(false)
                          setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                          })
                          setMessage(null)
                        }}
                        className="px-6 py-3 rounded-2xl bg-neutral-600 hover:bg-neutral-700 text-white font-bold text-sm transition-all"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        onClick={handlePasswordChange}
                        disabled={saving}
                        className="px-6 py-3 rounded-2xl bg-[#456882] hover:bg-[#3a5670] disabled:bg-neutral-600 disabled:cursor-not-allowed text-white font-bold text-sm transition-all flex items-center gap-2"
                        whileHover={!saving ? { scale: 1.05 } : {}}
                        whileTap={!saving ? { scale: 0.95 } : {}}
                      >
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Update Password
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Freeze/Unfreeze Account */}
              <div className={`rounded-3xl p-6 backdrop-blur-sm ${
                isFrozen 
                  ? 'bg-blue-500/10 border border-blue-500/30' 
                  : 'bg-neutral-800/50 border border-neutral-700'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-xl ${
                        isFrozen ? 'bg-blue-500/10' : 'bg-orange-500/10'
                      }`}>
                        <AlertCircle className={`h-5 w-5 ${
                          isFrozen ? 'text-blue-500' : 'text-orange-500'
                        }`} />
                      </div>
                      <h3 className="text-lg font-bold text-white">
                        {isFrozen ? 'Unfreeze Account' : 'Freeze Account'}
                      </h3>
                    </div>
                    {isFrozen && (
                      <div className="mb-2 px-3 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
                        <p className="text-blue-300 text-sm font-medium">
                          ⚠️ Your account is currently frozen
                        </p>
                      </div>
                    )}
                    <p className="text-neutral-400 text-sm">
                      {isFrozen 
                        ? 'Restore full access to your account and all features.'
                        : 'Temporarily disable your account. You can reactivate it at any time.'
                      }
                    </p>
                  </div>
                  <motion.button
                    onClick={handleToggleFreezeAccount}
                    disabled={saving}
                    className={`px-6 py-3 rounded-2xl disabled:bg-neutral-600 disabled:cursor-not-allowed text-white font-bold text-sm transition-all whitespace-nowrap ${
                      isFrozen
                        ? 'bg-blue-500 hover:bg-blue-600'
                        : 'bg-orange-500 hover:bg-orange-600'
                    }`}
                    whileHover={!saving ? { scale: 1.05 } : {}}
                    whileTap={!saving ? { scale: 0.95 } : {}}
                  >
                    {saving 
                      ? (isFrozen ? 'Unfreezing...' : 'Freezing...') 
                      : (isFrozen ? 'Unfreeze Account' : 'Freeze Account')
                    }
                  </motion.button>
                </div>
              </div>

              {/* Delete Account */}
              <div className="rounded-3xl p-6 bg-neutral-800/50 border border-red-900/50 backdrop-blur-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-xl bg-red-500/10">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      </div>
                      <h3 className="text-lg font-bold text-white">Delete Account</h3>
                    </div>
                    <p className="text-neutral-400 text-sm">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                  </div>
                  <motion.button
                    onClick={() => {
                      // TODO: Implement account deletion functionality
                      if (confirm('Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.')) {
                        setMessage({ type: 'error', text: 'Account deletion functionality coming soon' })
                        setTimeout(() => setMessage(null), 3000)
                      }
                    }}
                    className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all whitespace-nowrap"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Delete Account
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        )
      case 'integrations':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Integrations</h2>
              <p className="text-neutral-400 mt-2">Connect with third-party services and APIs</p>
            </div>

            <div className="rounded-3xl p-8 bg-neutral-800/50 border border-neutral-700 backdrop-blur-sm">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="p-4 rounded-full bg-[#456882]/10">
                  <Globe className="h-12 w-12 text-[#456882]" />
                </div>
                
                <div className="max-w-md space-y-2">
                  <h3 className="text-xl font-bold text-white">Coming Soon</h3>
                  <p className="text-neutral-400">
                    Integration features are currently under development. Soon you'll be able to connect with popular third-party services and APIs to enhance your experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-neutral-400">Manage your account and business preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div 
            className="rounded-3xl p-6 bg-neutral-900/90 border border-neutral-800"
          >
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-2xl transition-all ${
                      isActive
                        ? 'text-white bg-[#456882]'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                    whileHover={!isActive ? { x: 4 } : {}}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`p-2 rounded-xl ${isActive ? 'bg-white/20' : 'bg-transparent'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="ml-3">{tab.label}</span>
                  </motion.button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div 
            className="rounded-3xl p-8 bg-neutral-900/90 border border-neutral-800"
          >
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}