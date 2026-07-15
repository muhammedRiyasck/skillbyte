import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ComposedChart,
    Bar,
    Line,
    Legend
} from 'recharts';

interface EarningsChartProps {
    itemVariants: Variants;
    chartData: { date: string; revenue: number; profit: number; enrollments: number }[];
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
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">30-Day Performance</h3>
                    <p className="text-sm text-slate-500 font-medium">Revenue, net profit, and course enrollments by day</p>
                </div>
                <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-xl text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
                    <TrendingUp className="w-4 h-4" />
                    Moving Up
                </div>
            </div>
            
            <div className="h-[400px] w-full">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                            <XAxis 
                                dataKey="date" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                dy={10}
                                minTickGap={24}
                                tickFormatter={(value: string) => new Date(`${value}T00:00:00Z`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            />
                            <YAxis
                                yAxisId="money"
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                tickFormatter={(val) => `$${val}`}
                            />
                            <YAxis
                                yAxisId="enrollments"
                                orientation="right"
                                allowDecimals={false}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                            />
                            <Legend wrapperStyle={{ fontSize: 12, fontWeight: 700, paddingTop: 16 }} />
                            <Tooltip 
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const point = payload[0].payload as EarningsChartProps['chartData'][number];
                                        return (
                                            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{new Date(`${point.date}T00:00:00Z`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">Revenue: ${point.revenue.toLocaleString()} <span className="text-xs text-slate-500">(₹{Math.round(point.revenue * USD_TO_INR).toLocaleString()})</span></p>
                                                <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">Net profit: ${point.profit.toLocaleString()}</p>
                                                <p className="text-sm font-black text-violet-600 dark:text-violet-400">Enrollments: {point.enrollments}</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar yAxisId="money" dataKey="revenue" name="Revenue" fill="#818cf8" radius={[6, 6, 0, 0]} />
                            <Line yAxisId="money" type="monotone" dataKey="profit" name="Net Profit" stroke="#10b981" strokeWidth={3} dot={false} />
                            <Line yAxisId="enrollments" type="monotone" dataKey="enrollments" name="Enrollments" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                        </ComposedChart>
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
