'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UserBar from '@/components/UserBar';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const email = session.user.email || '';
        if (email.endsWith('@vitstudent.ac.in') || email.endsWith('@vit.ac.in')) {
          setUser(session.user);
        } else {
          setError('Only VIT email (@vitstudent.ac.in or @vit.ac.in) is allowed');
          await supabase.auth.signOut();
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const email = session.user.email || '';
        if (email.endsWith('@vitstudent.ac.in') || email.endsWith('@vit.ac.in')) {
          setUser(session.user);
        } else {
          setError('Only VIT email (@vitstudent.ac.in or @vit.ac.in) is allowed');
          supabase.auth.signOut();
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            hd: 'vitstudent.ac.in',
          },
        },
      });

      if (error) throw error;
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
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
          {/* Welcome Section with Yantra Logo */}
          <div className="text-center space-y-4 mb-8">
            {/* <Image
              src="/yantra_logo.svg"
              alt="Yantra Logo"
              width={200}
              height={200}
              className="mx-auto w-32 sm:w-40 md:w-48 h-auto"
              priority
            /> */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-wider">
              Welcome to Yantra 2026
            </h1>
          </div>

          {error && (
            <div className="mb-6 p-3 sm:p-4 bg-red-50 border-2 border-red-600 text-red-800">
              <p className="text-xs sm:text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Action buttons based on authentication status */}
          <div className="flex justify-center mb-8">
            {!user ? (
              <div className="w-full max-w-md space-y-3">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full bg-white text-black px-4 py-2.5 border-2 border-black hover:bg-black hover:text-white transition-colors font-bold uppercase tracking-wide text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>{loading ? 'SIGNING IN...' : 'SIGN IN WITH GOOGLE'}</span>
                </button>
                
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/form')}
                  className="bg-black text-white px-4 sm:px-6 py-2.5 border-2 border-black hover:bg-white hover:text-black transition-colors font-bold uppercase tracking-wide text-xs sm:text-sm whitespace-nowrap"
                >
                  Create Proposal
                </button>

                <button
                  onClick={() => router.push('/view')}
                  className="bg-white text-black px-4 sm:px-6 py-2.5 border-2 border-black hover:bg-black hover:text-white transition-colors font-bold uppercase tracking-wide text-xs sm:text-sm whitespace-nowrap"
                >
                  View Submissions
                </button>
              </div>
            )}
          </div>

          {/* General Instructions Section */}
          <div className="bg-white border-2 border-black p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold uppercase tracking-wide mb-4 border-b-2 border-black pb-2">
              General Instructions
            </h2>
            
            <div className="space-y-4 text-sm sm:text-base">
              <div>
                <h3 className="font-bold uppercase text-sm sm:text-base mb-2">About Yantra 2026</h3>
                <p className="text-gray-700 leading-relaxed">
                  Yantra is VIT's annual technical fest, showcasing innovation, creativity, and technical excellence. 
                  This portal allows Core Committee members to submit event proposals for Yantra 2026.
                </p>
              </div>

              <div>
                <h3 className="font-bold uppercase text-sm sm:text-base mb-2">Proposal Submission Guidelines</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
                  <li>Only VIT email addresses (@vitstudent.ac.in or @vit.ac.in) are permitted to submit proposals.</li>
                  <li>Fill out all required fields in the proposal form with accurate information.</li>
                  <li>Provide detailed descriptions of your event, including objectives, target audience, and expected outcomes.</li>
                  <li>Specify venue preferences, expected capacity, duration, and resource requirements clearly.</li>
                  <li>Include information about Point of Contact (POC) for the event.</li>
                  <li>Review your proposal carefully before submission as changes may not be possible later.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold uppercase text-sm sm:text-base mb-2">Important Notes</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
                  <li>Ensure all budget estimates (sponsorship, prize money) are realistic and justified.</li>
                  <li>For workshops, provide detailed information about content, prerequisites, and learning outcomes.</li>
                  <li>For competitions and hackathons, clearly define rules, judging criteria, and team structure.</li>
                  <li>Submit your proposal well before the deadline to allow time for review and feedback.</li>
                </ul>
              </div>

              <div className="bg-gray-50 border-l-4 border-black p-3 mt-4">
                <p className="font-semibold text-sm sm:text-base">
                  For any queries or technical issues, please contact the Yantra organizing committee.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
