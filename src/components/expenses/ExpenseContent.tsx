
import { TransactionList } from "@/components/TransactionList";
import { AddExpenseButton } from "@/components/AddExpenseButton";
import { ScrollText, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface Transaction {
  id: string;
  date: string;
  description: string | null;
  amount: number;
  category: string;
}

interface ExpenseContentProps {
  transactions: Transaction[];
}

export const ExpenseContent = ({ transactions }: ExpenseContentProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="fade-in px-4">
      <div className="flex items-center gap-2 mb-4">
        <ScrollText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-semibold text-gray-800 dark:text-gray-200`}>Recent Expenses</h2>
      </div>
      
      {transactions.length > 0 ? (
        <TransactionList transactions={transactions} />
      ) : (
        <div className={`text-center ${isMobile ? 'p-6' : 'p-12'} bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-purple-100 dark:border-slate-700 shadow-sm`}>
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-muted-foreground dark:text-gray-300 mb-6">No expenses found. Start tracking your spending by adding an expense.</p>
          <div className="flex justify-center">
            <AddExpenseButton showText={true} />
          </div>
        </div>
      )}
    </div>
  );
};
