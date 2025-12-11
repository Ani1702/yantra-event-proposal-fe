'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session after OAuth redirect
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          router.push('/login?error=auth_failed');
          return;
        }

        if (session?.user) {
          const email = session.user.email || '';
          
          // Check if email is from VIT
          if (email.endsWith('@vitstudent.ac.in') || email.endsWith('@vit.ac.in')) {
            // Valid VIT email, redirect to form
            router.push('/form');
          } else {
            // Not a VIT email, sign out and redirect to login with error
            await supabase.auth.signOut();
            router.push('/login?error=invalid_email');
          }
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Callback error:', error);
        router.push('/login?error=callback_failed');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-black"></div>
        <p className="mt-4 text-lg font-bold uppercase tracking-wider">
          Authenticating...
        </p>
      </div>
    </div>
  );
}
