import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { ROUTES } from '@core/router/paths';

interface DashboardHeaderProps {
    itemVariants: Variants;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ itemVariants }) => {
    return (
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <motion.h1 
                    variants={itemVariants}
                    className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2"
                >
                    Instructor <span className="text-indigo-600 dark:text-indigo-400">Dashboard</span>
                </motion.h1>
                <motion.p 
                    variants={itemVariants}
                    className="text-slate-500 dark:text-slate-400 font-medium"
                >
                    Monitor your performance, earnings, and schedules in real-time.
                </motion.p>
            </div>
            <motion.div variants={itemVariants}>
                <Link 
                    to={ROUTES.instructor.createCourseBase}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2 group"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    Create New Course
                </Link>
            </motion.div>
        </header>
    );
};

export default DashboardHeader;
