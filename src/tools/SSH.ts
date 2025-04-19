import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import type { SSHManager } from "../services/SSHManager";
import { z } from "zod";

export const sshTools = ({ sshManager, server }: { sshManager: SSHManager, server: McpServer }) => {
  // Connect to a remote server via SSH
  server.tool(
    "ssh-connect",
    "Connect to a remote server via SSH",
    {
      host: z.string().describe("The host of the remote server"),
      username: z.string().describe("The username of the remote server"),
      password: z.string().optional().describe("The password of the remote server"),
      privateKey: z.string().optional().describe("The private key of the remote server"),
      id: z.string().optional().describe("The id of the connection, if not provided, a random UUID will be generated")
    },
    async ({ host, username, password, privateKey, id }) => {
      try {
        const connectionId = await sshManager.connect({ host, username, password, privateKey, id });
        return {
          content: [{ type: "text", text: `Connected to the remote server, connection id: ${connectionId}` }]
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Failed to connect to the remote SSH server: ${error instanceof Error ? error.message : "Unknown error"}` }]
        };
      }
    }
  );

  // Disconnect from a remote server via SSH
  server.tool(
    "ssh-disconnect",
    "Disconnect from a remote server via SSH",
    {
      id: z.string().describe("The id of the connection")
    },
    async ({ id }) => {
      try {
        sshManager.disconnect(id);
        return { content: [{ type: "text", text: "Disconnected from the remote SSH server" }] };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Failed to disconnect from the remote SSH server: ${error instanceof Error ? error.message : "Unknown error"}` }]
        };
      }
    }
  );

  // Execute a command on a remote server via SSH
  server.tool(
    "ssh-execute",
    "Execute a command on a remote server via SSH",
    {
      id: z.string().describe("The id of the connection"),
      command: z.string().describe("The command to execute on the remote server")
    },
    async ({ id, command }) => {
      const ssh = sshManager.getConnection(id);
      if (!ssh) {
        return {
          content: [{ type: "text", text: "No connection found" }]
        };
      }
      try {
        const result = await ssh.execCommand(command);
        if (result.code === 0) {
          return { content: [{ type: "text", text: `Command executed successfully: ${result.stdout}` }] };
        } else {
          return { content: [{ type: "text", text: `Command failed: ${result.stderr}` }] };
        }
      } catch (error) {
        return {
          content: [{ type: "text", text: `Failed to execute command on the remote SSH server: ${error instanceof Error ? error.message : "Unknown error"}` }]
        };
      }
    }
  );
};