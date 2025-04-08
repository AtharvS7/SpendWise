
import { useState, useEffect } from "react";
import { Loader2, PieChart, CalendarClock } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AddExpenseButton } from "@/components/AddExpenseButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { useBudgetData } from "@/hooks/use-budget-data";
import { BudgetsList } from "@/components/budgets/BudgetsList";
import { AddBudgetDialog } from "@/components/budgets/AddBudgetDialog";
import { format } from "date-fns";

const Budgets = () => {
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);
  const isMobile = useIsMobile();
  const currentMonth = format(new Date(), 'MMMM yyyy');
  const queryClient = useQueryClient();

  // Setup realtime subscription to update budgets when expenses change
  useEffect(() => {
    const subscription = supabase
      .channel('budget-expenses-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'expenses' 
      }, () => {
        // Invalidate and immediately refetch all relevant data
        queryClient.invalidateQueries({ queryKey: ['expenses-for-budget'] });
        queryClient.invalidateQueries({ queryKey: ['manual-budgets'] });
        queryClient.invalidateQueries({ queryKey: ['budget-categories-for-dropdown'] });
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  // Fetch user session with shorter stale time for more frequent updates
  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
    staleTime: 1000 * 30, // 30 seconds
  });

  // Get user ID
  const userId = session?.user?.id;

  // Get budget data with optimized hook
  const { budgetsWithSpending, isLoading, deletingCategory, setDeletingCategory } = useBudgetData(userId);

  const handleAddBudgetClick = () => {
    setIsAddBudgetOpen(true);
  };

  if (isSessionLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
          <p className="text-purple-600 font-medium">Loading your budgets...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="p-8 text-center rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-md border border-purple-100 dark:border-slate-700 max-w-lg mx-auto mt-12">
        <h2 className="text-2xl font-semibold mb-4 text-purple-800 dark:text-purple-300">Please log in to view your budgets</h2>
        <p className="text-muted-foreground">You need to be logged in to access this feature.</p>
      </div>
    );
  }

  return (
    <div className={isMobile ? "p-4" : "p-8"}>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-3 mb-8 fade-in">
          <div className="p-2 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/50 dark:to-indigo-900/50 rounded-full">
            <PieChart className="h-6 w-6 text-purple-700 dark:text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold fade-in">
            Budget Management
          </h1>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-purple-700 dark:text-purple-400" />
            <h2 className="text-lg font-medium text-gray-700 dark:text-gray-200">{currentMonth}</h2>
          </div>
          <AddBudgetDialog 
            userId={userId} 
            existingBudgets={budgetsWithSpending}
          />
        </div>
        
        <div className="grid grid-cols-1 gap-6 fade-in">
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <BudgetsList 
                budgets={budgetsWithSpending} 
                userId={userId}
                onAddBudget={handleAddBudgetClick}
              />
            </div>
          </div>
        </div>
        
        {/* Add expense floating button */}
        <AddExpenseButton />
      </div>
    </div>
  );
};

export default Budgets;
