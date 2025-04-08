
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, AlertTriangle, Wallet } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { memo, useEffect, useState } from "react";

interface Budget {
  id?: string;
  category: string;
  budget: number;
  spent: number;
  user_id?: string;
}

interface BudgetCardProps {
  budget: Budget;
  deletingCategory: string | null;
  setDeletingCategory: (category: string | null) => void;
}

// Using memo to prevent unnecessary re-renders
export const BudgetCard = memo(({ budget, deletingCategory, setDeletingCategory }: BudgetCardProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const percentSpent = (budget.spent / budget.budget) * 100;
  const isOverBudget = budget.spent > budget.budget;
  const isCloseToLimit = percentSpent > 80 && !isOverBudget;
  
  // Animation effect for progress bar
  useEffect(() => {
    // Start with current value
    setAnimatedProgress(0);
    
    // Animate to new value
    const timer = setTimeout(() => {
      setAnimatedProgress(Math.min(percentSpent, 100));
    }, 100);
    
    return () => clearTimeout(timer);
  }, [percentSpent]);

  // Delete budget mutation
  const deleteBudgetMutation = useMutation({
    mutationFn: async (category: string) => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      
      if (!userId) throw new Error("User not logged in");
      
      // Find the budget placeholder expense
      const { data: budgetPlaceholder, error: fetchError } = await supabase
        .from('expenses')
        .select('id')
        .eq('user_id', userId)
        .eq('category', category)
        .eq('description', 'Budget category created');
      
      if (fetchError) throw fetchError;
      
      // Delete the budget placeholder
      if (budgetPlaceholder && budgetPlaceholder.length > 0) {
        const { error: deleteError } = await supabase
          .from('expenses')
          .delete()
          .in('id', budgetPlaceholder.map(e => e.id));
        
        if (deleteError) throw deleteError;
      }
      
      return { success: true };
    },
    onSuccess: (_, category) => {
      // Update all relevant queries
      queryClient.invalidateQueries({ queryKey: ['manual-budgets'] });
      queryClient.invalidateQueries({ queryKey: ['expenses-for-budget'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['budget-categories-for-dropdown'] });
      
      toast({
        title: "Success",
        description: `${category} budget deleted successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete budget",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setDeletingCategory(null);
    }
  });

  // Determine progress bar color based on budget status
  const getProgressBarColor = () => {
    if (isOverBudget) return "bg-red-500";
    if (isCloseToLimit) return "bg-yellow-500";
    return "bg-green-500";
  };

  const handleDeleteClick = (category: string) => {
    setDeletingCategory(category);
    deleteBudgetMutation.mutate(category);
  };

  const remaining = budget.budget - budget.spent;

  return (
    <Card className={`hover:shadow-lg transition-shadow duration-300 ${isOverBudget ? 'border-red-300' : isCloseToLimit ? 'border-yellow-300' : 'border-green-200'}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Wallet className="h-4 w-4 text-purple-600" />
          {budget.category}
        </CardTitle>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className={isMobile ? "w-[95vw] p-4" : ""}>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Budget</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the {budget.category} budget? This will remove the budget tracking for this category.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => handleDeleteClick(budget.category)}
                className="bg-destructive text-destructive-foreground"
              >
                {deleteBudgetMutation.isPending && deletingCategory === budget.category ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Progress 
            value={animatedProgress} 
            className={isOverBudget ? "bg-red-200" : isCloseToLimit ? "bg-yellow-200" : "bg-green-100"}
            indicatorClassName={getProgressBarColor()} 
          />
          <div className="flex justify-between text-sm">
            <span className={isOverBudget ? "text-red-500 font-semibold" : "text-muted-foreground"}>
              ₹{budget.spent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-muted-foreground">
              ₹{budget.budget.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="text-xs text-right text-muted-foreground">
            {isOverBudget ? (
              <span className="flex items-center justify-end gap-1 text-red-500">
                <AlertTriangle className="h-3 w-3" />
                Over budget by ₹{(budget.spent - budget.budget).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            ) : (
              <span>Remaining: ₹{remaining.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

BudgetCard.displayName = 'BudgetCard';
