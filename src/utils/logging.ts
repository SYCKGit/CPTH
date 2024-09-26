import * as vscode from "vscode";

export const logger: {
  logger: vscode.LogOutputChannel | null;
  ensureLogger(): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
} = {
  logger: null,
  ensureLogger() {
    if (!this.logger) {
      this.logger = vscode.window.createOutputChannel("CP Template Helper", { log: true });
    }
  },
  info(message: string) {
    this.ensureLogger();
    this.logger!.info(message);
  },
  warn(message: string) {
    this.ensureLogger();
    this.logger!.warn(message);
  },
  error(message: string) {
    this.ensureLogger();
    this.logger!.error(message);
  }
};