'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UserBar from '@/components/UserBar';
import { supabase, signOutCompletely, getValidAccessToken } from '@/lib/supabase';
import LogoUploadDialog from '@/components/LogoUploadDialog';

interface Proposal {
  id: string;
  cc_name: string;
  type: string;
  event_title: string;
  expected_capacity: number;
  duration: number;
  event_start_date: string;
  event_start_time: string;
  event_end_date: string;
  event_end_time: string;
  expected_sponsorship: number;
  expected_prize_money: number | null;
  is_overnight: boolean;
  poc_name: string;
  poc_registration_number: string;
  poc_contact: string;
  collaborating_cc: string | null;
  preferred_venue: string;
  description: string | null;
  competition_structure: string | null;
  competition_rules: string | null;
  judgement_criteria: string | null;
  faqs: string | null;
  team_size: string | null;
  workshop_outcome: string | null;
  workshop_type: string | null;
  speaker_name: string | null;
  eligibility_first_year: boolean;
  eligibility_second_year: boolean;
  eligibility_third_year: boolean;
  eligibility_fourth_year: boolean;
  submitted_by: string;
  created_at: string;
  updated_at: string;
  status: string;
  logo_url: string | null;
}

export default function ViewSubmissions() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false);
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          setLoading(false);
          router.push('/');
          return;
        }

        const email = session.user.email || '';
        if (!email.endsWith('@vitstudent.ac.in') && !email.endsWith('@vit.ac.in')) {
          setLoading(false);
          await signOutCompletely();
          router.push('/');
          return;
        }

        setUser(session.user);
        await fetchProposals();
      } catch (error) {
        console.error('Auth check error:', error);
        setError('Authentication error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const fetchProposals = async () => {
    try {
      // Get a valid, refreshed access token
      const accessToken = await getValidAccessToken();

      if (!accessToken) {
        setError('Session expired. Please sign in again.');
        setTimeout(async () => {
          await signOutCompletely();
          router.push('/');
        }, 2000);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/proposal/my-proposals`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setProposals(data.data);
        setError('');
      } else {
        setError(data.message || 'Failed to fetch proposals');
      }
    } catch (error) {
      console.error('Fetch proposals error:', error);
      setError('Network error. Please ensure the backend server is running.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Get a valid, refreshed access token
      const accessToken = await getValidAccessToken();

      if (!accessToken) {
        setError('Session expired. Please sign in again.');
        setTimeout(async () => {
          await signOutCompletely();
          router.push('/');
        }, 2000);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/proposal/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setProposals(proposals.filter(p => p.id !== id));
        setDeleteConfirm(null);
        setError('');
      } else {
        setError(data.message || 'Failed to delete proposal');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const handleOpenLogoDialog = (id: string) => {
    setSelectedProposalId(id);
    setIsLogoDialogOpen(true);
  };

  const handleLogoSuccess = (logoUrl: string) => {
    if (selectedProposalId) {
      setProposals(proposals.map(p =>
        p.id === selectedProposalId ? { ...p, logo_url: logoUrl } : p
      ));
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/view/${id}`);
  };

  const handleSignOut = async () => {
    await signOutCompletely();
    router.push('/');
  };

  const getEventTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'tech_competition': 'Tech Competition',
      'hackathon': 'Hackathon',
      'workshop': 'Workshop',
      'tech_talk': 'Tech Talk'
    };
    return labels[type] || type;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'under_consideration': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-wider">
              My Submissions
            </h1>
            <button
              onClick={() => router.push('/')}
              className="w-full sm:w-auto bg-white text-black px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-black hover:bg-black hover:text-white transition-colors font-bold uppercase tracking-wide text-xs sm:text-sm whitespace-nowrap"
            >
              ← Back to Home
            </button>
          </div>

          {error && (
            <div className="mb-6 p-3 sm:p-4 bg-red-50 border-2 border-red-600 text-red-800">
              <p className="text-xs sm:text-sm font-medium">{error}</p>
            </div>
          )}

          {proposals.length === 0 ? (
            <div className="text-center py-12 border-2 border-black">
              <p className="text-base sm:text-lg md:text-xl font-bold uppercase tracking-wide mb-4">
                No Proposals Found
              </p>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-6 px-4">
                You haven't submitted any proposals yet.
              </p>
              <button
                onClick={() => router.push('/form')}
                className="bg-black text-white px-6 py-3 border-2 border-black hover:bg-white hover:text-black transition-colors font-bold uppercase tracking-wide text-xs sm:text-sm"
              >
                Create Proposal
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {proposals.map((proposal) => (
                <div key={proposal.id} className="border-2 border-black bg-white p-4 sm:p-6 transition-shadow hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Logo Section - Fixed Size Box */}
                    <div
                      onClick={() => handleOpenLogoDialog(proposal.id)}
                      className="group relative w-full sm:w-40 h-40 shrink-0 bg-gray-50 border-2 border-dashed border-gray-300 hover:border-black transition-all cursor-pointer flex items-center justify-center overflow-hidden"
                    >
                      {proposal.logo_url ? (
                        <>
                          <img
                            src={proposal.logo_url}
                            alt="Event Logo"
                            className="w-full h-full object-contain p-2"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white font-bold uppercase text-xs tracking-wide border-2 border-white px-2 py-1">
                              Change
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-black transition-colors">
                          <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-[10px] font-bold uppercase tracking-wide">Add Logo</span>
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 min-w-0">
                      {/* Header: Title, Tags, Button */}
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                        <div>
                          <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-wide mb-2 break-words">
                            {proposal.event_title}
                          </h2>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className="bg-black text-white px-2 py-1 font-bold uppercase">
                              {getEventTypeLabel(proposal.type)}
                            </span>
                            <span className="border-2 border-black px-2 py-1 font-bold uppercase">
                              {proposal.cc_name}
                            </span>
                            {/* Status Badge */}
                            <span className={`border-2 px-2 py-1 font-bold uppercase ${getStatusColor(proposal.status)}`}>
                              {proposal.status?.replace('_', ' ') || 'Pending'}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleEdit(proposal.id)}
                          className="shrink-0 bg-white text-black px-4 py-2 border-2 border-black hover:bg-black hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase"
                        >
                          Edit Details
                        </button>
                      </div>

                      {/* Event Schedule & Venue */}
                      <div className="mb-4 p-3 bg-gray-50 border-l-4 border-black">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                          <h3 className="font-bold uppercase text-xs text-black">Event Schedule & Venue</h3>
                          <p className="text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-1 border border-red-200 rounded">
                            ⚠ Updated date,time and venue of the event will be reflected on the portal soon.
                          </p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-sm">
                          <div>
                            <p className="font-bold uppercase text-[10px] text-gray-500 mb-0.5">Start Date</p>
                            <p className="font-medium">
                              {formatDate(proposal.event_start_date)}
                            </p>
                          </div>
                          <div>
                            <p className="font-bold uppercase text-[10px] text-gray-500 mb-0.5">End Date</p>
                            <p className="font-medium">
                              {formatDate(proposal.event_end_date)}
                            </p>
                          </div>
                          <div>
                            <p className="font-bold uppercase text-[10px] text-gray-500 mb-0.5">Start Time</p>
                            <p className="font-medium">{proposal.event_start_time}</p>
                          </div>
                          <div>
                            <p className="font-bold uppercase text-[10px] text-gray-500 mb-0.5">End Time</p>
                            <p className="font-medium">{proposal.event_end_time}</p>
                          </div>
                          <div>
                            <p className="font-bold uppercase text-[10px] text-gray-500 mb-0.5">Venue</p>
                            <p className="font-medium">{proposal.preferred_venue}</p>
                          </div>
                        </div>
                      </div>

                      {/* Event Details */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <p className="font-bold uppercase text-[10px] text-gray-500 mb-0.5">Duration</p>
                          <p className="font-medium truncate">{proposal.duration} hours</p>
                        </div>
                        <div>
                          <p className="font-bold uppercase text-[10px] text-gray-500 mb-0.5">Capacity</p>
                          <p className="font-medium truncate">{proposal.expected_capacity} participants</p>
                        </div>
                        <div>
                          <p className="font-bold uppercase text-[10px] text-gray-500 mb-0.5">POC</p>
                          <p className="font-medium truncate">{proposal.poc_name}</p>
                        </div>
                        <div>
                          <p className="font-bold uppercase text-[10px] text-gray-500 mb-0.5">Contact</p>
                          <p className="font-medium truncate">{proposal.poc_contact}</p>
                        </div>
                      </div>

                      {/* Description Preview */}
                      {proposal.description && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {proposal.description}
                          </p>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="pt-3 border-t-2 border-gray-100 flex justify-between items-center">
                        <p className="text-[10px] font-bold uppercase text-gray-400">
                          Submitted on {formatDate(proposal.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <LogoUploadDialog
          isOpen={isLogoDialogOpen}
          onClose={() => setIsLogoDialogOpen(false)}
          proposalId={selectedProposalId || ''}
          onSuccess={handleLogoSuccess}
        />
      </main>

      <Footer />
    </div>
  );
}