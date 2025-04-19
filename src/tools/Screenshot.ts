import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { PageManager } from "../services/PageManager";
import { z } from "zod";

export const screenshotTools = ({ pageManager, server }: { pageManager: PageManager, server: McpServer }) => {
  // Get screenshot
  server.tool(
    "get-screenshot",
    "This tool gets the screenshot of the current page",
    {
      pageId: z.string().optional().describe("The ID of the page to get the screenshot of. If not provided, the active page will be used.")
    },
    async ({ pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      const screenshot = await pageData.page.screenshot({ type: "jpeg", quality: 80 });
      const base64Data = Buffer.from(screenshot).toString('base64');
      return {
        content: [{ type: "image", data: base64Data, mimeType: "image/jpeg" }]
      };
    }
  );

  // Get full page screenshot
  server.tool(
    "get-full-page-screenshot",
    "This tool gets the full page screenshot",
    {
      pageId: z.string().optional().describe("The ID of the page to get the full page screenshot of. If not provided, the active page will be used.")
    },
    async ({ pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      const screenshot = await pageData.page.screenshot({ fullPage: true, type: "jpeg", quality: 80 });
      const base64Data = Buffer.from(screenshot).toString('base64');
      return {
        content: [{ type: "image", data: base64Data, mimeType: "image/jpeg" }]
      };
    }
  );

  // Generate PDF
  server.tool(
    "generate-pdf",
    "This tool generates a PDF of the current page",
    {
      options: z.object({
        format: z.enum(['Letter', 'Legal', 'Tabloid', 'A4']).optional(),
        landscape: z.boolean().optional(),
        margin: z.object({
          top: z.string().optional(),
          right: z.string().optional(),
          bottom: z.string().optional(),
          left: z.string().optional()
        }).optional(),
      }).optional(),
      pageId: z.string().optional().describe("The ID of the page to generate the PDF of. If not provided, the active page will be used.")
    },
    async ({ options, pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      const pdf = await pageData.page.pdf(options || {});
      const base64Data = Buffer.from(pdf).toString('base64');
      return {
        content: [{ type: "image", data: base64Data, mimeType: "application/pdf" }]
      };
    }
  );
};