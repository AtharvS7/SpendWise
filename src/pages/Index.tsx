
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, DollarSign, PiggyBank } from "lucide-react";

// Main landing page component
const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="flex flex-col-reverse md:flex-row items-center justify-between mb-20">
          {/* Left side content */}
          <div className="md:w-1/2 space-y-6 text-left mt-8 md:mt-0 animate-fade-in">
            <div className="inline-block px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-2">
              Personal Finance
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              Track Your <span className="text-teal-500">Expenses</span> With Ease
            </h1>
            
            <p className="text-xl text-gray-600 max-w-lg">
              A simple and intuitive expense tracker to help you manage your finances and reach your financial goals.
            </p>

            <div className="pt-4 flex gap-4">
              <Button
                onClick={() => navigate("/expenses")}
                className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-6 rounded-lg text-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                Get Started
                <ArrowRight className="ml-1" />
              </Button>
            </div>
          </div>

          {/* Right side with logo */}
          <div className="md:w-1/2 flex justify-center animate-fade-in">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <img
                src="/lovable-uploads/41cc82be-f2ed-41ec-94e0-c6b91ee89a69.png"
                alt="SpendWise Logo"
                className="w-80 h-80 object-contain relative z-10"
              />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 animate-fade-in">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose <span className="text-teal-500">SpendWise</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expense Tracking</h3>
              <p className="text-gray-600">
                Keep track of where your money goes with our easy-to-use expense tracking features.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Detailed Analytics</h3>
              <p className="text-gray-600">
                Visualize your spending habits with beautiful charts and actionable insights.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <PiggyBank className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Budget Management</h3>
              <p className="text-gray-600">
                Set and track budgets to help you achieve your financial goals without the stress.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 mb-16 bg-gradient-to-r from-teal-500 to-blue-500 p-8 md:p-12 rounded-2xl text-white text-center animate-fade-in">
          <h2 className="text-3xl font-bold mb-4">Ready to take control of your finances?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of users who are managing their money efficiently.
          </p>
          <Button 
            onClick={() => navigate("/auth")}
            className="bg-white text-teal-600 hover:bg-gray-100 px-8 py-6 rounded-lg text-lg font-semibold"
          >
            Get Started Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
