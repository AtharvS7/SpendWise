
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IncomeList } from "@/components/IncomeList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, TrendingUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// Update the Income interface to include category with proper typing
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

const Income = () => {
  const isMobile = useIsMobile();
  const { data: incomeData = [], isLoading } = useQuery({
    queryKey: ['income'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('income')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const totalIncome = incomeData.reduce((sum, income) => sum + Number(income.amount), 0);

  // Group income by category for statistics
  const incomeByCategory = incomeData.reduce((acc, income) => {
    const category = income.category || "Uncategorized";
    acc[category] = (acc[category] || 0) + Number(income.amount);
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-12 h-12 animate-spin text-green-600" />
          <p className="text-green-600 font-medium">Loading income data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={isMobile ? "p-4" : "p-8"}>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-3 mb-8 fade-in">
          <div className="p-2 bg-gradient-to-r from-green-100 to-teal-100 rounded-full">
            <TrendingUp className="h-6 w-6 text-green-700" />
          </div>
          <h1 className="text-3xl font-bold fade-in">
            Income Management
          </h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 fade-in">
          <Card className="bg-white/80 backdrop-blur-sm border border-green-100/30 shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">
                ₹{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                From {incomeData.length} income entries
              </p>
            </CardContent>
          </Card>
          
          {/* Add category breakdown card */}
          {Object.keys(incomeByCategory).length > 0 && (
            <Card className="bg-white/80 backdrop-blur-sm border border-green-100/30 shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Top Income Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(incomeByCategory)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3)
                    .map(([category, amount]) => (
                      <div key={category} className="flex justify-between items-center">
                        <span className="text-sm">{category}</span>
                        <span className="text-sm font-medium text-green-700">
                          ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="fade-in">
          <IncomeList />
        </div>
      </div>
    </div>
  );
};

export default Income;
