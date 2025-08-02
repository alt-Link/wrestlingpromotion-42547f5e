
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trophy, Plus, Crown, Calendar, User, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAutoSave } from "@/hooks/useAutoSave";

interface Championship {
  id: string;
  name: string;
  brand: string;
  currentChampion?: string;
  reignStart?: string;
  reignLength?: number;
  history: {
    champion: string;
    start: string;
    end?: string;
    days: number;
    event: string;
  }[];
  retired: boolean;
}

export const ChampionshipManager = () => {
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedChampionship, setSelectedChampionship] = useState<Championship | null>(null);
  const [wrestlers, setWrestlers] = useState<any[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const { toast } = useToast();

  // Auto-save hook
  const autoSaveChampionships = useAutoSave({
    onSave: () => localStorage.setItem("championships", JSON.stringify(championships)),
    showToast: false
  });

  const [newChampionship, setNewChampionship] = useState({
    name: "",
    brand: "",
  });

  const [newChampion, setNewChampion] = useState({
    wrestler: "",
    event: "",
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const savedChampionships = localStorage.getItem("championships");
    const savedWrestlers = localStorage.getItem("wrestlers");
    const savedShows = localStorage.getItem("shows");
    
    if (savedChampionships) {
      setChampionships(JSON.parse(savedChampionships));
    } else {
      // Start with empty championships
      setChampionships([]);
    }

    if (savedWrestlers) {
      setWrestlers(JSON.parse(savedWrestlers));
    }

    // Get available brands from shows
    if (savedShows) {
      const shows = JSON.parse(savedShows);
      const brands = Array.from(new Set(shows.map((show: any) => show.brand).filter((brand: string) => brand && brand.trim()))) as string[];
      setAvailableBrands(brands);
    } else {
      setAvailableBrands([]);
    }
  }, []);

  // Trigger auto-save when championships change
  useEffect(() => {
    autoSaveChampionships();
  }, [championships, autoSaveChampionships]);

  const saveChampionships = (updatedChampionships: Championship[]) => {
    setChampionships(updatedChampionships);
    localStorage.setItem("championships", JSON.stringify(updatedChampionships));
  };

  const addChampionship = () => {
    if (!newChampionship.name.trim()) {
      toast({
        title: "Error",
        description: "Championship name is required",
        variant: "destructive"
      });
      return;
    }

    const championship: Championship = {
      id: Date.now().toString(),
      name: newChampionship.name,
      brand: newChampionship.brand,
      history: [],
      retired: false
    };

    const updatedChampionships = [...championships, championship];
    saveChampionships(updatedChampionships);
    
    setNewChampionship({ name: "", brand: "" });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Championship Created",
      description: `${championship.name} has been added.`
    });
  };

  const assignChampion = () => {
    if (!selectedChampionship || !newChampion.wrestler || !newChampion.event) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const updatedChampionships = championships.map(championship => {
      if (championship.id === selectedChampionship.id) {
        // End current reign if there is one
        let updatedHistory = [...championship.history];
        if (championship.currentChampion) {
          const currentReign = updatedHistory[updatedHistory.length - 1];
          if (currentReign && !currentReign.end) {
            const days = Math.floor((new Date(newChampion.date).getTime() - new Date(currentReign.start).getTime()) / (1000 * 60 * 60 * 24));
            currentReign.end = newChampion.date;
            currentReign.days = days;
          }
        }

        // Add new reign
        updatedHistory.push({
          champion: newChampion.wrestler,
          start: newChampion.date,
          days: 0,
          event: newChampion.event
        });

        return {
          ...championship,
          currentChampion: newChampion.wrestler,
          reignStart: newChampion.date,
          reignLength: 0,
          history: updatedHistory
        };
      }
      return championship;
    });

    saveChampionships(updatedChampionships);
    
    // Update wrestler titles
    const updatedWrestlers = wrestlers.map(wrestler => {
      if (wrestler.name === newChampion.wrestler) {
        const titles = [...(wrestler.titles || [])];
        if (!titles.includes(selectedChampionship.name)) {
          titles.push(selectedChampionship.name);
        }
        return { ...wrestler, titles };
      }
      return wrestler;
    });
    
    localStorage.setItem("wrestlers", JSON.stringify(updatedWrestlers));
    setWrestlers(updatedWrestlers);
    
    setNewChampion({ wrestler: "", event: "", date: new Date().toISOString().split('T')[0] });
    setIsAssignDialogOpen(false);
    setSelectedChampionship(null);
    
    toast({
      title: "Champion Assigned",
      description: `${newChampion.wrestler} is now the ${selectedChampionship.name} champion!`
    });
  };

  const vacateTitle = (championship: Championship) => {
    const updatedChampionships = championships.map(c => {
      if (c.id === championship.id) {
        // End current reign
        let updatedHistory = [...c.history];
        if (c.currentChampion) {
          const currentReign = updatedHistory[updatedHistory.length - 1];
          if (currentReign && !currentReign.end) {
            const days = Math.floor((new Date().getTime() - new Date(currentReign.start).getTime()) / (1000 * 60 * 60 * 24));
            currentReign.end = new Date().toISOString().split('T')[0];
            currentReign.days = days;
          }
        }

        return {
          ...c,
          currentChampion: undefined,
          reignStart: undefined,
          reignLength: undefined,
          history: updatedHistory
        };
      }
      return c;
    });

    saveChampionships(updatedChampionships);
    
    toast({
      title: "Title Vacated",
      description: `The ${championship.name} has been vacated.`
    });
  };

  const deleteHistoryEntry = (championshipId: string, historyIndex: number) => {
    const updatedChampionships = championships.map(championship => {
      if (championship.id === championshipId) {
        const updatedHistory = [...championship.history];
        const deletedEntry = updatedHistory.splice(historyIndex, 1)[0];
        
        // If we deleted the most recent entry and it was the current champion, update current champion
        let updatedChampionship = { ...championship, history: updatedHistory };
        if (historyIndex === championship.history.length - 1 && championship.currentChampion === deletedEntry.champion) {
          // Find the new current champion (last entry in history)
          const newCurrentEntry = updatedHistory[updatedHistory.length - 1];
          if (newCurrentEntry && !newCurrentEntry.end) {
            updatedChampionship.currentChampion = newCurrentEntry.champion;
            updatedChampionship.reignStart = newCurrentEntry.start;
          } else {
            // No current champion
            updatedChampionship.currentChampion = undefined;
            updatedChampionship.reignStart = undefined;
            updatedChampionship.reignLength = undefined;
          }
        }
        
        return updatedChampionship;
      }
      return championship;
    });

    saveChampionships(updatedChampionships);
    
    toast({
      title: "History Entry Deleted",
      description: "The championship history entry has been removed."
    });
  };

  const getBrandColor = (brand: string) => {
    switch (brand) {
      case "Raw": return "bg-red-500";
      case "SmackDown": return "bg-blue-500";
      case "NXT": return "bg-yellow-500";
      default: return "bg-purple-500";
    }
  };

  const calculateReignLength = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Championship Management</h2>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-yellow-600 hover:bg-yellow-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Championship
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-purple-500/30">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Championship</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-purple-200">Championship Name</Label>
                <Input
                  id="name"
                  value={newChampionship.name}
                  onChange={(e) => setNewChampionship({...newChampionship, name: e.target.value})}
                  className="bg-slate-700 border-purple-500/30 text-white"
                  placeholder="e.g., Hardcore Championship"
                />
              </div>
              <div>
                <Label className="text-purple-200">Brand</Label>
                <Select value={newChampionship.brand} onValueChange={(value) => setNewChampionship({...newChampionship, brand: value})}>
                  <SelectTrigger className="bg-slate-700 border-purple-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-purple-500/30">
                    <SelectItem value="Cross-Brand">Cross-Brand</SelectItem>
                    {availableBrands.map(brand => (
                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addChampionship} className="w-full bg-yellow-600 hover:bg-yellow-700">
                Create Championship
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Championships Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {championships.filter(c => !c.retired).map((championship) => (
          <Card key={championship.id} className="bg-slate-800/50 border-yellow-500/30 hover:border-yellow-400/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  <CardTitle className="text-white text-lg">{championship.name}</CardTitle>
                </div>
                <Badge className={`${getBrandColor(championship.brand)} text-white`}>
                  {championship.brand}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {championship.currentChampion ? (
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-4 rounded-lg border border-yellow-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 font-semibold">Current Champion</span>
                    </div>
                    <div className="flex items-center space-x-1 text-purple-200 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{championship.reignStart && calculateReignLength(championship.reignStart)} days</span>
                    </div>
                  </div>
                  <p className="text-white font-bold text-lg">{championship.currentChampion}</p>
                  <p className="text-yellow-200 text-sm">Since {championship.reignStart}</p>
                </div>
              ) : (
                <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                  <p className="text-gray-400 text-center">Championship Vacant</p>
                </div>
              )}

              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setSelectedChampionship(championship);
                    setIsAssignDialogOpen(true);
                  }}
                >
                  {championship.currentChampion ? "New Champion" : "Assign Champion"}
                </Button>
                {championship.currentChampion && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-red-500 text-red-400 hover:bg-red-500/20"
                    onClick={() => vacateTitle(championship)}
                  >
                    Vacate
                  </Button>
                )}
              </div>

              {championship.history.length > 0 && (
                <div>
                  <h4 className="text-purple-200 font-medium mb-2">Recent History</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {championship.history.slice(-3).reverse().map((reign, displayIndex) => {
                      const actualIndex = championship.history.length - 1 - displayIndex;
                      return (
                        <div key={displayIndex} className="bg-slate-700/30 p-2 rounded text-sm">
                          <div className="flex justify-between items-center">
                            <div className="flex-1">
                              <div className="flex justify-between items-center">
                                <span className="text-white font-medium">{reign.champion}</span>
                                <div className="flex items-center space-x-2">
                                  <span className="text-purple-200">{reign.days} days</span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-400 hover:bg-red-500/20 h-6 w-6 p-0"
                                    onClick={() => deleteHistoryEntry(championship.id, actualIndex)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              <div className="text-gray-400 text-xs">
                                {reign.start} {reign.end && `- ${reign.end}`} • {reign.event}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Assign Champion Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="bg-slate-800 border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedChampionship?.currentChampion ? "New Champion" : "Assign Champion"} - {selectedChampionship?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-purple-200">Wrestler</Label>
              <Select value={newChampion.wrestler} onValueChange={(value) => setNewChampion({...newChampion, wrestler: value})}>
                <SelectTrigger className="bg-slate-700 border-purple-500/30 text-white">
                  <SelectValue placeholder="Select a wrestler" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-purple-500/30">
                  {wrestlers.map((wrestler) => (
                    <SelectItem key={wrestler.id} value={wrestler.name}>
                      {wrestler.name} ({wrestler.brand})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="event" className="text-purple-200">Event</Label>
              <Input
                id="event"
                value={newChampion.event}
                onChange={(e) => setNewChampion({...newChampion, event: e.target.value})}
                className="bg-slate-700 border-purple-500/30 text-white"
                placeholder="e.g., WrestleMania 40"
              />
            </div>
            <div>
              <Label htmlFor="date" className="text-purple-200">Date</Label>
              <Input
                id="date"
                type="date"
                value={newChampion.date}
                onChange={(e) => setNewChampion({...newChampion, date: e.target.value})}
                className="bg-slate-700 border-purple-500/30 text-white"
              />
            </div>
            <Button onClick={assignChampion} className="w-full bg-green-600 hover:bg-green-700">
              Assign Championship
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {championships.filter(c => !c.retired).length === 0 && (
        <Card className="bg-slate-800/50 border-yellow-500/30">
          <CardContent className="text-center py-12">
            <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Championships Created</h3>
            <p className="text-purple-200 mb-4">
              Create your first championship to start tracking title reigns and history.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="bg-yellow-600 hover:bg-yellow-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Championship
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
