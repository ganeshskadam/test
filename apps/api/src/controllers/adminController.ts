import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { nextQueuePosition, estimateStartDate, sanitizeUser } from '../utils/helpers';

const prisma = new PrismaClient();

/**
 * GET /api/admin/pending-approvals
 * Returns all projects with status = SUBMITTED, ordered oldest-first.
 */
export async function getPendingApprovals(req: AuthRequest, res: Response): Promise<void> {
  try {
    const projects = await prisma.project.findMany({
      where: { status: 'SUBMITTED' },
      include: {
        submittedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            clientProfile: true,
          },
        },
      },
      orderBy: { submittedAt: 'asc' },
    });

    res.json({ projects, count: projects.length });
  } catch (error) {
    console.error('getPendingApprovals error:', error);
    res.status(500).json({ error: 'Failed to fetch pending approvals' });
  }
}

/**
 * POST /api/admin/approve-project/:id
 * Approve a submitted project: sets status → APPROVED, assigns queue position.
 */
export async function approveProject(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { userId } = req.user!;
    const { approvalNotes } = req.body as { approvalNotes?: string };

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (project.status !== 'SUBMITTED') {
      res.status(400).json({ error: `Project is already ${project.status}` });
      return;
    }

    // Determine the next available queue position
    const maxPositionResult = await prisma.project.aggregate({
      where: { status: { in: ['APPROVED', 'IN_QUEUE', 'IN_PROGRESS'] } },
      _max: { queuePosition: true },
    });

    const queuePos = nextQueuePosition(maxPositionResult._max.queuePosition);
    const estimatedStart = estimateStartDate(queuePos);

    const updated = await prisma.project.update({
      where: { id },
      data: {
        status: 'APPROVED',
        queuePosition: queuePos,
        estimatedStartDate: estimatedStart,
        reviewedAt: new Date(),
        reviewedById: userId,
        approvalNotes: approvalNotes ?? null,
        rejectionReason: null,
      },
    });

    // Notify the client
    if (project.submittedById) {
      await prisma.notification.create({
        data: {
          type: 'PROJECT_APPROVED',
          title: '🎉 Project Approved!',
          message: `Your project "${project.title}" has been approved! Queue position: #${queuePos}`,
          userId: project.submittedById,
          projectId: id,
        },
      });
    }

    res.json({
      message: 'Project approved successfully',
      project: updated,
    });
  } catch (error) {
    console.error('approveProject error:', error);
    res.status(500).json({ error: 'Failed to approve project' });
  }
}

/**
 * POST /api/admin/reject-project/:id
 * Reject a submitted project with a mandatory reason.
 */
export async function rejectProject(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { userId } = req.user!;
    const { rejectionReason } = req.body as { rejectionReason?: string };

    if (!rejectionReason || rejectionReason.trim().length === 0) {
      res.status(400).json({ error: 'rejectionReason is required' });
      return;
    }

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (project.status !== 'SUBMITTED') {
      res.status(400).json({ error: `Project is already ${project.status}` });
      return;
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedAt: new Date(),
        reviewedById: userId,
        rejectionReason: rejectionReason.trim(),
        approvalNotes: null,
        queuePosition: null,
        estimatedStartDate: null,
      },
    });

    // Refund the free project slot if it was counted as free
    if (project.isFree && project.submittedById && project.tier !== 'SIMPLE') {
      const clientProfile = await prisma.clientProfile.findUnique({
        where: { userId: project.submittedById },
      });
      if (clientProfile && clientProfile.freeProjectsUsed > 0) {
        await prisma.clientProfile.update({
          where: { userId: project.submittedById },
          data: { freeProjectsUsed: { decrement: 1 } },
        });
      }
    }

    // Notify the client
    if (project.submittedById) {
      await prisma.notification.create({
        data: {
          type: 'PROJECT_REJECTED',
          title: 'Project Not Approved',
          message: `Your project "${project.title}" was not approved. Reason: ${rejectionReason}`,
          userId: project.submittedById,
          projectId: id,
        },
      });
    }

    res.json({
      message: 'Project rejected',
      project: updated,
    });
  } catch (error) {
    console.error('rejectProject error:', error);
    res.status(500).json({ error: 'Failed to reject project' });
  }
}

/**
 * POST /api/admin/request-info/:id
 * Send a message to the client asking for more information.
 */
export async function requestInfo(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { userId } = req.user!;
    const { message: content } = req.body as { message?: string };

    if (!content || content.trim().length === 0) {
      res.status(400).json({ error: 'message is required' });
      return;
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include: { submittedBy: true },
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (!project.submittedById) {
      res.status(400).json({ error: 'Project has no associated client' });
      return;
    }

    // Create the message thread entry
    const msg = await prisma.message.create({
      data: {
        content: content.trim(),
        isInternal: false,
        senderId: userId,
        receiverId: project.submittedById,
        projectId: id,
      },
      include: {
        sender: { select: { id: true, name: true, role: true } },
        receiver: { select: { id: true, name: true, role: true } },
      },
    });

    // Notify the client
    await prisma.notification.create({
      data: {
        type: 'INFO_REQUESTED',
        title: 'More Information Requested',
        message: `The admin has requested more information about your project "${project.title}".`,
        userId: project.submittedById,
        projectId: id,
      },
    });

    res.status(201).json({ message: 'Info request sent', data: msg });
  } catch (error) {
    console.error('requestInfo error:', error);
    res.status(500).json({ error: 'Failed to send info request' });
  }
}

/**
 * GET /api/admin/users
 * List all users (owner only).
 */
export async function listUsers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      include: {
        clientProfile: true,
        workerProfile: true,
        managementProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ users: users.map(sanitizeUser) });
  } catch (error) {
    console.error('listUsers error:', error);
    res.status(500).json({ error: 'Failed to list users' });
  }
}
