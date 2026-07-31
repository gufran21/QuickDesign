import * as vscode from 'vscode';
import { createMcpServer } from '../mcp/server.js';

export class McpLauncher implements vscode.Disposable {
  private server: any;

  constructor(
    private context: vscode.ExtensionContext,
    private outputChannel: vscode.OutputChannel
  ) {}

  public start() {
    try {
      this.outputChannel.appendLine('[INFO] [MCP] Initializing local MCP Server...');
      this.server = createMcpServer(this.outputChannel);
      this.outputChannel.appendLine('[INFO] [MCP] Local MCP Server running on stdio.');
    } catch (err: any) {
      this.outputChannel.appendLine(`[ERROR] [MCP] Failed to launch MCP server: ${err.message}`);
    }
  }

  dispose() {
    if (this.server) {
      this.outputChannel.appendLine('[INFO] [MCP] Shutting down MCP Server.');
    }
  }
}
