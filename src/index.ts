#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSHManager } from "./services/SSHManager";
import { registerTools } from "./lib/toolLoader";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { PageManager } from "./services/PageManager";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";
async function startServer() {
  puppeteer.use(StealthPlugin());
  puppeteer.use(AdblockerPlugin());

  let browser = await puppeteer.launch({ headless: false, devtools: true });
  let pageManager = new PageManager(browser);

  // Restart the browser if it disconnects
  browser.on('disconnected', async () => {
    browser = await puppeteer.launch({ headless: false, devtools: true });
    pageManager = new PageManager(browser);
  });

  // Gracefully close the browser when the server is stopped
  process.on('SIGINT', async () => {
    await browser.close();
    process.exit(0);
  });

  const sshManager = new SSHManager();

  // Create MCP server
  const server = new McpServer({
    name: "development-tools-mcp",
    version: "1.0.0",
    description: "An MCP server that provides tools for development using puppeteer and other tools, you should use it when you want to test web pages or websites using puppeteer. And also for general web development tasks."
  });

  // Register all tools
  registerTools({ pageManager, server, sshManager });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

startServer();