import bcrypt from 'bcryptjs';
import { IPasswordHasher } from './IPasswordHasher';

export class BcryptPasswordHasher implements IPasswordHasher {
  constructor(private readonly saltRounds: number = 10) {}

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}

export const passwordHasher = new BcryptPasswordHasher();
