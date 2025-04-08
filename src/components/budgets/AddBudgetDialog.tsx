
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

interface AddBudgetDialogProps {
  userId: string | undefined;
  existingBudgets: Array<{ category: string }>;
}

export const AddBudgetDialog = ({ userId, existingBudgets }: AddBudgetDialogProps) => {
  const [newCategory, setNewCategory] = useState("");
  const [newBudget, setNewBudget] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  // Add budget mutation
  const addBudgetMutation = useMutation({
    mutationFn: async (newBudget: { category: string, budget: number, user_id: string }) => {
      // Create a placeholder expense with budget value
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          category: newBudget.category,
          amount: 0, // Zero amount placeholder expense
          description: "Budget category created",
          user_id: newBudget.user_id,
          date: new Date().toISOString(),
          budget: newBudget.budget, // Store the budget value
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manual-budgets'] });
      queryClient.invalidateQueries({ queryKey: ['expenses-for-budget'] });
      toast({
        title: "Success",
        description: "Budget category added successfully",
      });
      setIsOpen(false);
      setNewCategory("");
      setNewBudget("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add budget",
        variant: "destructive",
      });
    },
  });

  const handleAddBudget = () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to add a budget",
        variant: "destructive",
      });
      return;
    }

    if (!newCategory || !newBudget) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const budgetAmount = parseFloat(newBudget);
    if (isNaN(budgetAmount) || budgetAmount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid budget amount",
        variant: "destructive",
      });
      return;
    }

    // Check if budget already exists for this category
    const existingBudget = existingBudgets.find(b => b.category.toLowerCase() === newCategory.toLowerCase());
    if (existingBudget) {
      toast({
        title: "Error",
        description: "Budget for this category already exists",
        variant: "destructive",
      });
      return;
    }

    addBudgetMutation.mutate({
      category: newCategory,
      budget: budgetAmount,
      user_id: userId,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Budget
        </Button>
      </DialogTrigger>
      <DialogContent className={isMobile ? "w-[95vw] p-4" : ""}>
        <DialogHeader>
          <DialogTitle>Add New Budget Category</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category Name</Label>
            <Input
              id="category"
              placeholder="e.g., Groceries"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="budget">Budget Amount (₹)</Label>
            <Input
              id="budget"
              type="number"
              placeholder="Enter amount"
              value={newBudget}
              onChange={(e) => setNewBudget(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleAddBudget} 
            className="w-full"
            disabled={addBudgetMutation.isPending}
          >
            {addBudgetMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Budget
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
