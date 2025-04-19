import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { PageManager } from "../services/PageManager";
import { z } from "zod";

export const pageManagementTools = ({ pageManager, server }: { pageManager: PageManager, server: McpServer }) => {
  // Page management tools
  server.tool(
    "create-page",
    "This tool creates a new browser page",
    {
      pageId: z.string().optional().describe("The ID of the page to create. If not provided, a random ID will be generated.")
    },
    async ({ pageId }) => {
      const newPageId = await pageManager.createPage(pageId);
      return {
        content: [{ type: "text", text: `Created new page with ID: ${newPageId}` }]
      };
    }
  );

  server.tool(
    "close-page",
    "This tool closes a browser page",
    {
      pageId: z.string().describe("The ID of the page to close")
    },
    async ({ pageId }) => {
      const success = await pageManager.closePage(pageId);
      return {
        content: [{ type: "text", text: success ? `Closed page: ${pageId}` : `Failed to close page: ${pageId}` }]
      };
    }
  );

  server.tool(
    "switch-page",
    "This tool switches the active browser page",
    {
      pageId: z.string().describe("The ID of the page to switch to")
    },
    async ({ pageId }) => {
      const success = pageManager.setActivePage(pageId);
      await pageManager.getPage(pageId)?.page.bringToFront();
      return {
        content: [{ type: "text", text: success ? `Switched to page: ${pageId}` : `Failed to switch to page: ${pageId}` }]
      };
    }
  );

  server.tool(
    "list-pages",
    "This tool lists all browser pages",
    {},
    async () => {
      const pages = pageManager.getAllPageIds();
      const activePage = pageManager.getActivePageId();
      let text = `Pages:\n`;
      for (const id of pages) {
        const page = pageManager.getPage(id);
        text += `\t-${id}:\n\t\tActive: ${id === activePage ? 'yes' : 'no'}\n\t\tURL: ${page?.pageUrl || 'no url'}\n\t\tTitle: ${page?.pageTitle || 'no title'}\n`;
      }
      return {
        content: [{
          type: "text",
          text
        }]
      };
    }
  );


  // Get page title
  server.tool(
    "get-page-title",
    "This tool gets the page title",
    {
      pageId: z.string().optional().describe("The ID of the page to get the title of. If not provided, the active page will be used.")
    },
    async ({ pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      const title = await pageData.page.title();
      return {
        content: [{ type: "text", text: "Page title: " + title }]
      };
    }
  );

  // Get page URL
  server.tool(
    "get-page-url",
    "This tool gets the page URL",
    {
      pageId: z.string().optional().describe("The ID of the page to get the URL of. If not provided, the active page will be used.")
    },
    async ({ pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      const url = pageData.page.url();
      return {
        content: [{ type: "text", text: "Page URL: " + url }]
      };
    }
  );

  // Refresh page
  server.tool(
    "refresh-page",
    "This tool refreshes the page",
    {
      pageId: z.string().optional().describe("The ID of the page to refresh. If not provided, the active page will be used.")
    },
    async ({ pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      await pageData.page.reload({ waitUntil: "networkidle0" });

      pageData.pageUrl = pageData.page.url();
      pageData.pageTitle = await pageData.page.title();

      return {
        content: [{ type: "text", text: "Page refreshed" }]
      };
    }
  );

  // Switch to frame
  server.tool(
    "switch-to-frame",
    "This tool switches to a frame using a selector",
    {
      selector: z.string().describe("The selector of the frame to switch to"),
      pageId: z.string().optional().describe("The ID of the page to switch to. If not provided, the active page will be used.")
    },
    async ({ selector, pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      const frame = await pageData.page.$(selector);
      if (frame) {
        const contentFrame = await frame.contentFrame();
        if (contentFrame) {
          await contentFrame.waitForNavigation({ waitUntil: 'networkidle0' });
          return {
            content: [{ type: "text", text: "Switched to frame: " + selector }]
          };
        }
      }
      return {
        content: [{ type: "text", text: "Frame not found" }]
      };
    }
  );

  // Navigate to URL
  server.tool(
    "navigate-to-url",
    "This tool navigates to a given URL",
    {
      url: z.string().describe("The URL to navigate to"),
      pageId: z.string().optional().describe("The ID of the page to navigate to. If not provided, the active page will be used.")
    },
    async ({ url, pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      await pageData.page.goto(url, { waitUntil: "domcontentloaded" });

      pageData.pageUrl = url;
      pageData.pageTitle = await pageData.page.title();

      return {
        content: [{ type: "text", text: "Navigated to " + url }]
      };
    }
  );

  // Wait for page load
  server.tool(
    "wait-for-page-load",
    "This tool waits for the page to load, don't use it if you already used the navigate-to-url tool before it because it will wait for the page to load again.",
    {
      waitUntil: z.enum(["domcontentloaded", "networkidle0"]).optional().describe("The wait until to use. If not provided, the default will be used."),
      pageId: z.string().optional().describe("The ID of the page to wait for. If not provided, the active page will be used.")
    },
    async ({ waitUntil, pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      await pageData.page.waitForNavigation({ waitUntil: waitUntil || "domcontentloaded" });
      return {
        content: [{ type: "text", text: "Page loaded" }]
      };
    }
  );

  // Wait for element
  server.tool(
    "wait-for-element",
    "This tool waits for an element to be loaded",
    {
      selector: z.string().describe("The selector of the element to wait for"),
      pageId: z.string().optional().describe("The ID of the page to wait for. If not provided, the active page will be used.")
    },
    async ({ selector, pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      await pageData.page.waitForSelector(selector);
      return {
        content: [{ type: "text", text: `Element loaded: ${selector}` }]
      };
    }
  );

  // Get page content
  server.tool(
    "get-page-content",
    "This tool gets the page HTML content, try to avoid using this tool as it can return a large amount of data, instead try to use get-element-html with a specific selector to get a smaller amount of data",
    {
      pageId: z.string().optional().describe("The ID of the page to get the content of. If not provided, the active page will be used.")
    },
    async ({ pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      const content = await pageData.page.content();
      return {
        content: [{ type: "text", text: "Page content: " + content }]
      };
    }
  );

  // Check if dialog is open
  server.tool(
    "check-if-dialog-is-open",
    "This tool checks if a dialog is open",
    {
      pageId: z.string().optional().describe("The ID of the page to check if a dialog is open on. If not provided, the active page will be used.")
    },
    async ({ pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      const dialog = pageData?.dialog;
      // Get the message of the dialog
      const message = dialog?.message();
      // Get the type of the dialog
      const type = dialog?.type();
      // Get the default value of the dialog
      const defaultValue = dialog?.defaultValue();
      return {
        content: [{ type: "text", text: dialog ? "Dialog is open: " + message + " (" + type + ")" + " (Default value: " + defaultValue + ")" : "Dialog is not open" }]
      };
    }
  );
};
