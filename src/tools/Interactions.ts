import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import type { PageManager } from "@services/PageManager";
import { z } from "zod";
import { ElementHandle, KeyInput } from "puppeteer";

export const interactionsTools = ({ pageManager, server }: { pageManager: PageManager, server: McpServer }) => {
  // Click element
  server.tool(
    "click-element",
    "This tool clicks on an element using a selector",
    {
      selector: z.string().describe("The selector of the element to click on"),
      pageId: z.string().optional().describe("The ID of the page to click on. If not provided, the active page will be used.")
    },
    async ({ selector, pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      await pageData.page.click(selector);
      return {
        content: [{ type: "text", text: "Clicked element: " + selector }]
      };
    }
  );

  // Type text
  server.tool(
    "type-text-in-element",
    "This tool types text into an element using a selector",
    {
      selector: z.string().describe("The selector of the element to type text into"),
      text: z.string().describe("The text to type into the element"),
      pageId: z.string().optional().describe("The ID of the page to type text into. If not provided, the active page will be used.")
    },
    async ({ selector, text, pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      await pageData.page.type(selector, text);
      return {
        content: [{ type: "text", text: "Typed text: " + text }]
      };
    }
  );

  // Scroll to element
  server.tool(
    "scroll-to-element",
    "This tool scrolls to an element using a selector",
    {
      selector: z.string().describe("The selector of the element to scroll to"),
      pageId: z.string().optional().describe("The ID of the page to scroll to. If not provided, the active page will be used.")
    },
    async ({ selector, pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      await pageData.page.evaluate((selector) => {
        const element = document.querySelector(selector) as HTMLElement;
        element.scrollIntoView({ behavior: "smooth" });
      }, selector);
      return {
        content: [{ type: "text", text: "Scrolled to element: " + selector }]
      };
    }
  );

  // Scroll to top
  server.tool(
    "scroll-to-top",
    "This tool scrolls to the top of the page",
    {
      pageId: z.string().optional().describe("The ID of the page to scroll to. If not provided, the active page will be used.")
    },
    async ({ pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      await pageData.page.evaluate(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      return {
        content: [{ type: "text", text: "Scrolled to top" }]
      };
    }
  );

  // Scroll to bottom
  server.tool(
    "scroll-to-bottom",
    "This tool scrolls to the bottom of the page",
    {
      pageId: z.string().optional().describe("The ID of the page to scroll to. If not provided, the active page will be used.")
    },
    async ({ pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      await pageData.page.evaluate(() => {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
      });
      return {
        content: [{ type: "text", text: "Scrolled to bottom" }]
      };
    }
  );

  // Scroll to position
  server.tool(
    "scroll-to-position",
    "This tool scrolls to a specific position",
    {
      x: z.number().describe("The x coordinate to scroll to"),
      y: z.number().describe("The y coordinate to scroll to"),
      pageId: z.string().optional().describe("The ID of the page to scroll to. If not provided, the active page will be used.")
    },
    async ({ x, y, pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      await pageData.page.evaluate((x, y) => {
        window.scrollTo({ left: x, top: y, behavior: "smooth" });
      }, x, y);
      return {
        content: [{ type: "text", text: "Scrolled to position: " + x + ", " + y }]
      };
    }
  );

  // Hover over element
  server.tool(
    "hover-element",
    "This tool hovers over an element using a selector",
    {
      selector: z.string().describe("The selector of the element to hover over"),
      pageId: z.string().optional().describe("The ID of the page to hover over. If not provided, the active page will be used.")
    },
    async ({ selector, pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      await pageData.page.hover(selector);
      return {
        content: [{ type: "text", text: "Hovered over element: " + selector }]
      };
    }
  );

  // Send keyboard shortcut
  server.tool(
    "send-keyboard-shortcut",
    "This tool sends a keyboard shortcut",
    {
      keys: z.string().describe("The keyboard shortcut to send"),
      pageId: z.string().optional().describe("The ID of the page to send the keyboard shortcut to. If not provided, the active page will be used.")
    },
    async ({ keys, pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      await pageData.page.keyboard.press(keys as KeyInput);
      return {
        content: [{ type: "text", text: "Sent keyboard shortcut: " + keys }]
      };
    }
  );

  // Upload file
  server.tool(
    "upload-file",
    "This tool uploads a file to an element using a selector",
    {
      selector: z.string().describe("The selector of the element to upload a file to"),
      filePath: z.string().describe("The path to the file to upload"),
      pageId: z.string().optional().describe("The ID of the page to upload the file to. If not provided, the active page will be used.")
    },
    async ({ selector, filePath, pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      const element = await pageData.page.$('input[type="file"]' + selector);
      if (element) {
        await (element as ElementHandle<HTMLInputElement>).uploadFile(filePath);
        return {
          content: [{ type: "text", text: "File uploaded: " + filePath }]
        };
      }
      return {
        content: [{ type: "text", text: "Upload element not found" }]
      };
    }
  );

  // Submit form
  server.tool(
    "submit-form",
    "This tool submits a form using a selector",
    {
      selector: z.string().describe("The selector of the form to submit"),
      pageId: z.string().optional().describe("The ID of the page to submit the form on. If not provided, the active page will be used.")
    },
    async ({ selector, pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      await pageData.page.evaluate((selector) => {
        const form = document.querySelector(selector) as HTMLFormElement;
        if (form) form.submit();
      }, selector);
      await pageData.page.waitForNavigation({ waitUntil: 'networkidle0' });
      return {
        content: [{ type: "text", text: "Form submitted: " + selector }]
      };
    }
  );

  // Handle dialog
  server.tool(
    "handle-dialog",
    "This tool handles a dialog",
    {
      action: z.enum(['accept', 'dismiss']),
      promptText: z.string().optional().describe("The text to send to the dialog if it is a prompt"),
      pageId: z.string().optional().describe("The ID of the page to handle the dialog on. If not provided, the active page will be used.")
    },
    async ({ action, promptText, pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      if(pageData.dialog) {
        if(action === 'accept') {
          await pageData.dialog.accept(promptText);
        } else {
          await pageData.dialog.dismiss();
        }
      }
      return {
        content: [{ type: "text", text: `Dialog handler set to ${action}` }]
      };
    }
  );
};