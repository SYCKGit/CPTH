import * as vscode from "vscode";
import { logger, forEach, getLine, getTemplates, insertText, templateTypes, Watcher } from "./utils";
import { parseConfig, parseTemplateFile } from "./parser";

export async function activate(context: vscode.ExtensionContext) {
  logger.info("Extension activated, parsing config file");
  let config = await parseConfig();

  const configWatcher = await Watcher.create("cpth.config.json");
  configWatcher.onChange(async () => {
    logger.info("Config changed, re-parsing");
    config = await parseConfig();
  });

  const includeWatchers = await forEach(config.includes, async i => {
    const watcher = await Watcher.create(i.fp);
    watcher.onCreate(async () => {
      logger.info(`Template file in ${i.fp} created, re-parsing`);
      const newTemplates = await parseTemplateFile(i.fp);
      config.includes.find(old => old.fp === i.fp)!.templates = newTemplates.map(t => t.name);
      config.templates.push(...newTemplates);
    });
    watcher.onChange(async () => {
      logger.info(`Template file (in) ${i.fp} changed, re-parsing`);
      config.templates = config.templates.filter(t => !i.templates.includes(t.name));
      const newTemplates = await parseTemplateFile(i.fp);
      config.includes.find(old => old.fp === i.fp)!.templates = newTemplates.map(t => t.name);
      config.templates.push(...newTemplates);
    });
    watcher.onDelete(async () => {
      logger.info(`Template file (in) ${i.fp} deleted, re-parsing`);
      config.templates = config.templates.filter(t => !i.templates.includes(t.name));
      config.includes.find(old => old.fp === i.fp)!.templates = [];
    });
    return watcher;
  });

  const extendWatchers = await forEach(config.extends, async e => {
    const watcher = await Watcher.create(e.fp);
    watcher.onChange(async () => {
      logger.info(`External config file ${e.fp} changed, re-parsing`);
      config.templates = config.templates.filter(t => !e.templates.includes(t.name));
      const newTemplates = (await parseConfig(e.fp)).templates;
      config.extends.find(old => old.fp === e.fp)!.templates = newTemplates.map(t => t.name);
      config.templates.push(...newTemplates);
    });
    return watcher;
  });

  const provider = vscode.languages.registerCompletionItemProvider("cpp", {
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
      const text = document.getText();
      const lines = {
        macro: getLine(text, "aliases"),
        alias: getLine(text, "data structures"),
        ds: getLine(text, "algorithms"),
        algo: getLine(text, "main")
      };
      if (lines.macro === -1 || lines.alias === -1 || lines.ds === -1 || lines.algo === -1) {
        return [];
      }

      let macroSpace = false;
      if (getLine(text, "macros") === lines.macro - 1) {
        macroSpace = true;
      } else {
        lines.macro--;
      }
      let aliasSpace = false;
      if (lines.macro === lines.alias - 1) {
        aliasSpace = true;
      } else {
        lines.alias--;
      }

      return config.templates.map(t => {
        const content = getTemplates(config.templates, t, [text]);
        if (!content) {
          return null;
        }

        const completion = new vscode.CompletionItem(t.name, templateTypes[t.type]);
        const edits: vscode.TextEdit[] = [];
        if (content.ds) {
          insertText(edits, lines.ds, content.ds);
        }
        if (content.algo) {
          insertText(edits, lines.algo, content.algo);
        }
        if (content.alias) {
          insertText(edits, lines.alias, content.alias + (aliasSpace ? "\n" : ""));
        }
        if (content.macro) {
          insertText(edits, lines.macro, content.macro + (macroSpace ? "\n" : ""));
        }
        completion.additionalTextEdits = edits;
        return completion;
      }).filter(c => c !== null);
    }
  });

  context.subscriptions.push(provider, configWatcher, ...includeWatchers, ...extendWatchers);
}

export function deactivate() { }