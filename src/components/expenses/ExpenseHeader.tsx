
import { Coins } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ExpenseHeaderProps {
  transactions: any[];
}

export const ExpenseHeader = ({ transactions }: ExpenseHeaderProps) => {
  const totalExpenses = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const isMobile = useIsMobile();

  return (
    <div className={`flex items-center ${isMobile ? 'flex-col text-center' : ''} gap-5 bg-gradient-to-r from-purple-600 to-blue-500 text-white ${isMobile ? 'p-4' : 'p-6'} rounded-xl shadow-md animate-fade-in`}>
      <div className={`p-3 bg-white/20 rounded-full backdrop-blur-sm ${isMobile ? 'mb-2' : ''}`}>
        <Coins className="h-8 w-8" />
      </div>
      <div className="flex-1">
        <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold`}>
          Expense Management
        </h1>
        <p className="text-purple-100 mt-1">
          Track and manage your daily expenses
        </p>
      </div>
      {!isMobile && (
        <div className="hidden sm:flex flex-col items-end bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
          <p className="text-sm text-white/80">Total Expenses</p>
          <p className="text-xl font-bold">₹{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        </div>
      )}
      {isMobile && (
        <div className="w-full flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-lg p-3 mt-3 border border-white/20">
          <p className="text-sm text-white/80">Total Expenses</p>
          <p className="text-xl font-bold">₹{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        </div>
      )}
    </div>
  );
};
