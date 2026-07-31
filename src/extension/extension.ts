import * as vscode from 'vscode';
import { SystemDesignCustomEditorProvider } from './customEditor.js';
import { McpLauncher } from './mcpLauncher.js';
import { createEmptyDiagram } from '../core/schema.js';

let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
  outputChannel = vscode.window.createOutputChannel('System Design Canvas');
  outputChannel.appendLine('[INFO] [EXTENSION] Activating System Design Canvas Extension...');

  // Register Custom Editor Provider
  const editorProvider = SystemDesignCustomEditorProvider.register(
    context,
    outputChannel
  );

  // Register Command: System Design: New File
  const newFileCmd = vscode.commands.registerCommand(
    'systemDesign.newFile',
    async () => {
      const uri = await vscode.window.showSaveDialog({
        defaultUri: vscode.Uri.file('architecture.sysd'),
        filters: {
          'System Design Canvas': ['sysd'],
        },
      });

      if (uri) {
        const initialDiagram = createEmptyDiagram('human');
        const content = JSON.stringify(initialDiagram, null, 2);
        await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf8'));
        await vscode.commands.executeCommand('vscode.open', uri);
        vscode.window.showInformationMessage(
          `Created System Design Canvas file: ${uri.fsPath}`
        );
      }
    }
  );

  // Register Command: System Design: Apply Layout
  const applyLayoutCmd = vscode.commands.registerCommand(
    'systemDesign.applyLayout',
    async () => {
      const activeEditor = editorProvider.getActiveEditor();
      if (activeEditor) {
        activeEditor.triggerAutoLayout();
      } else {
        vscode.window.showWarningMessage('No active System Design Canvas editor found.');
      }
    }
  );

  // Launch Local MCP Server
  const mcpLauncher = new McpLauncher(context, outputChannel);
  mcpLauncher.start();

  context.subscriptions.push(
    outputChannel,
    editorProvider,
    newFileCmd,
    applyLayoutCmd,
    mcpLauncher
  );

  outputChannel.appendLine('[INFO] [EXTENSION] System Design Canvas Extension active.');
}

export function deactivate() {
  if (outputChannel) {
    outputChannel.appendLine('[INFO] [EXTENSION] Deactivating extension.');
  }
}
