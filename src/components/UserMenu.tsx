'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout, getAuthState } from '@/lib/auth';
import { User, LogOut } from 'lucide-react';

export default function UserMenu() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const auth = getAuthState();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!auth) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-mc-bg-tertiary text-mc-text-secondary hover:text-mc-text"
      >
        <User className="w-4 h-4" />
        <span className="text-sm font-medium">{auth.username}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 w-48 bg-mc-bg-secondary border border-mc-border rounded shadow-lg z-50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-mc-bg-tertiary"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
