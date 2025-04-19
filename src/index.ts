
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSHManager } from "@services/SSHManager";
import { SERVER_CONFIG } from "./config";
import { registerTools } from "@server/tools";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { browser } from "@services/BrowserService";
import { PageManager } from "@services/PageManager";

const pageManager = new PageManager(browser);
const sshManager = new SSHManager();

// Create MCP server
const server = new McpServer(SERVER_CONFIG);

// Register all tools
registerTools({ pageManager, server, sshManager });

const transport = new StdioServerTransport();
await server.connect(transport);