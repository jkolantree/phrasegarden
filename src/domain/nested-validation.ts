import type {
  ValidationIssue,
  ValidationResult,
} from "./results";

function nestedPath(rootPath: string, childPath: string): string {
  if (childPath === "$") {
    return rootPath;
  }
  if (childPath.startsWith("$.") || childPath.startsWith("$[")) {
    return `${rootPath}${childPath.slice(1)}`;
  }
  return `${rootPath}[${JSON.stringify(childPath)}]`;
}

export function collectNestedValidation<T>(
  result: ValidationResult<T>,
  rootPath: string,
  issues: ValidationIssue[],
): T | undefined {
  if (result.ok) {
    return result.value;
  }
  for (const item of result.issues) {
    issues.push({ ...item, path: nestedPath(rootPath, item.path) });
  }
  return undefined;
}
