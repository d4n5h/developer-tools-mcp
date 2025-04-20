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

  browser.on('disconnected', async () => {
    await setupBrowser();
  });

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
    description: `An MCP server that provides tools for development using puppeteer and other tools, you should use it when you want to test web pages or websites using puppeteer. And also for general web development tasks.
    
    ## Rules:
    1. When you're looking for selectors for an input or other interactive elements (for example, finding a search input, filling up forms, clicking buttons), you should always use the "get-all-clickable-elements" beforehand, so you'll be able to get all the clickable elements in a page and see their location and xpath selector.
    2. Never use the "wait-for-page-load" tool after using the "navigate-to-url" tool, because the page will already be loaded.
    3. Always check if a dialog is open using "check-if-dialog-is-open" before interacting with elements that might trigger dialogs (alerts, confirms, prompts).
    4. When performing form operations, use "get-element-visibility" to ensure the form elements are visible before interacting with them.
    5. When testing responsive design, use "emulate-device" with different device types and combine it with "analyze-accessibility" to ensure proper functionality across devices.
    6. Before submitting forms, verify all input values using "get-element-value" to ensure data was properly entered.
    7. Use "get-network-requests" to monitor API calls and network activity during testing sessions.
    8. Combine "analyze-seo" with "check-security-headers" for comprehensive page analysis.
    9. When uploading files, verify the file input element is present and enabled using "get-element-property" before attempting the upload.
    10. For debugging purposes, always check "get-console-logs" and "get-page-errors" when unexpected behavior occurs.
    11. When working with iframes, use "switch-to-frame" before attempting to interact with elements inside the frame.
    12. Use "get-computed-style" to verify CSS properties when testing layout and styling.
    13. For SSH operations, always use "ssh-list-connections" before creating new connections to avoid duplicates.
    14. When testing dynamic content, use "wait-for-element" with appropriate selectors rather than arbitrary delays.
    `
  });

  // Register all tools
  registerTools({ pageManager: browserState.pageManager!, server, sshManager });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

startServer();