import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const Settings = () => {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState("uz");

  const handleSaveSettings = () => {
    toast({
      title: "Sozlamalar saqlandi",
      description: "Sizning sozlamalaringiz muvaffaqiyatli saqlandi.",
    });
  };

  return (
    <div className="space-y-6 pb-16 mb-0 md:mb-0">
      <h1 className="text-3xl font-bold tracking-tight">Sozlamalar</h1>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Ilova sozlamalari</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode">Qorong'i rejim</Label>
              <p className="text-sm text-muted-foreground">
                Ilovaning qorong'i rejimini yoqish
              </p>
            </div>
            <Switch
              id="dark-mode"
              checked={theme === "dark"}
              onCheckedChange={(checked) =>
                setTheme(checked ? "dark" : "light")
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Bildirishnomalar</Label>
              <p className="text-sm text-muted-foreground">
                Bildirishnomalarni yoqish yoki o'chirish
              </p>
            </div>
            <Switch
              id="notifications"
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Til</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language" className="w-full">
                <SelectValue placeholder="Tilni tanlang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uz">O'zbek</SelectItem>
                <SelectItem value="ru">Русский</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSaveSettings} className="w-full">
            Saqlash
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
