import { prisma } from '../../database/prisma.service.js';
import crypto from 'crypto';

export class OrgService {
  public async createOrganization(userId: string, name: string, slug: string) {
    const org = await prisma.organization.create({
      data: {
        name,
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
        workspaces: {
          create: {
            name: 'Default Workspace',
            slug: 'default',
          },
        },
        subscription: {
          create: {
            tier: 'FREE',
            status: 'ACTIVE',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
      include: {
        workspaces: true,
        subscription: true,
      },
    });

    return org;
  }

  public async getUserOrganizations(userId: string) {
    const memberships = await prisma.organizationMember.findMany({
      where: { userId },
      include: {
        organization: {
          include: {
            workspaces: true,
            subscription: true,
            _count: { select: { members: true } },
          },
        },
      },
    });

    return memberships.map((m) => ({
      ...m.organization,
      userRole: m.role,
    }));
  }

  public async createWorkspace(organizationId: string, name: string, slug: string) {
    return prisma.workspace.create({
      data: {
        organizationId,
        name,
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      },
    });
  }

  public async inviteMember(organizationId: string, email: string, role: 'ADMIN' | 'MEMBER') {
    const token = crypto.randomBytes(32).toString('hex');
    const invitation = await prisma.invitation.create({
      data: {
        organizationId,
        email,
        role,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return invitation;
  }

  public async getMembers(organizationId: string) {
    return prisma.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }
}

export const orgService = new OrgService();
