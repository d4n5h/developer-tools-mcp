import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import type { PageManager } from "@services/PageManager";
import { z } from "zod";

export const cookiesTools = ({ pageManager, server }: { pageManager: PageManager, server: McpServer }) => {
  // Set cookie
  server.tool(
    "set-cookie",
    "This tool sets a cookie",
    {
      name: z.string().describe("The name of the cookie"),
      value: z.string().describe("The value of the cookie"),
      domain: z.string().describe("The domain of the cookie"),
      path: z.string().describe("The path of the cookie"),
      expires: z.number().describe("The expiration date of the cookie"),
      httpOnly: z.boolean().describe("Whether the cookie is HTTP only"),
      secure: z.boolean().describe("Whether the cookie is secure"),
      pageId: z.string().optional().describe("The ID of the page to set the cookie on. If not provided, the active page will be used.")
    },
    async ({ name, value, domain, path, expires, httpOnly, secure, pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      await pageData.page.setCookie({ name, value, domain, path, expires, httpOnly, secure });
      return {
        content: [{ type: "text", text: "Cookie set: " + name }]
      };
    }
  );

  // Get all cookies
  server.tool(
    "get-all-cookies",
    "This tool gets all the cookies",
    {
      pageId: z.string().optional().describe("The ID of the page to get the cookies of. If not provided, the active page will be used.")
    },
    async ({ pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      const cookies = await pageData.page.cookies();
      return {
        content: [{ type: "text", text: "All cookies: " + JSON.stringify(cookies) }]
      };
    }
  );

  // Get cookie
  server.tool(
    "get-cookie-by-name",
    "This tool gets a cookie by name",
    {
      name: z.string().describe("The name of the cookie"),
      pageId: z.string().optional().describe("The ID of the page to get the cookie of. If not provided, the active page will be used.")
    },
    async ({ name, pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      const cookies = await pageData.page.cookies();
      const cookie = cookies.find(c => c.name === name);
      return {
        content: [{ type: "text", text: "Cookie: " + JSON.stringify(cookie) }]
      };
    }
  );

  // Get cookies by domain
  server.tool(
    "get-cookies-by-domain",
    "This tool gets all the cookies by domain",
    {
      domain: z.string().describe("The domain of the cookies to get"),
      pageId: z.string().optional().describe("The ID of the page to get the cookies of. If not provided, the active page will be used.")
    },
    async ({ domain, pageId }) => {
      const pageData = pageManager.getPage(pageId);
      if (!pageData) {
        return {
          content: [{ type: "text", text: "No active page found" }]
        };
      }
      const cookies = await pageData.page.cookies();
      const cookiesByDomain = cookies.filter(c => c.domain === domain);
      return {
        content: [{ type: "text", text: "Cookies by domain: " + JSON.stringify(cookiesByDomain) }]
      };
    }
  );
};