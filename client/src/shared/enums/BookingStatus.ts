export enum BookingStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    REFUNDED = 'refunded',
}

export enum CancelledBy {
    STUDENT = 'student',
    INSTRUCTOR = 'instructor',
    SYSTEM = 'system',
}
