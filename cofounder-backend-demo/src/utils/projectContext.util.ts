// utils/projectContext.util.ts

import { ProjectContext } from "../types/projectContext.types";

/**
 * Deep merge new partial metadata into existing ProjectContext.
 * Only updates the fields provided in `updates`, preserves the rest.
 */

function isObject(val: any): val is Record<string, any> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

function deepMergeProjectContext(
  existing: Partial<ProjectContext>,
  updates: Partial<ProjectContext>
): Partial<ProjectContext> {
  const result: Partial<ProjectContext> = { ...existing };

  for (const key in updates) {
    const typedKey = key as keyof ProjectContext;

    const existingValue = result[typedKey];
    const updateValue = updates[typedKey];

    if (isObject(existingValue) && isObject(updateValue)) {
      result[typedKey] = {
        ...existingValue,
        ...updateValue,
      } as any;
    } else {
      result[typedKey] = updateValue as any;
    }
  }

  return result;
}

export { deepMergeProjectContext };
