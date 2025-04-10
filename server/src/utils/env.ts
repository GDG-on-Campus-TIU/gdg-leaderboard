import fs from "fs";

/**
 * Reads environment variables, prioritizing `_FILE` variants.
 * If the `_FILE` variant exists, it reads the value from the file.
 * Otherwise, it falls back to the standard environment variable.
 * @example
 * ```ts
 * // if the environment variable MY_VAR_FILE exists, it will read from that file
 * // otherwise, it will return the value of MY_VAR
 * const myVar = getEnv("MY_VAR");
 * ```
 *
 * @param key - The environment variable key.
 * @returns The value of the environment variable or file content.
 */
export const getEnv = (key: string): string | undefined => {
  const fileKey = `${key}_FILE`;
  if (process.env[fileKey]) {
    try {
      return fs.readFileSync(process.env[fileKey], "utf8").trim();
    } catch (error) {
      console.error(`Error reading file for ${fileKey}:`, error);
    }
  }
  return process.env[key];
};
