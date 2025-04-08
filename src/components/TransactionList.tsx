
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

interface Transaction {
  id: string;
  date: string;
  description: string | null;
  amount: number;
  category: string;
}

interface TransactionListProps {
  transactions: Transaction[];
}

export const TransactionList = ({ transactions }: TransactionListProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="glass p-4 rounded-lg border border-purple-100/30 bg-white/90 dark:bg-slate-800/80 shadow-sm">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No transactions found
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="fade-in bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-purple-100/30 dark:border-slate-700/30">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{transaction.description || "—"}</span>
                  <span className="font-bold text-right">
                    ₹{transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="text-muted-foreground">
                    {format(new Date(transaction.date), "MMM dd, yyyy")}
                    <div className="text-xs">
                      {format(new Date(transaction.date), "hh:mm a")}
                    </div>
                  </div>
                  <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                    {transaction.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="glass p-4 rounded-lg border border-purple-100/30 bg-white/90 dark:bg-slate-800/80 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date & Time</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                No transactions found
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.id} className="fade-in hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <TableCell>
                  {format(new Date(transaction.date), "MMM dd, yyyy")}
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(transaction.date), "hh:mm a")}
                  </div>
                </TableCell>
                <TableCell>{transaction.description || "—"}</TableCell>
                <TableCell>
                  <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                    {transaction.category}
                  </span>
                </TableCell>
                <TableCell className="text-right font-medium">
                  ₹{transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
