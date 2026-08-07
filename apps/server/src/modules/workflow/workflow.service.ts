import { prisma } from '../../database/prisma.service.js';

export class WorkflowService {
  public async getWorkflows(userId: string) {
    return prisma.workflow.findMany({
      where: { OR: [{ userId }, { isTemplate: true }] },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async createWorkflow(userId: string, name: string, description: string, steps: any[]) {
    return prisma.workflow.create({
      data: {
        userId,
        name,
        description,
        steps: JSON.stringify(steps),
      },
    });
  }

  public async executeWorkflow(userId: string, workflowId: string, inputData: any) {
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) throw new Error('Workflow not found');

    const task = await prisma.agentTask.create({
      data: {
        userId,
        workflowId,
        status: 'RUNNING',
        input: inputData || {},
      },
    });

    // Execute multi-step task simulation
    setTimeout(async () => {
      await prisma.agentTask.update({
        where: { id: task.id },
        data: {
          status: 'COMPLETED',
          result: { message: 'Workflow pipeline completed successfully', output: inputData },
        },
      });
    }, 2000);

    return task;
  }
}

export const workflowService = new WorkflowService();
