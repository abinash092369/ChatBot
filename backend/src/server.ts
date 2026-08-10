import { createApp } from './app.js';
import { env } from './config/env.config.js';
import { prisma } from './database/prisma.service.js';

const app = createApp();
const PORT = Number(env.PORT) || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${env.NODE_ENV} mode`);
  console.log(`🔗 API Endpoint: https://chatbot-m2lx.onrender.com/api/v1`);
});

// Graceful Shutdown
const shutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log('🔌 HTTP server closed.');
    await prisma.$disconnect();
    console.log('💾 Database client disconnected.');
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
