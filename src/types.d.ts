declare type TemplateType = "ds" | "algo" | "alias" | "macro";

declare type RawTemplate = {
  name?: string;
  type?: TemplateType;
  requires?: string[];
  template?: string | string[];
};

declare type Template = {
  name: string;
  type: TemplateType;
  requires: string[];
  template: string;
}

declare type RawConfig = {
  templates?: RawTemplate[];
  extends?: string[];
  includes?: string[];
}

declare type ExternalTemplates = {
  fp: string;
  templates: string[];
};

declare type Config = {
  templates: Template[];
  extends: ExternalTemplates[];
  includes: ExternalTemplates[];
};

declare type TemplateContents = {
  ds: string;
  algo: string;
  alias: string;
  macro: string;
};