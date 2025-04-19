import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import type { PageManager } from "../services/PageManager";
import { z } from "zod";

export const viewTools = ({ pageManager, server }: { pageManager: PageManager, server: McpServer }) => {
  // Device emulation
  server.tool(
    "emulate-device",
    "This tool emulates a device resolution",
    {
      deviceType: z.enum([
        'Mobile',
        'Tablet',
        'Desktop',
      ]).optional().describe("The type of device to emulate. If not provided, the active page will be used."),
      pageId: z.string().optional().describe("The ID of the page to emulate the device on. If not provided, the active page will be used.")
    },
    async ({ deviceType, pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      const devices: { [key: string]: any } = {
        'Mobile': {
          viewport: { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
        },
        'Tablet': {
          viewport: { width: 820, height: 1180, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
          userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
        },
        'Desktop': {
          viewport: { width: 1920, height: 1080, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
      };

      const device = devices[deviceType || 'Desktop'];
      await pageData.page.setViewport(device.viewport);
      await pageData.page.setUserAgent(device.userAgent);

      return {
        content: [{ type: "text", text: `Emulating ${deviceType} device` }]
      };
    }
  );
};