import Link from 'next/link';

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

interface ProjectCardProps {
  project: Project;
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  SUBMITTED: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  IN_QUEUE: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-purple-100 text-purple-700',
  UNDER_REVIEW: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

const PRIORITY_ICONS: Record<string, string> = {
  LOW: '🔵',
  NORMAL: '🟡',
  HIGH: '🟠',
  URGENT: '🔴',
};

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <div className="group rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 transition hover:shadow-md hover:ring-blue-300">
        {/* Header row */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-1">
            {project.title}
          </h3>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[project.status] ?? 'bg-gray-100 text-gray-600'}`}
          >
            {project.status.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Description */}
        <p className="mb-4 text-sm text-gray-500 line-clamp-2">{project.description}</p>

        {/* Footer row */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <span>{PRIORITY_ICONS[project.priority] ?? '🟡'}</span>
            <span>{project.category}</span>
          </span>
          <div className="flex items-center gap-2">
            {project.isFree && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700 font-medium">
                Free
              </span>
            )}
            {project.queuePosition && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-700 font-medium">
                #{project.queuePosition}
              </span>
            )}
            <span>{new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
