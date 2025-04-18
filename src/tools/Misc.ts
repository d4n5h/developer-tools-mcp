import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { z } from "zod";
import os from 'os';

export const miscTools = ({ server }: { server: McpServer }) => {
  // Perform API request
  server.tool(
    "perform-api-request",
    "This tool performs an HTTP request which can be used to interact and test APIs",
    {
      url: z.string().describe("The URL to perform the API request on"),
      method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).describe("The method to use for the API request"),
      headers: z.record(z.string(), z.string()).describe("The headers to send with the API request"),
      body: z.any().optional().describe("The body to send with the API request"),
    },
    async ({ url, method, headers, body }) => {
      const startTime = performance.now();
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });
      const responseBody = await response.text();
      const endTime = performance.now();
      const duration = endTime - startTime;
      return {
        content: [{ type: "text", text: `API response (${duration}ms): ${responseBody}` }]
      };
    }
  );

  // Get system info
  server.tool(
    "get-resource-usage",
    "This tool gets the system resource usage",
    {},
    async () => {
      const systemInfo = {
        memoryUsage: os.freemem(),
        totalMemory: os.totalmem(),
        cpuUsage: os.cpus(),
        uptime: os.uptime()
      };
      return {
        content: [{ type: "text", text: "System info: " + JSON.stringify(systemInfo) }]
      };
    }
  );

  // Get time
  server.tool(
    "get-utc-time",
    "This tool gets the current UTC time",
    {},
    async () => {
      const currentTime = new Date();
      return {
        content: [{ type: "text", text: "Current UTC time: " + currentTime.toISOString() }]
      };
    }
  );

  // Get local time
  server.tool(
    "get-local-time",
    "This tool gets the local time",
    {},
    async () => {
      const currentTime = new Date();
      return {
        content: [{ type: "text", text: "Current local time: " + currentTime.toLocaleString('en-GB') }]
      };
    }
  );
  
};