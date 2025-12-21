export interface IPaymentHistory {
  data: {
    _id: string;
    courseId: {
      _id: string;
      title: string;
      thumbnailUrl?: string;
    };
    amount: number;
    currency: string;
    status: string;
    createdAt: Date;
    stripePaymentIntentId: string;
  }[];
  totalCount: { count: number }[];
}

export interface IInstructorEarnings {
  data: {
    _id: string;
    userId: {
      _id: string;
      name: string;
      email: string;
    };
    courseId: {
      _id: string;
      title: string;
      thumbnailUrl?: string;
    };
    amount: number; // Total price
    adminFee: number;
    instructorAmount: number; // Net profit
    currency: string;
    status: string;
    createdAt: Date;
  }[];
  totalCount: { count: number }[];
  totalRevenue: { total: number }[];
  totalProfit: { total: number }[];
}
