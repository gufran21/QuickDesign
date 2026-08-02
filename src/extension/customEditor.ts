import * as vscode from 'vscode';
import { DiagramSpecSchema, DiagramSpec, createEmptyDiagram } from '../core/schema.js';
import { DiagramFileWatcher } from './fileWatcher.js';
import { applyLayout } from '../core/layout.js';

export class SystemDesignCustomEditorProvider
  implements vscode.CustomTextEditorProvider, vscode.Disposable
{
  public static readonly viewType = 'systemDesign.canvas';
  private static activeInstance: SystemDesignCustomEditorProvider | undefined;
  private activePanel: vscode.WebviewPanel | undefined;
  private activeDocument: vscode.TextDocument | undefined;
  private saveDebounceTimer: NodeJS.Timeout | undefined;

  public static register(
    context: vscode.ExtensionContext,
    outputChannel: vscode.OutputChannel
  ): SystemDesignCustomEditorProvider {
    const provider = new SystemDesignCustomEditorProvider(context, outputChannel);
    const registration = vscode.window.registerCustomEditorProvider(
      SystemDesignCustomEditorProvider.viewType,
      provider,
      {
        webviewOptions: {
          retainContextWhenHidden: true,
        },
        supportsMultipleEditorsPerDocument: false,
      }
    );
    context.subscriptions.push(registration);
    SystemDesignCustomEditorProvider.activeInstance = provider;
    return provider;
  }

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly outputChannel: vscode.OutputChannel
  ) {}

  public getActiveEditor(): SystemDesignCustomEditorProvider | undefined {
    return SystemDesignCustomEditorProvider.activeInstance;
  }

  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    this.activePanel = webviewPanel;
    this.activeDocument = document;

    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.context.extensionUri, 'dist'),
      ],
    };

    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

    // Watch file for external changes
    const fileWatcher = new DiagramFileWatcher(
      document.uri,
      (updatedDiagram, actor) => {
        if (actor !== 'human') {
          vscode.window.showInformationMessage(
            `Diagram updated externally by ${actor}`
          );
        }
        webviewPanel.webview.postMessage({
          type: 'FILE_EXTERNALLY_UPDATED',
          payload: updatedDiagram,
          actor,
        });
      },
      this.outputChannel
    );

    // Document change listener in VS Code
    const changeDocDisposable = vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.uri.toString() === document.uri.toString()) {
        // Updated text
      }
    });

    // Handle messages from Webview UI
    const messageDisposable = webviewPanel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.type) {
          case 'WEBVIEW_READY': {
            const diagram = this.getDocumentDiagram(document);
            webviewPanel.webview.postMessage({
              type: 'INIT_STATE',
              payload: diagram,
            });
            break;
          }
          case 'DISPATCH_CHANGES': {
            this.handleDispatchChanges(document, message.payload);
            break;
          }
          case 'APPLY_LAYOUT': {
            this.triggerAutoLayout(message.strategy);
            break;
          }
        }
      }
    );

    webviewPanel.onDidDispose(() => {
      fileWatcher.dispose();
      changeDocDisposable.dispose();
      messageDisposable.dispose();
      this.activePanel = undefined;
      this.activeDocument = undefined;
    });
  }

  public async triggerAutoLayout(strategy: 'left-to-right' | 'top-to-bottom' = 'left-to-right') {
    if (!this.activeDocument || !this.activePanel) return;
    try {
      const currentDiagram = this.getDocumentDiagram(this.activeDocument);
      const updatedDiagram = applyLayout(currentDiagram, strategy, 'human');
      await this.writeDiagramToDocument(this.activeDocument, updatedDiagram);
      this.activePanel.webview.postMessage({
        type: 'FILE_EXTERNALLY_UPDATED',
        payload: updatedDiagram,
        actor: 'human',
      });
      vscode.window.showInformationMessage('Applied automatic graph layout.');
    } catch (err: any) {
      this.outputChannel.appendLine(`[ERROR] [AUTO_LAYOUT] ${err.message}`);
    }
  }

  private getDocumentDiagram(document: vscode.TextDocument): DiagramSpec {
    const text = document.getText().trim();
    if (!text) {
      return createEmptyDiagram('human');
    }
    try {
      const json = JSON.parse(text);
      return DiagramSpecSchema.parse(json);
    } catch (err: any) {
      this.outputChannel.appendLine(
        `[WARN] [CUSTOM_EDITOR] Invalid .sysd format in ${document.uri.fsPath}: ${err.message}`
      );
      return createEmptyDiagram('human');
    }
  }

  private handleDispatchChanges(
    document: vscode.TextDocument,
    rawDiagram: any
  ) {
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
    }

    this.saveDebounceTimer = setTimeout(async () => {
      try {
        const diagram = DiagramSpecSchema.parse(rawDiagram);
        await this.writeDiagramToDocument(document, diagram);
      } catch (err: any) {
        this.outputChannel.appendLine(
          `[ERROR] [SAVE_DEBOUNCE] Schema validation error on save: ${err.message}`
        );
      }
    }, 300);
  }

  private async writeDiagramToDocument(
    document: vscode.TextDocument,
    diagram: DiagramSpec
  ) {
    const edit = new vscode.WorkspaceEdit();
    const fullRange = new vscode.Range(
      document.positionAt(0),
      document.positionAt(document.getText().length)
    );

    const formattedJson = JSON.stringify(diagram, null, 2);
    edit.replace(document.uri, fullRange, formattedJson);
    await vscode.workspace.applyEdit(edit);
    await document.save();
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview', 'assets', 'index.js')
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview', 'assets', 'index.css')
    );

    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; connect-src ${webview.cspSource} https: data: blob:; style-src ${webview.cspSource} 'unsafe-inline' https:; script-src ${webview.cspSource} 'unsafe-eval' 'nonce-${nonce}' https:; img-src ${webview.cspSource} data: blob: https:; font-src ${webview.cspSource} data: https:;">
  <link rel="stylesheet" href="${styleUri}">
  <title>System Design Canvas</title>
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }

  dispose() {}
}

function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
