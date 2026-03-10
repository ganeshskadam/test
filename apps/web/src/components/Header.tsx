'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface HeaderProps {
  user: User;
}

const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Owner',
  MANAGEMENT: 'Management',
  WORKER: 'Worker',
  CLIENT: 'Client',
};

export default function Header({ user }: HeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <Link href="/dashboard" className="text-xl font-bold text-blue-600">
          FlowQueue
        </Link>

        {/* Nav links */}
        <nav className="hidden items-center gap-4 sm:flex">
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
            Dashboard
          </Link>
          {user.role === 'OWNER' && (
            <Link
              href="/admin/approvals"
              className="text-sm text-purple-600 hover:text-purple-800"
            >
              Approvals
            </Link>
          )}
          {user.role === 'CLIENT' && (
            <Link href="/projects/new" className="text-sm text-blue-600 hover:text-blue-800">
              + New Project
            </Link>
          )}
        </nav>

        {/* User info + logout */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-400">{ROLE_LABELS[user.role] ?? user.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
