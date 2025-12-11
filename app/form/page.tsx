'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UserBar from '@/components/UserBar';
import CustomSelect from '@/components/CustomSelect';
import CustomDatePicker from '@/components/CustomDatePicker';
import CustomTimePicker from '@/components/CustomTimePicker';
import { supabase } from '@/lib/supabase';
import { CLUB_NAMES, VENUE_OPTIONS, EVENT_TYPE_OPTIONS, WORKSHOP_TYPE_OPTIONS } from '@/lib/constants';

export default function ProposalForm() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Map club names to the format required by CustomSelect
  const clubOptions = CLUB_NAMES.map((club) => ({
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
    // Common field for all event types
    description: '',
    // Tech Competition & Hackathon fields
    competition_structure: '',
    competition_rules: '',
    judgement_criteria: '',
    faqs: '',
    team_size: '',
    // Workshop fields
    workshop_outcome: '',
    workshop_type: '',
    // Tech Talk fields
    speaker_name: '',
    // Eligibility criteria (common for all)
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

  // Scroll to top when status message changes
  useEffect(() => {
    if (status.message) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [status.message]);

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        router.push('/');
        return;
      }

      const email = session.user.email || '';
      if (!email.endsWith('@vitstudent.ac.in') && !email.endsWith('@vit.ac.in')) {
        await supabase.auth.signOut();
        router.push('/');
        return;
      }

      setUser(session.user);
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Handler for standard <input> and <textarea>
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  // Handler for the new CustomSelect component
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error on selection
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: { [key: string]: string } = {};

    if (!formData.cc_name) newErrors.cc_name = 'Please select a club/chapter';
    if (!formData.type) newErrors.type = 'Please select an event type';
    if (!formData.event_title)
      newErrors.event_title = 'Please enter an event title';
    if (!formData.expected_capacity)
      newErrors.expected_capacity = 'Please enter expected capacity';
    if (!formData.duration) {
      newErrors.duration = 'Please enter duration';
    } else {
      // Validate duration is a valid integer
      const durationNum = parseInt(formData.duration);
      if (isNaN(durationNum) || !Number.isInteger(durationNum) || durationNum <= 0) {
        newErrors.duration = 'Duration must be a valid positive integer';
      } else if (formData.duration !== durationNum.toString()) {
        // Check if there are any non-numeric characters
        newErrors.duration = 'Duration must be a valid positive integer';
      }
    }
    if (!formData.event_start_date)
      newErrors.event_start_date = 'Please enter event start date';
    if (!formData.event_start_time)
      newErrors.event_start_time = 'Please enter event start time';
    if (!formData.event_end_date)
      newErrors.event_end_date = 'Please enter event end date';
    if (!formData.event_end_time)
      newErrors.event_end_time = 'Please enter event end time';
    if (!formData.expected_sponsorship)
      newErrors.expected_sponsorship = 'Please enter expected sponsorship amount';
    if (!formData.poc_name)
      newErrors.poc_name = 'Please enter POC name';
    if (!formData.poc_registration_number)
      newErrors.poc_registration_number = 'Please enter POC registration number';
    if (!formData.poc_contact) {
      newErrors.poc_contact = 'Please enter POC contact number';
    } else if (!/^\d{10}$/.test(formData.poc_contact)) {
      newErrors.poc_contact = 'Contact number must be 10 digits';
    }
    if (!formData.preferred_venue)
      newErrors.preferred_venue = 'Please select a preferred venue';

    // Conditional validation based on event type
    if (formData.type === 'tech_competition' || formData.type === 'hackathon') {
      if (!formData.description)
        newErrors.description = 'Please enter description';
      if (!formData.competition_structure)
        newErrors.competition_structure = 'Please enter structure';
      if (!formData.competition_rules)
        newErrors.competition_rules = 'Please enter rules';
      if (!formData.judgement_criteria)
        newErrors.judgement_criteria = 'Please enter judgement criteria';
      if (!formData.faqs)
        newErrors.faqs = 'Please enter FAQs';
      if (!formData.team_size)
        newErrors.team_size = 'Please enter team size';
    }

    if (formData.type === 'workshop') {
      if (!formData.description)
        newErrors.description = 'Please enter description';
      if (!formData.workshop_outcome)
        newErrors.workshop_outcome = 'Please enter expected outcome';
      if (!formData.workshop_type)
        newErrors.workshop_type = 'Please select workshop type';
    }

    if (formData.type === 'tech_talk') {
      if (!formData.description)
        newErrors.description = 'Please enter description';
      if (!formData.speaker_name)
        newErrors.speaker_name = 'Please enter speaker name';
    }

    // Validate at least one eligibility year is selected
    if (!formData.eligibility_first_year && !formData.eligibility_second_year && 
        !formData.eligibility_third_year && !formData.eligibility_fourth_year) {
      newErrors.eligibility = 'Please select at least one eligibility year';
    }

    // Validate event start date/time is before end date/time
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
      console.log('Validation errors found:');
      console.log('Missing/Invalid fields:', Object.keys(newErrors));
      console.log('Error details:', newErrors);
      
      setErrors(newErrors);
      setStatus({
        type: 'error',
        message: 'Please fill in all the required fields correctly.',
      });
      // Scroll to top will be triggered by the useEffect
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });
    setErrors({});

    try {
      
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/proposal`, {
        method: 'POST',
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
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: 'success',
          message: 'Proposal submitted successfully!',
        });
        setFormData({
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
      } else {
        setStatus({
          type: 'error',
          message: data.message || 'Failed to submit proposal',
        });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Network error. Please ensure the backend server is running.',
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
      
      <UserBar email={user?.email || ''} onSignOut={handleSignOut} />

      <main className="flex-1 px-3 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Status Message */}
            {status.message && (
              <div
                className={`p-3 sm:p-4 border-2 ${
                  status.type === 'success'
                    ? 'bg-green-50 border-green-600 text-green-800'
                    : 'bg-red-50 border-red-600 text-red-800'
                }`}
              >
                <p className="font-medium text-sm sm:text-base">{status.message}</p>
              </div>
            )}

            {/* Club/Chapter Name */}
            <div>
              <label
                htmlFor="cc_name"
                className="block text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 text-black uppercase tracking-wide"
              >
                Name of Club/Chapter *
              </label>
              <CustomSelect
                id="cc_name"
                options={clubOptions}
                value={formData.cc_name}
                onChange={(value) => handleSelectChange('cc_name', value)}
                placeholder="Select club/chapter"
                error={errors.cc_name}
              />
              {errors.cc_name && (
                <p className="text-red-600 text-xs sm:text-sm mt-1 font-medium">
                  {errors.cc_name}
                </p>
              )}
            </div>

            {/* Event Type */}
            <div>
              <label
                htmlFor="type"
                className="block text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 text-black uppercase tracking-wide"
              >
                Event Type *
              </label>
              <CustomSelect
                id="type"
                options={EVENT_TYPE_OPTIONS}
                value={formData.type}
                onChange={(value) => handleSelectChange('type', value)}
                placeholder="Select event type"
                error={errors.type}
              />
              {errors.type && (
                <p className="text-red-600 text-xs sm:text-sm mt-1 font-medium">
                  {errors.type}
                </p>
              )}
            </div>

            {/* Event Title */}
            <div>
              <label
                htmlFor="event_title"
                className="block text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 text-black uppercase tracking-wide"
              >
                Event Title *
              </label>
              <input
                type="text"
                id="event_title"
                name="event_title"
                value={formData.event_title}
                onChange={handleChange}
                className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 bg-white text-black focus:outline-none transition-colors text-sm sm:text-base ${
                  errors.event_title
                    ? 'border-red-600 focus:border-red-600'
                    : 'border-black focus:border-gray-600'
                }`}
                placeholder="Enter event title"
              />
              {errors.event_title && (
                <p className="text-red-600 text-xs sm:text-sm mt-1 font-medium">
                  {errors.event_title}
                </p>
              )}
            </div>

            {/* Expected Capacity and Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label
                  htmlFor="expected_capacity"
                  className="block text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 text-black uppercase tracking-wide"
                >
                  Expected Capacity *
                </label>
                <input
                  type="number"
                  id="expected_capacity"
                  name="expected_capacity"
                  value={formData.expected_capacity}
                  onChange={handleChange}
                  min="1"
                  className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 bg-white text-black focus:outline-none transition-colors text-sm sm:text-base ${
                    errors.expected_capacity
                      ? 'border-red-600 focus:border-red-600'
                      : 'border-black focus:border-gray-600'
                  }`}
                  placeholder="Number of participants"
                />
                {errors.expected_capacity && (
                  <p className="text-red-600 text-xs sm:text-sm mt-1 font-medium">
                    {errors.expected_capacity}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="duration"
                  className="block text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 text-black uppercase tracking-wide"
                >
                  Duration (hours) *
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  min="1"
                  step="1"
                  className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 bg-white text-black focus:outline-none transition-colors text-sm sm:text-base ${
                    errors.duration
                      ? 'border-red-600 focus:border-red-600'
                      : 'border-black focus:border-gray-600'
                  }`}
                  placeholder="Enter event duration in hours"
                />
                {errors.duration && (
                  <p className="text-red-600 text-xs sm:text-sm mt-1 font-medium">
                    {errors.duration}
                  </p>
                )}
              </div>
            </div>

            {/* Event Start Date and Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label
                  htmlFor="event_start_date"
                  className="block text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 text-black uppercase tracking-wide"
                >
                  Event Start Date *
                </label>
                <CustomDatePicker
                  id="event_start_date"
                  value={formData.event_start_date}
                  onChange={(value) => handleSelectChange('event_start_date', value)}
                  placeholder="Select start date"
                  error={errors.event_start_date}
                />
                {errors.event_start_date && (
                  <p className="text-red-600 text-xs sm:text-sm mt-1 font-medium">
                    {errors.event_start_date}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="event_start_time"
                  className="block text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 text-black uppercase tracking-wide"
                >
                  Event Start Time (24h) *
                </label>
                <CustomTimePicker
                  id="event_start_time"
                  value={formData.event_start_time}
                  onChange={(value) => handleSelectChange('event_start_time', value)}
                  placeholder="Select start time"
                  error={errors.event_start_time}
                />
                {errors.event_start_time && (
                  <p className="text-red-600 text-xs sm:text-sm mt-1 font-medium">
                    {errors.event_start_time}
                  </p>
                )}
              </div>
            </div>

            {/* Event End Date and Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label
                  htmlFor="event_end_date"
                  className="block text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 text-black uppercase tracking-wide"
                >
                  Event End Date *
                </label>
                <CustomDatePicker
                  id="event_end_date"
                  value={formData.event_end_date}
                  onChange={(value) => handleSelectChange('event_end_date', value)}
                  placeholder="Select end date"
                  error={errors.event_end_date}
                />
                {errors.event_end_date && (
                  <p className="text-red-600 text-xs sm:text-sm mt-1 font-medium">
                    {errors.event_end_date}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="event_end_time"
                  className="block text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 text-black uppercase tracking-wide"
                >
                  Event End Time (24h) *
                </label>
                <CustomTimePicker
                  id="event_end_time"
                  value={formData.event_end_time}
                  onChange={(value) => handleSelectChange('event_end_time', value)}
                  placeholder="Select end time"
                  error={errors.event_end_time}
                />
                {errors.event_end_time && (
                  <p className="text-red-600 text-xs sm:text-sm mt-1 font-medium">
                    {errors.event_end_time}
                  </p>
                )}
              </div>
            </div>

            {/* Expected Sponsorship and Prize Money */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label
                  htmlFor="expected_sponsorship"
                  className="block text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 text-black uppercase tracking-wide"
                >
                  Expected Sponsorship *
                </label>
                <input
                  type="number"
                  id="expected_sponsorship"
                  name="expected_sponsorship"
                  value={formData.expected_sponsorship}
                  onChange={handleChange}
                  min="0"
                  className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 bg-white text-black focus:outline-none transition-colors text-sm sm:text-base ${
                    errors.expected_sponsorship
                      ? 'border-red-600 focus:border-red-600'
                      : 'border-black focus:border-gray-600'
                  }`}
                  placeholder="Amount in ₹"
                />
                {errors.expected_sponsorship && (
                  <p className="text-red-600 text-xs sm:text-sm mt-1 font-medium">
                    {errors.expected_sponsorship}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="expected_prize_money"
                  className="block text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 text-black uppercase tracking-wide"
                >
                  Expected Prize Money
                </label>
                <input
                  type="number"
                  id="expected_prize_money"
                  name="expected_prize_money"
                  value={formData.expected_prize_money}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 bg-white text-black border-black focus:border-gray-600 focus:outline-none transition-colors text-sm sm:text-base"
                  placeholder="Amount in ₹ (if any)"
                />
              </div>
            </div>

            {/* Overnight Event Checkbox */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_overnight"
                name="is_overnight"
                checked={formData.is_overnight}
                onChange={handleChange}
                className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-black cursor-pointer accent-black"
              />
              <label
                htmlFor="is_overnight"
                className="text-xs sm:text-sm font-bold text-black uppercase tracking-wide cursor-pointer"
              >
                Is this an overnight event?
              </label>
            </div>

            {/* POC Name */}
            <div>
              <label
                htmlFor="poc_name"
                className="block text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 text-black uppercase tracking-wide"
              >
                Event POC Name *
              </label>
              <input
                type="text"
                id="poc_name"
                name="poc_name"
                value={formData.poc_name}
                onChange={handleChange}
                className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 bg-white text-black focus:outline-none transition-colors text-sm sm:text-base ${
                  errors.poc_name
                    ? 'border-red-600 focus:border-red-600'
                    : 'border-black focus:border-gray-600'
                }`}
                placeholder="Enter POC full name"
              />
              {errors.poc_name && (
                <p className="text-red-600 text-xs sm:text-sm mt-1 font-medium">
                  {errors.poc_name}
                </p>
              )}
            </div>

            {/* POC Registration Number and Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label
                  htmlFor="poc_registration_number"
                  className="block text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 text-black uppercase tracking-wide"
                >
                  POC Registration Number *
                </label>
                <input
                  type="text"
                  id="poc_registration_number"
                  name="poc_registration_number"
                  value={formData.poc_registration_number}
                  onChange={handleChange}
                  className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 bg-white text-black focus:outline-none transition-colors text-sm sm:text-base ${
                    errors.poc_registration_number
                      ? 'border-red-600 focus:border-red-600'
                      : 'border-black focus:border-gray-600'
                  }`}
                  placeholder="e.g., 21BEC1234"
                />
                {errors.poc_registration_number && (
                  <p className="text-red-600 text-xs sm:text-sm mt-1 font-medium">
                    {errors.poc_registration_number}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="poc_contact"
                  className="block text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 text-black uppercase tracking-wide"
                >
                  POC Contact Number *
                </label>
                <input
                  type="tel"
                  id="poc_contact"
                  name="poc_contact"
                  value={formData.poc_contact}
                  onChange={handleChange}
                  maxLength={10}
                  className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 bg-white text-black focus:outline-none transition-colors text-sm sm:text-base ${
                    errors.poc_contact
                      ? 'border-red-600 focus:border-red-600'
                      : 'border-black focus:border-gray-600'
                  }`}
                  placeholder="10-digit mobile number"
                />
                {errors.poc_contact && (
                  <p className="text-red-600 text-xs sm:text-sm mt-1 font-medium">
                    {errors.poc_contact}
                  </p>
                )}
              </div>
            </div>

            {/* Collaborating Club/Chapter */}
            <div>
              <label
                htmlFor="collaborating_cc"
                className="block text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 text-black uppercase tracking-wide"
              >
                Collaborating Club/Chapter
              </label>
              <CustomSelect
                id="collaborating_cc"
                options={clubOptions.filter(club => club.value !== formData.cc_name)}
                value={formData.collaborating_cc}
                onChange={(value) => handleSelectChange('collaborating_cc', value)}
                placeholder="Select collaborating club (if any)"
              />
            </div>

            {/* Preferred Venue */}
            <div>
              <label
                htmlFor="preferred_venue"
                className="block text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 text-black uppercase tracking-wide"
              >
                Preferred Venue *
              </label>
              <CustomSelect
                id="preferred_venue"
                options={VENUE_OPTIONS}
                value={formData.preferred_venue}
                onChange={(value) => handleSelectChange('preferred_venue', value)}
                placeholder="Select preferred venue"
                error={errors.preferred_venue}
              />
              {errors.preferred_venue && (
                <p className="text-red-600 text-xs sm:text-sm mt-1 font-medium">
                  {errors.preferred_venue}
                </p>
              )}
            </div>

            {/* Conditional Fields Based on Event Type */}
            
            {/* Common Description Field for All Event Types */}
            {formData.type && (
              <div>
                <label
                  htmlFor="description"
                  className="block text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 text-black uppercase tracking-wide"
                >
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 bg-white text-black focus:outline-none transition-colors resize-none text-sm sm:text-base ${
                    errors.description
                      ? 'border-red-600 focus:border-red-600'
                      : 'border-black focus:border-gray-600'
                  }`}
                  placeholder={
                    formData.type === 'tech_competition' ? 'Describe the competition' :
                    formData.type === 'hackathon' ? 'Describe the hackathon' :
                    formData.type === 'workshop' ? 'Describe the workshop' :
                    'Describe the tech talk'
                  }
                />
                {errors.description && (
                  <p className="text-red-600 text-xs sm:text-sm mt-1 font-medium">
                    {errors.description}
                  </p>
                )}
              </div>
            )}
            
            {/* Tech Competition & Hackathon Fields */}
            {(formData.type === 'tech_competition' || formData.type === 'hackathon') && (
              <>

                <div>
                  <label
                    htmlFor="competition_structure"
                    className="block text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 text-black uppercase tracking-wide"
                  >
                    Structure *
                  </label>
                  <textarea
                    id="competition_structure"
                    name="competition_structure"
                    value={formData.competition_structure}
                    onChange={handleChange}
                    rows={4}
                    className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 bg-white text-black focus:outline-none transition-colors resize-none text-sm sm:text-base ${
                      errors.competition_structure
                        ? 'border-red-600 focus:border-red-600'
                        : 'border-black focus:border-gray-600'
                    }`}
                    placeholder="Explain the event structure (rounds, phases, etc.)"
                  />
                  {errors.competition_structure && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1 font-medium">
                      {errors.competition_structure}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="competition_rules"
                    className="block text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 text-black uppercase tracking-wide"
                  >
                    Rules *
                  </label>
                  <textarea
                    id="competition_rules"
                    name="competition_rules"
                    value={formData.competition_rules}
                    onChange={handleChange}
                    rows={4}
                    className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 bg-white text-black focus:outline-none transition-colors resize-none text-sm sm:text-base ${
                      errors.competition_rules
                        ? 'border-red-600 focus:border-red-600'
                        : 'border-black focus:border-gray-600'
                    }`}
                    placeholder="List all rules and regulations"
                  />
                  {errors.competition_rules && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1 font-medium">
                      {errors.competition_rules}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="judgement_criteria"
                    className="block text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 text-black uppercase tracking-wide"
                  >
                    Judgement Criteria *
                  </label>
                  <textarea
                    id="judgement_criteria"
                    name="judgement_criteria"
                    value={formData.judgement_criteria}
                    onChange={handleChange}
                    rows={4}
                    className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 bg-white text-black focus:outline-none transition-colors resize-none text-sm sm:text-base ${
                      errors.judgement_criteria
                        ? 'border-red-600 focus:border-red-600'
                        : 'border-black focus:border-gray-600'
                    }`}
                    placeholder="Define how participants will be judged"
                  />
                  {errors.judgement_criteria && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1 font-medium">
                      {errors.judgement_criteria}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="faqs"
                    className="block text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 text-black uppercase tracking-wide"
                  >
                    FAQs *
                  </label>
                  <textarea
                    id="faqs"
                    name="faqs"
                    value={formData.faqs}
                    onChange={handleChange}
                    rows={4}
                    className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 bg-white text-black focus:outline-none transition-colors resize-none text-sm sm:text-base ${
                      errors.faqs
                        ? 'border-red-600 focus:border-red-600'
                        : 'border-black focus:border-gray-600'
                    }`}
                    placeholder="Common questions and answers"
                  />
                  {errors.faqs && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1 font-medium">
                      {errors.faqs}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="team_size"
                    className="block text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 text-black uppercase tracking-wide"
                  >
                    Team Size *
                  </label>
                  <input
                    type="text"
                    id="team_size"
                    name="team_size"
                    value={formData.team_size}
                    onChange={handleChange}
                    className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 bg-white text-black focus:outline-none transition-colors text-sm sm:text-base ${
                      errors.team_size
                        ? 'border-red-600 focus:border-red-600'
                        : 'border-black focus:border-gray-600'
                    }`}
                    placeholder="e.g., 1-4 members or Individual"
                  />
                  {errors.team_size && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1 font-medium">
                      {errors.team_size}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Workshop Fields */}
            {formData.type === 'workshop' && (
              <>
                <div>
                  <label
                    htmlFor="workshop_outcome"
                    className="block text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 text-black uppercase tracking-wide"
                  >
                    Outcome *
                  </label>
                  <textarea
                    id="workshop_outcome"
                    name="workshop_outcome"
                    value={formData.workshop_outcome}
                    onChange={handleChange}
                    rows={4}
                    className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 bg-white text-black focus:outline-none transition-colors resize-none text-sm sm:text-base ${
                      errors.workshop_outcome
                        ? 'border-red-600 focus:border-red-600'
                        : 'border-black focus:border-gray-600'
                    }`}
                    placeholder="What will participants learn or gain?"
                  />
                  {errors.workshop_outcome && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1 font-medium">
                      {errors.workshop_outcome}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="workshop_type"
                    className="block text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 text-black uppercase tracking-wide"
                  >
                    Type *
                  </label>
                  <CustomSelect
                    id="workshop_type"
                    options={WORKSHOP_TYPE_OPTIONS}
                    value={formData.workshop_type}
                    onChange={(value) => handleSelectChange('workshop_type', value)}
                    placeholder="Select workshop type"
                    error={errors.workshop_type}
                  />
                  {errors.workshop_type && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1 font-medium">
                      {errors.workshop_type}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Tech Talk Fields */}
            {formData.type === 'tech_talk' && (
              <>
                <div>
                  <label
                    htmlFor="speaker_name"
                    className="block text-xs sm:text-sm font-bold mb-1.5 sm:mb-2 text-black uppercase tracking-wide"
                  >
                    Speaker *
                  </label>
                  <input
                    type="text"
                    id="speaker_name"
                    name="speaker_name"
                    value={formData.speaker_name}
                    onChange={handleChange}
                    className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 bg-white text-black focus:outline-none transition-colors text-sm sm:text-base ${
                      errors.speaker_name
                        ? 'border-red-600 focus:border-red-600'
                        : 'border-black focus:border-gray-600'
                    }`}
                    placeholder="Enter speaker name"
                  />
                  {errors.speaker_name && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1 font-medium">
                      {errors.speaker_name}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Eligibility Criteria - Common for all event types */}
            <div>
              <label className="block text-xs sm:text-sm font-bold mb-2 sm:mb-3 text-black uppercase tracking-wide">
                Eligibility Criteria *
              </label>
              <div className="space-y-2 sm:space-y-2.5">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="eligibility_first_year"
                    name="eligibility_first_year"
                    checked={formData.eligibility_first_year}
                    onChange={handleChange}
                    className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-black cursor-pointer accent-black"
                  />
                  <label
                    htmlFor="eligibility_first_year"
                    className="text-xs sm:text-sm font-medium text-black cursor-pointer"
                  >
                    First Year (I Year)
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="eligibility_second_year"
                    name="eligibility_second_year"
                    checked={formData.eligibility_second_year}
                    onChange={handleChange}
                    className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-black cursor-pointer accent-black"
                  />
                  <label
                    htmlFor="eligibility_second_year"
                    className="text-xs sm:text-sm font-medium text-black cursor-pointer"
                  >
                    Second Year (II Year)
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="eligibility_third_year"
                    name="eligibility_third_year"
                    checked={formData.eligibility_third_year}
                    onChange={handleChange}
                    className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-black cursor-pointer accent-black"
                  />
                  <label
                    htmlFor="eligibility_third_year"
                    className="text-xs sm:text-sm font-medium text-black cursor-pointer"
                  >
                    Third Year (III Year)
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="eligibility_fourth_year"
                    name="eligibility_fourth_year"
                    checked={formData.eligibility_fourth_year}
                    onChange={handleChange}
                    className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-black cursor-pointer accent-black"
                  />
                  <label
                    htmlFor="eligibility_fourth_year"
                    className="text-xs sm:text-sm font-medium text-black cursor-pointer"
                  >
                    Final Year (IV & V Year)
                  </label>
                </div>
              </div>
              {errors.eligibility && (
                <p className="text-red-600 text-xs sm:text-sm mt-2 font-medium">
                  {errors.eligibility}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-3 sm:pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-white px-4 py-3 sm:px-6 sm:py-4 border-2 border-black hover:bg-white hover:text-black transition-colors font-bold uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isSubmitting ? 'SUBMITTING...' : 'SUBMIT PROPOSAL'}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}