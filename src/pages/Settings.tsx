
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Settings as SettingsIcon, UserCircle, KeyRound, Bell } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SettingsProps {
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  isCompactMode: boolean;
  setIsCompactMode: (value: boolean) => void;
}

const Settings = ({ isDarkMode, setIsDarkMode, isCompactMode, setIsCompactMode }: SettingsProps) => {
  const { toast } = useToast();
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const isMobile = useIsMobile();

  const handleDarkModeChange = (checked: boolean) => {
    setIsDarkMode(checked);
    toast({
      title: checked ? "Dark mode enabled" : "Dark mode disabled",
      duration: 2000,
    });
  };

  const handleCompactModeChange = (checked: boolean) => {
    setIsCompactMode(checked);
    toast({
      title: checked ? "Compact mode enabled" : "Compact mode disabled",
      duration: 2000,
    });
  };

  const handleUpdateUsername = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from('profiles')
        .update({ username: newUsername })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Username updated successfully",
        duration: 2000,
      });
      setNewUsername("");
    } catch (error: any) {
      toast({
        title: "Error updating username",
        description: error.message,
        duration: 2000,
      });
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        duration: 2000,
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Password updated successfully",
        duration: 2000,
      });
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Error updating password",
        description: error.message,
        duration: 2000,
      });
    }
  };

  return (
    <div className={isMobile ? "p-4" : "p-8"}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-6 fade-in">
          <div className="p-2 bg-gradient-to-r from-slate-100 to-blue-100 dark:from-slate-700 dark:to-blue-900 rounded-full">
            <SettingsIcon className="h-6 w-6 text-slate-700 dark:text-slate-300" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold fade-in">
            Settings
          </h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 fade-in">
          <Card className="border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-shadow duration-300 dark:bg-slate-800/90">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <UserCircle className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              <CardTitle className="text-base md:text-lg">Profile Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Update Username</Label>
                <Input
                  id="username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter new username"
                  className="border-slate-200 dark:border-slate-700 focus-visible:ring-slate-500 dark:bg-slate-900/50 dark:text-white"
                />
                <Button 
                  onClick={handleUpdateUsername} 
                  className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 dark:from-slate-700 dark:to-slate-600 text-white"
                >
                  Update Username
                </Button>
              </div>
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                  <Label htmlFor="new-password">Update Password</Label>
                </div>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="border-slate-200 dark:border-slate-700 focus-visible:ring-slate-500 dark:bg-slate-900/50 dark:text-white"
                />
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="border-slate-200 dark:border-slate-700 focus-visible:ring-slate-500 dark:bg-slate-900/50 dark:text-white"
                />
                <Button 
                  onClick={handleUpdatePassword} 
                  className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 dark:from-slate-700 dark:to-slate-600 text-white"
                >
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-shadow duration-300 dark:bg-slate-800/90">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              <CardTitle className="text-base md:text-lg">Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/80 rounded-md">
                <Label htmlFor="dark-mode" className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 cursor-pointer">
                  <span className="text-slate-700 dark:text-slate-300">Dark Mode</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">(Easier on the eyes)</span>
                </Label>
                <Switch 
                  id="dark-mode" 
                  checked={isDarkMode}
                  onCheckedChange={handleDarkModeChange}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/80 rounded-md">
                <Label htmlFor="compact-view" className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 cursor-pointer">
                  <span className="text-slate-700 dark:text-slate-300">Compact View</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">(More content)</span>
                </Label>
                <Switch 
                  id="compact-view"
                  checked={isCompactMode}
                  onCheckedChange={handleCompactModeChange}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
