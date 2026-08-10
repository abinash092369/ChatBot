import { auditRepository } from '../repositories/audit.repository.js';

export class AuditService {
  public async getLogs(userId?: string, limit = 50, page = 1) {
    return auditRepository.getLogs(userId, limit, page);
  }
}

export const auditService = new AuditService();
