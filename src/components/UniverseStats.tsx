
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trophy, Users, Calendar, Zap, Star, Shield, Clock, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UniverseData {
  totalWrestlers: number;
  activeChampionships: number;
  upcomingShows: number;
  activeRivalries: number;
  totalMatches: number;
  upcomingMatches: any[];
  currentChampions: any[];
}

export const UniverseStats = () => {
  const [stats, setStats] = useState<UniverseData>({
    totalWrestlers: 0,
    activeChampionships: 0,
    upcomingShows: 0,
    activeRivalries: 0,
    totalMatches: 0,
    upcomingMatches: [],
    currentChampions: []
  });
  
  const [isEditOutcomeDialogOpen, setIsEditOutcomeDialogOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [matchOutcome, setMatchOutcome] = useState({
    result: "",
    notes: ""
  });
  
  const { toast } = useToast();

  useEffect(() => {
    // Load stats from localStorage
    const wrestlers = JSON.parse(localStorage.getItem("wrestlers") || "[]");
    const championships = JSON.parse(localStorage.getItem("championships") || "[]");
    const shows = JSON.parse(localStorage.getItem("shows") || "[]");
    const rivalries = JSON.parse(localStorage.getItem("rivalries") || "[]");

    // Process shows to get upcoming matches
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const upcomingMatches: any[] = [];
    const upcomingShowsCount = new Set();

    // Process all shows to find upcoming matches
    shows.forEach((show: any) => {
      let showDate: Date | null = null;
      let isUpcoming = false;

      // Handle specific instances
      if (!show.isTemplate && show.instanceDate) {
        showDate = new Date(show.instanceDate);
        showDate.setHours(0, 0, 0, 0);
        isUpcoming = showDate >= now;
      }
      // Handle templates that recur
      else if (show.isTemplate && show.date) {
        const templateDate = new Date(show.date);
        templateDate.setHours(0, 0, 0, 0);
        
        // Find next occurrence based on frequency
        const daysDiff = Math.floor((now.getTime() - templateDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (show.frequency) {
          case 'weekly':
            if (daysDiff >= 0) {
              const weeksAhead = Math.ceil(daysDiff / 7);
              showDate = new Date(templateDate);
              showDate.setDate(templateDate.getDate() + (weeksAhead * 7));
              isUpcoming = true;
            }
            break;
          case 'monthly':
            if (daysDiff >= 0) {
              showDate = new Date(templateDate);
              showDate.setMonth(now.getMonth() + (now.getDate() >= templateDate.getDate() ? 1 : 0));
              isUpcoming = true;
            }
            break;
          case 'one-time':
            showDate = templateDate;
            isUpcoming = showDate >= now;
            break;
        }
      }

      if (isUpcoming && showDate) {
        // Count upcoming shows
        upcomingShowsCount.add(`${show.name}-${showDate.toDateString()}`);
        
        // Add matches from this show
        if (show.matches && show.matches.length > 0) {
          show.matches.forEach((match: any) => {
            upcomingMatches.push({
              ...match,
              showName: show.name,
              showDate: showDate!.toISOString(),
              showBrand: show.brand
            });
          });
        }
      }
    });

    // Sort upcoming matches by date and limit to 10
    upcomingMatches.sort((a, b) => new Date(a.showDate).getTime() - new Date(b.showDate).getTime());
    const limitedUpcomingMatches = upcomingMatches.slice(0, 10);

    // Get current champions with reign data
    const currentChampions = championships
      .filter((c: any) => c.currentChampion && !c.retired)
      .map((c: any) => {
        const reignLength = c.reignStart ? 
          Math.floor((new Date().getTime() - new Date(c.reignStart).getTime()) / (1000 * 60 * 60 * 24)) : 0;
        
        return {
          title: c.name,
          champion: c.currentChampion,
          reignStart: c.reignStart,
          reignLength,
          brand: c.brand
        };
      })
      .sort((a, b) => b.reignLength - a.reignLength); // Sort by longest reign first

    setStats({
      totalWrestlers: wrestlers.length,
      activeChampionships: championships.filter((c: any) => c.currentChampion && !c.retired).length,
      upcomingShows: upcomingShowsCount.size,
      activeRivalries: rivalries.filter((r: any) => r.status === "active").length,
      totalMatches: shows.reduce((acc: number, show: any) => acc + (show.matches?.length || 0), 0),
      upcomingMatches: limitedUpcomingMatches,
      currentChampions
    });
  }, []);

  const statCards = [
    {
      title: "Total Wrestlers",
      value: stats.totalWrestlers,
      icon: Users,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Active Championships",
      value: stats.activeChampionships,
      icon: Trophy,
      color: "from-yellow-500 to-orange-500"
    },
    {
      title: "Upcoming Shows",
      value: stats.upcomingShows,
      icon: Calendar,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Active Rivalries",
      value: stats.activeRivalries,
      icon: Zap,
      color: "from-red-500 to-pink-500"
    },
    {
      title: "Total Matches Booked",
      value: stats.totalMatches,
      icon: Star,
      color: "from-purple-500 to-violet-500"
    }
  ];

  const getBrandColor = (brand: string) => {
    switch (brand) {
      case "Raw": return "border-red-500/30 bg-red-500/10";
      case "SmackDown": return "border-blue-500/30 bg-blue-500/10";
      case "NXT": return "border-yellow-500/30 bg-yellow-500/10";
      case "PPV": return "border-orange-500/30 bg-orange-500/10";
      case "Special": return "border-green-500/30 bg-green-500/10";
      default: return "border-gray-500/30 bg-gray-500/10";
    }
  };

  const getChampionshipBrandColor = (brand: string) => {
    switch (brand) {
      case "Raw": return "from-red-500/20 to-red-600/20 border-red-500/30";
      case "SmackDown": return "from-blue-500/20 to-blue-600/20 border-blue-500/30";
      case "NXT": return "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30";
      default: return "from-purple-500/20 to-purple-600/20 border-purple-500/30";
    }
  };

  const openEditOutcomeDialog = (match: any) => {
    setSelectedMatch(match);
    setMatchOutcome({
      result: match.result || "",
      notes: match.notes || ""
    });
    setIsEditOutcomeDialogOpen(true);
  };

  const saveMatchOutcome = () => {
    if (!selectedMatch) return;
    
    const shows = JSON.parse(localStorage.getItem("shows") || "[]");
    const updatedShows = shows.map((show: any) => {
      if (show.matches && show.matches.length > 0) {
        const updatedMatches = show.matches.map((match: any) => {
          if (match.id === selectedMatch.id) {
            return {
              ...match,
              result: matchOutcome.result,
              notes: matchOutcome.notes
            };
          }
          return match;
        });
        return { ...show, matches: updatedMatches };
      }
      return show;
    });
    
    localStorage.setItem("shows", JSON.stringify(updatedShows));
    
    // Update the local state
    const updatedUpcomingMatches = stats.upcomingMatches.map((match: any) => {
      if (match.id === selectedMatch.id) {
        return {
          ...match,
          result: matchOutcome.result,
          notes: matchOutcome.notes
        };
      }
      return match;
    });
    
    setStats(prev => ({
      ...prev,
      upcomingMatches: updatedUpcomingMatches
    }));
    
    setIsEditOutcomeDialogOpen(false);
    setSelectedMatch(null);
    setMatchOutcome({ result: "", notes: "" });
    
    toast({
      title: "Match Outcome Updated",
      description: "The match result has been saved successfully."
    });
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="bg-slate-800/50 border-purple-500/30 hover:border-purple-400/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-200">{stat.title}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-gradient-to-r ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-purple-400" />
              Upcoming Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.upcomingMatches.length > 0 ? (
                stats.upcomingMatches.map((match, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${getBrandColor(match.showBrand)}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{match.participants.join(" vs ")}</h4>
                        <p className="text-sm text-purple-200">{match.type}</p>
                        {match.championship && (
                          <p className="text-sm text-yellow-400">Championship: {match.championship}</p>
                        )}
                        {match.result && (
                          <p className="text-sm text-green-400">Result: {match.result}</p>
                        )}
                      </div>
                      <div className="flex items-start justify-between">
                        <div className="text-right mr-3">
                          <p className="text-sm text-purple-300">{match.showName}</p>
                          <p className="text-xs text-purple-400">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {new Date(match.showDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-400 hover:bg-blue-500/20 h-8 w-8 p-0"
                          onClick={() => openEditOutcomeDialog(match)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    {match.stipulation && (
                      <p className="text-xs text-orange-400">Stipulation: {match.stipulation}</p>
                    )}
                    {match.notes && (
                      <p className="text-xs text-slate-400">Notes: {match.notes}</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Calendar className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-purple-200">No upcoming matches scheduled</p>
                  <p className="text-sm text-purple-400">Book some shows to see upcoming matches here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
              Championship Spotlight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.currentChampions.length > 0 ? (
                stats.currentChampions.slice(0, 4).map((champion, index) => (
                  <div key={index} className={`bg-gradient-to-r ${getChampionshipBrandColor(champion.brand)} p-4 rounded-lg border`}>
                    <h3 className="font-bold text-yellow-400">{champion.title}</h3>
                    <p className="text-white font-semibold">{champion.champion}</p>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-purple-200 text-sm">
                        Reign: {champion.reignLength} days
                      </p>
                      <p className="text-purple-400 text-xs">
                        Since {new Date(champion.reignStart).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-purple-200">No active champions</p>
                  <p className="text-sm text-purple-400">Assign champions to see them here</p>
                </div>
              )}
              
              {stats.currentChampions.length > 4 && (
                <div className="text-center pt-2 border-t border-purple-500/30">
                  <p className="text-purple-400 text-sm">
                    +{stats.currentChampions.length - 4} more champions
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Edit Outcome Dialog */}
      <Dialog open={isEditOutcomeDialogOpen} onOpenChange={setIsEditOutcomeDialogOpen}>
        <DialogContent className="bg-slate-800 border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-white">
              Edit Match Outcome
            </DialogTitle>
          </DialogHeader>
          {selectedMatch && (
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-semibold mb-2">
                  {selectedMatch.participants.join(" vs ")} - {selectedMatch.type}
                </h3>
                <p className="text-purple-200 text-sm">
                  {selectedMatch.showName} - {new Date(selectedMatch.showDate).toLocaleDateString()}
                </p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-purple-200">Match Result</Label>
                  <Input
                    value={matchOutcome.result}
                    onChange={(e) => setMatchOutcome({...matchOutcome, result: e.target.value})}
                    placeholder="e.g., John Cena wins via pinfall"
                    className="bg-slate-700 border-purple-500/30 text-white"
                  />
                </div>
                
                <div>
                  <Label className="text-purple-200">Additional Notes</Label>
                  <Textarea
                    value={matchOutcome.notes}
                    onChange={(e) => setMatchOutcome({...matchOutcome, notes: e.target.value})}
                    placeholder="Any additional details about the match outcome..."
                    className="bg-slate-700 border-purple-500/30 text-white"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="ghost"
                  onClick={() => setIsEditOutcomeDialogOpen(false)}
                  className="text-purple-400 hover:bg-purple-500/20"
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveMatchOutcome}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Save Outcome
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
