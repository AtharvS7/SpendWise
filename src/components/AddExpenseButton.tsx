
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddExpenseDialog } from "./AddExpenseDialog";

interface AddExpenseButtonProps {
  showText?: boolean;
}

export const AddExpenseButton = ({ showText = false }: AddExpenseButtonProps) => {
  const [open, setOpen] = useState(false);
  
  const handleOpenDialog = () => {
    setOpen(true);
  };

  // For the inline button in empty state
  if (showText) {
    return (
      <>
        <Button
          onClick={handleOpenDialog}
          className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg px-6 py-2.5 transition-all duration-200"
        >
          <Plus className="mr-2 h-5 w-5" />
          Add New Expense
        </Button>
        <AddExpenseDialog open={open} onOpenChange={setOpen} />
      </>
    );
  }

  // For the floating action button on other pages
  return (
    <>
      <Button
        className="fixed bottom-8 right-8 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200 z-40 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white"
        size="icon"
        onClick={handleOpenDialog}
        aria-label="Add Expense"
      >
        <Plus className="h-6 w-6" />
      </Button>
      <AddExpenseDialog open={open} onOpenChange={setOpen} />
    </>
  );
};
