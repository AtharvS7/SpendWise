
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";

// Update the Income interface to include category
interface Income {
  id: string;
  date: string;
  source: string;
  description: string;
  amount: number;
  user_id: string;
  category?: string | null;
  created_at?: string | null;
}

export const IncomeList = () => {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [newIncome, setNewIncome] = useState({
    date: "",
    source: "",
    description: "",
    amount: "",
    category: "",
  });

  const { data: incomes = [], isLoading, isError } = useQuery({
    queryKey: ['incomes'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to view your income data");
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase
        .from('income')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) {
        toast.error("Failed to load income data");
        throw error;
      }
      
      return data || [];
    },
    retry: 1,
    staleTime: 30000, // Cache data for 30 seconds
  });

  const handleAddIncome = async () => {
    if (!newIncome.date || !newIncome.source || !newIncome.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to add income");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('income')
        .insert([{
          date: newIncome.date,
          source: newIncome.source,
          description: newIncome.description,
          amount: parseFloat(newIncome.amount),
          category: newIncome.category || null, // Include category in the insert
          user_id: user.id
        }]);
      
      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      setNewIncome({ date: "", source: "", description: "", amount: "", category: "" });
      setIsAddDialogOpen(false);
      toast.success("Income added successfully");
    } catch (error) {
      toast.error("Failed to add income");
      console.error("Error adding income:", error);
    }
  };

  const handleEditIncome = (income: Income) => {
    setEditingIncome(income);
    setNewIncome({
      date: income.date,
      source: income.source,
      description: income.description || "",
      amount: income.amount.toString(),
      category: income.category || "", // Include category
    });
    setIsAddDialogOpen(true);
  };

  const handleUpdateIncome = async () => {
    if (!editingIncome) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to update income");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('income')
        .update({
          date: newIncome.date,
          source: newIncome.source,
          description: newIncome.description,
          amount: parseFloat(newIncome.amount),
          category: newIncome.category || null, // Include category in the update
          user_id: user.id
        })
        .eq('id', editingIncome.id);
      
      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      setEditingIncome(null);
      setNewIncome({ date: "", source: "", description: "", amount: "", category: "" });
      setIsAddDialogOpen(false);
      toast.success("Income updated successfully");
    } catch (error) {
      toast.error("Failed to update income");
      console.error("Error updating income:", error);
    }
  };

  const handleDeleteIncome = async (id: string) => {
    try {
      const { error } = await supabase
        .from('income')
        .delete()
        .eq('id', id);
      
      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      toast.success("Income deleted successfully");
    } catch (error) {
      toast.error("Failed to delete income");
      console.error("Error deleting income:", error);
    }
  };

  if (isError) {
    return (
      <div className="text-center py-4 text-red-500">
        Error loading income data. Please try again later.
      </div>
    );
  }

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex space-x-4">
          <Skeleton className="h-12 w-full" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Income Sources</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingIncome(null);
                setNewIncome({ date: "", source: "", description: "", amount: "", category: "" });
              }}
            >
              Add Income
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingIncome ? "Edit Income" : "Add New Income"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newIncome.date}
                  onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Select
                  value={newIncome.source}
                  onValueChange={(value) => setNewIncome({ ...newIncome, source: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Salary">Salary</SelectItem>
                    <SelectItem value="Freelance">Freelance</SelectItem>
                    <SelectItem value="Investment">Investment</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newIncome.category}
                  onValueChange={(value) => setNewIncome({ ...newIncome, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Salary">Salary</SelectItem>
                    <SelectItem value="Investments">Investments</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Rental">Rental</SelectItem>
                    <SelectItem value="Dividends">Dividends</SelectItem>
                    <SelectItem value="Gifts">Gifts</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newIncome.description}
                  onChange={(e) => setNewIncome({ ...newIncome, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={newIncome.amount}
                  onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                />
              </div>
              <Button
                className="w-full"
                onClick={editingIncome ? handleUpdateIncome : handleAddIncome}
              >
                {editingIncome ? "Update" : "Add"} Income
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="glass p-4 rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <LoadingSkeleton />
                </TableCell>
              </TableRow>
            ) : incomes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-4">
                  No income entries yet. Add your first income source!
                </TableCell>
              </TableRow>
            ) : (
              incomes.map((income) => (
                <TableRow key={income.id} className="fade-in">
                  <TableCell>{new Date(income.date).toLocaleDateString()}</TableCell>
                  <TableCell>{income.source}</TableCell>
                  <TableCell>{income.category || "—"}</TableCell>
                  <TableCell>{income.description}</TableCell>
                  <TableCell className="text-right">₹{income.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditIncome(income)}
                      className="mr-2"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteIncome(income.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
