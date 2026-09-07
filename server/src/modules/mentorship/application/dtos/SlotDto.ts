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

export interface CreateRecurringSlotDto {
  instructorId: string;
  title: string;
  description: string;
  duration: 30 | 45 | 60 | 90;
  price: number;
  currency?: string;
  jobTitle?: string;
  tags?: string[];
  timezone?: string;
  timezoneOffset?: number; // client timezone offset in minutes, e.g. -330
  recurrence: {
    frequency: 'daily' | 'weekly';
    daysOfWeek?: number[];
    startDate: Date;
    endDate: Date;
    time: string; // HH:mm format
  };
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
