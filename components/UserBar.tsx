'use client';

interface UserBarProps {
  email: string;
  onSignOut: () => void;
}

export default function UserBar({ email, onSignOut }: UserBarProps) {
  return (
    <div className="bg-gray-100 px-4 sm:px-8 border-b-2 border-gray-300" style={{ height: '60px' }}>
      <div className="h-full relative flex items-center">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <div className="text-sm">
            <span className="font-medium">Signed in as:</span>{' '}
            <span className="font-bold">{email}</span>
          </div>
        </div>
        
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <button
            onClick={onSignOut}
            className="text-sm px-4 py-2 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors font-bold uppercase tracking-wider"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
