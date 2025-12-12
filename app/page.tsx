'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UserBar from '@/components/UserBar';
import { supabase, signOutCompletely } from '@/lib/supabase';

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
          await signOutCompletely();
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
          signOutCompletely();
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
    await signOutCompletely();
    setUser(null);
    router.push('/');
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
          <div className="text-center mb-10 sm:mb-12">
           
            <div className="inline-block">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-[0.2em]  text-gray-900">
                WELCOME TO <b className='font-extrabold'>YANTRA 2026</b>
                
              </h1>
                 {/* <h1 className="text-2xl mt-4 sm:text-3xl md:text-xl font-light tracking-[0.2em]  text-gray-900">
               <b>EVENT PROPOSAL PORTAL</b>
                
              </h1>
           */}
              <div className="relative">
                 {/* <Image
              src="/yantra_logo_black.svg"
              alt="Yantra Logo"
              width={200}
              height={200}
              className="mx-auto w-32 sm:w-40 md:w-48 h-auto"
              priority
            /> */}
                {/* <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-black mt-2"></div> */}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3 sm:p-4 bg-red-50 border-2 border-red-600 text-red-800">
              <p className="text-xs sm:text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Action buttons based on authentication status */}
          <div className="flex justify-center mb-8">
            {!user ? (
              <div className="w-full max-w-xs space-y-3">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full bg-white text-black px-4 py-3 border-2 border-black hover:bg-black hover:text-white transition-colors font-bold uppercase tracking-wide text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto max-w-xs sm:max-w-none">
                <button
                  onClick={() => router.push('/form')}
                  className="w-full sm:w-auto bg-black text-white px-4 sm:px-6 py-3 sm:py-2.5 border-2 border-black hover:bg-white hover:text-black transition-colors font-bold uppercase tracking-wide text-xs sm:text-sm whitespace-nowrap"
                >
                  Create Proposal
                </button>

                <button
                  onClick={() => router.push('/view')}
                  className="w-full sm:w-auto bg-white text-black px-4 sm:px-6 py-3 sm:py-2.5 border-2 border-black hover:bg-black hover:text-white transition-colors font-bold uppercase tracking-wide text-xs sm:text-sm whitespace-nowrap"
                >
                  View Submissions
                </button>
              </div>
            )}
          </div>

          {/* General Instructions Section */}
          <div className="bg-white border-2 border-black mt-8">
            {/* Header Bar */}
            <div className="bg-gray-50 px-6 py-4 border-b-2 border-black">
              <h2 className="text-lg font-bold text-black tracking-tight flex items-center gap-2 uppercase">
                <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                General Instructions
              </h2>
            </div>

            <div className="p-6 sm:p-8 space-y-8">
              
              {/* Section 1: About & Theme */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">About Yantra</h3>
                  <p className="text-sm text-gray-600 leading-relaxed text-justify">
                    Yantra is a week-long celebration of <span className="italic">technical innovation</span>, where all technical clubs and chapters organize events such as competitions, workshops, hackathons, and technical talks. Like every year, the event is conducted under the <span className="font-bold">Office of Students’ Welfare</span> and coordinated by the <span className="italic">Student Council</span>. All events are free and exclusively for VIT students.
                  </p>
                </div>
                
                {/* Theme Card */}
                <div className="bg-gray-50 border border-black p-4 md:col-span-1">
                  <p className="text-xs font-semibold text-black uppercase tracking-wide mb-1">
                    This Year&apos;s Theme
                  </p>
                  <p className="text-base font-bold text-gray-900">
                    AI for Social Responsibility
                  </p>
                   <p className="text-xs text-gray-500 mt-2 leading-snug">

        Events from all disciplines are encouraged, as long as they align with the technical nature of Yantra.

        </p>
                </div>
              </div>

              <hr className="border-gray-200" />

              {/* Section 2: Guidelines */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                  Submission Guidelines
                </h3>
                
                <ul className="space-y-3">
                  {[
                    "Only the official representative of the club/chapter is allowed to fill out the proposal form, and the submission must be made through a valid VIT email ID.",
                    "Fill out all required fields in the proposal form with accurate and complete information.",
                    "Provide detailed descriptions of the event, including objectives, target audience, and expected outcomes (this will be displayed on the Yantra website).",
                    "Clearly specify venue preferences, expected capacity, and event duration; final allocation will depend on availability.",
                    "Include complete details of the Point of Contact (POC) for the event."
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="shrink-0 mt-1.5 w-1.5 h-1.5 bg-black"></div>
                      <span className="text-sm text-gray-600 leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                  <li className="flex items-start gap-3">
                    <div className="shrink-0 mt-1.5 w-1.5 h-1.5 bg-black"></div>
                    <span className="text-sm text-gray-600 leading-relaxed">
                      All clubs and chapters are requested to begin planning their events and submit proposals on or before <span className="font-bold text-gray-900">18/12/2025</span>.
                    </span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 px-6 py-4 mt-4 text-center sm:text-left border-t-2 border-black">
                <p className="text-xs text-gray-900">
                  <span className="font-bold text-black uppercase">Need Assistance?</span> For queries or technical issues, please contact the Yantra Organizing Committee.
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
