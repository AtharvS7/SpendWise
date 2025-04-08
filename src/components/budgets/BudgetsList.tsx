
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { BudgetCard } from "./BudgetCard";
import { useState, memo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Budget {
  id?: string;
  category: string;
  budget: number;
  spent: number;
  user_id?: string;
}

interface BudgetsListProps {
  budgets: Budget[];
  userId: string | undefined;
  onAddBudget: () => void;
}

export const BudgetsList = memo(({ budgets, userId, onAddBudget }: BudgetsListProps) => {
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Effect to refetch budget data when expenses change
  useEffect(() => {
    if (!userId) return;
    
    // Subscribe to ALL changes on expenses table to ensure proper updates
    const subscription = supabase
      .channel('expense-budget-updates')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'expenses',
        filter: `user_id=eq.${userId}` 
      }, () => {
        // Immediately invalidate and refetch all relevant data
        queryClient.invalidateQueries({ queryKey: ['expenses-for-budget'] });
        queryClient.invalidateQueries({ queryKey: ['manual-budgets'] });
        queryClient.invalidateQueries({ queryKey: ['expenses'] });
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient, userId]);

  if (budgets.length === 0) {
    return (
      <div className="col-span-full text-center text-muted-foreground py-8">
        <p className="mb-4">No budget data available yet. Start by adding your first budget category.</p>
        <Button onClick={onAddBudget}>
          <Plus className="mr-2 h-4 w-4" />
          Create Your First Budget
        </Button>
      </div>
    );
  }

  return (
    <>
      {budgets.map((budget, index) => (
        <BudgetCard 
          key={`${budget.category}-${index}`}
          budget={budget} 
          deletingCategory={deletingCategory}
          setDeletingCategory={setDeletingCategory}
        />
      ))}
    </>
  );
});

BudgetsList.displayName = 'BudgetsList';
