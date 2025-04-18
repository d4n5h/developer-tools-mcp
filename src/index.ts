import { createServer } from "./server/setup";
import { logger } from "./lib/Logger";
// Create and configure server
const { app, browser } = createServer();

const port = Number(process.env.PORT || 3001);
// Start the server
app.listen(port, () => {
  logger.info(`MCP server running at http://localhost:${port}`);
  logger.info(`- GET /sse for SSE connection`);
  logger.info(`- POST /messages?sessionId=<ID> for messages`);
});

// Graceful shutdown handlers
const shutdown = async (signal: string) => {
  logger.error(`Received ${signal} signal. Shutting down...`);
  await browser.close();
  process.exit(signal === 'uncaughtException' ? 1 : 0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGQUIT', () => shutdown('SIGQUIT'));
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  shutdown('uncaughtException');
});