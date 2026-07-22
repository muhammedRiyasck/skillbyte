export interface CreateSlotDto {
  instructorId: string;
  title: string;
  description: string;
  duration: 30 | 45 | 60 | 90;
  price: number;
  currency?: string;
  scheduledAt: Date;
  jobTitle?: string;
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

export interface UpdateSlotRequestDto {
  slotId: string;
  data: UpdateSlotDto;
}

export interface SlotFiltersDto {
  search?: string;
  jobTitle?: string;
  minPrice?: number;
  maxPrice?: number;
  fromDate?: Date;
  toDate?: Date;
  tags?: string[];
  page?: number;
  limit?: number;
}

export interface GetInstructorSlotsDto {
  instructorId: string;
  filters?: {
    status?: string;
    fromDate?: Date;
    toDate?: Date;
    page?: number;
    limit?: number;
  };
}
