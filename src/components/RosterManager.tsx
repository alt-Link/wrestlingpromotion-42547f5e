
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Users, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Wrestler {
  id: string;
  name: string;
  brand: string;
  alignment: string;
  gender: string;
  titles: string[];
  manager?: string;
  faction?: string;
  injured: boolean;
  customAttributes: Record<string, string>;
}

export const RosterManager = () => {
  const [wrestlers, setWrestlers] = useState<Wrestler[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBrand, setFilterBrand] = useState("all");
  const [filterAlignment, setFilterAlignment] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingWrestler, setEditingWrestler] = useState<Wrestler | null>(null);
  const { toast } = useToast();

  const [newWrestler, setNewWrestler] = useState<Partial<Wrestler>>({
    name: "",
    brand: "Raw",
    alignment: "Face",
    gender: "Male",
    titles: [],
    injured: false,
    customAttributes: {}
  });

  useEffect(() => {
    const savedWrestlers = localStorage.getItem("wrestlers");
    if (savedWrestlers) {
      setWrestlers(JSON.parse(savedWrestlers));
    }
  }, []);

  const saveWrestlers = (updatedWrestlers: Wrestler[]) => {
    setWrestlers(updatedWrestlers);
    localStorage.setItem("wrestlers", JSON.stringify(updatedWrestlers));
  };

  const addWrestler = () => {
    if (!newWrestler.name?.trim()) {
      toast({
        title: "Error",
        description: "Wrestler name is required",
        variant: "destructive"
      });
      return;
    }

    const wrestler: Wrestler = {
      id: Date.now().toString(),
      name: newWrestler.name!,
      brand: newWrestler.brand || "Raw",
      alignment: newWrestler.alignment || "Face",
      gender: newWrestler.gender || "Male",
      titles: newWrestler.titles || [],
      manager: newWrestler.manager,
      faction: newWrestler.faction,
      injured: newWrestler.injured || false,
      customAttributes: newWrestler.customAttributes || {}
    };

    const updatedWrestlers = [...wrestlers, wrestler];
    saveWrestlers(updatedWrestlers);
    
    setNewWrestler({
      name: "",
      brand: "Raw",
      alignment: "Face",
      gender: "Male",
      titles: [],
      injured: false,
      customAttributes: {}
    });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Wrestler Added",
      description: `${wrestler.name} has been added to the roster.`
    });
  };

  const deleteWrestler = (id: string) => {
    const updatedWrestlers = wrestlers.filter(w => w.id !== id);
    saveWrestlers(updatedWrestlers);
    toast({
      title: "Wrestler Removed",
      description: "Wrestler has been removed from the roster."
    });
  };

  const filteredWrestlers = wrestlers.filter(wrestler => {
    const matchesSearch = wrestler.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = filterBrand === "all" || wrestler.brand === filterBrand;
    const matchesAlignment = filterAlignment === "all" || wrestler.alignment === filterAlignment;
    
    return matchesSearch && matchesBrand && matchesAlignment;
  });

  const getBrandColor = (brand: string) => {
    switch (brand) {
      case "Raw": return "bg-red-500";
      case "SmackDown": return "bg-blue-500";
      case "NXT": return "bg-yellow-500";
      case "Legends": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const getAlignmentColor = (alignment: string) => {
    switch (alignment) {
      case "Face": return "bg-green-500";
      case "Heel": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Users className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Roster Management</h2>
        </div>
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
                      <SelectItem value="Face">Face</SelectItem>
                      <SelectItem value="Heel">Heel</SelectItem>
                      <SelectItem value="Neutral">Neutral</SelectItem>
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
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
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
            <SelectItem value="Face">Face</SelectItem>
            <SelectItem value="Heel">Heel</SelectItem>
            <SelectItem value="Neutral">Neutral</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Wrestler Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWrestlers.map((wrestler) => (
          <Card key={wrestler.id} className="bg-slate-800/50 border-purple-500/30 hover:border-purple-400/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-white text-lg">{wrestler.name}</CardTitle>
                <div className="flex space-x-2">
                  <Button size="sm" variant="ghost" className="text-purple-400 hover:bg-purple-500/20">
                    <Edit className="w-4 h-4" />
                  </Button>
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
              </div>
              
              {wrestler.titles.length > 0 && (
                <div>
                  <p className="text-sm text-purple-200 mb-1">Championships:</p>
                  <div className="flex flex-wrap gap-1">
                    {wrestler.titles.map((title, index) => (
                      <Badge key={index} className="bg-yellow-500 text-black text-xs">
                        {title}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
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
        ))}
      </div>

      {filteredWrestlers.length === 0 && (
        <Card className="bg-slate-800/50 border-purple-500/30">
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Wrestlers Found</h3>
            <p className="text-purple-200 mb-4">
              {wrestlers.length === 0 
                ? "Start building your roster by adding your first wrestler."
                : "No wrestlers match your current filters."
              }
            </p>
            {wrestlers.length === 0 && (
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
