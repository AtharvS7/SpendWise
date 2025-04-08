
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AddExpenseButton } from "@/components/AddExpenseButton";
import { ExpenseHeader } from "@/components/expenses/ExpenseHeader";
import { ExpenseFilters } from "@/components/expenses/ExpenseFilters";
import { ExpenseStats } from "@/components/expenses/ExpenseStats";
import { ExpenseContent } from "@/components/expenses/ExpenseContent";
import { useIsMobile } from "@/hooks/use-mobile";

const Expenses = () => {
  const [timeFrame, setTimeFrame] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const isMobile = useIsMobile();

  // Fetch user session
  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const userId = session?.user?.id;

  // Fetch all expenses
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['expenses', userId, timeFrame, categoryFilter],
    queryFn: async () => {
      if (!userId) return [];
      
      let query = supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId);
      
      // Apply time filter
      const now = new Date();
      if (timeFrame === 'today') {
        const today = new Date().toISOString().split('T')[0];
        query = query.gte('date', today);
      } else if (timeFrame === 'week') {
        const weekAgo = new Date(now.setDate(now.getDate() - 7)).toISOString();
        query = query.gte('date', weekAgo);
      } else if (timeFrame === 'month') {
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
        query = query.gte('date', monthAgo);
      }
      
      // Apply category filter
      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }
      
      // Order by date
      query = query.order('date', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching expenses:", error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch categories for filter dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ['expense-categories', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('expenses')
        .select('category')
        .eq('user_id', userId)
        .order('category');
      
      if (error) throw error;
      
      // Extract unique categories
      const uniqueCategories = [...new Set(data.map(item => item.category))];
      return uniqueCategories;
    },
    enabled: !!userId,
  });

  // Exclude budget placeholders from display
  const filteredTransactions = transactions.filter(t => 
    !(t.amount === 0 && t.description === "Budget category created")
  );

  const totalExpenses = filteredTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const dailyAverage = filteredTransactions.length > 0 ? totalExpenses / filteredTransactions.length : 0;

  if (sessionLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
          <p className="text-purple-600 font-medium">Loading your expenses...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="p-8 text-center rounded-xl bg-white/80 backdrop-blur-sm shadow-md border border-purple-100 max-w-lg mx-auto mt-12">
        <h2 className="text-2xl font-semibold mb-4 text-purple-800">Please log in to view your expenses</h2>
        <p className="text-muted-foreground">You need to be logged in to access this feature.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full">
      <div className="max-w-7xl mx-auto space-y-8 py-4">
        <div className={`flex flex-col mb-8 gap-4 fade-in ${isMobile ? 'px-4' : ''}`}>
          <ExpenseHeader transactions={filteredTransactions} />
          <ExpenseFilters 
            timeFrame={timeFrame}
            setTimeFrame={setTimeFrame}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            categories={categories}
            transactions={filteredTransactions}
          />
        </div>
        
        <ExpenseStats
          totalExpenses={totalExpenses}
          dailyAverage={dailyAverage}
        />

        <ExpenseContent transactions={filteredTransactions} />

        <AddExpenseButton />
      </div>
    </div>
  );
};

export default Expenses;
