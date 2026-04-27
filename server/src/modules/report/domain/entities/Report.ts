export class Report {
  constructor(
    public reportedBy: string, // Student ID
    public targetType: 'review' | 'course' | 'lesson',
    public targetId: string,
    public reason: string,
    public description: string | undefined,
    public status: 'pending' | 'dismissed' | 'actioned' = 'pending',
    public _id?: string,
    public createdAt?: Date,
    public updatedAt?: Date,
    public studentInfo?: { name: string; profilePictureUrl?: string },
    public targetDetails?: {
      title?: string; // For course/lesson
      comment?: string; // For review
      rating?: number; // For review
    },
  ) {}
}
