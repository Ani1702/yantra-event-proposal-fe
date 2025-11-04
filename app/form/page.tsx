'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UserBar from '@/components/UserBar';
import { supabase } from '@/lib/supabase';


interface CustomSelectProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
  id: string; 
}

function CustomSelect({
  options,
  value,
  onChange,
  placeholder,
  error,
  id,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  // Find the label for the currently selected value
  const selectedLabel =
    options.find((opt) => opt.value === value)?.label || placeholder;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={selectRef}>
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-4 border-2 bg-white text-black focus:outline-none transition-colors cursor-pointer text-base text-left flex justify-between items-center ${
          error
            ? 'border-red-600 focus:border-red-600'
            : 'border-black focus:border-gray-600'
        }`}
      >
        <span className={value ? 'text-black' : 'text-gray-500'}>
          {selectedLabel}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="square"
          strokeLinejoin="miter"
          className={`transition-transform duration-200 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border-2 border-black max-h-60 overflow-y-auto shadow-lg">
          <ul>
            {options.map((option) => (
              <li
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`px-4 py-3 cursor-pointer hover:bg-gray-100 text-black text-base ${
                  option.value === value ? 'bg-gray-200 font-medium' : ''
                }`}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// --- Main Proposal Form Component ---

export default function ProposalForm() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // --- Data for Selects ---
  const clubNames = [
    "ADVANCE DEVELOPERS CLUB",
    "ADVERTISING AND MARKETING CLUB",
    "ALPHA BIO CELL (ABC)",
    "ARCHI-TECH",
    "ASTRONOMY CLUB- VIT STELLAR",
    "BLOCKCHAIN COMMUNITY VIT",
    "BULLS AND BEARS CLUB",
    "CENTRE FOR SOCIAL ENTREPRENEURSHIP DEVELOPMENT(CSED)",
    "CODECHEF - VIT",
    "DEVELOPERS STUDENT CLUB (DSC)",
    "DIGIT SQUAD",
    "DREAM MERCHANTS",
    "ENTREPRENEURSHIP CELL (E-CELL)",
    "ENVIRONMENT & ENERGY PROTECTION CLUB (E2 PC)",
    "GURUTVA - THE PHYSICS CLUB",
    "INNOVATION AND CREATION CLUB",
    "INNOVATOR'S QUEST",
    "INTERNET OF THINGS COMMUNITY (IOTHINC)",
    "LINUX USER'S GROUP (LUG)",
    "MATRIX- THE MULTIMEDIA CLUB",
    "MOZILLA FIREFOX",
    "ROBOVITICS",
    "SOLAI",
    "STANDARDS CLUB",
    "STUDENTS ASSOCIATION OF BIO-ENGINEERING SCIENCE AND TECHNOLOGY (SABEST)",
    "TECHNOLOGY AND GAMING CLUB (TAG)",
    "THE AI & ML CLUB - TAM",
    "THE CATALYST CLUB",
    "THE ELECTRONICS CLUB (TEC)",
    "VISUAL BLOGGER'S CLUB",
    "VIT AMATEUR RADIO CLUB (VARC)",
    "ZERO WASTE MANAGEMENT (ZWM)",
    "MATH VERSE CLUB",
    "GEO SPATIAL CLUB",
    "VINNOVATEIT CLUB",
    "THE WHITEHATS CLUB",
    "SOCIETY OF AUTOMOTIVE ENGINEERS (SAE)",
    "AMERICAN SOCIETY OF MECHANICAL ENGINEERS (ASME)",
    "INSTITUTION OF INDUSTRIAL AND SYSTEMS ENGINEERS (IISE)",
    "INTERNATIONAL SOCIETY OF AUTOMATION (ISA)",
    "SOCIETY OF MANUFACTURING ENGINEERS (SME)",
    "AMERICAN INSTITUTE OF CHEMICAL ENGINEERS (AICHE)",
    "TOASTMASTERS INTERNATIONAL",
    "ASSOCIATION OF ENERGY ENGINEERS (AEE)",
    "AMERICAN SOCIETY OF CIVIL ENGINEERS (ASCE)",
    "THE SOCIETY OF PETROLEUM ENGINEERS (SPE)",
    "STUDENTS FOR THE EXPLORATION AND DEVELOPMENT OF SPACE (SEDS)",
    "THE SCIENTIFIC RESEARCH SOCIETY (SIGMA XI)",
    "THE INSTITUTION OF ENGINEERING AND TECHNOLOGY (IET)",
    "INSTITUTION OF ELECTRONICS AND TELECOMMUNICATION ENGINEERS (IETE)",
    "SOCIETY FOR INDUSTRIAL AND APPLIED MATHEMATICS (SIAM)",
    "AMERICAN SOCIETY OF HEATING, REFRIGERATING AND AIR-CONDITIONING ENGINEERS (ASHRAE)",
    "SOCIETY FOR BIOLOGOCAL ENGINEERING (SBE)",
    "ASSOCIATION FOR COMPUTING MACHINERY (ACM)",
    "INDUSTRIAL DESIGN SOCIETY OF AMERICA (IDSA)",
    "INTERACATION DESIGN ASSOSICATION (IxDA)",
    "MATERIAL ADVANTAGE STUDENT CHAPTER (ASM)",
    "INTERNATIOANL ASSOCIATION OF STUDNTS IN ECONOMIC COMMERCIAL SCIENCE(AIESEC)",
    "INDIAN INSTITUTE OF CHEMICAL ENGINEERS (IICHE)",
    "INDIAN SOCIETY FOR TECHNICAL EDUCATION (ISTE)",
    "VIT MATHEMATICAL ASSOCIATION (VITMAS)",
    "THE BIOTECH RESEARCH SOCIETY INDIA (BRSI)",
    "INSTITUTION OF ENGINEERS INDIA IE(I)",
    "THE INSTRUMENT SOCIETY OF INDIA (ISOI)",
    "SOFT COMPUTING RESEARCH SOCIETY (SCRS)",
    "INDIAN GEOTECHNICAL SOCIETY",
    "INDIA SMART GRID FORUM (ISGF)",
    "COMPUTER SOCIETY OF INDIA (CSI)",
    "THE INDIAN SOCIETY OF HEATING, REFRIGERATING AND AIR CONDITIONING ENGINEERS (ISHRAE)",
    "INDIAN SOCIETY OF EARTHQUAKE TECHNOLOGY(ISET)",
    "ADDITIVE MANUFACTURING SOCIETY OF INDIA (AMSI)",
    "ASSOCIATION OF DESIGNERS OF INDIA (ADI)",
    "COMPBIO CELL - RSG INDIA",
    "SOLAR ENERGY SOCIETY OF INDIA",
    "INDIAN CONCRETE INSTITUTE",
    "NATIONAL ASSOCIATION OF STUDENTS OF ARCHITECTURE (NASA)",
    "INDIAN WATER RESOURCES SOCIETY (IWRS)",
    "IEEE CIRCUITS AND SYSTEMS (IEEE-CAS)",
    "IEEE -COMMUNICATIONS SOCIETY (IEEE-COMSOC)",
    "IEEE COMPUTER SOCIETY (IEEE-CS)",
    "IEEE ELECTROMAGENETIC COMPATIBILITY SOCIETY (IEEE-EMCS)",
    "IEEE ELECTRON DEVICES SOCIETY (IEEE -EDS)",
    "IEEE ENGINEERING IN MEDICINE & BIOLOGY SOCIETY (IEEE-EMBS)",
    "IEEE INDUSTRIAL APPLICATIONS SOCIETY (IEEE-IAS)",
    "IEEE INFORMATION THEORY SOCIETY (IEEE-ITS)",
    "IEEE MICROWAVE THEORY AND TECHNIQUES SOCIETY (IEEE-MTTS)",
    "IEEE NUCLEAR AND PLASMA SCIENCES AND SOCIETY (IEEE-NPSS)",
    "IEEE POWER AND ENERGY SOCIETY (IEEE-PES)",
    "IEEE POWER ELECTRONICS SOCIETY (IEEE - PELS)",
    "IEEE PRODUCT SAFETY ENGINEERING SOCIETY (IEEE-PSES)",
    "IEEE PROFESSIONAL COMMUNICATION SOCIETY (IEEE-PCS)",
    "IEEE ROBOTICS & AUTOMATION SOCIETY (IEEE-RAS)",
    "IEEE SIGNAL PROCESSING SOCIETY (IEEE-SPS)",
    "IEEE SOCIETY ON SOCIAL IMPLICATIONS OF TECHNOLOGY (IEEE-SSIT)",
    "IEEE TECHNOLOGY AND ENGINEERING MANAGEMENT SOCIETY ( IEEE-TEMS)",
    "IEEE WOMEN IN ENGINEERING (IEEE-WIE)",
    "INSTITUTE OF ELECTRICAL & ELECTRONICS ENGINEERING (IEEE)"
  ];

  // Map club names to the format required by CustomSelect
  const clubOptions = clubNames.map((club) => ({
    value: club,
    label: club,
  }));

  // Define event types in the required format
  const eventTypeOptions = [
    { value: 'competition', label: 'COMPETITION' },
    { value: 'hackathon', label: 'HACKATHON' },
    { value: 'workshop', label: 'WORKSHOP' },
    { value: 'ted_talk', label: 'TED TALK' },
  ];

  const [formData, setFormData] = useState({
    cc_name: '',
    type: '',
    event_title: '',
    event_proposal: '',
    expected_capacity: '',
    duration: '',
  });

  const [status, setStatus] = useState<{
    type: 'success' | 'error' | '';
    message: string;
  }>({ type: '', message: '' });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        router.push('/login');
        return;
      }

      const email = session.user.email || '';
      if (!email.endsWith('@vitstudent.ac.in') && !email.endsWith('@vitstudent')) {
        await supabase.auth.signOut();
        router.push('/login');
        return;
      }

      setUser(session.user);
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Handler for standard <input> and <textarea>
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
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
    if (!formData.event_proposal)
      newErrors.event_proposal = 'Please enter an event proposal';
    if (!formData.expected_capacity)
      newErrors.expected_capacity = 'Please enter expected capacity';
    if (!formData.duration) newErrors.duration = 'Please enter duration';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setStatus({
        type: 'error',
        message: 'Please fill in all required fields',
      });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });
    setErrors({});

    try {
      
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const response = await fetch('http://localhost:8080/api/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          ...formData,
          expected_capacity: parseInt(formData.expected_capacity),
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
          event_proposal: '',
          expected_capacity: '',
          duration: '',
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

      <main className="flex-1 px-4 sm:px-8 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Status Message */}
            {status.message && (
              <div
                className={`p-4 border-2 ${
                  status.type === 'success'
                    ? 'bg-green-50 border-green-600 text-green-800'
                    : 'bg-red-50 border-red-600 text-red-800'
                }`}
              >
                <p className="font-medium">{status.message}</p>
              </div>
            )}

            {/* Club/Chapter Name */}
            <div>
              <label
                htmlFor="cc_name"
                className="block text-sm font-bold mb-2 text-black uppercase tracking-wider"
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
                <p className="text-red-600 text-sm mt-1 font-medium">
                  {errors.cc_name}
                </p>
              )}
            </div>

            {/* Event Type */}
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-bold mb-2 text-black uppercase tracking-wider"
              >
                Event Type *
              </label>
              <CustomSelect
                id="type"
                options={eventTypeOptions}
                value={formData.type}
                onChange={(value) => handleSelectChange('type', value)}
                placeholder="Select event type"
                error={errors.type}
              />
              {errors.type && (
                <p className="text-red-600 text-sm mt-1 font-medium">
                  {errors.type}
                </p>
              )}
            </div>

            {/* Event Title */}
            <div>
              <label
                htmlFor="event_title"
                className="block text-sm font-bold mb-2 text-black uppercase tracking-wider"
              >
                Event Title *
              </label>
              <input
                type="text"
                id="event_title"
                name="event_title"
                value={formData.event_title}
                onChange={handleChange}
                className={`w-full px-4 py-4 border-2 bg-white text-black focus:outline-none transition-colors text-base ${
                  errors.event_title
                    ? 'border-red-600 focus:border-red-600'
                    : 'border-black focus:border-gray-600'
                }`}
                placeholder="Enter event title"
              />
              {errors.event_title && (
                <p className="text-red-600 text-sm mt-1 font-medium">
                  {errors.event_title}
                </p>
              )}
            </div>

            {/* Event Proposal */}
            <div>
              <label
                htmlFor="event_proposal"
                className="block text-sm font-bold mb-2 text-black uppercase tracking-wider"
              >
                Event Proposal *
              </label>
              <textarea
                id="event_proposal"
                name="event_proposal"
                value={formData.event_proposal}
                onChange={handleChange}
                rows={8}
                className={`w-full px-4 py-4 border-2 bg-white text-black focus:outline-none transition-colors resize-none text-base ${
                  errors.event_proposal
                    ? 'border-red-600 focus:border-red-600'
                    : 'border-black focus:border-gray-600'
                }`}
                placeholder="Describe your event proposal in detail"
              />
              {errors.event_proposal && (
                <p className="text-red-600 text-sm mt-1 font-medium">
                  {errors.event_proposal}
                </p>
              )}
            </div>

            {/* Expected Capacity and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="expected_capacity"
                  className="block text-sm font-bold mb-2 text-black uppercase tracking-wider"
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
                  className={`w-full px-4 py-4 border-2 bg-white text-black focus:outline-none transition-colors text-base ${
                    errors.expected_capacity
                      ? 'border-red-600 focus:border-red-600'
                      : 'border-black focus:border-gray-600'
                  }`}
                  placeholder="Number of participants"
                />
                {errors.expected_capacity && (
                  <p className="text-red-600 text-sm mt-1 font-medium">
                    {errors.expected_capacity}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="duration"
                  className="block text-sm font-bold mb-2 text-black uppercase tracking-wider"
                >
                  Duration *
                </label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className={`w-full px-4 py-4 border-2 bg-white text-black focus:outline-none transition-colors text-base ${
                    errors.duration
                      ? 'border-red-600 focus:border-red-600'
                      : 'border-black focus:border-gray-600'
                  }`}
                  placeholder="Duration of event (in hours)"
                />
                {errors.duration && (
                  <p className="text-red-600 text-sm mt-1 font-medium">
                    {errors.duration}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 sm:pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-white px-8 py-5 border-2 border-black hover:bg-white hover:text-black transition-colors font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg"
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