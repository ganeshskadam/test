'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { projectsApi } from '@/lib/api';
import Header from '@/components/Header';
import ProjectCard from '@/components/ProjectCard';

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
  submittedAt: string | null;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  clientProfile?: { freeProjectsUsed: number; freeProjectsLimit: number } | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(stored));

    projectsApi
      .list()
      .then((res) => setProjects(res.data.projects))
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  if (!user) return null;

  const isOwner = user.role === 'OWNER';
  const isClient = user.role === 'CLIENT';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Welcome banner */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user.name}!
            </h1>
            <p className="text-gray-500 capitalize">{user.role.toLowerCase()} account</p>
          </div>
          <div className="flex gap-3">
            {isOwner && (
              <Link
                href="/admin/approvals"
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
              >
                Admin Approvals
              </Link>
            )}
            {isClient && (
              <Link
                href="/projects/new"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                + New Project
              </Link>
            )}
          </div>
        </div>

        {/* Free tier counter for clients */}
        {isClient && user.clientProfile && (
          <div className="mb-6 rounded-xl bg-blue-50 p-4 ring-1 ring-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-800">Free Projects</p>
                <p className="text-sm text-blue-600">
                  You have used{' '}
                  <strong>
                    {user.clientProfile.freeProjectsUsed}/{user.clientProfile.freeProjectsLimit}
                  </strong>{' '}
                  free project slots
                </p>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: user.clientProfile.freeProjectsLimit }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-4 w-8 rounded-full ${
                      i < (user.clientProfile?.freeProjectsUsed ?? 0)
                        ? 'bg-blue-500'
                        : 'bg-blue-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Total Projects', value: projects.length },
            { label: 'Pending Review', value: projects.filter((p) => p.status === 'SUBMITTED').length },
            { label: 'In Progress', value: projects.filter((p) => p.status === 'IN_PROGRESS').length },
            { label: 'Completed', value: projects.filter((p) => p.status === 'COMPLETED').length },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Projects list */}
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          {isClient ? 'Your Projects' : 'All Projects'}
        </h2>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading projects…</div>
        ) : projects.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-200">
            <p className="text-gray-400 text-lg">No projects yet</p>
            {isClient && (
              <Link
                href="/projects/new"
                className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Submit your first project
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
