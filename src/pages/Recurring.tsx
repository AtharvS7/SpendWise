
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Repeat, CalendarClock, PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const Recurring = () => {
  const isMobile = useIsMobile();
  const { data: recurringExpenses = [], isLoading } = useQuery({
    queryKey: ['recurring'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          <p className="text-blue-600 font-medium">Loading recurring payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={isMobile ? "p-4" : "p-8"}>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-3 mb-8 fade-in">
          <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full">
            <Repeat className="h-6 w-6 text-blue-700" />
          </div>
          <h1 className="text-3xl font-bold fade-in">
            Recurring Payments
          </h1>
        </div>
        
        <Card className="glass p-6 rounded-xl border border-blue-100/30 bg-white/80 backdrop-blur-sm shadow-md fade-in">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Next Due</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recurringExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 bg-blue-50 rounded-full">
                        <CalendarClock className="h-8 w-8 text-blue-500" />
                      </div>
                      <p className="text-muted-foreground">No recurring payments set up yet</p>
                      <Button className="mt-2 bg-blue-600 hover:bg-blue-700">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Recurring Payment
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                recurringExpenses.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell>₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>Monthly</TableCell>
                    <TableCell>{format(new Date(item.date), "MMM dd, yyyy")}</TableCell>
                    <TableCell>{format(new Date(item.date), "hh:mm a")}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default Recurring;
