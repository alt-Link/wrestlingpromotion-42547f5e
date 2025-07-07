import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RosterManager } from "@/components/RosterManager";
import { ChampionshipManager } from "@/components/ChampionshipManager";
import { ShowBooking } from "@/components/ShowBooking";
import { RivalryTracker } from "@/components/RivalryTracker";
import { CalendarView } from "@/components/CalendarView";
import { UniverseStats } from "@/components/UniverseStats";
import { Settings } from "@/components/Settings";
import { Storylines } from "@/components/Storylines";
import { Trophy, Users, Calendar, Zap, BarChart3, Settings as SettingsIcon, Download, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { toast } = useToast();

  const handleExportData = () => {
    // Get universe data from localStorage
    const universeData = {
      wrestlers: JSON.parse(localStorage.getItem("wrestlers") || "[]"),
      championships: JSON.parse(localStorage.getItem("championships") || "[]"),
      shows: JSON.parse(localStorage.getItem("shows") || "[]"),
      rivalries: JSON.parse(localStorage.getItem("rivalries") || "[]"),
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(universeData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `wrestling-universe-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    toast({
      title: "Universe Exported",
      description: "Your wrestling universe data has been downloaded successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto p-6">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Wrestling 2K25 Universe Manager
              </h1>
              <p className="text-purple-200">Complete control over your wrestling universe</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleExportData} variant="outline" className="border-purple-500 text-purple-300 hover:bg-purple-500/20">
                <Download className="w-4 h-4 mr-2" />
                Export Universe
              </Button>
            </div>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8 mb-8 bg-slate-800/50 border border-purple-500/30">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-purple-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="roster" className="data-[state=active]:bg-purple-600">
              <Users className="w-4 h-4 mr-2" />
              Roster
            </TabsTrigger>
            <TabsTrigger value="championships" className="data-[state=active]:bg-purple-600">
              <Trophy className="w-4 h-4 mr-2" />
              Titles
            </TabsTrigger>
            <TabsTrigger value="booking" className="data-[state=active]:bg-purple-600">
              <Calendar className="w-4 h-4 mr-2" />
              Booking
            </TabsTrigger>
            <TabsTrigger value="calendar" className="data-[state=active]:bg-purple-600">
              <Calendar className="w-4 h-4 mr-2" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="rivalries" className="data-[state=active]:bg-purple-600">
              <Zap className="w-4 h-4 mr-2" />
              Rivalries
            </TabsTrigger>
            <TabsTrigger value="storylines" className="data-[state=active]:bg-purple-600">
              <BookOpen className="w-4 h-4 mr-2" />
              Storylines
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-purple-600">
              <SettingsIcon className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <UniverseStats />
          </TabsContent>

          <TabsContent value="roster">
            <RosterManager />
          </TabsContent>

          <TabsContent value="championships">
            <ChampionshipManager />
          </TabsContent>

          <TabsContent value="booking">
            <ShowBooking />
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarView />
          </TabsContent>

          <TabsContent value="rivalries">
            <RivalryTracker />
          </TabsContent>

          <TabsContent value="storylines">
            <Storylines />
          </TabsContent>

          <TabsContent value="settings">
            <Settings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
