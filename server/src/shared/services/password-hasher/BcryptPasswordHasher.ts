import bcrypt from 'bcryptjs';
import { IPasswordHasher } from './IPasswordHasher';

/** Handles bcrypt password hasher functionality. */
export class BcryptPasswordHasher implements IPasswordHasher {
  constructor(private readonly saltRounds: number = 10) {}

  /**
   * Hash for the BcryptPasswordHasher entity.
   *
   * @param password - The password information.
   * @returns The result of the operation.
   */
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Compare for the BcryptPasswordHasher entity.
   *
   * @param plain - The plain information.
   * @param hashed - The hashed information.
   * @returns The result of the operation.
   */
  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}

export const passwordHasher = new BcryptPasswordHasher();
