
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "./ui/skeleton";
import { PieChartIcon } from "lucide-react";

export const ExpensePieChart = () => {
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses-pie'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate category totals
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
  }));

  // Enhanced gradient color palette
  const COLORS = [
    '#8B5CF6', // Purple
    '#4ADE80', // Green
    '#F472B6', // Pink
    '#FB923C', // Orange
    '#60A5FA', // Blue
    '#6366F1', // Indigo
    '#EC4899', // Pink
    '#F97316', // Orange
    '#A78BFA', // Light purple
    '#34D399', // Emerald
    '#FCD34D', // Yellow
    '#38BDF8'  // Sky blue
  ];

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-purple-100/30 dark:border-slate-700/50">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Expense Distribution</h3>
        </div>
        <Skeleton className="w-full h-[300px] rounded-lg dark:bg-slate-700" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-purple-100/30 dark:border-slate-700/50">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Expense Distribution</h3>
        </div>
        <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700 p-6">
          <PieChartIcon className="h-12 w-12 text-purple-200 dark:text-purple-800 mb-4" />
          <p className="text-center font-medium text-purple-900 dark:text-purple-300">
            No expense data available
          </p>
          <p className="text-sm text-center opacity-70 mt-1 max-w-xs">
            Add expenses to see your spending distribution across different categories
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-purple-100/30 dark:border-slate-700/50 hover:shadow-lg transition-shadow duration-300">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 flex items-center">
          <PieChartIcon className="h-5 w-5 text-purple-500 dark:text-purple-400 mr-2" />
          Expense Distribution
        </h3>
      </div>
      <div className="w-full h-[300px] sm:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              fill="#8884d8"
              paddingAngle={4}
              dataKey="value"
              labelLine={false}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  stroke="none"
                  className="hover:opacity-80 transition-opacity"
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
              contentStyle={{ 
                borderRadius: '8px', 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                border: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.97)'
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              formatter={(value) => <span style={{color: document.documentElement.classList.contains('dark') ? '#ddd' : '#666', fontWeight: 500}}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
