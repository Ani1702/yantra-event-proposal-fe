'use client';

import Image from 'next/image';

export default function Header() {
  return (
    <header className="bg-black text-white px-2 sm:px-4 md:px-8 py-2 border-b-4 border-white">
      <div className="relative flex items-center">
        <div className="absolute left-1 sm:left-2 md:left-4 top-1/2 -translate-y-1/2">
          <Image
            src="/vit.png"
            alt="VIT Logo"
            width={200}
            height={200}
            className="w-[80px] sm:w-[120px] md:w-[150px] lg:w-[200px] h-auto"
            priority
          />
        </div>

        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 px-2">
          <h1 className="text-[10px] xs:text-xs sm:text-base md:text-xl lg:text-2xl font-bold tracking-wide sm:tracking-wider md:tracking-widest uppercase text-center whitespace-nowrap">
            YANTRA EVENT PROPOSAL
          </h1>
        </div>

        <div className="absolute right-1 sm:right-2 md:right-4 top-1/2 -translate-y-1/2">
          <Image
            src="/yantra_logo.jpg"
            alt="Yantra Logo"
            width={100}
            height={100}
            className="w-[50px] sm:w-[70px] md:w-[85px] lg:w-[100px] h-auto"
            priority
          />
        </div>
        
        <div className="w-full h-[60px] sm:h-[80px] md:h-[90px] lg:h-[100px]"></div>
      </div>
    </header>
  );
}
