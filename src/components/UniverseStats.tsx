
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Calendar, Zap, Star, Shield, Clock } from "lucide-react";

interface UniverseData {
  totalWrestlers: number;
  activeChampionships: number;
  upcomingShows: number;
  activeRivalries: number;
  totalMatches: number;
  upcomingMatches: any[];
}

export const UniverseStats = () => {
  const [stats, setStats] = useState<UniverseData>({
    totalWrestlers: 0,
    activeChampionships: 0,
    upcomingShows: 0,
    activeRivalries: 0,
    totalMatches: 0,
    upcomingMatches: []
  });

  useEffect(() => {
    // Load stats from localStorage
    const wrestlers = JSON.parse(localStorage.getItem("wrestlers") || "[]");
    const championships = JSON.parse(localStorage.getItem("championships") || "[]");
    const shows = JSON.parse(localStorage.getItem("shows") || "[]");
    const rivalries = JSON.parse(localStorage.getItem("rivalries") || "[]");

    // Get upcoming shows and their matches
    const upcomingShows = shows.filter((s: any) => new Date(s.date) > new Date());
    const upcomingMatches = upcomingShows.reduce((acc: any[], show: any) => {
      if (show.matches && show.matches.length > 0) {
        const showMatches = show.matches.map((match: any) => ({
          ...match,
          showName: show.name,
          showDate: show.date,
          showBrand: show.brand
        }));
        return [...acc, ...showMatches];
      }
      return acc;
    }, []).slice(0, 10); // Limit to 10 upcoming matches

    setStats({
      totalWrestlers: wrestlers.length,
      activeChampionships: championships.filter((c: any) => c.currentChampion).length,
      upcomingShows: upcomingShows.length,
      activeRivalries: rivalries.filter((r: any) => r.status === "active").length,
      totalMatches: shows.reduce((acc: number, show: any) => acc + (show.matches?.length || 0), 0),
      upcomingMatches
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
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-purple-300">{match.showName}</p>
                        <p className="text-xs text-purple-400">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {new Date(match.showDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {match.stipulation && (
                      <p className="text-xs text-orange-400">Stipulation: {match.stipulation}</p>
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
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-4 rounded-lg border border-yellow-500/30">
                <h3 className="font-bold text-yellow-400">WWE Championship</h3>
                <p className="text-white">John Cena - 45 days</p>
                <p className="text-purple-200 text-sm">Next Defense: SummerSlam</p>
              </div>
              <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-4 rounded-lg border border-blue-500/30">
                <h3 className="font-bold text-blue-400">Universal Championship</h3>
                <p className="text-white">Roman Reigns - 127 days</p>
                <p className="text-purple-200 text-sm">Next Defense: Monday Night Raw</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
