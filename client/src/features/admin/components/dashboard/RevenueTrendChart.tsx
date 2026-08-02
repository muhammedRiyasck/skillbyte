import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { getRevenueTrendByYear } from '../../services/DashboardService';

interface TrendData {
    date: string;
    revenue: number;
    commission: number;
}

interface Props {
    data: TrendData[] | undefined;
    itemVariants?: Variants;
}

const RevenueTrendChart: React.FC<Props> = ({ data: initialData, itemVariants }) => {
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState<number>(currentYear);
    const [chartData, setChartData] = useState<TrendData[]>(initialData || []);
    const [loading, setLoading] = useState(false);

    // Available years: from 2023 up to current year
    const availableYears = Array.from(
        { length: currentYear - 2022 },
        (_, i) => 2023 + i
    );

    useEffect(() => {
        // On first load, if selected year is current, use the initial data from the dashboard payload
        if (selectedYear === currentYear && initialData && initialData.length > 0) {
            setChartData(initialData);
            return;
        }
        const fetchTrend = async () => {
            setLoading(true);
            try {
                const res = await getRevenueTrendByYear(selectedYear);
                setChartData(res?.data || []);
            } catch {
                console.error('Failed to fetch revenue trend');
            } finally {
                setLoading(false);
            }
        };
        fetchTrend();
    }, [selectedYear, initialData, currentYear]);

    const handlePrevYear = () => {
        if (selectedYear > availableYears[0]) setSelectedYear(y => y - 1);
    };

    const handleNextYear = () => {
        if (selectedYear < currentYear) setSelectedYear(y => y + 1);
    };

    return (
        <motion.div
            {...(itemVariants && { variants: itemVariants })}
            className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700/50"
        >
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Revenue Analysis</h3>
                    <p className="text-sm text-slate-500 font-medium">Platform growth and commission trend</p>
                </div>

                {/* Year Selector */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrevYear}
                        disabled={selectedYear <= availableYears[0]}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-30 transition-all cursor-pointer"
                    >
                        <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    </button>

                    <div className="flex gap-1">
                        {availableYears.map(year => (
                            <button
                                key={year}
                                onClick={() => setSelectedYear(year)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    selectedYear === year
                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                }`}
                            >
                                {year}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleNextYear}
                        disabled={selectedYear >= currentYear}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-30 transition-all cursor-pointer"
                    >
                        <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    </button>

                    <div className="bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-xl text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2 ml-2">
                        <Activity className="w-4 h-4" />
                        {selectedYear === currentYear ? 'Live' : selectedYear}
                    </div>
                </div>
            </div>

            <div className="h-[350px] w-full relative">
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-slate-800/60 rounded-2xl z-10">
                        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
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
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b pb-2 dark:border-slate-700">
                                                {payload[0].payload.date} {selectedYear}
                                            </p>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between gap-8">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                                                        <span className="text-xs font-bold text-slate-500">Revenue</span>
                                                    </div>
                                                    <span className="text-sm font-black text-slate-900 dark:text-white">${payload[0]?.value || 0}</span>
                                                </div>
                                                <div className="flex items-center justify-between gap-8">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                        <span className="text-xs font-bold text-slate-500">Commission</span>
                                                    </div>
                                                    <span className="text-sm font-black text-emerald-600">${payload[1]?.value || 0}</span>
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
