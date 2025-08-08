import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RosterManager } from "@/components/RosterManager";
import { ChampionshipManager } from "@/components/ChampionshipManager";
import { ShowBooking } from "@/components/ShowBooking";
import { RivalryTracker } from "@/components/RivalryTracker";
import { CalendarView } from "@/components/CalendarView";
import { PromotionStats } from "@/components/PromotionStats";
import { Settings } from "@/components/Settings";
import { Storylines } from "@/components/Storylines";
import { DataMigrationNotice } from "@/components/DataMigrationNotice";
import { Trophy, Users, Calendar, Zap, BarChart3, Settings as SettingsIcon, Download, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { toast } = useToast();

  const handleExportData = () => {
    // Get promotion data from localStorage
    const promotionData = {
      wrestlers: JSON.parse(localStorage.getItem("wrestlers") || "[]"),
      championships: JSON.parse(localStorage.getItem("championships") || "[]"),
      shows: JSON.parse(localStorage.getItem("shows") || "[]"),
      rivalries: JSON.parse(localStorage.getItem("rivalries") || "[]"),
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(promotionData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `wrestling-promotion-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    toast({
      title: "Promotion Exported",
      description: "Your wrestling promotion data has been downloaded successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">
      <div className="container mx-auto p-6">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                The Gorilla Room
              </h1>
              <p className="text-slate-300">Complete control over your wrestling promotion</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleExportData} variant="outline" className="border-slate-500 text-slate-300 hover:bg-slate-500/20">
                <Download className="w-4 h-4 mr-2" />
                Export Promotion
              </Button>
              <Button 
                onClick={async () => {
                  const { supabase } = await import('@/integrations/supabase/client');
                  await supabase.auth.signOut();
                }}
                variant="outline" 
                className="border-red-500 text-red-300 hover:bg-red-500/20"
              >
                Logout
              </Button>
            </div>
          </div>
        </header>

        <DataMigrationNotice />
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8 mb-8 bg-slate-800/50 border border-slate-600/30">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-slate-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="roster" className="data-[state=active]:bg-slate-600">
              <Users className="w-4 h-4 mr-2" />
              Roster
            </TabsTrigger>
            <TabsTrigger value="championships" className="data-[state=active]:bg-slate-600">
              <Trophy className="w-4 h-4 mr-2" />
              Titles
            </TabsTrigger>
            <TabsTrigger value="booking" className="data-[state=active]:bg-slate-600">
              <Calendar className="w-4 h-4 mr-2" />
              Booking
            </TabsTrigger>
            <TabsTrigger value="calendar" className="data-[state=active]:bg-slate-600">
              <Calendar className="w-4 h-4 mr-2" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="rivalries" className="data-[state=active]:bg-slate-600">
              <Zap className="w-4 h-4 mr-2" />
              Rivalries
            </TabsTrigger>
            <TabsTrigger value="storylines" className="data-[state=active]:bg-slate-600">
              <BookOpen className="w-4 h-4 mr-2" />
              Storylines
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-slate-600">
              <SettingsIcon className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <PromotionStats />
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
