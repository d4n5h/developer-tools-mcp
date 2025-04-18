import { Elysia } from "elysia";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SERVER_CONFIG } from "../config";
import { SSETransport } from "@lib/SSETransport";
import { logger } from "@lib/Logger";
type TransportMap = Map<string, SSETransport>;

export function setupSSERoutes(
  app: Elysia,
  mcpServer: McpServer,
  transports: TransportMap
): void {
  // Info route
  app.get('/', () => (SERVER_CONFIG));

  // SSE connection route
  app.get('/sse', async (context) => {
    logger.info("SSE connection requested");

    try {
      // Set SSE headers
      Object.entries({
        'content-type': 'text/event-stream',
        'cache-control': 'no-cache',
        'connection': 'keep-alive'
      }).forEach(([key, value]) => {
        context.set.headers[key] = value as string;
      });

      // Create and store transport
      const transport = new SSETransport('/messages', context);
      transports.set(transport.sessionId, transport);

      // Connect to MCP server
      await mcpServer.connect(transport);

      return context.response;
    } catch (error) {
      logger.error("SSE connection error:", error);
      return new Response(JSON.stringify({
        error: "SSE connection failed",
        message: error instanceof Error ? error.message : String(error)
      }), {
        status: 500,
        headers: { 'content-type': 'application/json' }
      });
    }
  });

  // Message handling route
  app.post('/messages', async (context) => {
    try {
      const url = new URL(context.request.url);
      const sessionId = url.searchParams.get("sessionId");

      if (!sessionId || !transports.has(sessionId)) {
        return new Response(JSON.stringify({
          error: "Invalid or missing session ID"
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const transport = transports.get(sessionId)!;
      return transport.handlePostMessage(context);
    } catch (error) {
      logger.error("Message handling error:", error);
      return new Response(JSON.stringify({
        error: "Message handling failed",
        message: error instanceof Error ? error.message : String(error)
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  });
} 