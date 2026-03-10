'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { projectsApi } from '@/lib/api';

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Please provide a detailed description (min 20 characters)'),
  category: z.string().min(1, 'Category is required'),
  tier: z.enum(['SIMPLE', 'STANDARD', 'PREMIUM', 'ENTERPRISE']).default('STANDARD'),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  budget: z.coerce.number().optional(),
  deadline: z.string().optional(),
  deliverables: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const CATEGORIES = [
  'Web Development',
  'Mobile App',
  'Design / Branding',
  'Content Writing',
  'SEO / Marketing',
  'Data Analysis',
  'Video / Animation',
  'Other',
];

export default function NewProjectPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    setError(null);
    setLoading(true);
    try {
      await projectsApi.create(data);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-6">
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Submit New Project</h1>
          <p className="text-gray-500">Fill in the details and our team will review it shortly.</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200"
        >
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          {/* Title */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Project Title <span className="text-red-500">*</span>
            </label>
            <input
              {...register('title')}
              placeholder="e.g. E-commerce Website for my bakery"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder="Describe what you need in detail…"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Category + Tier row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                {...register('category')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select…</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-xs text-red-600">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Service Tier</label>
              <select
                {...register('tier')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="SIMPLE">Simple (always free)</option>
                <option value="STANDARD">Standard</option>
                <option value="PREMIUM">Premium</option>
                <option value="ENTERPRISE">Enterprise</option>
              </select>
            </div>
          </div>

          {/* Priority + Budget row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Priority</label>
              <select
                {...register('priority')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Budget (USD)</label>
              <input
                {...register('budget')}
                type="number"
                min={0}
                placeholder="e.g. 500"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Deadline (optional)</label>
            <input
              {...register('deadline')}
              type="date"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Deliverables */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Expected Deliverables
            </label>
            <textarea
              {...register('deliverables')}
              rows={3}
              placeholder="What do you expect to receive? e.g. Responsive website, source code, deployment"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Submitting…' : 'Submit Project for Review'}
          </button>
        </form>
      </div>
    </div>
  );
}
