
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Download, Upload, Trash2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseData } from "@/hooks/useSupabaseData";

export const Settings = () => {
  const { toast } = useToast();
  const { saveWrestlers, saveShows, saveChampionships, saveRivalries } = useSupabaseData();

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            
            // Import data to Supabase using save functions
            if (data.wrestlers) await saveWrestlers(data.wrestlers);
            if (data.championships) await saveChampionships(data.championships);
            if (data.shows) await saveShows(data.shows);
            if (data.rivalries) await saveRivalries(data.rivalries);
            
            toast({
              title: "Data Imported",
              description: "Your wrestling promotion has been restored successfully.",
            });
            
            // Refresh the page to load new data
            window.location.reload();
          } catch (error) {
            toast({
              title: "Import Failed",
              description: "The file format is invalid or corrupted.",
              variant: "destructive"
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleResetData = () => {
    if (confirm("Are you sure you want to reset all promotion data? This action cannot be undone.")) {
      localStorage.removeItem("wrestlers");
      localStorage.removeItem("championships");
      localStorage.removeItem("shows");
      localStorage.removeItem("rivalries");
      
      toast({
        title: "Promotion Reset",
        description: "All data has been cleared. The page will refresh.",
      });
      
      setTimeout(() => window.location.reload(), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <SettingsIcon className="w-6 h-6 text-purple-400" />
        <h2 className="text-2xl font-bold text-white">Settings</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-400" />
              Profile & Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <p className="text-purple-200 text-sm mb-2">Authentication Status</p>
              <p className="text-white">Authenticated User</p>
              <p className="text-gray-400 text-xs">Your data is synchronized and secure</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Download className="w-5 h-5 mr-2 text-green-400" />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button 
                onClick={handleImportData} 
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Promotion Data
              </Button>
              <p className="text-gray-400 text-xs">
                Import a previously exported promotion JSON file
              </p>
            </div>
            
            <div className="border-t border-slate-600 pt-4">
              <Button 
                onClick={handleResetData} 
                variant="destructive" 
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Reset All Data
              </Button>
              <p className="text-gray-400 text-xs mt-1">
                This will permanently delete all promotion data
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">App Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-purple-200">Auto-save Changes</Label>
                <p className="text-gray-400 text-sm">Automatically save changes to local storage</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-purple-200">Show Match Ratings</Label>
                <p className="text-gray-400 text-sm">Display star ratings for matches</p>
              </div>
              <Switch defaultChecked />
            </div>
            
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">App Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-purple-200">Version</span>
              <span className="text-white">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-200">Last Updated</span>
              <span className="text-white">June 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-200">Data Storage</span>
              <span className="text-white">Local Browser</span>
            </div>
            <div className="pt-3 border-t border-slate-600">
              <p className="text-gray-400 text-sm">
                Built for wrestling enthusiasts who want complete control over their promotion experience.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
