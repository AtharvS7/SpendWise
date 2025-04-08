
import { Card } from "@/components/ui/card";
import { TransactionList } from "@/components/TransactionList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ScrollText } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Transactions = () => {
  const isMobile = useIsMobile();
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data: expenses, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return expenses || [];
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 dark:text-purple-400" />
          <p className="text-purple-600 dark:text-purple-400 font-medium">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={isMobile ? "p-4" : "p-8"}>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-3 mb-8 fade-in">
          <div className="p-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 rounded-full">
            <ScrollText className="h-6 w-6 text-purple-700 dark:text-purple-300" />
          </div>
          <h1 className="text-3xl font-bold fade-in">
            Transactions History
          </h1>
        </div>
        
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-purple-100/30 dark:border-slate-700/50 shadow-md p-6 rounded-xl fade-in">
          <TransactionList transactions={transactions} />
        </Card>
      </div>
    </div>
  );
};

export default Transactions;
