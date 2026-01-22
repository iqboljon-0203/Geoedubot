import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { Moon, Bell, Globe, Settings as SettingsIcon } from "lucide-react";

const Settings = () => {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState("uz");

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Preferences updated successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20 relative overflow-hidden">
       {/* Gradient Header */}
       <div className="bg-primary-gradient h-48 w-full rounded-b-[2.5rem] shadow-lg absolute top-0 z-0" />
       
       <div className="relative z-10 pt-16 px-6 max-w-xl mx-auto">
          <div className="flex items-center gap-3 mb-8 text-white">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md shadow-lg">
               <SettingsIcon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black">Settings</h1>
              <p className="opacity-80 text-sm font-medium">Manage your preferences</p>
            </div>
          </div>

          <div className="card-modern bg-white shadow-xl space-y-8 p-8">
             {/* Dark Mode */}
             <div className="flex items-center justify-between group cursor-pointer" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                   <Moon className="w-6 h-6" />
                 </div>
                 <div>
                   <Label className="text-lg font-bold cursor-pointer">Dark Mode</Label>
                   <p className="text-xs text-muted-foreground font-medium">Toggle app theme</p>
                 </div>
               </div>
               <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                  className="data-[state=checked]:bg-indigo-600"
               />
             </div>
             
             <div className="h-px bg-gray-100 w-full" />

             {/* Notifications */}
             <div className="flex items-center justify-between group cursor-pointer" onClick={() => setNotificationsEnabled(!notificationsEnabled)}>
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 group-hover:bg-teal-100 transition-colors">
                   <Bell className="w-6 h-6" />
                 </div>
                 <div>
                   <Label className="text-lg font-bold cursor-pointer">Notifications</Label>
                   <p className="text-xs text-muted-foreground font-medium">Manage alerts</p>
                 </div>
               </div>
               <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                  className="data-[state=checked]:bg-teal-500"
               />
             </div>

             <div className="h-px bg-gray-100 w-full" />

             {/* Language */}
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                   <Globe className="w-6 h-6" />
                 </div>
                 <div>
                   <Label className="text-lg font-bold">Language</Label>
                   <p className="text-xs text-muted-foreground font-medium">Interface language</p>
                 </div>
               </div>
               <div className="w-32">
                 <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="rounded-xl border-gray-200 bg-gray-50 font-bold text-gray-700">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uz">O'zbek</SelectItem>
                    <SelectItem value="ru">Русский</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
               </div>
             </div>

             <Button onClick={handleSaveSettings} className="w-full rounded-xl py-6 text-base font-bold bg-primary hover:bg-primary/90 mt-4 shadow-lg shadow-primary/30">
                Save Changes
             </Button>
          </div>
       </div>
    </div>
  );
};

export default Settings;
