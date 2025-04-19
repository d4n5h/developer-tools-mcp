import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { PageManager } from "../services/PageManager";
import type { SSHManager } from "../services/SSHManager";
import {
  pageManagementTools,
  screenshotTools,
  cookiesTools,
  viewTools,
  miscTools,
  debugTools,
  analysisTools,
  elementsTools,
  interactionsTools,
  sshTools
} from "../tools/index";

interface ToolsConfig {
  pageManager: PageManager;
  server: McpServer;
  sshManager: SSHManager;
}

export function registerTools({ pageManager, server, sshManager }: ToolsConfig): void {
  pageManagementTools({ server, pageManager });
  screenshotTools({ server, pageManager });
  cookiesTools({ server, pageManager });
  viewTools({ server, pageManager });
  miscTools({ server });
  debugTools({ server, pageManager });
  analysisTools({ server, pageManager });
  elementsTools({ server, pageManager });
  interactionsTools({ server, pageManager });
  sshTools({ server, sshManager });
} 