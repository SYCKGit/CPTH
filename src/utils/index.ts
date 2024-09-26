export * from "./code";
export * from "./templates";
export * from "./logging";

import { logger } from "./logging";

export async function forEach<T, Ret>(arr: T[] | undefined = [], cb: (t: T) => Promise<Ret>) : Promise<Ret[]> {
  return await Promise.all(arr.map(cb));
}

export function getLine(text: string, comment: string) {
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith(`// ${comment.toUpperCase()}`)) {
      return i;
    }
  }
  const message = `Could not find comment // ${comment.toUpperCase()}`;
  logger.warn(message);
  return -1;
}