import React from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface Props {
    data: Array<{ date: string; revenue: number; commission: number }> | undefined;
    itemVariants?: any;
}

const RevenueTrendChart: React.FC<Props> = ({ data, itemVariants }) => {
    return (
        <motion.div 
            variants={itemVariants}
            className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700/50"
        >
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Revenue Analysis</h3>
                    <p className="text-sm text-slate-500 font-medium">Platform growth and commission trend</p>
                </div>
                <div className="flex gap-2">
                     <div className="bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-xl text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Live Status
                     </div>
                </div>
            </div>
            <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data || []}>
                        <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                        <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                            tickFormatter={(v) => `$${v}`}
                        />
                        <Tooltip 
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b pb-2 dark:border-slate-700">{payload[0].payload.date}</p>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between gap-8">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                                                        <span className="text-xs font-bold text-slate-500">Revenue</span>
                                                    </div>
                                                    <span className="text-sm font-black text-slate-900 dark:text-white">${payload[0].value}</span>
                                                </div>
                                                <div className="flex items-center justify-between gap-8">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                        <span className="text-xs font-bold text-slate-500">Commission</span>
                                                    </div>
                                                    <span className="text-sm font-black text-emerald-600">${payload[1].value}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#6366f1" 
                            strokeWidth={4} 
                            fillOpacity={1} 
                            fill="url(#colorRev)" 
                        />
                        <Area 
                            type="monotone" 
                            dataKey="commission" 
                            stroke="#10b981" 
                            strokeWidth={4} 
                            fillOpacity={1} 
                            fill="url(#colorComm)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default RevenueTrendChart;
