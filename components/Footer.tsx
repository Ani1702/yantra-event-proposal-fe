'use client';

import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-black text-white px-3 sm:px-6 md:px-8 py-3 sm:py-4 md:py-6 border-t-4 border-white">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 md:gap-6">
        {/* <Image
          src="/sw_logo.jpg"
          alt="Student's Welfare Logo"
          width={80}
          height={80}
          className="object-contain w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20"
        /> */}
        <div className="text-center">
          <p className="text-[10px] sm:text-xs md:text-sm font-bold tracking-wide sm:tracking-wider md:tracking-widest uppercase">
            Office of Students' Welfare
          </p>
          <p className="text-[9px] sm:text-xs mt-0.5 sm:mt-1 tracking-wide sm:tracking-wider opacity-80">
            Vellore Institute of Technology
          </p>
        </div>
      </div>
    </footer>
  );
}
