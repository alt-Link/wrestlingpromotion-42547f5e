
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Zap, Plus, Users, Edit, Trash2, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Rivalry {
  id: string;
  name: string;
  participants: string[];
  type: string;
  intensity: number;
  startDate: string;
  endDate?: string;
  description: string;
  events: RivalryEvent[];
  active: boolean;
}

interface RivalryEvent {
  id: string;
  date: string;
  type: string;
  description: string;
}

export const RivalryTracker = () => {
  const [rivalries, setRivalries] = useState<Rivalry[]>([]);
  const [wrestlers, setWrestlers] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const [newRivalry, setNewRivalry] = useState<Partial<Rivalry>>({
    name: "",
    participants: [],
    type: "personal",
    intensity: 1,
    description: "",
    events: [],
    active: true
  });

  useEffect(() => {
    const savedRivalries = localStorage.getItem("rivalries");
    if (savedRivalries) {
      setRivalries(JSON.parse(savedRivalries));
    }

    const savedWrestlers = localStorage.getItem("wrestlers");
    if (savedWrestlers) {
      setWrestlers(JSON.parse(savedWrestlers));
    }
  }, []);

  const saveRivalries = (updatedRivalries: Rivalry[]) => {
    setRivalries(updatedRivalries);
    localStorage.setItem("rivalries", JSON.stringify(updatedRivalries));
  };

  const addRivalry = () => {
    if (!newRivalry.name?.trim() || !newRivalry.participants?.length || newRivalry.participants.length < 2) {
      toast({
        title: "Error",
        description: "Rivalry name and at least 2 participants are required",
        variant: "destructive"
      });
      return;
    }

    const rivalry: Rivalry = {
      id: Date.now().toString(),
      name: newRivalry.name!,
      participants: newRivalry.participants!,
      type: newRivalry.type || "personal",
      intensity: newRivalry.intensity || 1,
      startDate: new Date().toISOString(),
      description: newRivalry.description || "",
      events: [],
      active: true
    };

    const updatedRivalries = [...rivalries, rivalry];
    saveRivalries(updatedRivalries);
    
    setNewRivalry({
      name: "",
      participants: [],
      type: "personal",
      intensity: 1,
      description: "",
      events: [],
      active: true
    });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Rivalry Created",
      description: `${rivalry.name} has been added to your storylines.`
    });
  };

  const deleteRivalry = (id: string) => {
    const updatedRivalries = rivalries.filter(r => r.id !== id);
    saveRivalries(updatedRivalries);
    toast({
      title: "Rivalry Deleted",
      description: "Rivalry has been removed from your storylines."
    });
  };

  const toggleRivalryStatus = (id: string) => {
    const updatedRivalries = rivalries.map(r => 
      r.id === id ? { ...r, active: !r.active, endDate: r.active ? new Date().toISOString() : undefined } : r
    );
    saveRivalries(updatedRivalries);
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity <= 2) return "bg-green-500";
    if (intensity <= 4) return "bg-yellow-500";
    if (intensity <= 6) return "bg-orange-500";
    if (intensity <= 8) return "bg-red-500";
    return "bg-red-700";
  };

  const getIntensityLabel = (intensity: number) => {
    if (intensity <= 2) return "Simmering";
    if (intensity <= 4) return "Building";
    if (intensity <= 6) return "Heated";
    if (intensity <= 8) return "Intense";
    return "Blood Feud";
  };

  const getRivalryTypeColor = (type: string) => {
    switch (type) {
      case "personal": return "bg-blue-500";
      case "championship": return "bg-yellow-500";
      case "faction": return "bg-purple-500";
      case "romantic": return "bg-pink-500";
      case "betrayal": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Zap className="w-6 h-6 text-red-400" />
          <h2 className="text-2xl font-bold text-white">Rivalry Tracker</h2>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Rivalry
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-red-500/30 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Rivalry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="rivalryName" className="text-red-200">Rivalry Name</Label>
                <Input
                  id="rivalryName"
                  value={newRivalry.name || ""}
                  onChange={(e) => setNewRivalry({...newRivalry, name: e.target.value})}
                  className="bg-slate-700 border-red-500/30 text-white"
                  placeholder="e.g. The Ultimate Rivalry"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-red-200">Rivalry Type</Label>
                  <Select value={newRivalry.type} onValueChange={(value) => setNewRivalry({...newRivalry, type: value})}>
                    <SelectTrigger className="bg-slate-700 border-red-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-red-500/30">
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="championship">Championship</SelectItem>
                      <SelectItem value="faction">Faction War</SelectItem>
                      <SelectItem value="romantic">Romantic</SelectItem>
                      <SelectItem value="betrayal">Betrayal</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-red-200">Intensity Level (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={newRivalry.intensity || 1}
                    onChange={(e) => setNewRivalry({...newRivalry, intensity: parseInt(e.target.value)})}
                    className="bg-slate-700 border-red-500/30 text-white"
                  />
                </div>
              </div>

              <div>
                <Label className="text-red-200">Participants</Label>
                <div className="space-y-2">
                  {wrestlers.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {wrestlers.map((wrestler) => (
                        <label key={wrestler.id} className="flex items-center space-x-2 text-sm text-white">
                          <input
                            type="checkbox"
                            checked={newRivalry.participants?.includes(wrestler.name) || false}
                            onChange={(e) => {
                              const participants = newRivalry.participants || [];
                              if (e.target.checked) {
                                setNewRivalry({...newRivalry, participants: [...participants, wrestler.name]});
                              } else {
                                setNewRivalry({...newRivalry, participants: participants.filter(p => p !== wrestler.name)});
                              }
                            }}
                            className="rounded border-red-500/30"
                          />
                          <span>{wrestler.name}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">No wrestlers found. Add wrestlers to your roster first.</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-red-200">Description</Label>
                <Input
                  id="description"
                  value={newRivalry.description || ""}
                  onChange={(e) => setNewRivalry({...newRivalry, description: e.target.value})}
                  className="bg-slate-700 border-red-500/30 text-white"
                  placeholder="Describe the storyline and background"
                />
              </div>

              <Button onClick={addRivalry} className="w-full bg-red-600 hover:bg-red-700">
                Create Rivalry
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rivalries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rivalries.map((rivalry) => (
          <Card key={rivalry.id} className="bg-slate-800/50 border-red-500/30 hover:border-red-400/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-white text-lg">{rivalry.name}</CardTitle>
                <div className="flex space-x-2">
                  <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-500/20">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-red-400 hover:bg-red-500/20"
                    onClick={() => deleteRivalry(rivalry.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge className={`${getRivalryTypeColor(rivalry.type)} text-white`}>
                  {rivalry.type}
                </Badge>
                <Badge className={`${getIntensityColor(rivalry.intensity)} text-white`}>
                  {getIntensityLabel(rivalry.intensity)}
                </Badge>
                {rivalry.active ? (
                  <Badge className="bg-green-500 text-white">Active</Badge>
                ) : (
                  <Badge variant="outline" className="border-gray-500 text-gray-400">Concluded</Badge>
                )}
              </div>
              
              <div>
                <p className="text-sm text-red-200 mb-1">Participants:</p>
                <div className="flex flex-wrap gap-1">
                  {rivalry.participants.map((participant, index) => (
                    <span key={index} className="text-xs bg-slate-600 text-white px-2 py-1 rounded">
                      {participant}
                    </span>
                  ))}
                </div>
              </div>
              
              {rivalry.description && (
                <p className="text-sm text-slate-400">{rivalry.description}</p>
              )}
              
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-red-200">
                  Started: {new Date(rivalry.startDate).toLocaleDateString()}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleRivalryStatus(rivalry.id)}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                >
                  {rivalry.active ? "End" : "Reactivate"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {rivalries.length === 0 && (
        <Card className="bg-slate-800/50 border-red-500/30">
          <CardContent className="text-center py-12">
            <Zap className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Rivalries Created</h3>
            <p className="text-red-200 mb-4">
              Start building compelling storylines by creating your first rivalry.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="bg-red-600 hover:bg-red-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Rivalry
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
