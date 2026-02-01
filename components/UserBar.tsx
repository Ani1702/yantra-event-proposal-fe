'use client';

import { useState, useEffect } from 'react';
import { getValidAccessToken } from '@/lib/supabase';

interface UserBarProps {
  email: string;
  onSignOut: () => void;
}

export default function UserBar({ email, onSignOut }: UserBarProps) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const token = await getValidAccessToken();
        if (!token) return;

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/status`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
        });
        const data = await response.json();
        setIsAdmin(data.isAdmin);
      } catch (error) {
        console.error('Failed to check admin status', error);
      }
    };

    if (email) {
      checkAdminStatus();
    }
  }, [email]);

  return (
    <div className="bg-gray-100 px-3 sm:px-6 md:px-8 py-2 sm:py-2.5 border-b-2 border-gray-300">
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] sm:text-xs md:text-sm">
            <span className="font-medium hidden sm:inline">Welcome, </span>
            <span className="font-medium sm:hidden">Welcome, </span>
            <span className="font-semibold truncate block sm:inline">{email}</span>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2 sm:gap-3">
          {isAdmin && (
            <a
              href="/admin"
              className="text-[10px] sm:text-xs md:text-sm px-2 py-1 sm:px-3 sm:py-1.5 bg-black text-white hover:bg-gray-800 transition-colors font-semibold uppercase tracking-wide whitespace-nowrap"
            >
              Admin
            </a>
          )}
          <button
            onClick={onSignOut}
            className=" sm:text-[10px] md:text-sm px-1 py-0.5 sm:px-3 sm:py-1.5 border border-black bg-white hover:bg-black hover:text-white transition-colors font-semibold uppercase tracking-wide whitespace-nowrap"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
