import { Elysia } from "elysia";
import { staticPlugin } from '@elysiajs/static';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SERVER_CONFIG } from "../config";
import { PageManager } from "../services/PageManager";
import { browser } from "../services/BrowserService";
import { registerTools } from "./tools";
import { setupSSERoutes } from "./sseRoutes";
import { SSHManager } from "@services/SSHManager";

export function createServer() {
  const pageManager = new PageManager(browser);
  const sshManager = new SSHManager();
  // Create MCP server
  const mcpServer = new McpServer(SERVER_CONFIG);

  // Register all tools
  registerTools({ pageManager, server: mcpServer, sshManager });

  // Create Elysia app
  const app = new Elysia({
    serve: { idleTimeout: 0 }
  }).use(staticPlugin({
    assets: './public',
    prefix: '/'
  }));

  // Setup routes with shared transport map
  const transports = new Map();
  setupSSERoutes(app, mcpServer, transports);

  return { app, browser };
} 