export class Email {
  constructor(public readonly value: string) {
    if (!this.isValidEmail(value)) {
      throw new Error('Invalid email address');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
// This class represents an email address and ensures that it is valid.
