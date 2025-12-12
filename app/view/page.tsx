'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UserBar from '@/components/UserBar';
import { supabase, signOutCompletely, getValidAccessToken } from '@/lib/supabase';

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
}

export default function ViewSubmissions() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-wider">
              My Submissions
            </h1>
            <button
              onClick={() => router.push('/')}
              className="bg-white text-black px-4 py-2 border-2 border-black hover:bg-black hover:text-white transition-colors font-bold uppercase tracking-wide text-xs sm:text-sm"
            >
              Back to Home
            </button>
          </div>

          {error && (
            <div className="mb-6 p-3 sm:p-4 bg-red-50 border-2 border-red-600 text-red-800">
              <p className="text-xs sm:text-sm font-medium">{error}</p>
            </div>
          )}

          {proposals.length === 0 ? (
            <div className="text-center py-12 border-2 border-black">
              <p className="text-lg sm:text-xl font-bold uppercase tracking-wide mb-4">
                No Proposals Found
              </p>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                You haven't submitted any proposals yet.
              </p>
              <button
                onClick={() => router.push('/form')}
                className="bg-black text-white px-6 py-3 border-2 border-black hover:bg-white hover:text-black transition-colors font-bold uppercase tracking-wide text-sm"
              >
                Create Proposal
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {proposals.map((proposal) => (
                <div key={proposal.id} className="border-2 border-black bg-white">
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-wide mb-2">
                          {proposal.event_title}
                        </h2>
                        <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                          <span className="bg-black text-white px-3 py-1 font-bold uppercase">
                            {getEventTypeLabel(proposal.type)}
                          </span>
                          <span className="border-2 border-black px-3 py-1 font-bold uppercase">
                            {proposal.cc_name}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 self-start">
                        <button
                          onClick={() => handleEdit(proposal.id)}
                          className="bg-white text-black p-2 sm:p-2.5 border-2 border-black hover:bg-black hover:text-white transition-colors"
                          title="Edit Proposal"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        {deleteConfirm === proposal.id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDelete(proposal.id)}
                              className="bg-red-600 text-white px-3 py-2 text-xs font-bold uppercase hover:bg-red-700 transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="bg-gray-200 text-black px-3 py-2 text-xs font-bold uppercase hover:bg-gray-300 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(proposal.id)}
                            className="bg-red-600 text-white p-2 sm:p-2.5 border-2 border-red-600 hover:bg-red-700 transition-colors"
                            title="Delete Proposal"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
                      <div>
                        <p className="font-bold uppercase text-xs text-gray-600">Date & Time</p>
                        <p className="font-medium">
                          {formatDate(proposal.event_start_date)} at {proposal.event_start_time}
                        </p>
                      </div>
                      <div>
                        <p className="font-bold uppercase text-xs text-gray-600">Duration</p>
                        <p className="font-medium">{proposal.duration} hours</p>
                      </div>
                      <div>
                        <p className="font-bold uppercase text-xs text-gray-600">Capacity</p>
                        <p className="font-medium">{proposal.expected_capacity} participants</p>
                      </div>
                      <div>
                        <p className="font-bold uppercase text-xs text-gray-600">Venue</p>
                        <p className="font-medium">{proposal.preferred_venue}</p>
                      </div>
                      <div>
                        <p className="font-bold uppercase text-xs text-gray-600">POC</p>
                        <p className="font-medium">{proposal.poc_name}</p>
                      </div>
                      <div>
                        <p className="font-bold uppercase text-xs text-gray-600">Contact</p>
                        <p className="font-medium">{proposal.poc_contact}</p>
                      </div>
                    </div>

                    {proposal.description && (
                      <div className="mt-4 pt-4 border-t-2 border-gray-200">
                        <p className="font-bold uppercase text-xs text-gray-600 mb-2">Description</p>
                        <p className="text-sm text-gray-700 line-clamp-3">
                          {proposal.description}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t-2 border-gray-200">
                      <p className="font-bold uppercase text-xs text-gray-600 mb-2">Submitted On</p>
                      <p className="text-sm text-gray-700">
                        {formatDate(proposal.created_at)} at {new Date(proposal.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}