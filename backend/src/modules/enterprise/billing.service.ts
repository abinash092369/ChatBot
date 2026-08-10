import { prisma } from '../../database/prisma.service.js';

export class BillingService {
  public async getSubscription(organizationId: string) {
    let sub = await prisma.subscription.findUnique({
      where: { organizationId },
      include: { invoices: true },
    });

    if (!sub) {
      sub = await prisma.subscription.create({
        data: {
          organizationId,
          tier: 'FREE',
          status: 'ACTIVE',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        include: { invoices: true },
      });
    }

    return sub;
  }

  public async updatePlan(organizationId: string, tier: 'FREE' | 'PRO' | 'BUSINESS' | 'ENTERPRISE') {
    const sub = await prisma.subscription.upsert({
      where: { organizationId },
      update: { tier, status: 'ACTIVE' },
      create: {
        organizationId,
        tier,
        status: 'ACTIVE',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Create Invoice record
    const amount = tier === 'PRO' ? 29 : tier === 'BUSINESS' ? 99 : tier === 'ENTERPRISE' ? 499 : 0;
    if (amount > 0) {
      await prisma.invoice.create({
        data: {
          subscriptionId: sub.id,
          amount,
          currency: 'USD',
          status: 'PAID',
        },
      });
    }

    return sub;
  }
}

export const billingService = new BillingService();
