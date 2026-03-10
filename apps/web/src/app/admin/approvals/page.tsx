'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import ApprovalCard from '@/components/ApprovalCard';
import { adminApi } from '@/lib/api';

interface ClientProfile {
  freeProjectsUsed: number;
  freeProjectsLimit: number;
}

interface SubmittedBy {
  id: string;
  name: string;
  email: string;
  clientProfile: ClientProfile | null;
}

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  tier: string;
  priority: string;
  isFree: boolean;
  budget: number | null;
  deadline: string | null;
  deliverables: string | null;
  submittedAt: string | null;
  submittedBy: SubmittedBy | null;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function ApprovalsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchPending = useCallback(async () => {
    try {
      const res = await adminApi.pendingApprovals();
      setProjects(res.data.projects);
    } catch {
      showToast('error', 'Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/login');
      return;
    }
    const parsed: User = JSON.parse(stored);
    if (parsed.role !== 'OWNER') {
      router.push('/dashboard');
      return;
    }
    setUser(parsed);
    fetchPending();
  }, [router, fetchPending]);

  const handleApprove = async (id: string, notes?: string) => {
    try {
      await adminApi.approveProject(id, notes);
      showToast('success', 'Project approved successfully!');
      fetchPending();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Approval failed');
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      await adminApi.rejectProject(id, reason);
      showToast('success', 'Project rejected.');
      fetchPending();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Rejection failed');
    }
  };

  const handleRequestInfo = async (id: string, message: string) => {
    try {
      await adminApi.requestInfo(id, message);
      showToast('success', 'Info request sent to client.');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to send request');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />

      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed right-4 top-4 z-50 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.message}
        </div>
      )}

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
          <p className="text-gray-500">
            {projects.length} project{projects.length !== 1 ? 's' : ''} awaiting review
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400">Loading…</div>
        ) : projects.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-200">
            <p className="text-2xl">🎉</p>
            <p className="mt-2 font-medium text-gray-700">All caught up!</p>
            <p className="text-sm text-gray-400">No projects pending review right now.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <ApprovalCard
                key={project.id}
                project={project}
                onApprove={handleApprove}
                onReject={handleReject}
                onRequestInfo={handleRequestInfo}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
