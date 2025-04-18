import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import type { PageManager } from "@services/PageManager";
import { z } from "zod";

export const debugTools = ({ pageManager, server }: { pageManager: PageManager, server: McpServer }) => {
  // Get console logs
  server.tool(
    "get-console-logs",
    "This tool gets the page console logs",
    {
      pageId: z.string().optional().describe("The ID of the page to get the console logs of. If not provided, the active page will be used.")
    },
    async ({ pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      const logs = pageData.consoleLogs;
      pageData.consoleLogs = [];
      return {
        content: [{ type: "text", text: "Console logs: " + logs.join("\n") }]
      };
    }
  );

  // Get page errors
  server.tool(
    "get-page-errors",
    "This tool gets all the page errors",
    {
      pageId: z.string().optional().describe("The ID of the page to get the errors of. If not provided, the active page will be used.")
    },
    async ({ pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      const errors = pageData.pageErrors;
      pageData.pageErrors = [];
      return {
        content: [{ type: "text", text: "Page errors: " + errors.join("\n") }]
      };
    }
  );
  
  // Run script
  server.tool(
    "run-script",
    "This tool runs a script",
    {
      script: z.string().describe("The script to run"),
      pageId: z.string().optional().describe("The ID of the page to run the script on. If not provided, the active page will be used.")
    },
    async ({ script, pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      await pageData.page.evaluate(script);
      return {
        content: [{ type: "text", text: "Script run: " + script }]
      };
    }
  );

  // Monitor network requests
  server.tool(
    "get-network-requests",
    "This tool gets all the network requests",
    {
      pageId: z.string().optional().describe("The ID of the page to get the network requests of. If not provided, the active page will be used.")
    },
    async ({ pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      const requests = await pageData.page.evaluate(() => {
        return (performance.getEntriesByType('resource') as PerformanceResourceTiming[]).map(entry => ({
          name: entry.name,
          type: entry.initiatorType,
          duration: entry.duration
        }));
      });
      return {
        content: [{ type: "text", text: "Network requests: " + JSON.stringify(requests) }]
      };
    }
  );
};
