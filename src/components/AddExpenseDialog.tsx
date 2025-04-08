
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Receipt, DollarSign, Calendar, Clock, Tag } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddExpenseDialog = ({ open, onOpenChange }: AddExpenseDialogProps) => {
  const queryClient = useQueryClient();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  
  const now = new Date();
  const formattedDate = now.toISOString().split('T')[0];
  const formattedTime = now.toTimeString().split(' ')[0].substring(0, 5);
  
  const [date, setDate] = useState(formattedDate);
  const [time, setTime] = useState(formattedTime);
  
  const isMobile = useIsMobile();

  // Fetch user session for current user ID
  const { data: sessionData } = useQuery({
    queryKey: ['current-session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data;
    },
    enabled: open,
  });

  const userId = sessionData?.session?.user?.id;

  // Get budget categories with improved query
  const { data: existingBudgetCategories = [] } = useQuery({
    queryKey: ['budget-categories-for-dropdown', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data: expensesWithBudget, error } = await supabase
        .from('expenses')
        .select('category, budget')
        .eq('user_id', userId)
        .not('budget', 'is', null);
      
      if (error) {
        console.error('Error fetching budget categories:', error);
        return [];
      }
      
      // Extract unique categories with budget values
      const uniqueCategories = [...new Set(expensesWithBudget?.map(item => item.category) || [])];
      return uniqueCategories;
    },
    enabled: open && !!userId,
  });

  const addExpenseMutation = useMutation({
    mutationFn: async (expense: { description: string; amount: number; category: string; date: string; user_id: string }) => {
      const { data, error } = await supabase
        .from('expenses')
        .insert(expense);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate all related queries to ensure data is updated everywhere
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenses-for-budget'] });
      queryClient.invalidateQueries({ queryKey: ['manual-budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-categories-for-dropdown'] });
      
      // Check if this category has a budget and show appropriate message
      const hasBudget = existingBudgetCategories.includes(category);
      
      if (hasBudget) {
        toast("Expense Added", {
          description: `Your expense has been added and the ${category} budget has been updated.`,
        });
      } else {
        toast("Expense Added", {
          description: "Your expense has been successfully recorded.",
        });
      }

      // Reset form
      setDescription("");
      setAmount("");
      setCategory("");
      setDate(new Date().toISOString().split('T')[0]);
      setTime(new Date().toTimeString().split(' ')[0].substring(0, 5));
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast("Error", {
        description: error.message || "Failed to add expense. Please try again.",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast("Error", {
        description: "You must be logged in to add an expense",
      });
      return;
    }
    
    if (!description || !amount || !category) {
      toast("Error", {
        description: "Please fill in all required fields",
      });
      return;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast("Error", {
        description: "Please enter a valid amount",
      });
      return;
    }

    const dateTime = new Date(`${date}T${time}`);
    
    addExpenseMutation.mutate({
      description,
      amount: amountValue,
      category,
      date: dateTime.toISOString(),
      user_id: userId
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-[425px] z-[100] ${isMobile ? 'w-[95vw] p-4' : ''}`}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-purple-800 flex items-center">
            <Receipt className="mr-2 h-5 w-5" />
            Add New Expense
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center text-gray-700">
              <span>Description</span>
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter expense description"
              className="border-purple-100 focus-visible:ring-purple-500"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount" className="flex items-center text-gray-700">
              <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
              <span>Amount (₹)</span>
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="border-purple-100 focus-visible:ring-purple-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center text-gray-700">
                <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                <span>Date</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="border-purple-100 focus-visible:ring-purple-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center text-gray-700">
                <Clock className="h-4 w-4 mr-1 text-gray-500" />
                <span>Time</span>
              </Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="border-purple-100 focus-visible:ring-purple-500"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category-select" className="flex items-center text-gray-700">
              <Tag className="h-4 w-4 mr-1 text-gray-500" />
              <span>Category</span>
              {existingBudgetCategories.includes(category) && (
                <span className="ml-2 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Has Budget</span>
              )}
            </Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger id="category-select" className="w-full border-purple-100 focus-visible:ring-purple-500">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent position="popper" className="z-[101] bg-background">
                <SelectItem value="Groceries">Groceries</SelectItem>
                <SelectItem value="Entertainment">Entertainment</SelectItem>
                <SelectItem value="Transportation">Transportation</SelectItem>
                <SelectItem value="Utilities">Utilities</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Dining">Dining</SelectItem>
                <SelectItem value="Shopping">Shopping</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Housing">Housing</SelectItem>
                <SelectItem value="Travel">Travel</SelectItem>
                <SelectItem value="Rent">Rent</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={addExpenseMutation.isPending}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white shadow-md"
            >
              {addExpenseMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Expense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
