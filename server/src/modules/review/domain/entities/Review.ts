export class Review {
  constructor(
    public studentId: string,
    public targetType: 'course' | 'session',
    public targetId: string,
    public instructorId: string,
    public rating: number,
    public comment: string,
    public helpfulCount: number = 0,
    public isHidden: boolean = false,
    public reviewId?: string,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public studentInfo?: { name: string; profileImageUrl?: string },
    public instructorReply?: string,
    public repliedAt?: Date,
    public targetName?: string,
  ) {}
}
