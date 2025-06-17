
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trophy, Plus, Crown, Calendar, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUniverseData } from "@/hooks/useUniverseData";

export const ChampionshipManager = () => {
  const { data, loading, saveChampionship, deleteRecord } = useUniverseData();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedChampionship, setSelectedChampionship] = useState<any>(null);
  const { toast } = useToast();

  const championships = data.championships || [];
  const wrestlers = data.wrestlers || [];

  const [newChampionship, setNewChampionship] = useState({
    name: "",
    brand: "Raw",
  });

  const [newChampion, setNewChampion] = useState({
    wrestler: "",
    event: "",
    date: new Date().toISOString().split('T')[0]
  });

  const addChampionship = async () => {
    if (!newChampionship.name.trim()) {
      toast({
        title: "Error",
        description: "Championship name is required",
        variant: "destructive"
      });
      return;
    }

    const championship = {
      name: newChampionship.name,
      brand: newChampionship.brand,
      history: [],
      retired: false
    };

    const { error } = await saveChampionship(championship);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to create championship. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    setNewChampionship({ name: "", brand: "Raw" });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Championship Created",
      description: `${championship.name} has been added.`
    });
  };

  const assignChampion = async () => {
    if (!selectedChampionship || !newChampion.wrestler || !newChampion.event) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // End current reign if there is one
    let updatedHistory = [...(selectedChampionship.history || [])];
    if (selectedChampionship.current_champion) {
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

    const updatedChampionship = {
      ...selectedChampionship,
      current_champion: newChampion.wrestler,
      reign_start: newChampion.date,
      history: updatedHistory
    };

    const { error } = await saveChampionship(updatedChampionship);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to assign champion. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    setNewChampion({ wrestler: "", event: "", date: new Date().toISOString().split('T')[0] });
    setIsAssignDialogOpen(false);
    setSelectedChampionship(null);
    
    toast({
      title: "Champion Assigned",
      description: `${newChampion.wrestler} is now the ${selectedChampionship.name} champion!`
    });
  };

  const vacateTitle = async (championship: any) => {
    // End current reign
    let updatedHistory = [...(championship.history || [])];
    if (championship.current_champion) {
      const currentReign = updatedHistory[updatedHistory.length - 1];
      if (currentReign && !currentReign.end) {
        const days = Math.floor((new Date().getTime() - new Date(currentReign.start).getTime()) / (1000 * 60 * 60 * 24));
        currentReign.end = new Date().toISOString().split('T')[0];
        currentReign.days = days;
      }
    }

    const updatedChampionship = {
      ...championship,
      current_champion: null,
      reign_start: null,
      history: updatedHistory
    };

    const { error } = await saveChampionship(updatedChampionship);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to vacate title. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Title Vacated",
      description: `The ${championship.name} has been vacated.`
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

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
                    <SelectItem value="Raw">Raw</SelectItem>
                    <SelectItem value="SmackDown">SmackDown</SelectItem>
                    <SelectItem value="NXT">NXT</SelectItem>
                    <SelectItem value="Cross-Brand">Cross-Brand</SelectItem>
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
              {championship.current_champion ? (
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-4 rounded-lg border border-yellow-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 font-semibold">Current Champion</span>
                    </div>
                    <div className="flex items-center space-x-1 text-purple-200 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{championship.reign_start && calculateReignLength(championship.reign_start)} days</span>
                    </div>
                  </div>
                  <p className="text-white font-bold text-lg">{championship.current_champion}</p>
                  <p className="text-yellow-200 text-sm">Since {championship.reign_start}</p>
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
                  {championship.current_champion ? "New Champion" : "Assign Champion"}
                </Button>
                {championship.current_champion && (
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

              {championship.history && championship.history.length > 0 && (
                <div>
                  <h4 className="text-purple-200 font-medium mb-2">Recent History</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {championship.history.slice(-3).reverse().map((reign: any, index: number) => (
                      <div key={index} className="bg-slate-700/30 p-2 rounded text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-white font-medium">{reign.champion}</span>
                          <span className="text-purple-200">{reign.days} days</span>
                        </div>
                        <div className="text-gray-400 text-xs">
                          {reign.start} {reign.end && `- ${reign.end}`} • {reign.event}
                        </div>
                      </div>
                    ))}
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
              {selectedChampionship?.current_champion ? "New Champion" : "Assign Champion"} - {selectedChampionship?.name}
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
