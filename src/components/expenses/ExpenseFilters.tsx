
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar, Filter, Download, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from "@/integrations/supabase/client";

interface ExpenseFiltersProps {
  timeFrame: string;
  setTimeFrame: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  categories: string[];
  transactions: any[];
}

export const ExpenseFilters = ({ 
  timeFrame, 
  setTimeFrame, 
  categoryFilter, 
  setCategoryFilter,
  categories,
  transactions
}: ExpenseFiltersProps) => {
  const { toast } = useToast();

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(transactions);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");
    XLSX.writeFile(workbook, "expenses.xlsx");
    
    toast({
      title: "Export Successful",
      description: "Your expenses have been exported to Excel",
    });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Expenses Report", 14, 20);
    
    autoTable(doc, {
      head: [["Date", "Description", "Amount (₹)", "Category"]],
      body: transactions.map(t => [
        t.date,
        t.description,
        t.amount.toLocaleString("en-IN"),
        t.category
      ]),
      startY: 30,
    });
    
    doc.save("expenses.pdf");
    
    toast({
      title: "Export Successful",
      description: "Your expenses have been exported to PDF",
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-purple-100 shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-3 items-center justify-between w-full">
          <div className="flex flex-wrap gap-3 items-center">
            {/* First: Time period filter */}
            <Select value={timeFrame} onValueChange={setTimeFrame}>
              <SelectTrigger className="w-auto min-w-[120px] border-purple-100 hover:border-purple-300 bg-white">
                <Calendar className="mr-2 h-4 w-4 text-purple-600" />
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent className="z-50 bg-white">
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Second: Category filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-auto min-w-[120px] border-purple-100 hover:border-purple-300 bg-white">
                <Filter className="mr-2 h-4 w-4 text-purple-600" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="z-50 bg-white">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Third: Export button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-purple-100 hover:border-purple-300 bg-white hover:bg-purple-50">
                  <Download className="mr-2 h-4 w-4 text-purple-600" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="z-50 bg-white border border-purple-100">
                <DropdownMenuItem onClick={exportToExcel} className="hover:bg-purple-50 cursor-pointer">
                  Export to Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToPDF} className="hover:bg-purple-50 cursor-pointer">
                  Export to PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Fourth: Logout button (at the right end) */}
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="bg-white hover:bg-red-50 border-red-200 hover:border-red-300 text-red-600 hover:text-red-700"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
