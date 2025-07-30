export class Student  {
   constructor(
    public name: string,
    public email: string,
    public passwordHash: string,
    public isEmailVerified?: boolean ,
    public profilePictureUrl?:string | null,
    public accountStatus: string = 'active',
    public _id?: string
  ) {}

  changePassword(newPasswordHash: string) {
    this.passwordHash = newPasswordHash;
  }
}

