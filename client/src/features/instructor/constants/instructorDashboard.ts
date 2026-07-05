import { ROUTES } from "@/core/router/paths";
import { BookOpen, Calendar, TrendingUp, Users } from "lucide-react";

export function getStats(totalProfitUSD: number, totalStudents: number, courses: unknown[], bookings: unknown[]) {
    const USD_TO_INR = 83;
    const totalProfitINR = Math.round(totalProfitUSD * USD_TO_INR);
    
    return [
        {
            label: 'Net Profit',
            value: `$${totalProfitUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            subValue: `₹${totalProfitINR.toLocaleString()}`,
            icon: TrendingUp,
            color: 'text-green-600',
            bgColor: 'bg-green-100 dark:bg-green-900/30',
            link: ROUTES.instructor.earnings
        },
        {
            label: 'Total Students',
            value: totalStudents,
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100 dark:bg-blue-900/30',
            link: ROUTES.instructor.enrollments
        },
        {
            label: 'Total Courses',
            value: courses.length,
            icon: BookOpen,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100 dark:bg-purple-900/30',
            link: ROUTES.instructor.myCourses
        },
        {
            label: 'Upcoming Sessions',
            value: bookings.length,
            icon: Calendar,
            color: 'text-teal-600',
            bgColor: 'bg-teal-100 dark:bg-teal-900/30',
            link: ROUTES.instructor.mentorship.bookings
        }
    ]
}
