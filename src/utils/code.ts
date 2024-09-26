import * as vscode from "vscode";

export function asRelativePath(fp: string): vscode.Uri {
  const root = vscode.workspace.workspaceFolders?.[0].uri;
  return vscode.Uri.joinPath(root!, fp);
}

export function insertText(edits: vscode.TextEdit[], line: number, content: string) {
  edits.push(vscode.TextEdit.insert(new vscode.Position(line, 0), content + "\n"));
}

export class Watcher {
  watcher: vscode.FileSystemWatcher;
  disposables: vscode.Disposable[] = [];

  constructor(watcher: vscode.FileSystemWatcher) {
    this.watcher = watcher;
  }

  static async create(fp: string) {
    const uri = asRelativePath(fp);
    fp = uri.fsPath;
    const stat = await vscode.workspace.fs.stat(uri);
    if (stat.type === vscode.FileType.Directory) {
      fp += "/**/*.cpp";
    }
    return new Watcher(vscode.workspace.createFileSystemWatcher(fp));
  }

  onCreate(cb: () => void) {
    this.disposables.push(this.watcher.onDidCreate(cb));
  }

  onChange(cb: () => void) {
    this.disposables.push(this.watcher.onDidChange(cb));
  }

  onDelete(cb: () => void) {
    this.disposables.push(this.watcher.onDidDelete(cb));
  }

  dispose() {
    this.disposables.forEach(d => d.dispose());
    this.watcher.dispose();
  }
};