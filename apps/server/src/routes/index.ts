import { Router } from 'express';
import { createApiResponse } from '@chatbot/utils';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import auditRoutes from './audit.routes.js';
import healthRoutes from './health.routes.js';
import chatRoutes from './chat.routes.js';
import conversationRoutes from './conversation.routes.js';
import messageRoutes from './message.routes.js';
import toolsRoutes from './tools.routes.js';
import searchRoutes from './search.routes.js';
import ragRoutes from './rag.routes.js';
import codeRoutes from './code.routes.js';
import imagesRoutes from './images.routes.js';
import workflowsRoutes from './workflows.routes.js';
import adminRoutes from './admin.routes.js';
import orgRoutes from './org.routes.js';
import billingRoutes from './billing.routes.js';
import apikeysRoutes from './apikeys.routes.js';
import promptsRoutes from './prompts.routes.js';
import featureFlagsRoutes from './feature-flags.routes.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(createApiResponse(true, 'AI Assistant Platform Backend API v1', { version: '1.0.0', status: 'online' }));
});

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/chat', chatRoutes);
router.use('/conversations', conversationRoutes);
router.use('/messages', messageRoutes);
router.use('/tools', toolsRoutes);
router.use('/search', searchRoutes);
router.use('/rag', ragRoutes);
router.use('/code', codeRoutes);
router.use('/images', imagesRoutes);
router.use('/workflows', workflowsRoutes);
router.use('/admin', adminRoutes);
router.use('/organizations', orgRoutes);
router.use('/billing', billingRoutes);
router.use('/apikeys', apikeysRoutes);
router.use('/prompts', promptsRoutes);
router.use('/feature-flags', featureFlagsRoutes);

export default router;
