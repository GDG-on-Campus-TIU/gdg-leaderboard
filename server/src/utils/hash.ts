import bcrypt from "bcryptjs";

/**
 * @description Hashes a password using `bcryptjs` library to store passwords securely.
 * @example
 * ```ts
 * const hashedPassword = await hashPassword("mySecretPassword");
 * ```
 *
 * @param password - The password to be hashed.
 * @returns { string } - The hashed password.
 */
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

/**
 * @description Compares a password with a hashed password using `bcryptjs` library.
 * @example
 * ```ts
 * const isMatch = await comparePassword("mySecretPassword", hashedPassword);
 * ```
 *
 * @param password - The password to be compared.
 * @param hashedPassword - The hashed password to compare against.
 * @returns { boolean } - True if the password matches the hashed password, false otherwise.
 */
const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
};

/**
 * @description Utility functions for hashing and comparing passwords.
 * @example
 * ```ts
 * const hashedPassword = await hashPassword("mySecretPassword");
 * ```
 * @example
 * ```ts
 * const isMatch = await comparePassword("mySecretPassword", hashedPassword);
 * ```
 */
export const Utils = {
  hashPassword,
  comparePassword,
};
