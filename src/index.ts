#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSHManager } from "./services/SSHManager";
import { registerTools } from "./lib/toolLoader";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { PageManager } from "./services/PageManager";
import type { Browser } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";

const browserState: {
  browser: Browser | null,
  pageManager: PageManager | null
} = {
  browser: null,
  pageManager: null
};


async function setupBrowser() {
  const browser = await puppeteer.launch({ headless: false, devtools: true });
  const pageManager = new PageManager(browser);

  // browser.on('disconnected', async () => {
  //   await setupBrowser();
  // });

  browserState.browser = browser;
  browserState.pageManager = pageManager;
}

async function startServer() {
  puppeteer.use(StealthPlugin());
  puppeteer.use(AdblockerPlugin());

  await setupBrowser();

  // Gracefully close the browser when the server is stopped
  process.on('SIGINT', async () => {
    await browserState.browser?.close();
    process.exit(0);
  });

  const sshManager = new SSHManager();

  // Create MCP server
  const server = new McpServer({
    name: "development-tools-mcp",
    version: "1.0.0",
    description: `An MCP server that provides tools for development using puppeteer and other tools, you should use it when you want to test web pages or websites using puppeteer. And also for general web development tasks.`
  });

  // Register all tools
  registerTools({ pageManager: browserState.pageManager!, server, sshManager });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

startServer();