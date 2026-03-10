'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { projectsApi } from '@/lib/api';

interface Message {
  id: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
  sender: { id: string; name: string; role: string };
}

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  tier: string;
  status: string;
  priority: string;
  isFree: boolean;
  queuePosition: number | null;
  estimatedStartDate: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  approvalNotes: string | null;
  budget: number | null;
  deadline: string | null;
  deliverables: string | null;
  messages: Message[];
  submittedBy: { id: string; name: string; email: string } | null;
  assignedWorker: { id: string; name: string; email: string } | null;
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SUBMITTED: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  IN_QUEUE: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-purple-100 text-purple-700',
  UNDER_REVIEW: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    projectsApi
      .get(id)
      .then((res) => setProject(res.data.project))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load project'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  }

  if (error || !project) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error ?? 'Project not found'}</p>
          <Link href="/dashboard" className="mt-4 text-blue-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>

        <div className="mt-4 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
              <p className="mt-1 text-gray-500">{project.category}</p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[project.status] ?? 'bg-gray-100 text-gray-600'}`}
            >
              {project.status.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Description
            </h2>
            <p className="text-gray-700">{project.description}</p>
          </div>

          {/* Meta grid */}
          <div className="mb-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div>
              <span className="font-medium text-gray-500">Tier</span>
              <p className="text-gray-900">{project.tier}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Priority</span>
              <p className="text-gray-900">{project.priority}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Budget</span>
              <p className="text-gray-900">{project.budget ? `$${project.budget}` : '—'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Deadline</span>
              <p className="text-gray-900">
                {project.deadline ? new Date(project.deadline).toLocaleDateString() : '—'}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Queue Position</span>
              <p className="text-gray-900">
                {project.queuePosition ? `#${project.queuePosition}` : '—'}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Est. Start</span>
              <p className="text-gray-900">
                {project.estimatedStartDate
                  ? new Date(project.estimatedStartDate).toLocaleDateString()
                  : '—'}
              </p>
            </div>
          </div>

          {/* Rejection reason */}
          {project.status === 'REJECTED' && project.rejectionReason && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 ring-1 ring-red-200">
              <p className="font-medium text-red-700">Rejection Reason</p>
              <p className="mt-1 text-sm text-red-600">{project.rejectionReason}</p>
            </div>
          )}

          {/* Approval notes */}
          {project.approvalNotes && (
            <div className="mb-6 rounded-lg bg-green-50 p-4 ring-1 ring-green-200">
              <p className="font-medium text-green-700">Approval Notes</p>
              <p className="mt-1 text-sm text-green-600">{project.approvalNotes}</p>
            </div>
          )}

          {/* Deliverables */}
          {project.deliverables && (
            <div className="mb-6">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Deliverables
              </h2>
              <p className="text-gray-700">{project.deliverables}</p>
            </div>
          )}

          {/* Messages */}
          {project.messages.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Messages
              </h2>
              <div className="space-y-3">
                {project.messages.map((msg) => (
                  <div key={msg.id} className="rounded-lg bg-gray-50 p-3 text-sm ring-1 ring-gray-200">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-medium text-gray-700">{msg.sender.name}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(msg.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-600">{msg.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
