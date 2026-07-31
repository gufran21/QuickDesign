import * as vscode from 'vscode';
import { DiagramSpecSchema, DiagramSpec } from '../core/schema.js';

export class DiagramFileWatcher implements vscode.Disposable {
  private watcher: vscode.FileSystemWatcher;
  private disposables: vscode.Disposable[] = [];

  constructor(
    private documentUri: vscode.Uri,
    private onExternalChange: (updatedDiagram: DiagramSpec, actor: string) => void,
    private outputChannel: vscode.OutputChannel
  ) {
    const relativePattern = new vscode.RelativePattern(
      vscode.Uri.joinPath(documentUri, '..'),
      vscode.workspace.asRelativePath(documentUri)
    );

    this.watcher = vscode.workspace.createFileSystemWatcher(relativePattern);

    this.disposables.push(
      this.watcher.onDidChange(async (uri) => {
        if (uri.fsPath === this.documentUri.fsPath) {
          await this.handleFileChange();
        }
      })
    );
  }

  private async handleFileChange() {
    try {
      const fileBytes = await vscode.workspace.fs.readFile(this.documentUri);
      const fileText = Buffer.from(fileBytes).toString('utf8');
      const rawJson = JSON.parse(fileText);
      const diagram = DiagramSpecSchema.parse(rawJson);

      const lastActor = diagram.meta?.lastModifiedBy || 'external';
      this.outputChannel.appendLine(
        `[INFO] [FILE_WATCHER] External edit detected on ${this.documentUri.fsPath} by ${lastActor}`
      );

      this.onExternalChange(diagram, lastActor);
    } catch (err: any) {
      this.outputChannel.appendLine(
        `[WARN] [FILE_WATCHER] Failed to reconcile external file edit: ${err.message}`
      );
    }
  }

  dispose() {
    this.watcher.dispose();
    this.disposables.forEach((d) => d.dispose());
  }
}
