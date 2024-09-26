import * as vscode from "vscode";
import { logger } from "./logging";

export const templateTypes = {
  ds: vscode.CompletionItemKind.Class,
  macro: vscode.CompletionItemKind.Keyword,
  algo: vscode.CompletionItemKind.Function,
  alias: vscode.CompletionItemKind.Interface
};

export function getTemplates(templates: Template[], template: Template, texts: string[]) : TemplateContents | null {
  if (texts[0].includes(template.template) || texts.includes(template.template)) {
    return null;
  }
  texts.push(template.name);
  const ret = {
    ds: "",
    algo: "",
    alias: "",
    macro: ""
  };
  for (const req of template.requires) {
    const t = templates.find(t => t.name === req);
    if (t) {
      const content = getTemplates(templates, t, texts);
      if (content) {
        if (content.ds) {
          ret.ds += content.ds;
        }
        if (content.algo) {
          ret.algo += content.algo;
        }
        if (content.alias) {
          ret.alias += content.alias;
        }
        if (content.macro) {
          ret.macro += content.macro;
        }
      }
    } else {
      logger.error(`Could not find template ${req} required by ${template.name}`);
    }
  }
  if (ret[template.type]) {
    ret[template.type] += "\n";
  }
  ret[template.type] += template.template;
  return ret;
}