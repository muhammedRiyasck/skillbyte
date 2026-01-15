export interface CreateSlotDto {
  instructorId: string;
  title: string;
  description: string;
  duration: 30 | 45 | 60 | 90;
  price: number;
  currency: string;
  scheduledAt: Date;
  jobTitle: string;
  tags?: string[];
  timezone?: string;
}

export interface UpdateSlotDto {
  title?: string;
  description?: string;
  duration?: 30 | 45 | 60 | 90;
  price?: number;
  currency?: string;
  scheduledAt?: Date;
  jobTitle?: string;
  tags?: string[];
  timezone?: string;
}

export interface SlotFiltersDto {
  jobTitle?: string;
  minPrice?: number;
  maxPrice?: number;
  fromDate?: Date;
  toDate?: Date;
  tags?: string[];
}
