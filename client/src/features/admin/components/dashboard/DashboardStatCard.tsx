import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import Pulse from '@/shared/ui/Pulse';

export interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    link: string;
    description: string;
}

interface Props {
    stat: StatCardProps;
    itemVariants?: any;
}

const DashboardStatCard: React.FC<Props> = ({ stat, itemVariants }) => {
    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white dark:bg-slate-800 p-5 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700/50 relative overflow-hidden group transition-all"
        >
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.bgColor} ${stat.color} p-3 rounded-2xl`}>
                        <stat.icon className="w-5 h-5" />
                    </div>
                    <Pulse />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">{stat.value}</h3>
                <p className="text-[10px] text-slate-500 font-bold">{stat.description}</p>
            </div>
            <Link to={stat.link} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="w-4 h-4 text-slate-400 hover:text-indigo-600" />
            </Link>
            <div className={`absolute -bottom-6 -right-6 w-20 h-20 ${stat.bgColor} opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`}></div>
        </motion.div>
    );
};

export default DashboardStatCard;
