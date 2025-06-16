
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Users, Edit, Trash2, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUniverseData } from "@/hooks/useUniverseData";

interface Wrestler {
  id: string;
  name: string;
  brand: string;
  alignment: string;
  gender: string;
  manager?: string;
  faction?: string;
  injured: boolean;
  on_break: boolean;
}

export const RosterManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBrand, setFilterBrand] = useState("all");
  const [filterAlignment, setFilterAlignment] = useState("all");
  const [filterDivision, setFilterDivision] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingWrestler, setEditingWrestler] = useState<Wrestler | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFreeAgentDialogOpen, setIsFreeAgentDialogOpen] = useState(false);
  const [selectedFreeAgent, setSelectedFreeAgent] = useState<Wrestler | null>(null);
  const [showFreeAgents, setShowFreeAgents] = useState(false);
  const { toast } = useToast();
  const { data, loading, saveWrestler, deleteRecord } = useUniverseData();

  const wrestlers = data.wrestlers || [];

  const [newWrestler, setNewWrestler] = useState<Partial<Wrestler>>({
    name: "",
    brand: "Raw",
    alignment: "face",
    gender: "male",
    injured: false,
    on_break: false
  });

  const editWrestler = (wrestler: Wrestler) => {
    setEditingWrestler({...wrestler});
    setIsEditDialogOpen(true);
  };

  const saveEditedWrestler = async () => {
    if (!editingWrestler?.name?.trim()) {
      toast({
        title: "Error",
        description: "Wrestler name is required",
        variant: "destructive"
      });
      return;
    }

    const { error } = await saveWrestler(editingWrestler);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to update wrestler. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    setEditingWrestler(null);
    setIsEditDialogOpen(false);
    
    toast({
      title: "Wrestler Updated",
      description: `${editingWrestler.name} has been updated.`
    });
  };

  const releaseWrestler = async (id: string) => {
    const wrestler = wrestlers.find(w => w.id === id);
    if (!wrestler) return;

    // Move to free agents by updating brand
    const releasedWrestler = { ...wrestler, brand: "Free Agent" };
    const { error } = await saveWrestler(releasedWrestler);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to release wrestler. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    setEditingWrestler(null);
    setIsEditDialogOpen(false);
    
    toast({
      title: "Wrestler Released",
      description: `${wrestler.name} has been released and moved to the free agent pool.`
    });
  };

  const signFreeAgent = async (freeAgent: Wrestler, newBrand: string) => {
    const signedWrestler = { ...freeAgent, brand: newBrand };
    const { error } = await saveWrestler(signedWrestler);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign free agent. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedFreeAgent(null);
    setIsFreeAgentDialogOpen(false);
    
    toast({
      title: "Free Agent Signed",
      description: `${freeAgent.name} has been signed to ${newBrand}.`
    });
  };

  const addWrestler = async () => {
    if (!newWrestler.name?.trim()) {
      toast({
        title: "Error",
        description: "Wrestler name is required",
        variant: "destructive"
      });
      return;
    }

    const wrestler = {
      name: newWrestler.name!,
      brand: newWrestler.brand || "Raw",
      alignment: newWrestler.alignment || "face",
      gender: newWrestler.gender || "male",
      manager: newWrestler.manager,
      faction: newWrestler.faction,
      injured: newWrestler.injured || false,
      on_break: newWrestler.on_break || false
    };

    const { error } = await saveWrestler(wrestler);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to add wrestler. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    setNewWrestler({
      name: "",
      brand: "Raw",
      alignment: "face",
      gender: "male",
      injured: false,
      on_break: false
    });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Wrestler Added",
      description: `${wrestler.name} has been added to the roster.`
    });
  };

  const deleteWrestler = async (id: string) => {
    const { error } = await deleteRecord('wrestlers', id);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete wrestler. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Wrestler Removed",
      description: "Wrestler has been removed from the roster."
    });
  };

  // Filter wrestlers based on current view (active roster or free agents)
  const currentList = showFreeAgents 
    ? wrestlers.filter(w => w.brand === "Free Agent")
    : wrestlers.filter(w => w.brand !== "Free Agent");

  const filteredWrestlers = currentList.filter(wrestler => {
    const matchesSearch = wrestler.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = filterBrand === "all" || wrestler.brand === filterBrand;
    const matchesAlignment = filterAlignment === "all" || wrestler.alignment === filterAlignment;
    const matchesDivision = filterDivision === "all" || 
      (filterDivision === "mens" && wrestler.gender === "male") ||
      (filterDivision === "womens" && wrestler.gender === "female");
    
    return matchesSearch && matchesBrand && matchesAlignment && matchesDivision;
  });

  // Group wrestlers by division for active roster
  const groupedWrestlers = !showFreeAgents ? {
    mens: filteredWrestlers.filter(w => w.gender === "male"),
    womens: filteredWrestlers.filter(w => w.gender === "female")
  } : null;

  const getBrandColor = (brand: string) => {
    switch (brand) {
      case "Raw": return "bg-red-500";
      case "SmackDown": return "bg-blue-500";
      case "NXT": return "bg-yellow-500";
      case "Legends": return "bg-purple-500";
      case "Free Agent": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getAlignmentColor = (alignment: string) => {
    switch (alignment) {
      case "face": return "bg-green-500";
      case "heel": return "bg-red-500";
      case "tweener": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const renderWrestlerCard = (wrestler: Wrestler) => (
    <Card key={wrestler.id} className="bg-slate-800/50 border-purple-500/30 hover:border-purple-400/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-white text-lg">{wrestler.name}</CardTitle>
          <div className="flex space-x-2">
            {showFreeAgents ? (
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-green-400 hover:bg-green-500/20"
                onClick={() => {
                  setSelectedFreeAgent(wrestler);
                  setIsFreeAgentDialogOpen(true);
                }}
              >
                <UserCheck className="w-4 h-4" />
              </Button>
            ) : (
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-purple-400 hover:bg-purple-500/20"
                onClick={() => editWrestler(wrestler)}
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-red-400 hover:bg-red-500/20"
              onClick={() => deleteWrestler(wrestler.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge className={`${getBrandColor(wrestler.brand)} text-white`}>
            {wrestler.brand}
          </Badge>
          <Badge className={`${getAlignmentColor(wrestler.alignment)} text-white`}>
            {wrestler.alignment}
          </Badge>
          <Badge variant="outline" className="border-purple-500/30 text-purple-200">
            {wrestler.gender}
          </Badge>
          {wrestler.injured && (
            <Badge variant="destructive">Injured</Badge>
          )}
          {wrestler.on_break && (
            <Badge className="bg-orange-500 text-white">On Break</Badge>
          )}
        </div>
        
        {wrestler.manager && (
          <p className="text-sm text-purple-200">
            <span className="font-medium">Manager:</span> {wrestler.manager}
          </p>
        )}
        
        {wrestler.faction && (
          <p className="text-sm text-purple-200">
            <span className="font-medium">Faction:</span> {wrestler.faction}
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  const activeRosterCount = wrestlers.filter(w => w.brand !== "Free Agent").length;
  const freeAgentsCount = wrestlers.filter(w => w.brand === "Free Agent").length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Users className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">
            {showFreeAgents ? `Free Agents (${freeAgentsCount})` : `Active Roster (${activeRosterCount})`}
          </h2>
        </div>
        <div className="flex space-x-3">
          <Button 
            onClick={() => setShowFreeAgents(!showFreeAgents)} 
            variant="outline" 
            className="border-purple-500 text-purple-300 hover:bg-purple-500/20"
          >
            <UserCheck className="w-4 h-4 mr-2" />
            {showFreeAgents ? "View Active Roster" : "View Free Agents"}
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Wrestler
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-purple-500/30">
              <DialogHeader>
                <DialogTitle className="text-white">Add New Wrestler</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-purple-200">Name</Label>
                  <Input
                    id="name"
                    value={newWrestler.name || ""}
                    onChange={(e) => setNewWrestler({...newWrestler, name: e.target.value})}
                    className="bg-slate-700 border-purple-500/30 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-purple-200">Brand</Label>
                    <Select value={newWrestler.brand} onValueChange={(value) => setNewWrestler({...newWrestler, brand: value})}>
                      <SelectTrigger className="bg-slate-700 border-purple-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-purple-500/30">
                        <SelectItem value="Raw">Raw</SelectItem>
                        <SelectItem value="SmackDown">SmackDown</SelectItem>
                        <SelectItem value="NXT">NXT</SelectItem>
                        <SelectItem value="Legends">Legends</SelectItem>
                        <SelectItem value="Free Agent">Free Agent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-purple-200">Alignment</Label>
                    <Select value={newWrestler.alignment} onValueChange={(value) => setNewWrestler({...newWrestler, alignment: value})}>
                      <SelectTrigger className="bg-slate-700 border-purple-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-purple-500/30">
                        <SelectItem value="face">Face</SelectItem>
                        <SelectItem value="heel">Heel</SelectItem>
                        <SelectItem value="tweener">Tweener</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-purple-200">Gender</Label>
                  <Select value={newWrestler.gender} onValueChange={(value) => setNewWrestler({...newWrestler, gender: value})}>
                    <SelectTrigger className="bg-slate-700 border-purple-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-purple-500/30">
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="manager" className="text-purple-200">Manager (Optional)</Label>
                    <Input
                      id="manager"
                      value={newWrestler.manager || ""}
                      onChange={(e) => setNewWrestler({...newWrestler, manager: e.target.value})}
                      className="bg-slate-700 border-purple-500/30 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="faction" className="text-purple-200">Faction (Optional)</Label>
                    <Input
                      id="faction"
                      value={newWrestler.faction || ""}
                      onChange={(e) => setNewWrestler({...newWrestler, faction: e.target.value})}
                      className="bg-slate-700 border-purple-500/30 text-white"
                    />
                  </div>
                </div>
                <Button onClick={addWrestler} className="w-full bg-purple-600 hover:bg-purple-700">
                  Add Wrestler
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-800 border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Wrestler</DialogTitle>
          </DialogHeader>
          {editingWrestler && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editName" className="text-purple-200">Name</Label>
                <Input
                  id="editName"
                  value={editingWrestler.name}
                  onChange={(e) => setEditingWrestler({...editingWrestler, name: e.target.value})}
                  className="bg-slate-700 border-purple-500/30 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-purple-200">Brand</Label>
                  <Select value={editingWrestler.brand} onValueChange={(value) => setEditingWrestler({...editingWrestler, brand: value})}>
                    <SelectTrigger className="bg-slate-700 border-purple-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-purple-500/30">
                      <SelectItem value="Raw">Raw</SelectItem>
                      <SelectItem value="SmackDown">SmackDown</SelectItem>
                      <SelectItem value="NXT">NXT</SelectItem>
                      <SelectItem value="Legends">Legends</SelectItem>
                      <SelectItem value="Free Agent">Free Agent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-purple-200">Alignment</Label>
                  <Select value={editingWrestler.alignment} onValueChange={(value) => setEditingWrestler({...editingWrestler, alignment: value})}>
                    <SelectTrigger className="bg-slate-700 border-purple-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-purple-500/30">
                      <SelectItem value="face">Face</SelectItem>
                      <SelectItem value="heel">Heel</SelectItem>
                      <SelectItem value="tweener">Tweener</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-purple-200">Gender</Label>
                <Select value={editingWrestler.gender} onValueChange={(value) => setEditingWrestler({...editingWrestler, gender: value})}>
                  <SelectTrigger className="bg-slate-700 border-purple-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-purple-500/30">
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editManager" className="text-purple-200">Manager (Optional)</Label>
                  <Input
                    id="editManager"
                    value={editingWrestler.manager || ""}
                    onChange={(e) => setEditingWrestler({...editingWrestler, manager: e.target.value})}
                    className="bg-slate-700 border-purple-500/30 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="editFaction" className="text-purple-200">Faction (Optional)</Label>
                  <Input
                    id="editFaction"
                    value={editingWrestler.faction || ""}
                    onChange={(e) => setEditingWrestler({...editingWrestler, faction: e.target.value})}
                    className="bg-slate-700 border-purple-500/30 text-white"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="editInjured"
                    checked={editingWrestler.injured}
                    onChange={(e) => setEditingWrestler({...editingWrestler, injured: e.target.checked})}
                    className="rounded border-purple-500/30"
                  />
                  <Label htmlFor="editInjured" className="text-purple-200">Injured</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="editBreak"
                    checked={editingWrestler.on_break || false}
                    onChange={(e) => setEditingWrestler({...editingWrestler, on_break: e.target.checked})}
                    className="rounded border-purple-500/30"
                  />
                  <Label htmlFor="editBreak" className="text-purple-200">Break</Label>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button onClick={saveEditedWrestler} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Save Changes
                </Button>
                <Button 
                  onClick={() => releaseWrestler(editingWrestler.id)} 
                  variant="destructive" 
                  className="flex-1"
                >
                  Release Wrestler
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isFreeAgentDialogOpen} onOpenChange={setIsFreeAgentDialogOpen}>
        <DialogContent className="bg-slate-800 border-purple-500/30">
          <DialogHeader>
            <DialogTitle className="text-white">Sign Free Agent</DialogTitle>
          </DialogHeader>
          {selectedFreeAgent && (
            <div className="space-y-4">
              <p className="text-purple-200">
                Sign <span className="font-bold text-white">{selectedFreeAgent.name}</span> to which brand?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={() => signFreeAgent(selectedFreeAgent, "Raw")} 
                  className="bg-red-600 hover:bg-red-700"
                >
                  Raw
                </Button>
                <Button 
                  onClick={() => signFreeAgent(selectedFreeAgent, "SmackDown")} 
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  SmackDown
                </Button>
                <Button 
                  onClick={() => signFreeAgent(selectedFreeAgent, "NXT")} 
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  NXT
                </Button>
                <Button 
                  onClick={() => signFreeAgent(selectedFreeAgent, "Legends")} 
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Legends
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search wrestlers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-700 border-purple-500/30 text-white"
          />
        </div>
        <Select value={filterBrand} onValueChange={setFilterBrand}>
          <SelectTrigger className="w-40 bg-slate-700 border-purple-500/30 text-white">
            <SelectValue placeholder="Filter by brand" />
          </SelectTrigger>
          <SelectContent className="bg-slate-700 border-purple-500/30">
            <SelectItem value="all">All Brands</SelectItem>
            <SelectItem value="Raw">Raw</SelectItem>
            <SelectItem value="SmackDown">SmackDown</SelectItem>
            <SelectItem value="NXT">NXT</SelectItem>
            <SelectItem value="Legends">Legends</SelectItem>
            <SelectItem value="Free Agent">Free Agent</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterAlignment} onValueChange={setFilterAlignment}>
          <SelectTrigger className="w-40 bg-slate-700 border-purple-500/30 text-white">
            <SelectValue placeholder="Filter by alignment" />
          </SelectTrigger>
          <SelectContent className="bg-slate-700 border-purple-500/30">
            <SelectItem value="all">All Alignments</SelectItem>
            <SelectItem value="face">Face</SelectItem>
            <SelectItem value="heel">Heel</SelectItem>
            <SelectItem value="tweener">Tweener</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterDivision} onValueChange={setFilterDivision}>
          <SelectTrigger className="w-40 bg-slate-700 border-purple-500/30 text-white">
            <SelectValue placeholder="Filter by division" />
          </SelectTrigger>
          <SelectContent className="bg-slate-700 border-purple-500/30">
            <SelectItem value="all">All Divisions</SelectItem>
            <SelectItem value="mens">Men's Division</SelectItem>
            <SelectItem value="womens">Women's Division</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Wrestler Display */}
      {!showFreeAgents && groupedWrestlers ? (
        <div className="space-y-8">
          {/* Men's Division */}
          {groupedWrestlers.mens.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-400" />
                Men's Division ({groupedWrestlers.mens.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedWrestlers.mens.map(renderWrestlerCard)}
              </div>
            </div>
          )}

          {/* Women's Division */}
          {groupedWrestlers.womens.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-pink-400" />
                Women's Division ({groupedWrestlers.womens.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedWrestlers.womens.map(renderWrestlerCard)}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Free Agents Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWrestlers.map(renderWrestlerCard)}
        </div>
      )}

      {filteredWrestlers.length === 0 && (
        <Card className="bg-slate-800/50 border-purple-500/30">
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {showFreeAgents ? "No Free Agents Found" : "No Wrestlers Found"}
            </h3>
            <p className="text-purple-200 mb-4">
              {currentList.length === 0 
                ? showFreeAgents 
                  ? "No wrestlers have been released to the free agent pool yet."
                  : "Start building your roster by adding your first wrestler."
                : `No ${showFreeAgents ? "free agents" : "wrestlers"} match your current filters.`
              }
            </p>
            {!showFreeAgents && activeRosterCount === 0 && (
              <Button onClick={() => setIsAddDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Wrestler
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
