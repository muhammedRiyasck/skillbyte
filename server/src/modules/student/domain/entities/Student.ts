/**
 * Represents a Student entity in the domain layer.
 * Encapsulates student data and business logic.
 */
export class Student {
  /**
   * Creates a new Student instance.
   * @param name - The student's full name.
   * @param email - The student's email address.
   * @param passwordHash - The hashed password.
   * @param isEmailVerified - Whether the email is verified (optional).
   * @param registeredVia - Registration method ('google' or 'local').
   * @param profilePictureUrl - URL of the profile picture (optional).
   * @param accountStatus - Account status ('active', 'block', etc.).
   * @param _id - Unique identifier (optional, set by database).
   */
  constructor(
    public name: string,
    public email: string,
    public passwordHash: string,
    public isEmailVerified?: boolean,
    public registeredVia: 'google' | 'local' = 'local',
    public profilePictureUrl?: string | null,
    public accountStatus: string = 'active',
    public studentId?: string
  ) {}

}

