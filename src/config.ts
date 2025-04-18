export const SERVER_CONFIG = {
  name: "development-tools-mcp",
  description: "An MCP server that provides tools for development using puppeteer and other tools",
  version: "1.0.0",
  endpoints: {
    root: "/",
    sse: "/sse",
    messages: "/messages"
  }
} as const;