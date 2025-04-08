
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseGraph } from "@/components/ExpenseGraph";
import { ExpensePieChart } from "@/components/ExpensePieChart";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, LineChart, PieChart, Wallet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const Analytics = () => {
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate top expense category
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categoryTotals).reduce(
    (top, [category, amount]) => 
      (!top || amount > top.amount) ? { category, amount } : top,
    null as { category: string; amount: number } | null
  );

  // Get average daily expense
  const calculateDailyAverage = () => {
    if (expenses.length === 0) return 0;
    
    const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    // Assume the expenses span at least one day, or use actual date range if needed
    return totalExpense / Math.max(1, expenses.length);
  };

  const dailyAverage = calculateDailyAverage();

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8">
            Financial Analytics
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">
            Financial Analytics
          </h1>
          <p className="text-muted-foreground">Analyze your spending patterns and financial health</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-gray-700">
            <CardHeader className="pb-2 space-y-0 flex flex-row items-center justify-between border-b border-purple-100/30 dark:border-gray-600/30">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <PieChart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                Top Expense Category
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-purple-800 dark:text-purple-300">
                {topCategory ? topCategory.category : 'No expenses yet'}
              </div>
              {topCategory && (
                <p className="text-muted-foreground text-sm mt-1">
                  ₹{topCategory.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} total
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-700">
            <CardHeader className="pb-2 space-y-0 flex flex-row items-center justify-between border-b border-blue-100/30 dark:border-gray-600/30">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                ₹{expenses.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                {expenses.length} transactions
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-gray-700">
            <CardHeader className="pb-2 space-y-0 flex flex-row items-center justify-between border-b border-green-100/30 dark:border-gray-600/30">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart className="h-4 w-4 text-green-600 dark:text-green-400" />
                Daily Average
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-800 dark:text-green-300">
                ₹{dailyAverage.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                Per day average
              </p>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8 bg-gradient-to-r from-transparent via-purple-200 to-transparent dark:via-purple-900/30" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2 space-y-0 flex flex-row items-center justify-between border-b border-blue-100/30 dark:border-gray-600/30">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <LineChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Expense Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-6">
              <div className="min-h-[400px]">
                <ExpenseGraph />
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2 space-y-0 flex flex-row items-center justify-between border-b border-purple-100/30 dark:border-gray-600/30">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <PieChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                Expense Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-6">
              <div className="min-h-[400px]">
                <ExpensePieChart />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
