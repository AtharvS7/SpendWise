import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, IndianRupee, LineChart, BarChart4 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const InterestCalculator = () => {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [time, setTime] = useState("");
  const [compoundFrequency, setCompoundFrequency] = useState("1"); // 1 = annually
  const [simpleInterest, setSimpleInterest] = useState<number | null>(null);
  const [compoundInterest, setCompoundInterest] = useState<number | null>(null);
  const [futureValue, setFutureValue] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const calculateSimpleInterest = () => {
    if (!validateInputs()) return;

    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100;
    const t = parseFloat(time);

    const interest = p * r * t;
    const total = p + interest;

    setSimpleInterest(interest);
    setFutureValue(total);
  };

  const calculateCompoundInterest = () => {
    if (!validateInputs()) return;

    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100;
    const t = parseFloat(time);
    const n = parseFloat(compoundFrequency);

    const total = p * Math.pow(1 + r / n, n * t);
    const interest = total - p;

    setCompoundInterest(interest);
    setFutureValue(total);
  };

  const validateInputs = () => {
    if (!principal || !rate || !time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return false;
    }

    const p = parseFloat(principal);
    const r = parseFloat(rate);
    const t = parseFloat(time);

    if (isNaN(p) || isNaN(r) || isNaN(t) || p <= 0 || r <= 0 || t <= 0) {
      toast({
        title: "Error",
        description: "Please enter valid positive numbers",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleCalculate = (type: "simple" | "compound") => {
    setIsCalculating(true);
    try {
      if (type === "simple") {
        calculateSimpleInterest();
      } else {
        calculateCompoundInterest();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during calculation",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className={isMobile ? "p-4" : "p-8"}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-3 mb-8 fade-in">
          <div className="p-2 bg-gradient-to-r from-blue-100 to-green-100 rounded-full">
            <Calculator className="h-6 w-6 text-blue-700" />
          </div>
          <h1 className="text-3xl font-bold fade-in">Interest Calculator</h1>
        </div>

        <Tabs defaultValue="simple" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-xl bg-gradient-to-r from-blue-50 to-green-50 p-1">
            <TabsTrigger value="simple" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-700">
              Simple Interest
            </TabsTrigger>
            <TabsTrigger value="compound" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-green-700">
              Compound Interest
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="simple" className="space-y-6 mt-6">
            <Card className="border border-blue-100 shadow-md">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/60 rounded-t-xl">
                <CardTitle className="text-xl text-blue-800">Simple Interest Calculator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="principal-simple" className="text-blue-700">Principal Amount (₹)</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <Input
                        id="principal-simple"
                        type="number"
                        placeholder="Enter principal amount"
                        value={principal}
                        onChange={(e) => setPrincipal(e.target.value)}
                        className="pl-10 border-blue-200 focus:border-blue-400 focus-visible:ring-blue-400"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rate-simple" className="text-blue-700">Interest Rate (% per year)</Label>
                    <Input
                      id="rate-simple"
                      type="number"
                      placeholder="Enter interest rate"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      className="border-blue-200 focus:border-blue-400 focus-visible:ring-blue-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time-simple" className="text-blue-700">Time Period (years)</Label>
                    <Input
                      id="time-simple"
                      type="number"
                      placeholder="Enter time period"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="border-blue-200 focus:border-blue-400 focus-visible:ring-blue-400"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={() => handleCalculate("simple")} 
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md"
                  disabled={isCalculating}
                >
                  Calculate Simple Interest
                </Button>
                
                {simpleInterest !== null && futureValue !== null && (
                  <div className="bg-blue-50 p-4 rounded-xl space-y-4 mt-4 border border-blue-100">
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="bg-white border border-blue-100">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <IndianRupee className="h-5 w-5 text-green-500" />
                            <h3 className="text-sm font-medium">Interest Earned</h3>
                          </div>
                          <p className="text-2xl font-bold mt-2 text-green-600">{formatCurrency(simpleInterest)}</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-white border border-blue-100">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <LineChart className="h-5 w-5 text-blue-500" />
                            <h3 className="text-sm font-medium">Future Value</h3>
                          </div>
                          <p className="text-2xl font-bold mt-2 text-blue-600">{formatCurrency(futureValue)}</p>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="text-sm text-blue-600/70 bg-blue-50/80 p-3 rounded-lg">
                      <p>Formula: Simple Interest = Principal × Rate × Time</p>
                      <p>Future Value = Principal + Simple Interest</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="compound" className="space-y-6 mt-6">
            <Card className="border border-green-100 shadow-md">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100/60 rounded-t-xl">
                <CardTitle className="text-xl text-green-800">Compound Interest Calculator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="principal-compound" className="text-green-700">Principal Amount (₹)</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <Input
                        id="principal-compound"
                        type="number"
                        placeholder="Enter principal amount"
                        value={principal}
                        onChange={(e) => setPrincipal(e.target.value)}
                        className="pl-10 border-green-200 focus:border-green-400 focus-visible:ring-green-400"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rate-compound" className="text-green-700">Interest Rate (% per year)</Label>
                    <Input
                      id="rate-compound"
                      type="number"
                      placeholder="Enter interest rate"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      className="border-green-200 focus:border-green-400 focus-visible:ring-green-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time-compound" className="text-green-700">Time Period (years)</Label>
                    <Input
                      id="time-compound"
                      type="number"
                      placeholder="Enter time period"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="border-green-200 focus:border-green-400 focus-visible:ring-green-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="compound-frequency" className="text-green-700">Compounding Frequency</Label>
                    <select
                      id="compound-frequency"
                      className="flex h-10 w-full rounded-md border border-green-200 bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                      value={compoundFrequency}
                      onChange={(e) => setCompoundFrequency(e.target.value)}
                    >
                      <option value="1">Annually (1/year)</option>
                      <option value="2">Semi-Annually (2/year)</option>
                      <option value="4">Quarterly (4/year)</option>
                      <option value="12">Monthly (12/year)</option>
                      <option value="365">Daily (365/year)</option>
                    </select>
                  </div>
                </div>
                
                <Button 
                  onClick={() => handleCalculate("compound")} 
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-md"
                  disabled={isCalculating}
                >
                  Calculate Compound Interest
                </Button>
                
                {compoundInterest !== null && futureValue !== null && (
                  <div className="bg-green-50 p-4 rounded-xl space-y-4 mt-4 border border-green-100">
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="bg-white border border-green-100">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <IndianRupee className="h-5 w-5 text-green-500" />
                            <h3 className="text-sm font-medium">Interest Earned</h3>
                          </div>
                          <p className="text-2xl font-bold mt-2 text-green-600">{formatCurrency(compoundInterest)}</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-white border border-green-100">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <BarChart4 className="h-5 w-5 text-blue-500" />
                            <h3 className="text-sm font-medium">Future Value</h3>
                          </div>
                          <p className="text-2xl font-bold mt-2 text-blue-600">{formatCurrency(futureValue)}</p>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="text-sm text-green-600/70 bg-green-50/80 p-3 rounded-lg">
                      <p>Formula: Future Value = Principal × (1 + Rate/n)^(n×t)</p>
                      <p>Compound Interest = Future Value - Principal</p>
                      <p>where n = compounding frequency per year, t = time in years</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InterestCalculator;
