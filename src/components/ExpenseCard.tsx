
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartPie, DollarSign } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const currencies = [
  { symbol: "₹", code: "INR" },
  { symbol: "$", code: "USD" },
  { symbol: "€", code: "EUR" },
  { symbol: "£", code: "GBP" },
  { symbol: "¥", code: "JPY" },
];

interface ExpenseCardProps {
  title: string;
  amount: number;
  type: "total" | "average";
  icon?: ReactNode;
}

export const ExpenseCard = ({ title, amount, type, icon }: ExpenseCardProps) => {
  const [currency, setCurrency] = useState("₹");
  const isMobile = useIsMobile();

  return (
    <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-purple-50 dark:from-slate-800 dark:to-slate-900">
      <CardHeader className={`flex flex-row items-center justify-between pb-2 border-b border-purple-100/30 dark:border-slate-700/30 ${isMobile ? 'px-4 py-3' : ''}`}>
        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
          {icon || (type === "total" ? 
            <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" /> : 
            <ChartPie className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          )}
          {title}
        </CardTitle>
        <Select
          defaultValue="₹"
          onValueChange={(value) => setCurrency(value)}
        >
          <SelectTrigger className="w-[60px] h-8 text-xs bg-white dark:bg-slate-700 border-purple-100 dark:border-slate-600">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {currencies.map((curr) => (
              <SelectItem key={curr.code} value={curr.symbol}>
                {curr.symbol} ({curr.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className={`${isMobile ? 'px-4 py-3' : 'pt-4'}`}>
        <div className="text-3xl font-bold text-purple-800 dark:text-purple-300">
          {currency}
          {amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {type === "total" ? "Current period" : "Per transaction"}
        </p>
      </CardContent>
    </Card>
  );
};
