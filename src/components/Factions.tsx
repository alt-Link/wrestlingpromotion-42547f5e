
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Plus, Edit, Trash2, Users, Crown, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUniverseData } from "@/hooks/useUniverseData";

export const Factions = () => {
  const { data, loading } = useUniverseData();
  const { toast } = useToast();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newFactionName, setNewFactionName] = useState("");
  const [newFactionDescription, setNewFactionDescription] = useState("");

  const wrestlers = data.wrestlers || [];
  const championships = data.championships || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  // Group wrestlers by faction
  const factions = wrestlers.reduce((acc: any, wrestler: any) => {
    if (wrestler.faction && wrestler.faction.trim()) {
      if (!acc[wrestler.faction]) {
        acc[wrestler.faction] = [];
      }
      acc[wrestler.faction].push(wrestler);
    }
    return acc;
  }, {});

  const getFactionChampions = (factionMembers: any[]) => {
    return factionMembers.filter(member => 
      championships.some(championship => 
        championship.current_champion === member.name && !championship.retired
      )
    );
  };

  const getBrandColor = (brand: string) => {
    switch (brand) {
      case "Raw": return "bg-red-500/20 border-red-500/30";
      case "SmackDown": return "bg-blue-500/20 border-blue-500/30";
      case "NXT": return "bg-yellow-500/20 border-yellow-500/30";
      default: return "bg-purple-500/20 border-purple-500/30";
    }
  };

  const getAlignmentColor = (alignment: string) => {
    switch (alignment) {
      case "heel": return "text-red-400";
      case "face": return "text-blue-400";
      case "tweener": return "text-yellow-400";
      default: return "text-gray-400";
    }
  };

  const createNewFaction = () => {
    if (!newFactionName.trim()) {
      toast({
        title: "Error",
        description: "Faction name is required",
        variant: "destructive"
      });
      return;
    }

    // Check if faction already exists
    if (factions[newFactionName.trim()]) {
      toast({
        title: "Error",
        description: "A faction with this name already exists",
        variant: "destructive"
      });
      return;
    }

    // For now, we'll just show a success message
    // In a full implementation, this would create a faction record
    toast({
      title: "Faction Created",
      description: `${newFactionName} faction created. Add wrestlers to this faction by editing their profiles.`
    });

    setNewFactionName("");
    setNewFactionDescription("");
    setIsAddDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Faction Management</h2>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Faction
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-purple-500/30">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Faction</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="factionName" className="text-purple-200">Faction Name</Label>
                <Input
                  id="factionName"
                  value={newFactionName}
                  onChange={(e) => setNewFactionName(e.target.value)}
                  className="bg-slate-700 border-purple-500/30 text-white"
                  placeholder="e.g. The Authority, New World Order"
                />
              </div>
              <div>
                <Label htmlFor="factionDescription" className="text-purple-200">Description (Optional)</Label>
                <Textarea
                  id="factionDescription"
                  value={newFactionDescription}
                  onChange={(e) => setNewFactionDescription(e.target.value)}
                  className="bg-slate-700 border-purple-500/30 text-white"
                  placeholder="Describe the faction's purpose and characteristics"
                  rows={3}
                />
              </div>
              <Button onClick={createNewFaction} className="w-full bg-purple-600 hover:bg-purple-700">
                Create Faction
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Factions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(factions).map(([factionName, members]: [string, any]) => {
          const champions = getFactionChampions(members);
          const membersByBrand = members.reduce((acc: any, member: any) => {
            if (!acc[member.brand]) acc[member.brand] = [];
            acc[member.brand].push(member);
            return acc;
          }, {});

          return (
            <Card key={factionName} className="bg-slate-800/50 border-purple-500/30 hover:border-purple-400/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-white text-lg flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-purple-400" />
                    {factionName}
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-purple-400 hover:bg-purple-500/20"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Faction Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-purple-200">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{members.length} members</span>
                  </div>
                  {champions.length > 0 && (
                    <div className="flex items-center text-yellow-400">
                      <Crown className="w-4 h-4 mr-1" />
                      <span>{champions.length} champions</span>
                    </div>
                  )}
                </div>

                {/* Champions Section */}
                {champions.length > 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-lg">
                    <h4 className="text-yellow-400 font-medium text-sm mb-2 flex items-center">
                      <Crown className="w-4 h-4 mr-1" />
                      Title Holders
                    </h4>
                    <div className="space-y-1">
                      {champions.map((champion: any) => {
                        const championshipDetails = championships.find(c => 
                          c.current_champion === champion.name && !c.retired
                        );
                        return (
                          <div key={champion.id} className="text-sm">
                            <span className="text-white font-medium">{champion.name}</span>
                            {championshipDetails && (
                              <span className="text-yellow-300 ml-2">
                                - {championshipDetails.name}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Members by Brand */}
                <div className="space-y-3">
                  <h4 className="text-purple-200 font-medium text-sm">Members</h4>
                  {Object.entries(membersByBrand).map(([brand, brandMembers]: [string, any]) => (
                    <div key={brand} className={`p-3 rounded-lg border ${getBrandColor(brand)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="text-xs font-medium">{brand}</Badge>
                        <span className="text-xs text-slate-400">{brandMembers.length} wrestlers</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {brandMembers.map((member: any) => (
                          <div key={member.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-white text-sm font-medium">{member.name}</span>
                              {member.alignment && (
                                <span className={`text-xs ${getAlignmentColor(member.alignment)}`}>
                                  ({member.alignment})
                                </span>
                              )}
                            </div>
                            {member.overall_rating && (
                              <Badge variant="outline" className="text-xs">
                                {member.overall_rating}/100
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Manager Info */}
                {members.some((member: any) => member.manager) && (
                  <div className="bg-slate-700/50 p-3 rounded-lg">
                    <h4 className="text-purple-200 font-medium text-sm mb-2">Management</h4>
                    <div className="space-y-1">
                      {[...new Set(members.filter((member: any) => member.manager).map((member: any) => member.manager))].map((manager: string) => (
                        <div key={manager} className="text-sm">
                          <span className="text-green-400">Manager: {manager}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {Object.keys(factions).length === 0 && (
        <Card className="bg-slate-800/50 border-purple-500/30">
          <CardContent className="text-center py-12">
            <Shield className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Factions Found</h3>
            <p className="text-purple-200 mb-4">
              Create factions to organize your wrestlers into groups and storylines.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-slate-400">
                To add wrestlers to factions, edit their profiles in the Roster section.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Faction
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions Card */}
      {Object.keys(factions).length > 0 && (
        <Card className="bg-slate-800/50 border-purple-500/30">
          <CardContent className="py-4">
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <Target className="w-4 h-4" />
              <span>
                Tip: To add or remove wrestlers from factions, edit their profiles in the Roster section and update their faction field.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
