'use client';

import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-black text-white px-4 sm:px-8 py-4 sm:py-6 border-t-4 border-white">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
        <Image
          src="/sw_logo.jpg"
          alt="Student's Welfare Logo"
          width={80}
          height={80}
          className="object-contain w-16 h-16 sm:w-20 sm:h-20"
        />
        <div className="text-center">
          <p className="text-xs sm:text-sm font-bold tracking-widest uppercase">
            Office of Student's Welfare
          </p>
          <p className="text-xs mt-1 tracking-wider opacity-80">
            Vellore Institute of Technology
          </p>
        </div>
      </div>
    </footer>
  );
}
