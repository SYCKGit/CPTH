import * as vscode from "vscode";
import { logger, asRelativePath, forEach, templateTypes } from "./utils";

export async function parseTemplateFile(fp: string): Promise<Template[]> {
  logger.info(`Parsing template file ${fp}`);
  const uri = asRelativePath(fp);
  const stat = await vscode.workspace.fs.stat(uri);
  const templates: Template[] = [];

  if (stat.type === vscode.FileType.Directory) {
    const files = await vscode.workspace.fs.readDirectory(uri);
    await forEach(files, async ([name, _]) => {
      const nw = await parseTemplateFile(`${fp}/${name}`);
      templates.push(...nw);
    });
  }

  else if (stat.type === vscode.FileType.File && fp.endsWith(".cpp")) {
    const buffer = await vscode.workspace.fs.readFile(uri);
    const lines = buffer.toString().split("\n");

    if (!lines[0].startsWith("// @template")) {
      logger.info(`${fp} is not a template file`);
      return [];
    }
    const name = lines[0].slice(12).trim();

    let requires: string[] = [];
    if (lines.length > 1 && lines[1].startsWith("// @requires")) {
      requires = lines[1].slice(12).split(",").map(s => s.trim());
    }

    let start = -1, type: TemplateType = "ds";
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("// START DATA STRUCTURE")) {
        start = i + 1;
        break;
      }
      if (lines[i].startsWith("// START ALGORITHM")) {
        start = i + 1;
        type = "algo";
        break;
      }
    }

    if (start !== -1) {
      logger.info(`Found template ${name} of type ${type} in ${fp}`);
      templates.push({
        name,
        type,
        requires,
        template: lines.slice(start).join("\n") + "\n"
      });
    } else {
      logger.error(`Could not find template in ${fp}`);
    }
  }

  logger.info(`Parsed ${templates.length} templates from ${fp}`);

  return templates;
}

export async function parseConfig(fp: string = "cpth.config.json"): Promise<Config> {
  const base = fp.split("/").slice(0, -1).join("/");
  const configUri = asRelativePath(fp);
  const configBuffer = await vscode.workspace.fs.readFile(configUri);
  const rawConfig: RawConfig = JSON.parse(configBuffer.toString());
  const config: Config = { templates: [], extends: [], includes: [] };

  await forEach(rawConfig.templates, async t => {
    if (!t.name) {
      logger.error("Template must have a name");
      return;
    }
    if (typeof t.name !== "string") {
      logger.error("Template name must be a string");
      return;
    }
    t.type = t.type || "alias";
    if (!templateTypes[t.type]) {
      logger.error(`Template type must be one of ${Object.keys(templateTypes).join(", ")}`);
      return;
    }
    if (!t.template) {
      logger.error("Template must have either a template or a templateFile");
      return;
    }
    if (t.template && typeof t.template !== "string" && !Array.isArray(t.template)) {
      logger.error("template must be a string or an array of strings");
      return;
    }
    if (Array.isArray(t.template)) {
      logger.info(`${t.name} is an array`);
      t.template = t.template.join("\n");
    }
    if (t.type === "ds" || t.type === "algo") {
      t.template += "\n";
    }
    config.templates.push({
      name: t.name,
      type: t.type,
      requires: t.requires || [],
      template: t.template
    });
  });

  await forEach(rawConfig.includes, async fp => {
    const templates = await parseTemplateFile(`${base}/${fp}`);
    config.includes.push({ fp, templates: templates.map(t => t.name) });
    config.templates.push(...templates);
  });

  await forEach(rawConfig.extends, async fp => {
    const subConfig = await parseConfig(fp);
    config.extends.push({ fp, templates: subConfig.templates.map(t => t.name) });
    config.templates.push(...subConfig.templates);
  });

  return config;
}