
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Download, Upload, Trash2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUniverseData } from "@/hooks/useUniverseData";

export const Settings = () => {
  const { toast } = useToast();
  const { saveWrestler, saveChampionship, saveShow, saveRivalry, saveStoryline, deleteRecord, data } = useUniverseData();

  const exportData = () => {
    const exportData = {
      wrestlers: data.wrestlers || [],
      championships: data.championships || [],
      shows: data.shows || [],
      rivalries: data.rivalries || [],
      storylines: data.storylines || []
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `wrestling-universe-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data Exported",
      description: "Your wrestling universe has been exported successfully.",
    });
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const importedData = JSON.parse(event.target?.result as string);
            
            console.log('Importing data:', importedData);
            
            let importCount = 0;
            let errorCount = 0;
            
            // Import wrestlers
            if (importedData.wrestlers && Array.isArray(importedData.wrestlers)) {
              for (const wrestler of importedData.wrestlers) {
                const { error } = await saveWrestler(wrestler);
                if (error) {
                  console.error('Error importing wrestler:', wrestler, error);
                  errorCount++;
                } else {
                  importCount++;
                }
              }
            }
            
            // Import championships
            if (importedData.championships && Array.isArray(importedData.championships)) {
              for (const championship of importedData.championships) {
                const { error } = await saveChampionship(championship);
                if (error) {
                  console.error('Error importing championship:', championship, error);
                  errorCount++;
                } else {
                  importCount++;
                }
              }
            }
            
            // Import shows
            if (importedData.shows && Array.isArray(importedData.shows)) {
              for (const show of importedData.shows) {
                const { error } = await saveShow(show);
                if (error) {
                  console.error('Error importing show:', show, error);
                  errorCount++;
                } else {
                  importCount++;
                }
              }
            }
            
            // Import rivalries
            if (importedData.rivalries && Array.isArray(importedData.rivalries)) {
              for (const rivalry of importedData.rivalries) {
                const { error } = await saveRivalry(rivalry);
                if (error) {
                  console.error('Error importing rivalry:', rivalry, error);
                  errorCount++;
                } else {
                  importCount++;
                }
              }
            }
            
            // Import storylines
            if (importedData.storylines && Array.isArray(importedData.storylines)) {
              for (const storyline of importedData.storylines) {
                const { error } = await saveStoryline(storyline);
                if (error) {
                  console.error('Error importing storyline:', storyline, error);
                  errorCount++;
                } else {
                  importCount++;
                }
              }
            }
            
            if (errorCount > 0) {
              toast({
                title: "Import Completed with Errors",
                description: `${importCount} items imported successfully, ${errorCount} items failed.`,
                variant: "destructive"
              });
            } else {
              toast({
                title: "Data Imported Successfully",
                description: `${importCount} items have been imported to your wrestling universe.`,
              });
            }
            
          } catch (error) {
            console.error('Import error:', error);
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

  const handleResetData = async () => {
    if (confirm("Are you sure you want to reset all universe data? This action cannot be undone.")) {
      try {
        // Delete all data from each table
        const deletePromises = [];
        
        for (const wrestler of data.wrestlers || []) {
          deletePromises.push(deleteRecord('wrestlers', wrestler.id));
        }
        
        for (const championship of data.championships || []) {
          deletePromises.push(deleteRecord('championships', championship.id));
        }
        
        for (const show of data.shows || []) {
          deletePromises.push(deleteRecord('shows', show.id));
        }
        
        for (const rivalry of data.rivalries || []) {
          deletePromises.push(deleteRecord('rivalries', rivalry.id));
        }
        
        for (const storyline of data.storylines || []) {
          deletePromises.push(deleteRecord('storylines', storyline.id));
        }
        
        await Promise.all(deletePromises);
        
        toast({
          title: "Universe Reset",
          description: "All data has been cleared successfully.",
        });
        
      } catch (error) {
        console.error('Reset error:', error);
        toast({
          title: "Reset Failed",
          description: "There was an error clearing your data. Please try again.",
          variant: "destructive"
        });
      }
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
              <p className="text-white">Cloud User (Supabase)</p>
              <p className="text-gray-400 text-xs">Your data is synced to the cloud</p>
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
                onClick={exportData} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Universe Data
              </Button>
              <p className="text-gray-400 text-xs">
                Download your universe data as a JSON file
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={handleImportData} 
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Universe Data
              </Button>
              <p className="text-gray-400 text-xs">
                Import a previously exported universe JSON file
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
                This will permanently delete all universe data
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
                <p className="text-gray-400 text-sm">Automatically save changes to cloud storage</p>
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
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-purple-200">Enable AI Suggestions</Label>
                <p className="text-gray-400 text-sm">Get booking and storyline suggestions</p>
              </div>
              <Switch />
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
              <span className="text-white">Cloud (Supabase)</span>
            </div>
            <div className="pt-3 border-t border-slate-600">
              <p className="text-gray-400 text-sm">
                Built for wrestling enthusiasts who want complete control over their Universe Mode experience.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
