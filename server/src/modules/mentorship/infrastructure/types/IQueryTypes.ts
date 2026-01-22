
export interface findByInstructorIdQueryType {
      instructorId: string;
      status?: 'available' | 'booked' | 'cancelled';
      scheduledAt?: {
        $gte?: Date;
        $lte?: Date;
      };
      
  }

    export interface findAvailableSlotsType {
      status?: {
        $in?: ['available', 'booked'];
      }
      scheduledAt?: {
        $gte?: Date;
        $lte?: Date;
      };
      price?: {
        $lte?: number;
        $gte?: number;
      }
      tags?: {
        $in?: string[];
      }
      
    }
