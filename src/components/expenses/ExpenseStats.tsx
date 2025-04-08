
import { ExpenseCard } from "@/components/ExpenseCard";
import { BadgeDollarSign, BarChart } from "lucide-react";

interface ExpenseStatsProps {
  totalExpenses: number;
  dailyAverage: number;
}

export const ExpenseStats = ({ totalExpenses, dailyAverage }: ExpenseStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 fade-in px-4">
      <ExpenseCard
        title="Total Expenses"
        amount={totalExpenses}
        type="total"
        icon={<BadgeDollarSign className="h-5 w-5 text-purple-600" />}
      />
      <ExpenseCard
        title="Daily Average"
        amount={dailyAverage}
        type="average"
        icon={<BarChart className="h-5 w-5 text-blue-600" />}
      />
    </div>
  );
};
