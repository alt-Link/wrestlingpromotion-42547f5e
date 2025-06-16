
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RosterManager } from "@/components/RosterManager";
import { ChampionshipManager } from "@/components/ChampionshipManager";
import { ShowBooking } from "@/components/ShowBooking";
import { CalendarView } from "@/components/CalendarView";
import { RivalryTracker } from "@/components/RivalryTracker";
import { Storylines } from "@/components/Storylines";
import { Settings } from "@/components/Settings";
import { UniverseStats } from "@/components/UniverseStats";
import { Factions } from "@/components/Factions";
import { AppHeader } from "@/components/AppHeader";
import { useUniverseData } from "@/hooks/useUniverseData";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { data, loading, refetch } = useUniverseData();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Trigger a refetch to ensure data is up to date
      await refetch();
      toast({
        title: "Saved Successfully",
        description: "All your changes have been saved to the cloud.",
      });
    } catch (error) {
      toast({
        title: "Save Error",
        description: "Failed to save. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Set up auto-save
  useAutoSave({
    onSave: handleSave,
    delay: 2000,
    showToast: false
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-purple-200">Loading your universe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <AppHeader onSave={handleSave} saving={saving} />
        
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-9 bg-slate-800/50 border-purple-500/30">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-purple-600">Dashboard</TabsTrigger>
            <TabsTrigger value="roster" className="data-[state=active]:bg-purple-600">Roster</TabsTrigger>
            <TabsTrigger value="factions" className="data-[state=active]:bg-purple-600">Factions</TabsTrigger>
            <TabsTrigger value="championships" className="data-[state=active]:bg-purple-600">Championships</TabsTrigger>
            <TabsTrigger value="booking" className="data-[state=active]:bg-purple-600">Show Booking</TabsTrigger>
            <TabsTrigger value="calendar" className="data-[state=active]:bg-purple-600">Calendar</TabsTrigger>
            <TabsTrigger value="rivalries" className="data-[state=active]:bg-purple-600">Rivalries</TabsTrigger>
            <TabsTrigger value="storylines" className="data-[state=active]:bg-purple-600">Storylines</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-purple-600">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <UniverseStats />
          </TabsContent>

          <TabsContent value="roster">
            <RosterManager />
          </TabsContent>

          <TabsContent value="factions">
            <Factions />
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
