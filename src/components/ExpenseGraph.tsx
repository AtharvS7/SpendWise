
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subMonths, format } from "date-fns";
import { BarChart3, LineChart as LineChartIcon } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

export const ExpenseGraph = () => {
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses-graph'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Generate last 6 months for data points
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return format(date, 'MMM');
  }).reverse();

  // Calculate monthly totals
  const monthlyData = months.map(month => {
    const monthExpenses = expenses.filter(exp => 
      format(new Date(exp.date), 'MMM') === month
    );
    
    return {
      month,
      expenses: monthExpenses.reduce((sum, exp) => sum + exp.amount, 0),
      income: 0, // This would need to be calculated from income data if needed
      budget: 0, // This would need to be set from budget data if needed
    };
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (monthlyData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No expense data available
      </div>
    );
  }

  const currentMonth = monthlyData[monthlyData.length - 1];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <Card className="overflow-hidden border-none shadow-sm bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-700">
          <CardHeader className="pb-2 space-y-0 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <LineChartIcon className="h-4 w-4 text-blue-500" />
              Monthly Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-300">
              ₹{currentMonth.expenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Current month's total
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="expenses" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="expenses" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900/30">
            <LineChartIcon className="h-4 w-4 mr-2" />
            Expenses Trend
          </TabsTrigger>
          <TabsTrigger value="comparison" className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/30">
            <BarChart3 className="h-4 w-4 mr-2" />
            Monthly Overview
          </TabsTrigger>
        </TabsList>
        <TabsContent value="expenses">
          <div className="h-[300px] p-2 rounded-lg">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <XAxis
                  dataKey="month"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: 'none'
                  }}
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN', {minimumFractionDigits: 2})}`, 'Expenses']}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  dot={{ fill: "#8B5CF6", strokeWidth: 2 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
        <TabsContent value="comparison">
          <div className="h-[300px] p-2 rounded-lg">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis
                  dataKey="month"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: 'none'
                  }}
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN', {minimumFractionDigits: 2})}`, 'Expenses']}
                />
                <Bar 
                  dataKey="expenses" 
                  fill="#8B5CF6" 
                  radius={[4, 4, 0, 0]} 
                  name="Expenses" 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
