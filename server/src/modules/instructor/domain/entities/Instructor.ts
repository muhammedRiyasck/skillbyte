


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
    public rejected: boolean,
    public approvalNotes: string | null,
    public approvedBy: string | null,
    public approvedAt: Date | null,
    public averageRating: number,
    public totalReviews: number,
    public _id?: string // Optional ID for database storage
  ) {}

  // ✅ Write methods like this ↓


  suspendAccount() {
    this.accountStatus = "suspended";
  }

  activateAccount() {
    this.accountStatus = "active";
  }

  approve(adminId: string) {
    this.approved = true;
    this.approvedBy = adminId;
    this.approvedAt = new Date();
  }

  updateRating(newRating: number) {
    const totalScore = this.averageRating * this.totalReviews + newRating;
    this.totalReviews += 1;
    this.averageRating = totalScore / this.totalReviews;
  }
}


