'use client';

interface UserBarProps {
  email: string;
  onSignOut: () => void;
}

export default function UserBar({ email, onSignOut }: UserBarProps) {
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
        
        <div className="shrink-0">
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
