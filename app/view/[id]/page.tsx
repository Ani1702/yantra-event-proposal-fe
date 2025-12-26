'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UserBar from '@/components/UserBar';
import CustomSelect from '@/components/CustomSelect';
import CustomDatePicker from '@/components/CustomDatePicker';
import CustomTimePicker from '@/components/CustomTimePicker';
import { supabase, signOutCompletely, getValidAccessToken } from '@/lib/supabase';
import { CLUB_NAMES, ALL_COLLAB_CLUBS, VENUE_OPTIONS, EVENT_TYPE_OPTIONS, WORKSHOP_TYPE_OPTIONS } from '@/lib/constants';

export default function EditProposal() {
  const router = useRouter();
  const params = useParams();
  const proposalId = params?.id as string;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  // Map club names to the format required by CustomSelect
  const clubOptions = CLUB_NAMES.map((club) => ({
    value: club,
    label: club,
  }));

  const collabClubOptions = ALL_COLLAB_CLUBS.map((club) => ({
    value: club,
    label: club,
  }));

  const [formData, setFormData] = useState({
    cc_name: '',
    type: '',
    event_title: '',
    expected_capacity: '',
    duration: '',
    event_start_date: '',
    event_start_time: '',
    event_end_date: '',
    event_end_time: '',
    expected_sponsorship: '',
    expected_prize_money: '',
    is_overnight: false,
    poc_name: '',
    poc_registration_number: '',
    poc_contact: '',
    collaborating_cc: '',
    preferred_venue: '',
    description: '',
    competition_structure: '',
    competition_rules: '',
    judgement_criteria: '',
    faqs: '',
    team_size: '',
    workshop_outcome: '',
    workshop_type: '',
    speaker_name: '',
    eligibility_first_year: false,
    eligibility_second_year: false,
    eligibility_third_year: false,
    eligibility_fourth_year: false,
  });

  const [status, setStatus] = useState<{
    type: 'success' | 'error' | '';
    message: string;
  }>({ type: '', message: '' });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [originalData, setOriginalData] = useState(formData);

  // Scroll to top when status message changes
  useEffect(() => {
    if (status.message) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [status.message]);

  useEffect(() => {
    const checkAuthAndLoadProposal = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        router.push('/');
        return;
      }

      const email = session.user.email || '';
      if (!email.endsWith('@vitstudent.ac.in') && !email.endsWith('@vit.ac.in')) {
        await signOutCompletely();
        router.push('/');
        return;
      }

      setUser(session.user);

      // Load proposal data
      try {
        // Get a valid, refreshed access token
        const accessToken = await getValidAccessToken();
        
        if (!accessToken) {
          setStatus({
            type: 'error',
            message: 'Session expired. Please sign in again.',
          });
          setTimeout(async () => {
            await signOutCompletely();
            router.push('/');
          }, 2000);
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/proposal/${proposalId}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to load proposal');
        }

        const responseData = await response.json();
        const proposal = responseData.data || responseData;
        
        // Check if this proposal belongs to the current user
        if (proposal.submitted_by !== session.user.email) {
          setStatus({
            type: 'error',
            message: 'You do not have permission to edit this proposal',
          });
          setTimeout(() => router.push('/view'), 2000);
          return;
        }

        // Convert the proposal data to form format
        const loadedData = {
          cc_name: proposal.cc_name || '',
          type: proposal.type || '',
          event_title: proposal.event_title || '',
          expected_capacity: proposal.expected_capacity?.toString() || '',
          duration: proposal.duration?.toString() || '',
          event_start_date: proposal.event_start_date || '',
          event_start_time: proposal.event_start_time || '',
          event_end_date: proposal.event_end_date || '',
          event_end_time: proposal.event_end_time || '',
          expected_sponsorship: proposal.expected_sponsorship?.toString() || '',
          expected_prize_money: proposal.expected_prize_money?.toString() || '',
          is_overnight: proposal.is_overnight || false,
          poc_name: proposal.poc_name || '',
          poc_registration_number: proposal.poc_registration_number || '',
          poc_contact: proposal.poc_contact || '',
          collaborating_cc: proposal.collaborating_cc || '',
          preferred_venue: proposal.preferred_venue || '',
          description: proposal.description || '',
          competition_structure: proposal.competition_structure || '',
          competition_rules: proposal.competition_rules || '',
          judgement_criteria: proposal.judgement_criteria || '',
          faqs: proposal.faqs || '',
          team_size: proposal.team_size || '',
          workshop_outcome: proposal.workshop_outcome || '',
          workshop_type: proposal.workshop_type || '',
          speaker_name: proposal.speaker_name || '',
          eligibility_first_year: proposal.eligibility_first_year || false,
          eligibility_second_year: proposal.eligibility_second_year || false,
          eligibility_third_year: proposal.eligibility_third_year || false,
          eligibility_fourth_year: proposal.eligibility_fourth_year || false,
        };

        setFormData(loadedData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading proposal:', error);
        setStatus({
          type: 'error',
          message: 'Failed to load proposal data',
        });
        setLoading(false);
      }
    };

    if (proposalId) {
      checkAuthAndLoadProposal();
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [router, proposalId]);

  const handleSignOut = async () => {
    await signOutCompletely();
    router.push('/');
  };

  const toggleEditMode = () => {
    if (isEditMode) {
      // Cancel edit - restore original data
      if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
        setFormData(originalData);
        setIsEditMode(false);
        setErrors({});
        setStatus({ type: '', message: '' });
      }
    } else {
      // Enable edit mode
      setIsEditMode(true);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!isEditMode) return;
    
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (!isEditMode) return;
    
    setFormData({
      ...formData,
      [name]: value,
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditMode) return;

    // Validate all fields (same validation as create form)
    const newErrors: { [key: string]: string } = {};

    if (!formData.cc_name) newErrors.cc_name = 'Please select a club/chapter';
    if (!formData.type) newErrors.type = 'Please select an event type';
    if (!formData.event_title) newErrors.event_title = 'Please enter an event title';
    if (!formData.expected_capacity) newErrors.expected_capacity = 'Please enter expected capacity';
    if (!formData.duration) {
      newErrors.duration = 'Please enter duration';
    } else {
      const durationNum = parseInt(formData.duration);
      if (isNaN(durationNum) || !Number.isInteger(durationNum) || durationNum <= 0) {
        newErrors.duration = 'Duration must be a valid positive integer';
      }
    }
    if (!formData.event_start_date) newErrors.event_start_date = 'Please enter event start date';
    if (!formData.event_start_time) newErrors.event_start_time = 'Please enter event start time';
    if (!formData.event_end_date) newErrors.event_end_date = 'Please enter event end date';
    if (!formData.event_end_time) newErrors.event_end_time = 'Please enter event end time';
    if (!formData.expected_sponsorship) newErrors.expected_sponsorship = 'Please enter expected sponsorship amount';
    if (!formData.poc_name) newErrors.poc_name = 'Please enter POC name';
    if (!formData.poc_registration_number) newErrors.poc_registration_number = 'Please enter POC registration number';
    if (!formData.poc_contact) {
      newErrors.poc_contact = 'Please enter POC contact number';
    } else if (!/^\d{10}$/.test(formData.poc_contact)) {
      newErrors.poc_contact = 'Contact number must be 10 digits';
    }
    if (!formData.preferred_venue) newErrors.preferred_venue = 'Please select a preferred venue';

    // Conditional validation based on event type
    if (formData.type === 'tech_competition' || formData.type === 'hackathon') {
      if (!formData.description) newErrors.description = 'Please enter description';
      if (!formData.competition_structure) newErrors.competition_structure = 'Please enter structure';
      if (!formData.competition_rules) newErrors.competition_rules = 'Please enter rules';
      if (!formData.judgement_criteria) newErrors.judgement_criteria = 'Please enter judgement criteria';
      if (!formData.faqs) newErrors.faqs = 'Please enter FAQs';
      if (!formData.team_size) newErrors.team_size = 'Please enter team size';
    }

    if (formData.type === 'workshop') {
      if (!formData.description) newErrors.description = 'Please enter description';
      if (!formData.workshop_outcome) newErrors.workshop_outcome = 'Please enter expected outcome';
      if (!formData.workshop_type) newErrors.workshop_type = 'Please select workshop type';
    }

    if (formData.type === 'tech_talk') {
      if (!formData.description) newErrors.description = 'Please enter description';
      if (!formData.speaker_name) newErrors.speaker_name = 'Please enter speaker name';
    }

    if (!formData.eligibility_first_year && !formData.eligibility_second_year && 
        !formData.eligibility_third_year && !formData.eligibility_fourth_year) {
      newErrors.eligibility = 'Please select at least one eligibility year';
    }

    if (formData.event_start_date && formData.event_start_time && 
        formData.event_end_date && formData.event_end_time) {
      const startDateTime = new Date(`${formData.event_start_date}T${formData.event_start_time}`);
      const endDateTime = new Date(`${formData.event_end_date}T${formData.event_end_time}`);
      
      if (startDateTime >= endDateTime) {
        newErrors.event_end_date = 'Event end date/time must be after start date/time';
        newErrors.event_end_time = 'Event end date/time must be after start date/time';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setStatus({
        type: 'error',
        message: 'Please fill in all the required fields correctly.',
      });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });
    setErrors({});

    try {
      // Get a valid, refreshed access token
      const accessToken = await getValidAccessToken();
      
      if (!accessToken) {
        setStatus({
          type: 'error',
          message: 'Session expired. Please sign in again.',
        });
        setTimeout(async () => {
          await signOutCompletely();
          router.push('/');
        }, 2000);
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/proposal/${proposalId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            ...formData,
            expected_capacity: parseInt(formData.expected_capacity),
            duration: parseInt(formData.duration),
            expected_sponsorship: parseInt(formData.expected_sponsorship),
            expected_prize_money: formData.expected_prize_money ? parseInt(formData.expected_prize_money) : null,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: 'success',
          message: 'Proposal updated successfully!',
        });
        setIsEditMode(false);
        setOriginalData(formData);
        
        // Redirect to view page after 2 seconds
        setTimeout(() => {
          router.push('/view');
        }, 2000);
      } else {
        setStatus({
          type: 'error',
          message: data.error || 'Failed to update proposal. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error updating proposal:', error);
      setStatus({
        type: 'error',
        message: 'An error occurred. Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-black"></div>
          <p className="mt-4 text-lg font-bold uppercase tracking-wider">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      {user && <UserBar email={user.email || ''} onSignOut={handleSignOut} />}

      <main className="flex-1 px-4 sm:px-6 md:px-8 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header with Edit Toggle Button */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-wider">
              {isEditMode ? 'Edit Proposal' : 'View Proposal'}
            </h1>
            
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => router.push('/view')}
                className="px-3 sm:px-4 py-2 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors font-semibold uppercase tracking-wide text-xs sm:text-sm whitespace-nowrap"
              >
                ← Back
              </button>
              
              <button
                type="button"
                onClick={toggleEditMode}
                className={`px-3 sm:px-4 py-2 border-2 transition-colors font-semibold uppercase tracking-wide text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                  isEditMode
                    ? 'border-red-600 bg-red-600 text-white hover:bg-white hover:text-red-600'
                    : 'border-black bg-black text-white hover:bg-white hover:text-black'
                }`}
              >
                {isEditMode ? (
                  <>
                    <span className="text-base sm:text-lg">✕</span>
                    <span className="hidden xs:inline">Cancel</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span className="hidden xs:inline">Edit</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Status Message */}
          {status.message && (
            <div
              className={`mb-6 p-3 sm:p-4 border-2 ${
                status.type === 'success'
                  ? 'bg-green-50 border-green-600 text-green-800'
                  : 'bg-red-50 border-red-600 text-red-800'
              }`}
            >
              <p className="text-xs sm:text-sm font-medium">{status.message}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="bg-white border-2 border-black p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wide mb-4 border-b-2 border-black pb-2">
                Basic Information
              </h2>

              <div className="space-y-4">
                {/* Club/Chapter Name */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
                    Club/Chapter Name <span className="text-red-600">*</span>
                  </label>
                  <CustomSelect
                    id="cc_name"
                    options={clubOptions}
                    value={formData.cc_name}
                    onChange={(value) => handleSelectChange('cc_name', value)}
                    placeholder="Select Club/Chapter"
                    disabled={!isEditMode}
                  />
                  {errors.cc_name && (
                    <p className="mt-1 text-xs text-red-600">{errors.cc_name}</p>
                  )}
                </div>

                {/* Event Type */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
                    Event Type <span className="text-red-600">*</span>
                  </label>
                  <CustomSelect
                    id="type"
                    options={EVENT_TYPE_OPTIONS}
                    value={formData.type}
                    onChange={(value) => handleSelectChange('type', value)}
                    placeholder="Select Event Type"
                    disabled={!isEditMode}
                  />
                  {errors.type && (
                    <p className="mt-1 text-xs text-red-600">{errors.type}</p>
                  )}
                </div>

                {/* Event Title */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
                    Event Title <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="event_title"
                    value={formData.event_title}
                    onChange={handleChange}
                    disabled={!isEditMode}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-black text-xs sm:text-sm ${
                      isEditMode ? 'bg-white' : 'bg-gray-100'
                    }`}
                    placeholder="Enter event title"
                  />
                  {errors.event_title && (
                    <p className="mt-1 text-xs text-red-600">{errors.event_title}</p>
                  )}
                </div>

                {/* Expected Capacity and Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
                      Expected Capacity <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      name="expected_capacity"
                      value={formData.expected_capacity}
                      onChange={handleChange}
                      disabled={!isEditMode}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-black text-xs sm:text-sm ${
                        isEditMode ? 'bg-white' : 'bg-gray-100'
                      }`}
                      placeholder="Enter capacity"
                    />
                    {errors.expected_capacity && (
                      <p className="mt-1 text-xs text-red-600">{errors.expected_capacity}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
                      Duration (hours) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      disabled={!isEditMode}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-black text-xs sm:text-sm ${
                        isEditMode ? 'bg-white' : 'bg-gray-100'
                      }`}
                      placeholder="Enter duration"
                    />
                    {errors.duration && (
                      <p className="mt-1 text-xs text-red-600">{errors.duration}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Event Schedule Section */}
            <div className="bg-white border-2 border-black p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wide mb-4 border-b-2 border-black pb-2">
                Event Schedule
              </h2>

              <div className="space-y-4">
                {/* Start Date and Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
                      Start Date <span className="text-red-600">*</span>
                    </label>
                    <CustomDatePicker
                      id="event_start_date"
                      placeholder="Select start date"
                      value={formData.event_start_date}
                      onChange={(value) => handleSelectChange('event_start_date', value)}
                      disabled={!isEditMode}
                    />
                    {errors.event_start_date && (
                      <p className="mt-1 text-xs text-red-600">{errors.event_start_date}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
                      Start Time <span className="text-red-600">*</span>
                    </label>
                    <CustomTimePicker
                      id="event_start_time"
                      placeholder="Select start time"
                      value={formData.event_start_time}
                      onChange={(value) => handleSelectChange('event_start_time', value)}
                      disabled={!isEditMode}
                    />
                    {errors.event_start_time && (
                      <p className="mt-1 text-xs text-red-600">{errors.event_start_time}</p>
                    )}
                  </div>
                </div>

                {/* End Date and Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
                      End Date <span className="text-red-600">*</span>
                    </label>
                    <CustomDatePicker
                      id="event_end_date"
                      placeholder="Select end date"
                      value={formData.event_end_date}
                      onChange={(value) => handleSelectChange('event_end_date', value)}
                      disabled={!isEditMode}
                    />
                    {errors.event_end_date && (
                      <p className="mt-1 text-xs text-red-600">{errors.event_end_date}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
                      End Time <span className="text-red-600">*</span>
                    </label>
                    <CustomTimePicker
                      id="event_end_time"
                      placeholder="Select end time"
                      value={formData.event_end_time}
                      onChange={(value) => handleSelectChange('event_end_time', value)}
                      disabled={!isEditMode}
                    />
                    {errors.event_end_time && (
                      <p className="mt-1 text-xs text-red-600">{errors.event_end_time}</p>
                    )}
                  </div>
                </div>

                {/* Overnight Event */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_overnight"
                    id="is_overnight"
                    checked={formData.is_overnight}
                    onChange={handleChange}
                    disabled={!isEditMode}
                    className="w-4 h-4 border-2 border-black"
                  />
                  <label htmlFor="is_overnight" className="text-xs sm:text-sm font-semibold uppercase tracking-wide">
                    Overnight Event
                  </label>
                </div>
              </div>
            </div>

            {/* Budget Section */}
            <div className="bg-white border-2 border-black p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wide mb-4 border-b-2 border-black pb-2">
                Budget Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
                    Expected Sponsorship (₹) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    name="expected_sponsorship"
                    value={formData.expected_sponsorship}
                    onChange={handleChange}
                    disabled={!isEditMode}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-black text-xs sm:text-sm ${
                      isEditMode ? 'bg-white' : 'bg-gray-100'
                    }`}
                    placeholder="Enter amount"
                  />
                  {errors.expected_sponsorship && (
                    <p className="mt-1 text-xs text-red-600">{errors.expected_sponsorship}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
                    Expected Prize Money (₹)
                  </label>
                  <input
                    type="number"
                    name="expected_prize_money"
                    value={formData.expected_prize_money}
                    onChange={handleChange}
                    disabled={!isEditMode}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-black text-xs sm:text-sm ${
                      isEditMode ? 'bg-white' : 'bg-gray-100'
                    }`}
                    placeholder="Enter amount"
                  />
                </div>
              </div>
            </div>

            {/* POC Information Section */}
            <div className="bg-white border-2 border-black p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wide mb-4 border-b-2 border-black pb-2">
                Point of Contact (POC)
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
                    POC Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="poc_name"
                    value={formData.poc_name}
                    onChange={handleChange}
                    disabled={!isEditMode}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-black text-xs sm:text-sm ${
                      isEditMode ? 'bg-white' : 'bg-gray-100'
                    }`}
                    placeholder="Enter POC name"
                  />
                  {errors.poc_name && (
                    <p className="mt-1 text-xs text-red-600">{errors.poc_name}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
                      POC Registration Number <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="poc_registration_number"
                      value={formData.poc_registration_number}
                      onChange={handleChange}
                      disabled={!isEditMode}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-black text-xs sm:text-sm ${
                        isEditMode ? 'bg-white' : 'bg-gray-100'
                      }`}
                      placeholder="Enter registration number"
                    />
                    {errors.poc_registration_number && (
                      <p className="mt-1 text-xs text-red-600">{errors.poc_registration_number}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
                      POC Contact (WhatsApp)<span className="text-red-600">*</span>
                    </label>
                    <input
                      type="tel"
                      name="poc_contact"
                      value={formData.poc_contact}
                      onChange={handleChange}
                      disabled={!isEditMode}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-black text-xs sm:text-sm ${
                        isEditMode ? 'bg-white' : 'bg-gray-100'
                      }`}
                      placeholder="10-digit number"
                      maxLength={10}
                    />
                    {errors.poc_contact && (
                      <p className="mt-1 text-xs text-red-600">{errors.poc_contact}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Venue and Collaboration Section */}
            <div className="bg-white border-2 border-black p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wide mb-4 border-b-2 border-black pb-2">
                Venue & Collaboration
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
                    Preferred Venue <span className="text-red-600">*</span>
                  </label>
                  <CustomSelect
                    id="preferred_venue"
                    options={VENUE_OPTIONS}
                    value={formData.preferred_venue}
                    onChange={(value) => handleSelectChange('preferred_venue', value)}
                    placeholder="Select Venue"
                    disabled={!isEditMode}
                  />
                  {errors.preferred_venue && (
                    <p className="mt-1 text-xs text-red-600">{errors.preferred_venue}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
                    Collaborating Club/Chapter (if any)
                  </label>
                  <CustomSelect
                    id="collaborating_cc"
                    options={collabClubOptions.filter(club => club.value !== formData.cc_name)}
                    value={formData.collaborating_cc}
                    onChange={(value) => handleSelectChange('collaborating_cc', value)}
                    placeholder="Select collaborating club (if any)"
                    disabled={!isEditMode}
                  />
                </div>
              </div>
            </div>

            {/* Event Details Section - Conditional based on type */}
            {formData.type && (
              <div className="bg-white border-2 border-black p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wide mb-4 border-b-2 border-black pb-2">
                  Event Details
                </h2>

                <div className="space-y-4">
                  {/* Description - Common for all types */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
                      Event Description <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      disabled={!isEditMode}
                      rows={4}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-black text-xs sm:text-sm resize-none ${
                        isEditMode ? 'bg-white' : 'bg-gray-100'
                      }`}
                      placeholder="Provide a detailed description of your event"
                    />
                    {errors.description && (
                      <p className="mt-1 text-xs text-red-600">{errors.description}</p>
                    )}
                  </div>

                  {/* Tech Competition & Hackathon specific fields */}
                  {(formData.type === 'tech_competition' || formData.type === 'hackathon') && (
                    <>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
                          Competition Structure <span className="text-red-600">*</span>
                        </label>
                        <textarea
                          name="competition_structure"
                          value={formData.competition_structure}
                          onChange={handleChange}
                          disabled={!isEditMode}
                          rows={3}
                          className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-black text-xs sm:text-sm resize-none ${
                            isEditMode ? 'bg-white' : 'bg-gray-100'
                          }`}
                          placeholder="Describe the structure (rounds, format, etc.)"
                        />
                        {errors.competition_structure && (
                          <p className="mt-1 text-xs text-red-600">{errors.competition_structure}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
                          Competition Rules <span className="text-red-600">*</span>
                        </label>
                        <textarea
                          name="competition_rules"
                          value={formData.competition_rules}
                          onChange={handleChange}
                          disabled={!isEditMode}
                          rows={3}
                          className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-black text-xs sm:text-sm resize-none ${
                            isEditMode ? 'bg-white' : 'bg-gray-100'
                          }`}
                          placeholder="List the rules and regulations"
                        />
                        {errors.competition_rules && (
                          <p className="mt-1 text-xs text-red-600">{errors.competition_rules}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
                          Judgement Criteria <span className="text-red-600">*</span>
                        </label>
                        <textarea
                          name="judgement_criteria"
                          value={formData.judgement_criteria}
                          onChange={handleChange}
                          disabled={!isEditMode}
                          rows={3}
                          className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-black text-xs sm:text-sm resize-none ${
                            isEditMode ? 'bg-white' : 'bg-gray-100'
                          }`}
                          placeholder="Explain how entries will be judged"
                        />
                        {errors.judgement_criteria && (
                          <p className="mt-1 text-xs text-red-600">{errors.judgement_criteria}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
                          FAQs <span className="text-red-600">*</span>
                        </label>
                        <textarea
                          name="faqs"
                          value={formData.faqs}
                          onChange={handleChange}
                          disabled={!isEditMode}
                          rows={3}
                          className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-black text-xs sm:text-sm resize-none ${
                            isEditMode ? 'bg-white' : 'bg-gray-100'
                          }`}
                          placeholder="List common questions and answers"
                        />
                        {errors.faqs && (
                          <p className="mt-1 text-xs text-red-600">{errors.faqs}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
                          Team Size <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          name="team_size"
                          value={formData.team_size}
                          onChange={handleChange}
                          disabled={!isEditMode}
                          className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-black text-xs sm:text-sm ${
                            isEditMode ? 'bg-white' : 'bg-gray-100'
                          }`}
                          placeholder="e.g., 1-4 members per team"
                        />
                        {errors.team_size && (
                          <p className="mt-1 text-xs text-red-600">{errors.team_size}</p>
                        )}
                      </div>
                    </>
                  )}

                  {/* Workshop specific fields */}
                  {formData.type === 'workshop' && (
                    <>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
                          Workshop Type <span className="text-red-600">*</span>
                        </label>
                        <CustomSelect
                          id="workshop_type"
                          options={WORKSHOP_TYPE_OPTIONS}
                          value={formData.workshop_type}
                          onChange={(value) => handleSelectChange('workshop_type', value)}
                          placeholder="Select Workshop Type"
                          disabled={!isEditMode}
                        />
                        {errors.workshop_type && (
                          <p className="mt-1 text-xs text-red-600">{errors.workshop_type}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
                          Expected Outcome <span className="text-red-600">*</span>
                        </label>
                        <textarea
                          name="workshop_outcome"
                          value={formData.workshop_outcome}
                          onChange={handleChange}
                          disabled={!isEditMode}
                          rows={3}
                          className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-black text-xs sm:text-sm resize-none ${
                            isEditMode ? 'bg-white' : 'bg-gray-100'
                          }`}
                          placeholder="What will participants learn or achieve?"
                        />
                        {errors.workshop_outcome && (
                          <p className="mt-1 text-xs text-red-600">{errors.workshop_outcome}</p>
                        )}
                      </div>
                    </>
                  )}

                  {/* Tech Talk specific fields */}
                  {formData.type === 'tech_talk' && (
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
                        Speaker Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="speaker_name"
                        value={formData.speaker_name}
                        onChange={handleChange}
                        disabled={!isEditMode}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-black text-xs sm:text-sm ${
                          isEditMode ? 'bg-white' : 'bg-gray-100'
                        }`}
                        placeholder="Enter speaker name"
                      />
                      {errors.speaker_name && (
                        <p className="mt-1 text-xs text-red-600">{errors.speaker_name}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Eligibility Section */}
            <div className="bg-white border-2 border-black p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wide mb-4 border-b-2 border-black pb-2">
                Eligibility Criteria <span className="text-red-600">*</span>
              </h2>

              <div className="space-y-2">
                <p className="text-xs sm:text-sm text-gray-600 mb-3">
                  Select which year students can participate:
                </p>

                {errors.eligibility && (
                  <p className="mb-2 text-xs text-red-600">{errors.eligibility}</p>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="eligibility_first_year"
                      id="eligibility_first_year"
                      checked={formData.eligibility_first_year}
                      onChange={handleChange}
                      disabled={!isEditMode}
                      className="w-4 h-4 border-2 border-black"
                    />
                    <label htmlFor="eligibility_first_year" className="text-xs sm:text-sm font-medium">
                      I Year
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="eligibility_second_year"
                      id="eligibility_second_year"
                      checked={formData.eligibility_second_year}
                      onChange={handleChange}
                      disabled={!isEditMode}
                      className="w-4 h-4 border-2 border-black"
                    />
                    <label htmlFor="eligibility_second_year" className="text-xs sm:text-sm font-medium">
                      II Year
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="eligibility_third_year"
                      id="eligibility_third_year"
                      checked={formData.eligibility_third_year}
                      onChange={handleChange}
                      disabled={!isEditMode}
                      className="w-4 h-4 border-2 border-black"
                    />
                    <label htmlFor="eligibility_third_year" className="text-xs sm:text-sm font-medium">
                      III Year
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="eligibility_fourth_year"
                      id="eligibility_fourth_year"
                      checked={formData.eligibility_fourth_year}
                      onChange={handleChange}
                      disabled={!isEditMode}
                      className="w-4 h-4 border-2 border-black"
                    />
                    <label htmlFor="eligibility_fourth_year" className="text-xs sm:text-sm font-medium">
                      Final Year (IV & V Year)
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button - Only shown in edit mode */}
            {isEditMode && (
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-black text-white border-2 border-black hover:bg-white hover:text-black transition-colors font-bold uppercase tracking-wide text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'UPDATING...' : 'UPDATE PROPOSAL'}
                </button>
              </div>
            )}
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
