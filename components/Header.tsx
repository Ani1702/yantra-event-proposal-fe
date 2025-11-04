'use client';

import Image from 'next/image';

export default function Header() {
  return (
    <header className="bg-black text-white px-4 sm:px-8 py-2 border-b-4 border-white">
      <div className="relative flex items-center">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <Image
            src="/vit.png"
            alt="VIT Logo"
            width={200}
            height={200}
            className="w-[200px] h-auto"
            priority
          />
        </div>

        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <h1 className="text-sm sm:text-xl md:text-2xl font-bold tracking-wider sm:tracking-widest uppercase text-center whitespace-nowrap">
            YANTRA EVENT PROPOSAL
          </h1>
        </div>

        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <Image
            src="/yantra_logo.jpg"
            alt="Yantra Logo"
            width={100}
            height={100}
            className="w-[100px] h-auto"
            priority
          />
        </div>
        
        <div className="w-full" style={{ height: '100px' }}></div>
      </div>
    </header>
  );
}
