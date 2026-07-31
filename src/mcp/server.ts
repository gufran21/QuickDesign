import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { SYSTEM_DESIGN_TOOLS } from './tools.js';

export function createMcpServer(outputChannel?: { appendLine: (msg: string) => void }) {
  const server = new Server(
    {
      name: 'system-design-canvas-mcp',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: Object.entries(SYSTEM_DESIGN_TOOLS).map(([name, tool]) => ({
        name,
        description: tool.description,
        inputSchema: {
          type: 'object',
          properties: {},
        },
      })),
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const tool = (SYSTEM_DESIGN_TOOLS as any)[name];

    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }

    try {
      const result = tool.execute(args || {});
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (err: any) {
      if (outputChannel) {
        outputChannel.appendLine(`[ERROR] [MCP_TOOL:${name}] ${err.message}`);
      }
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Error executing tool '${name}': ${err.message}`,
          },
        ],
      };
    }
  });

  return server;
}
