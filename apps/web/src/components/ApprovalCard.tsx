'use client';

import { useState } from 'react';

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

interface ApprovalCardProps {
  project: Project;
  onApprove: (id: string, notes?: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  onRequestInfo: (id: string, message: string) => Promise<void>;
}

export default function ApprovalCard({
  project,
  onApprove,
  onReject,
  onRequestInfo,
}: ApprovalCardProps) {
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);

  const [rejectReason, setRejectReason] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');

  const [loading, setLoading] = useState(false);

  const client = project.submittedBy;
  const profile = client?.clientProfile;
  const willUseFreeSlot =
    project.isFree &&
    profile &&
    profile.freeProjectsUsed < profile.freeProjectsLimit &&
    project.tier !== 'SIMPLE';

  const handleApprove = async () => {
    setLoading(true);
    await onApprove(project.id, approvalNotes || undefined);
    setLoading(false);
    setApproveModalOpen(false);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setLoading(true);
    await onReject(project.id, rejectReason);
    setLoading(false);
    setRejectModalOpen(false);
    setRejectReason('');
  };

  const handleRequestInfo = async () => {
    if (!infoMessage.trim()) return;
    setLoading(true);
    await onRequestInfo(project.id, infoMessage);
    setLoading(false);
    setInfoModalOpen(false);
    setInfoMessage('');
  };

  return (
    <>
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        {/* Project header */}
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
            <p className="text-sm text-gray-500">
              {project.category} · <span className="capitalize">{project.tier}</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            {project.isFree && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                Free
              </span>
            )}
            {willUseFreeSlot && (
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
                Uses free slot
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="mb-4 text-sm text-gray-600 line-clamp-3">{project.description}</p>

        {/* Client info */}
        {client && (
          <div className="mb-4 rounded-lg bg-gray-50 p-3 ring-1 ring-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">{client.name}</p>
                <p className="text-xs text-gray-500">{client.email}</p>
              </div>
              {profile && (
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-700">Free Projects</p>
                  <p className="text-xs text-gray-500">
                    {profile.freeProjectsUsed}/{profile.freeProjectsLimit} used
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Meta */}
        <div className="mb-5 flex flex-wrap gap-3 text-xs text-gray-500">
          {project.budget && <span>💰 ${project.budget}</span>}
          {project.deadline && (
            <span>📅 {new Date(project.deadline).toLocaleDateString()}</span>
          )}
          {project.submittedAt && (
            <span>🕐 Submitted {new Date(project.submittedAt).toLocaleDateString()}</span>
          )}
          <span className="capitalize">⚡ {project.priority.toLowerCase()} priority</span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setApproveModalOpen(true)}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            ✅ Approve
          </button>
          <button
            onClick={() => setRejectModalOpen(true)}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            ❌ Reject
          </button>
          <button
            onClick={() => setInfoModalOpen(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            💬 Request Info
          </button>
        </div>
      </div>

      {/* ── Approve Modal ───────────────────────────────────────────────────── */}
      {approveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-gray-900">Approve Project</h3>
            <p className="mb-4 text-sm text-gray-600">
              You are about to approve <strong>{project.title}</strong>. It will be added to the
              queue.
            </p>
            <textarea
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="Optional notes for the client…"
              rows={3}
              className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setApproveModalOpen(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={loading}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Approving…' : 'Confirm Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Modal ────────────────────────────────────────────────────── */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-gray-900">Reject Project</h3>
            <p className="mb-4 text-sm text-gray-600">
              Provide a reason so the client knows how to improve their submission.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection…"
              rows={4}
              className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={loading || !rejectReason.trim()}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Rejecting…' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Request Info Modal ──────────────────────────────────────────────── */}
      {infoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-gray-900">Request More Information</h3>
            <p className="mb-4 text-sm text-gray-600">
              This message will be sent to the client about <strong>{project.title}</strong>.
            </p>
            <textarea
              value={infoMessage}
              onChange={(e) => setInfoMessage(e.target.value)}
              placeholder="What additional information do you need?"
              rows={4}
              className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setInfoModalOpen(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestInfo}
                disabled={loading || !infoMessage.trim()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Sending…' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
