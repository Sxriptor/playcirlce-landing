'use client'

import { useState } from 'react'
import { motion } from "framer-motion"
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

export default function PartnerEntryPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [fullName, setFullName] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showEmailVerification, setShowEmailVerification] = useState(false)
  const [signupEmail, setSignupEmail] = useState('')
  const [showDuplicateEmailOverlay, setShowDuplicateEmailOverlay] = useState(false)
  const [duplicateEmail, setDuplicateEmail] = useState('')

  // Application overlay states
  const [showApplicationOverlay, setShowApplicationOverlay] = useState(false)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState<'none' | 'pending' | 'under_review' | 'rejected'>('none')
  const [rejectionReason, setRejectionReason] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Application form fields
  const [appPhone, setAppPhone] = useState('')
  const [appWebsite, setAppWebsite] = useState('')
  const [appAddress, setAppAddress] = useState('')
  const [appCity, setAppCity] = useState('')
  const [appState, setAppState] = useState('')
  const [appPostalCode, setAppPostalCode] = useState('')
  const [appBusinessType, setAppBusinessType] = useState<'venue' | 'club' | 'academy' | 'other'>('venue')
  const [appDescription, setAppDescription] = useState('')
  const [appYearsInBusiness, setAppYearsInBusiness] = useState('')
  const [appNumberOfCourts, setAppNumberOfCourts] = useState('')
  const [appSportsOffered, setAppSportsOffered] = useState<string[]>([])
  const [appEstimatedMonthlyBookings, setAppEstimatedMonthlyBookings] = useState('')
  const [appCurrentBookingSystem, setAppCurrentBookingSystem] = useState('')
  const [appBusinessLicenseUrl, setAppBusinessLicenseUrl] = useState('')
  const [appInsuranceCertificateUrl, setAppInsuranceCertificateUrl] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      if (!authData.user) {
        setError('Failed to sign in. Please try again.')
        setLoading(false)
        return
      }

      // Store user ID and email for application form
      setCurrentUserId(authData.user.id)
      setEmail(email)

      // Check if user is a partner
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('partner, full_name')
        .eq('id', authData.user.id)
        .single()

      if (profileError) {
        setError('Failed to verify partner status: ' + profileError.message)
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      // If already a partner, allow access
      if (profileData && profileData.partner) {
        window.location.href = '/partner/dashboard'
        return
      }

      // Set full name from profile if available
      if (profileData?.full_name) {
        setFullName(profileData.full_name)
      }

      // Check if user has an application
      const { data: applicationData, error: applicationError } = await supabase
        .from('partner_applications')
        .select('status,rejection_reason,company_name')
        .eq('user_id', authData.user.id)
        .maybeSingle()

      if (applicationError) {
        console.error('Application query error:', applicationError)
        setError('Failed to check application status: ' + applicationError.message)
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      // If no application exists, show overlay to create one
      if (!applicationData) {
        setApplicationStatus('none')
        setShowApplicationOverlay(true)
        setLoading(false)
        return
      }

      // Set company name from application if available
      if (applicationData.company_name) {
        setCompanyName(applicationData.company_name)
      }

      // Check application status and show appropriate overlay
      if (applicationData.status === 'pending') {
        setApplicationStatus('pending')
        setShowApplicationOverlay(true)
        setLoading(false)
        return
      }

      if (applicationData.status === 'under_review') {
        setApplicationStatus('under_review')
        setShowApplicationOverlay(true)
        setLoading(false)
        return
      }

      if (applicationData.status === 'rejected') {
        setApplicationStatus('rejected')
        setRejectionReason(applicationData.rejection_reason || 'Not specified')
        setShowApplicationOverlay(true)
        setLoading(false)
        return
      }

      // If status is approved but partner column is still false, there might be an issue
      if (applicationData.status === 'approved') {
        setError('Your application was approved but there was an issue setting up your partner account. Please contact support.')
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      // Unknown status
      setError('Unknown application status. Please contact support.')
      await supabase.auth.signOut()
      setLoading(false)
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in')
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company_name: companyName,  // Presence of company_name indicates partner signup
          }
        }
      })

      if (authError) {
        // Check if the error is due to a duplicate email/user already registered
        if (authError.message.toLowerCase().includes('already') ||
            authError.message.toLowerCase().includes('exists') ||
            authError.message.toLowerCase().includes('registered')) {
          setDuplicateEmail(email)
          setShowDuplicateEmailOverlay(true)
          setLoading(false)
          return
        }

        setError(authError.message)
        setLoading(false)
        return
      }

      if (!authData.user) {
        setError('Failed to create account. Please try again.')
        setLoading(false)
        return
      }

      // Wait for the profile to be created by the auth trigger, with retries
      let profileExists = false
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const { data: profileCheck } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', authData.user.id)
          .single()
        
        if (profileCheck) {
          profileExists = true
          break
        }
      }

      if (!profileExists) {
        // Profile wasn't created by trigger, create it manually
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            username: email.split('@')[0],
            full_name: fullName,
            partner: false
          })

        if (insertError) {
          // Check if it's a duplicate key error (user already exists)
          if (insertError.code === '23505') {
            // Duplicate key - user already exists
            setDuplicateEmail(email)
            setShowDuplicateEmailOverlay(true)
            setLoading(false)
            return
          }

          // Check for foreign key violations or other duplicate-related errors
          if (insertError.message.toLowerCase().includes('duplicate') ||
              insertError.message.toLowerCase().includes('already exists') ||
              insertError.message.toLowerCase().includes('foreign key') ||
              insertError.code === '23503') {
            setDuplicateEmail(email)
            setShowDuplicateEmailOverlay(true)
            setLoading(false)
            return
          }

          setError('Failed to create profile: ' + insertError.message)
          setLoading(false)
          return
        }
      } else {
        // Update profile with full name
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: fullName,
          })
          .eq('id', authData.user.id)

        if (profileError) {
          console.warn('Failed to update profile, but continuing:', profileError.message)
        }
      }

      // Success - show email verification overlay
      setError('')
      setLoading(false)
      setSignupEmail(email)
      setShowEmailVerification(true)

    } catch (err: any) {
      // Check if the error indicates a duplicate account
      const errorMessage = err.message || ''
      if (errorMessage.toLowerCase().includes('duplicate') ||
          errorMessage.toLowerCase().includes('already exists') ||
          errorMessage.toLowerCase().includes('already registered') ||
          errorMessage.toLowerCase().includes('foreign key') ||
          errorMessage.toLowerCase().includes('user already')) {
        setDuplicateEmail(email)
        setShowDuplicateEmailOverlay(true)
        setLoading(false)
        return
      }

      setError(err.message || 'An error occurred during sign up')
      setLoading(false)
    }
  }

  const switchToSignUp = () => {
    setIsSignUp(true)
    setError('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setCompanyName('')
    setFullName('')
  }

  const switchToSignIn = (prefillEmail?: string) => {
    setIsSignUp(false)
    setError('')
    setEmail(prefillEmail || '')
    setPassword('')
    setConfirmPassword('')
    setCompanyName('')
    setFullName('')
  }

  const handleEmailVerificationClose = () => {
    setShowEmailVerification(false)
    switchToSignIn(signupEmail)
  }

  // Handle creating application row when user clicks "Fill Out Application"
  const handleCreateApplication = async () => {
    if (!currentUserId) return

    setLoading(true)
    try {
      // Create basic application row
      const { error: createError } = await supabase
        .from('partner_applications')
        .insert({
          user_id: currentUserId,
          email: email,
          company_name: companyName || fullName || 'To Be Provided',
          contact_person: fullName || 'To Be Provided',
          description: 'Application in progress',
          business_type: 'venue',
          status: 'pending'
        })

      if (createError) {
        console.error('Supabase error details:', createError)
        setError('Failed to create application: ' + createError.message + (createError.hint ? ' (' + createError.hint + ')' : ''))
        setLoading(false)
        return
      }

      // Show the application form
      setShowApplicationForm(true)
      setLoading(false)
    } catch (err: any) {
      console.error('Caught error:', err)
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  // Handle submitting the application form
  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUserId) return

    // Validate sports offered
    if (appSportsOffered.length === 0) {
      setError('Please select at least one sport')
      return
    }

    setLoading(true)
    try {
      // Normalize website URL
      let normalizedWebsite = appWebsite.trim()
      if (normalizedWebsite && !normalizedWebsite.startsWith('http://') && !normalizedWebsite.startsWith('https://')) {
        normalizedWebsite = 'https://' + normalizedWebsite
      }

      // Update the application with full details
      const { error: updateError } = await supabase
        .from('partner_applications')
        .update({
          company_name: companyName,
          phone: appPhone,
          website: normalizedWebsite,
          address: appAddress,
          city: appCity,
          state: appState,
          postal_code: appPostalCode,
          business_type: appBusinessType,
          description: appDescription,
          years_in_business: appYearsInBusiness ? parseInt(appYearsInBusiness) : null,
          number_of_courts: appNumberOfCourts ? parseInt(appNumberOfCourts) : null,
          sports_offered: appSportsOffered,
          estimated_monthly_bookings: appEstimatedMonthlyBookings ? parseInt(appEstimatedMonthlyBookings) : null,
          current_booking_system: appCurrentBookingSystem,
          business_license_url: appBusinessLicenseUrl || null,
          insurance_certificate_url: appInsuranceCertificateUrl || null,
        })
        .eq('user_id', currentUserId)

      if (updateError) {
        setError('Failed to update application: ' + updateError.message)
        setLoading(false)
        return
      }

      // Close overlay and sign out
      setShowApplicationForm(false)
      setShowApplicationOverlay(false)
      await supabase.auth.signOut()

      const message = applicationStatus === 'pending'
        ? 'Application updated successfully! Your changes have been saved.'
        : 'Application submitted successfully! We will review your application and notify you once it has been processed.'

      alert(message)
      setLoading(false)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  // Handle closing overlay (sign out user)
  const handleCloseOverlay = async () => {
    setShowApplicationOverlay(false)
    setShowApplicationForm(false)
    await supabase.auth.signOut()
  }

  // Handle editing existing application
  const handleEditApplication = async () => {
    if (!currentUserId) return

    setLoading(true)
    try {
      // Fetch the existing application data
      const { data: appData, error: fetchError } = await supabase
        .from('partner_applications')
        .select('*')
        .eq('user_id', currentUserId)
        .single()

      if (fetchError) {
        setError('Failed to load application data: ' + fetchError.message)
        setLoading(false)
        return
      }

      // Populate form fields with existing data
      if (appData) {
        setCompanyName(appData.company_name || '')
        setFullName(appData.contact_person || '')
        setAppPhone(appData.phone || '')
        setAppWebsite(appData.website || '')
        setAppAddress(appData.address || '')
        setAppCity(appData.city || '')
        setAppState(appData.state || '')
        setAppPostalCode(appData.postal_code || '')
        setAppBusinessType(appData.business_type || 'venue')
        setAppDescription(appData.description || '')
        setAppYearsInBusiness(appData.years_in_business?.toString() || '')
        setAppNumberOfCourts(appData.number_of_courts?.toString() || '')
        setAppSportsOffered(appData.sports_offered || [])
        setAppEstimatedMonthlyBookings(appData.estimated_monthly_bookings?.toString() || '')
        setAppCurrentBookingSystem(appData.current_booking_system || '')
        setAppBusinessLicenseUrl(appData.business_license_url || '')
        setAppInsuranceCertificateUrl(appData.insurance_certificate_url || '')
      }

      // Show the form
      setShowApplicationForm(true)
      setLoading(false)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <>
      {/* Duplicate Email Overlay */}
      {showDuplicateEmailOverlay && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            className="bg-slate-800 rounded-lg p-8 max-w-md w-full text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Warning Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-amber-600/20 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-10 h-10 text-amber-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-4">
              Account Already Exists
            </h2>

            <p className="text-slate-300 text-lg mb-2">
              An account with this email already exists:
            </p>

            <p className="text-amber-400 font-medium text-lg mb-6">
              {duplicateEmail}
            </p>

            <p className="text-slate-400 text-sm mb-8">
              Please sign in with your existing account or use a different email address to create a new account.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDuplicateEmailOverlay(false)
                  switchToSignIn(duplicateEmail)
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setShowDuplicateEmailOverlay(false)
                  setEmail('')
                }}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 rounded-lg transition-colors"
              >
                Try Different Email
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Email Verification Overlay */}
      {showEmailVerification && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            className="bg-slate-800 rounded-lg p-8 max-w-md w-full text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Email Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-10 h-10 text-blue-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-4">
              Verify Your Email
            </h2>

            <p className="text-slate-300 text-lg mb-2">
              We've sent a verification email to:
            </p>

            <p className="text-blue-400 font-medium text-lg mb-6">
              {signupEmail}
            </p>

            <p className="text-slate-400 text-sm mb-8">
              Please check your inbox and click the verification link to activate your account.
              Once verified, you can sign in and submit your partner application.
            </p>

            <button
              onClick={handleEmailVerificationClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Continue to Sign In
            </button>
          </motion.div>
        </div>
      )}

      {/* Application Status Overlay */}
      {showApplicationOverlay && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            className="bg-slate-800 rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {!showApplicationForm ? (
              // Status Display
              <div className="text-center space-y-6">
                <h2 className="text-3xl font-bold text-white">
                  {applicationStatus === 'none' && 'Partner Application Required'}
                  {applicationStatus === 'pending' && 'Application Pending'}
                  {applicationStatus === 'under_review' && 'Application Under Review'}
                  {applicationStatus === 'rejected' && 'Application Rejected'}
                </h2>

                <p className="text-slate-300 text-lg">
                  {applicationStatus === 'none' && 'To access the partner dashboard, you need to submit a partner application. Click the button below to fill out the application form.'}
                  {applicationStatus === 'pending' && 'Your partner application is currently pending review. Our team will review your submission and get back to you soon.'}
                  {applicationStatus === 'under_review' && 'Your application is currently being reviewed by our team. We will notify you of our decision soon.'}
                  {applicationStatus === 'rejected' && `Your application was rejected. Reason: ${rejectionReason}. Please contact support for more information.`}
                </p>

                <div className="flex gap-4 justify-center">
                  {applicationStatus === 'none' && (
                    <button
                      onClick={handleCreateApplication}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Creating...' : 'Fill Out Application'}
                    </button>
                  )}
                  {applicationStatus === 'pending' && (
                    <button
                      onClick={handleEditApplication}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Loading...' : 'Edit Application'}
                    </button>
                  )}
                  <button
                    onClick={handleCloseOverlay}
                    className="bg-slate-700 hover:bg-slate-600 text-white font-medium px-8 py-3 rounded-lg transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              // Application Form
              <form onSubmit={handleSubmitApplication} className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">Partner Application Form</h2>

                {error && (
                  <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">Company Name*</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">Contact Person*</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">Phone*</label>
                    <input
                      type="tel"
                      value={appPhone}
                      onChange={(e) => setAppPhone(e.target.value)}
                      required
                      placeholder="(555) 123-4567"
                      className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">Website*</label>
                    <input
                      type="text"
                      value={appWebsite}
                      onChange={(e) => setAppWebsite(e.target.value)}
                      required
                      placeholder="example.com or www.example.com"
                      className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">Business Type*</label>
                    <select
                      value={appBusinessType}
                      onChange={(e) => setAppBusinessType(e.target.value as any)}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white"
                    >
                      <option value="venue">Venue</option>
                      <option value="club">Club</option>
                      <option value="academy">Academy</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">Years in Business*</label>
                    <input
                      type="number"
                      value={appYearsInBusiness}
                      onChange={(e) => setAppYearsInBusiness(e.target.value)}
                      required
                      min="0"
                      placeholder="5"
                      className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-white">Number of Courts*</label>
                    <input
                      type="number"
                      value={appNumberOfCourts}
                      onChange={(e) => setAppNumberOfCourts(e.target.value)}
                      required
                      min="1"
                      className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-white">Address*</label>
                    <input
                      type="text"
                      value={appAddress}
                      onChange={(e) => setAppAddress(e.target.value)}
                      required
                      placeholder="123 Main Street"
                      className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">City*</label>
                    <input
                      type="text"
                      value={appCity}
                      onChange={(e) => setAppCity(e.target.value)}
                      required
                      placeholder="New York"
                      className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">State*</label>
                    <select
                      value={appState}
                      onChange={(e) => setAppState(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white"
                    >
                      <option value="">Select State</option>
                      <option value="AL">AL</option>
                      <option value="AK">AK</option>
                      <option value="AZ">AZ</option>
                      <option value="AR">AR</option>
                      <option value="CA">CA</option>
                      <option value="CO">CO</option>
                      <option value="CT">CT</option>
                      <option value="DE">DE</option>
                      <option value="FL">FL</option>
                      <option value="GA">GA</option>
                      <option value="HI">HI</option>
                      <option value="ID">ID</option>
                      <option value="IL">IL</option>
                      <option value="IN">IN</option>
                      <option value="IA">IA</option>
                      <option value="KS">KS</option>
                      <option value="KY">KY</option>
                      <option value="LA">LA</option>
                      <option value="ME">ME</option>
                      <option value="MD">MD</option>
                      <option value="MA">MA</option>
                      <option value="MI">MI</option>
                      <option value="MN">MN</option>
                      <option value="MS">MS</option>
                      <option value="MO">MO</option>
                      <option value="MT">MT</option>
                      <option value="NE">NE</option>
                      <option value="NV">NV</option>
                      <option value="NH">NH</option>
                      <option value="NJ">NJ</option>
                      <option value="NM">NM</option>
                      <option value="NY">NY</option>
                      <option value="NC">NC</option>
                      <option value="ND">ND</option>
                      <option value="OH">OH</option>
                      <option value="OK">OK</option>
                      <option value="OR">OR</option>
                      <option value="PA">PA</option>
                      <option value="RI">RI</option>
                      <option value="SC">SC</option>
                      <option value="SD">SD</option>
                      <option value="TN">TN</option>
                      <option value="TX">TX</option>
                      <option value="UT">UT</option>
                      <option value="VT">VT</option>
                      <option value="VA">VA</option>
                      <option value="WA">WA</option>
                      <option value="WV">WV</option>
                      <option value="WI">WI</option>
                      <option value="WY">WY</option>
                      <option value="DC">DC</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">Postal Code*</label>
                    <input
                      type="text"
                      value={appPostalCode}
                      onChange={(e) => setAppPostalCode(e.target.value)}
                      required
                      placeholder="10001"
                      className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-white">Sports Offered*</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['Tennis', 'Pickleball', 'Padel', 'Squash', 'Racquetball', 'Badminton', 'Table Tennis', 'Other'].map((sport) => (
                        <label key={sport} className="flex items-center space-x-2 text-white cursor-pointer">
                          <input
                            type="checkbox"
                            checked={appSportsOffered.includes(sport)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAppSportsOffered([...appSportsOffered, sport])
                              } else {
                                setAppSportsOffered(appSportsOffered.filter(s => s !== sport))
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-600 rounded bg-slate-700"
                          />
                          <span className="text-sm">{sport}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">Estimated Monthly Bookings*</label>
                    <input
                      type="number"
                      value={appEstimatedMonthlyBookings}
                      onChange={(e) => setAppEstimatedMonthlyBookings(e.target.value)}
                      required
                      min="0"
                      className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white"
                      placeholder="150"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">Current Booking System*</label>
                    <input
                      type="text"
                      value={appCurrentBookingSystem}
                      onChange={(e) => setAppCurrentBookingSystem(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white"
                      placeholder="CourtReserve, Manual, None"
                      list="booking-systems"
                    />
                    <datalist id="booking-systems">
                      <option value="CourtReserve" />
                      <option value="PlayYourCourt" />
                      <option value="Tennis Bookings" />
                      <option value="ClubSpark" />
                      <option value="Manual/Phone" />
                      <option value="None" />
                    </datalist>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-white">Business License URL</label>
                    <input
                      type="url"
                      value={appBusinessLicenseUrl}
                      onChange={(e) => setAppBusinessLicenseUrl(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white"
                      placeholder="https://example.com/business-license.pdf"
                    />
                    <p className="text-xs text-slate-400">Upload your business license to a file hosting service and paste the URL here</p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-white">Insurance Certificate URL</label>
                    <input
                      type="url"
                      value={appInsuranceCertificateUrl}
                      onChange={(e) => setAppInsuranceCertificateUrl(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white"
                      placeholder="https://example.com/insurance-certificate.pdf"
                    />
                    <p className="text-xs text-slate-400">Upload your insurance certificate to a file hosting service and paste the URL here</p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-white">Description*</label>
                    <textarea
                      value={appDescription}
                      onChange={(e) => setAppDescription(e.target.value)}
                      required
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white"
                      placeholder="Tell us about your business..."
                    />
                  </div>
                </div>

                <div className="flex gap-4 justify-end">
                  <button
                    type="button"
                    onClick={handleCloseOverlay}
                    className="bg-slate-700 hover:bg-slate-600 text-white font-medium px-6 py-3 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}

    <div className="min-h-screen flex">
      {/* Left side - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Image and Overlay Container - locked together */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 1.2, 
            ease: "easeOut",
            opacity: { duration: 0.8 },
            scale: { duration: 1.2 }
          }}
        >
          {/* Background Image */}
          <Image
            src="/soccer-field-aerial-view-night.jpg"
            alt="Soccer field aerial view"
            fill
            className="object-cover"
            priority
          />
          
          {/* Gradient Overlay - locked to image */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-[#456882]/90 to-[#1e3a8a]/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ 
              duration: 1,
              delay: 0.3,
              ease: "easeOut"
            }}
          />
        </motion.div>
        
        {/* Centered Content */}
        <div className="relative z-20 flex items-center justify-center w-full h-full p-12">
          <motion.div
            className="text-center text-white space-y-8 max-w-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {/* Logo */}
            <motion.div
              className="flex justify-center mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: 1
              }}
              transition={{
                opacity: { duration: 0.8, delay: 0.6 },
                scale: { duration: 0.8, delay: 0.6 }
              }}
            >
              <Image
                src="/logo.png"
                alt="PlayCircle Logo"
                width={120}
                height={120}
                className="drop-shadow-2xl"
              />
            </motion.div>
            
            {/* Main Title with Advanced Styling */}
            <motion.div className="space-y-4">
              <h1 className="text-6xl lg:text-7xl font-black leading-none tracking-tight">
                <span className="block bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent drop-shadow-lg">
                  PLAYCIRCLE
                </span>
                <span className="block text-4xl lg:text-5xl font-light mt-2 text-white/90 tracking-wider">
                  PARTNER DASHBOARD
                </span>
              </h1>
            </motion.div>
            
            {/* Subtitle with Enhanced Typography */}
            <motion.div className="space-y-3">
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/50 to-transparent mx-auto"></div>
              <p className="text-xl lg:text-2xl font-light text-white/90 leading-relaxed mx-auto max-w-lg">
                Manage your venues, events, and connect with players in your community
              </p>
              <div className="flex items-center justify-center space-x-2 text-white/70">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                <span className="text-sm font-medium tracking-widest uppercase">
                  Professional Dashboard
                </span>
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-neutral-900 p-8 relative">
        {/* Back Arrow Button */}
        <motion.button
          onClick={() => window.location.href = '/partners'}
          className="absolute top-8 left-8 text-neutral-400 hover:text-white transition-colors flex items-center gap-2 group"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          whileHover={{ x: -4 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          <span className="text-sm font-medium">Back</span>
        </motion.button>

        <div className="w-full max-w-md space-y-8">
          {/* Welcome Message */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.h2 className="text-3xl font-bold text-white mb-2">
              {isSignUp ? 'Create Your Account' : 'Nice to see you!'}
            </motion.h2>
            <motion.p className="text-neutral-400">
              {isSignUp ? 'Join PlayCircle as a partner' : 'Enter your email and password to sign in'}
            </motion.p>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={isSignUp ? handleSignUp : handleSignIn}
            className="space-y-6"
            key={isSignUp ? 'signup' : 'signin'}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            {error && (
              <motion.div
                className="p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.div>
            )}

            {isSignUp && (
              <>
                <motion.div className="space-y-2">
                  <label htmlFor="fullName" className="block text-sm font-medium text-white">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-400 focus:border-[#456882] focus:ring-1 focus:ring-[#456882] transition-colors disabled:opacity-50"
                  />
                </motion.div>

                <motion.div className="space-y-2">
                  <label htmlFor="companyName" className="block text-sm font-medium text-white">
                    Company Name
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Your company name"
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-400 focus:border-[#456882] focus:ring-1 focus:ring-[#456882] transition-colors disabled:opacity-50"
                  />
                </motion.div>
              </>
            )}

            <motion.div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-white">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-400 focus:border-[#456882] focus:ring-1 focus:ring-[#456882] transition-colors disabled:opacity-50"
              />
            </motion.div>

            <motion.div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-white">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-400 focus:border-[#456882] focus:ring-1 focus:ring-[#456882] transition-colors disabled:opacity-50"
              />
            </motion.div>

            {isSignUp && (
              <motion.div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-400 focus:border-[#456882] focus:ring-1 focus:ring-[#456882] transition-colors disabled:opacity-50"
                />
              </motion.div>
            )}

            {!isSignUp && (
              <motion.div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-[#456882] focus:ring-[#456882] border-neutral-700 rounded bg-neutral-800"
                />
                <label htmlFor="remember-me" className="ml-2 text-sm text-neutral-300">
                  Remember me
                </label>
              </motion.div>
            )}

            <motion.button
              type="submit"
              className="w-full bg-[#456882] hover:bg-[#3a5670] text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'
              )}
            </motion.button>
          </motion.form>

          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <motion.p className="text-sm text-neutral-400">
              {isSignUp ? (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => switchToSignIn()}
                    className="font-medium text-[#456882] hover:text-[#5a7a99] transition-colors"
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <button
                    onClick={switchToSignUp}
                    className="font-medium text-[#456882] hover:text-[#5a7a99] transition-colors"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </motion.p>
          </motion.div>

          {/* Footer */}
          <motion.div 
            className="text-center text-xs text-neutral-500 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <motion.p>
              © 2025 • Made with ❤️ by PlayCircle • Digitxl Link
            </motion.p>
          </motion.div>

        </div>
      </div>
    </div>
    </>
  )
}