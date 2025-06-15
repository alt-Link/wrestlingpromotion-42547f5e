
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Calendar, Zap, Star, Shield } from "lucide-react";

interface UniverseData {
  totalWrestlers: number;
  activeChampionships: number;
  upcomingShows: number;
  activeRivalries: number;
  totalMatches: number;
  recentActivity: string[];
}

export const UniverseStats = () => {
  const [stats, setStats] = useState<UniverseData>({
    totalWrestlers: 0,
    activeChampionships: 0,
    upcomingShows: 0,
    activeRivalries: 0,
    totalMatches: 0,
    recentActivity: []
  });

  useEffect(() => {
    // Load stats from localStorage
    const wrestlers = JSON.parse(localStorage.getItem("wrestlers") || "[]");
    const championships = JSON.parse(localStorage.getItem("championships") || "[]");
    const shows = JSON.parse(localStorage.getItem("shows") || "[]");
    const rivalries = JSON.parse(localStorage.getItem("rivalries") || "[]");

    setStats({
      totalWrestlers: wrestlers.length,
      activeChampionships: championships.filter((c: any) => c.currentChampion).length,
      upcomingShows: shows.filter((s: any) => new Date(s.date) > new Date()).length,
      activeRivalries: rivalries.filter((r: any) => r.status === "active").length,
      totalMatches: shows.reduce((acc: number, show: any) => acc + (show.matches?.length || 0), 0),
      recentActivity: [
        "John Cena defeated Roman Reigns for the WWE Championship",
        "New rivalry started between Seth Rollins and CM Punk",
        "Monday Night Raw booked for next week",
        "Cody Rhodes added to roster"
      ]
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
              <Shield className="w-5 h-5 mr-2 text-purple-400" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <p className="text-purple-100 text-sm">{activity}</p>
                </div>
              ))}
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
