
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  BarChart3,
  CalendarClock,
  CircleDollarSign,
  CreditCard,
  Grid3X3,
  Menu,
  Receipt,
  Settings,
  Calculator,
} from "lucide-react";

interface SidebarItem {
  title: string;
  icon: React.ReactNode;
  href: string;
}

export function AppSidebar() {
  const isMobile = useIsMobile();
  const { open: isSidebarOpen, setOpen: setSidebarOpen } = useSidebar();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsSheetOpen(false);
  }, [location.pathname]);

  const items: SidebarItem[] = [
    {
      title: "Expenses",
      icon: <CreditCard className="h-4 w-4" />,
      href: "/expenses",
    },
    {
      title: "Income",
      icon: <CircleDollarSign className="h-4 w-4" />,
      href: "/income",
    },
    {
      title: "Transactions",
      icon: <Receipt className="h-4 w-4" />,
      href: "/transactions",
    },
    {
      title: "Analytics",
      icon: <BarChart3 className="h-4 w-4" />,
      href: "/analytics",
    },
    {
      title: "Budgets",
      icon: <Grid3X3 className="h-4 w-4" />,
      href: "/budgets",
    },
    {
      title: "Recurring",
      icon: <CalendarClock className="h-4 w-4" />,
      href: "/recurring",
    },
    {
      title: "Interest Calculator",
      icon: <Calculator className="h-4 w-4" />,
      href: "/interest-calculator",
    },
    {
      title: "Settings",
      icon: <Settings className="h-4 w-4" />,
      href: "/settings",
    },
  ];

  if (isMobile) {
    return (
      <>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed top-4 left-4 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm"
            >
              <Menu className="h-4 w-4" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 sidebar">
            <div className="flex h-full flex-col">
              <div className="p-6">
                <h2 className="text-xl font-semibold tracking-tight mb-1">
                  SpendWise
                </h2>
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                  Manage your finances with ease
                </p>
              </div>
              <ScrollArea className="flex-1">
                <nav className="flex flex-col gap-1 p-4">
                  {items.map((item) => (
                    <Button
                      key={item.title}
                      variant="ghost"
                      className={`justify-start h-auto py-2 px-4 sidebar-item ${
                        location.pathname === item.href
                          ? "active"
                          : ""
                      }`}
                      asChild
                    >
                      <Link to={item.href}>
                        {item.icon}
                        <span className="ml-2">{item.title}</span>
                      </Link>
                    </Button>
                  ))}
                </nav>
              </ScrollArea>
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <div
      className={`fixed inset-y-0 z-20 flex flex-col sidebar border-r transition-all duration-300 ${
        isSidebarOpen ? "w-72" : "w-20"
      }`}
    >
      <div className="flex h-14 items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          {isSidebarOpen && (
            <Link to="/" className="text-xl font-semibold tracking-tight">
              SpendWise
            </Link>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 sidebar-item"
          onClick={() => setSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-1 p-2">
          {items.map((item) => (
            <Button
              key={item.title}
              variant="ghost"
              className={`justify-start h-auto py-2 sidebar-item ${
                isSidebarOpen ? "px-4" : "justify-center px-0"
              } ${
                location.pathname === item.href ? "active" : ""
              }`}
              asChild
            >
              <Link to={item.href}>
                {item.icon}
                {isSidebarOpen && <span className="ml-2">{item.title}</span>}
              </Link>
            </Button>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}
