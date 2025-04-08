
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Budget {
  id?: string;
  category: string;
  budget: number;
  spent: number;
  user_id?: string;
}

export const useBudgetData = (userId: string | undefined) => {
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Get current month's first and last day for filtering
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

  // Fetch manually created budgets
  const { data: manualBudgets = [], isLoading: isBudgetsLoading } = useQuery({
    queryKey: ['manual-budgets', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      try {
        // Get all expense categories with budget values
        const { data: expensesWithBudget, error: expensesError } = await supabase
          .from('expenses')
          .select('category, budget')
          .eq('user_id', userId)
          .not('budget', 'is', null)
          .order('category');
        
        if (expensesError) {
          console.error('Error fetching budgets:', expensesError);
          throw expensesError;
        }
        
        // Extract unique categories with their budget values
        const budgetMap = new Map();
        
        if (expensesWithBudget) {
          expensesWithBudget.forEach(item => {
            if (!budgetMap.has(item.category) && item.budget !== null) {
              budgetMap.set(item.category, {
                category: item.category,
                budget: item.budget,
                spent: 0,
                user_id: userId
              });
            }
          });
        }
        
        return Array.from(budgetMap.values());
      } catch (error) {
        console.error("Error in fetching budgets:", error);
        return [];
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 30, // Reduced cache time to 30 seconds for more frequent updates
  });

  // Fetch ALL expenses for the current month to calculate spending per category
  const { data: expenses = [], isLoading: isExpensesLoading } = useQuery({
    queryKey: ['expenses-for-budget', userId, firstDay, lastDay],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('expenses')
        .select('category, amount, description, date')
        .eq('user_id', userId)
        .gte('date', firstDay)
        .lte('date', lastDay);
      
      if (error) {
        console.error('Error fetching expenses:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!userId,
    staleTime: 1000 * 30, // Reduced cache time to 30 seconds for more frequent updates
  });

  // Calculate category spending totals
  const categorySpending = expenses.reduce((acc, expense) => {
    // Only include real expenses (exclude budget placeholders)
    if (expense.description !== "Budget category created" || expense.amount > 0) {
      const category = expense.category;
      acc[category] = (acc[category] || 0) + Number(expense.amount);
    }
    return acc;
  }, {} as Record<string, number>);

  // Combine budgets with actual spending
  const budgetsWithSpending: Budget[] = manualBudgets.map(budget => ({
    ...budget,
    spent: categorySpending[budget.category] || 0,
  }));

  const isLoading = isBudgetsLoading || isExpensesLoading;

  return {
    budgetsWithSpending,
    isLoading,
    deletingCategory,
    setDeletingCategory
  };
};
