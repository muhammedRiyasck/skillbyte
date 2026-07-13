import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

interface EarningsChartProps {
    itemVariants: Variants;
    chartData: { date: string; amount: number }[];
    USD_TO_INR: number;
}

const EarningsChart: React.FC<EarningsChartProps> = ({ itemVariants, chartData, USD_TO_INR }) => {
    return (
        <motion.div 
            variants={itemVariants}
            className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-700/50"
        >
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Earnings Overview</h3>
                    <p className="text-sm text-slate-500 font-medium">Daily income distribution for this week</p>
                </div>
                <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-xl text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
                    <TrendingUp className="w-4 h-4" />
                    Moving Up
                </div>
            </div>
            
            <div className="h-[400px] w-full">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
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
                                tickFormatter={(val) => `$${val}`}
                            />
                            <Tooltip 
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const val = payload[0].value as number;
                                        return (
                                            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{payload[0].payload.date}</p>
                                                <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">${val.toLocaleString()}</p>
                                                <p className="text-xs font-bold text-slate-500">≈ ₹{Math.round(val * USD_TO_INR).toLocaleString()}</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="amount" 
                                stroke="#6366f1" 
                                strokeWidth={4} 
                                fillOpacity={1} 
                                fill="url(#colorAmount)" 
                                animationDuration={2000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 font-bold">
                        <TrendingUp className="w-12 h-12 mb-4 opacity-20" />
                        No chart data available yet
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default EarningsChart;
