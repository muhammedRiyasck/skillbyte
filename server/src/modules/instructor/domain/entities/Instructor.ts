


export class Instructor {
  constructor(
    public name: string,
    public email: string,
    public passwordHash: string,
    public subject: string,
    public jobTitle: string,
    public experience: number,
    public socialProfile:string,
    public portfolio:string,
    public bio: string | null,
    public profilePictureUrl: string | null,
    public isEmailVerified: boolean,
    public accountStatus: "pending" | "active" | "suspended" | "rejected" ,
    public approved: boolean,
    public suspendNote: string | null,
    public rejected: boolean,
    public rejectedNote:string|null,
    public doneBy: string | null,
    public doneAt: Date | null,
    public averageRating: number,
    public totalReviews: number,
    public instructorId?: string 
  ) {}


}


