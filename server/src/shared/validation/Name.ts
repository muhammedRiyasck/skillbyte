export class Name {
 constructor(public readonly value: string) {
    if (!this.isValidName(value)) {
      throw new Error('Invalid email address');
    }
  }

  private isValidName(name: string): boolean {
    // A simple validation for names: must be at least 2 characters long and contain only letters and spaces
    const nameRegex = /^[A-Za-z\s]{2,}$/;
    return nameRegex.test(name);
  }
}
