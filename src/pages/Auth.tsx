
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, Lock, LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/expenses");
      }
    };
    
    checkSession();
  }, [navigate]);

  // Get the current URL for redirecting after sign-in
  const origin = window.location.origin;
  const redirectTo = `${origin}/expenses`;

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast.success("Signed in successfully!");
      navigate("/expenses");
    } catch (error: any) {
      toast.error(error.message || "Error signing in");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (error) throw error;
      
      toast.success("Sign up successful! Please check your email for verification.");
    } catch (error: any) {
      toast.error(error.message || "Error signing up");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            prompt: 'select_account',
          }
        }
      });

      if (error) throw error;
      
      // We don't need to navigate here as the redirect will happen automatically
    } catch (error: any) {
      setGoogleLoading(false);
      toast.error(error.message || "Error signing in with Google");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="glass shadow-lg border border-gray-100">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-2">
              <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center text-white">
                <Lock className="w-8 h-8" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">SpendWise</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-2">
              <TabsTrigger value="signin" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-teal-500 data-[state=active]:text-white">
                <UserPlus className="mr-2 h-4 w-4" />
                Sign Up
              </TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={handleEmailSignIn}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2 text-gray-700">
                      <Mail className="h-4 w-4 text-teal-500" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="flex items-center gap-2 text-gray-700">
                        <Lock className="h-4 w-4 text-teal-500" />
                        Password
                      </Label>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-teal-500 hover:bg-teal-600 text-white" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Sign In
                  </Button>
                  <div className="relative flex items-center">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="mx-4 flex-shrink text-sm text-gray-400">or</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                  </div>
                  <Button 
                    type="button"
                    variant="outline" 
                    className="w-full border-gray-300 hover:bg-gray-50" 
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading}
                  >
                    {googleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                        <path d="M1 1h22v22H1z" fill="none" />
                      </svg>
                    )}
                    Continue with Google
                  </Button>
                </CardContent>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleEmailSignUp}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-signup" className="flex items-center gap-2 text-gray-700">
                      <Mail className="h-4 w-4 text-teal-500" />
                      Email
                    </Label>
                    <Input
                      id="email-signup"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-signup" className="flex items-center gap-2 text-gray-700">
                      <Lock className="h-4 w-4 text-teal-500" />
                      Password
                    </Label>
                    <Input
                      id="password-signup"
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                    />
                    <p className="text-xs text-gray-500">Password must be at least 6 characters long</p>
                  </div>
                  <Button type="submit" className="w-full bg-teal-500 hover:bg-teal-600 text-white" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Sign Up
                  </Button>
                  <div className="relative flex items-center">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="mx-4 flex-shrink text-sm text-gray-400">or</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                  </div>
                  <Button 
                    type="button"
                    variant="outline" 
                    className="w-full border-gray-300 hover:bg-gray-50" 
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading}
                  >
                    {googleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                        <path d="M1 1h22v22H1z" fill="none" />
                      </svg>
                    )}
                    Continue with Google
                  </Button>
                </CardContent>
              </form>
            </TabsContent>
          </Tabs>
          <CardFooter className="flex flex-col space-y-4 pt-0">
            <p className="text-xs text-center text-gray-500 mt-4">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
