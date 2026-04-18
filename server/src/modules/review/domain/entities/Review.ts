export class Review {
  constructor(
    public studentId: string,
    public targetType: 'course' | 'session',
    public targetId: string,
    public instructorId: string,
    public rating: number,
    public comment: string,
    public helpfulCount: number = 0,
    public isReported: boolean = false,
    public reviewId?: string,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public studentInfo?: { name: string; profileImageUrl?: string },
  ) {}
}
