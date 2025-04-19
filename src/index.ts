
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSHManager } from "./services/SSHManager";
import { registerTools } from "./lib/toolLoader";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { PageManager } from "./services/PageManager";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";

puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin());

async function main() {

  const browser = await puppeteer.launch({ headless: false, devtools: true });


  const pageManager = new PageManager(browser);
  const sshManager = new SSHManager();

  // Create MCP server
  const server = new McpServer({
    name: "development-tools-mcp",
    description: "An MCP server that provides tools for development using puppeteer and other tools",
    version: "1.0.0"
  });

  // Register all tools
  registerTools({ pageManager, server, sshManager });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main();