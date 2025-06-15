
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Plus, Edit, Trash2, Target, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Storyline {
  id: string;
  title: string;
  wrestler: string;
  status: string;
  priority: string;
  startDate: string;
  estimatedEndDate?: string;
  description: string;
  objectives: string[];
  milestones: Milestone[];
  notes: string;
}

interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  date?: string;
  description: string;
}

export const Storylines = () => {
  const [storylines, setStorylines] = useState<Storyline[]>([]);
  const [wrestlers, setWrestlers] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStoryline, setEditingStoryline] = useState<Storyline | null>(null);
  const { toast } = useToast();

  const [newStoryline, setNewStoryline] = useState<Partial<Storyline>>({
    title: "",
    wrestler: "",
    status: "planning",
    priority: "medium",
    description: "",
    objectives: [],
    milestones: [],
    notes: ""
  });

  useEffect(() => {
    const savedStorylines = localStorage.getItem("storylines");
    if (savedStorylines) {
      setStorylines(JSON.parse(savedStorylines));
    }

    const savedWrestlers = localStorage.getItem("wrestlers");
    if (savedWrestlers) {
      setWrestlers(JSON.parse(savedWrestlers));
    }
  }, []);

  const saveStorylines = (updatedStorylines: Storyline[]) => {
    setStorylines(updatedStorylines);
    localStorage.setItem("storylines", JSON.stringify(updatedStorylines));
  };

  const addStoryline = () => {
    if (!newStoryline.title?.trim() || !newStoryline.wrestler?.trim()) {
      toast({
        title: "Error",
        description: "Title and wrestler are required",
        variant: "destructive"
      });
      return;
    }

    const storyline: Storyline = {
      id: Date.now().toString(),
      title: newStoryline.title!,
      wrestler: newStoryline.wrestler!,
      status: newStoryline.status || "planning",
      priority: newStoryline.priority || "medium",
      startDate: new Date().toISOString(),
      description: newStoryline.description || "",
      objectives: [],
      milestones: [],
      notes: newStoryline.notes || ""
    };

    const updatedStorylines = [...storylines, storyline];
    saveStorylines(updatedStorylines);
    
    setNewStoryline({
      title: "",
      wrestler: "",
      status: "planning",
      priority: "medium",
      description: "",
      objectives: [],
      milestones: [],
      notes: ""
    });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Storyline Created",
      description: `${storyline.title} has been added to your planning.`
    });
  };

  const deleteStoryline = (id: string) => {
    const updatedStorylines = storylines.filter(s => s.id !== id);
    saveStorylines(updatedStorylines);
    toast({
      title: "Storyline Deleted",
      description: "Storyline has been removed from your planning."
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning": return "bg-blue-500";
      case "active": return "bg-green-500";
      case "paused": return "bg-yellow-500";
      case "completed": return "bg-purple-500";
      case "cancelled": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "bg-green-500";
      case "medium": return "bg-yellow-500";
      case "high": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-6 h-6 text-indigo-400" />
          <h2 className="text-2xl font-bold text-white">Storyline Planning</h2>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Plan Storyline
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-indigo-500/30 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Plan New Storyline</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="storylineTitle" className="text-indigo-200">Storyline Title</Label>
                <Input
                  id="storylineTitle"
                  value={newStoryline.title || ""}
                  onChange={(e) => setNewStoryline({...newStoryline, title: e.target.value})}
                  className="bg-slate-700 border-indigo-500/30 text-white"
                  placeholder="e.g. Rise to Championship"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-indigo-200">Wrestler</Label>
                  <Select value={newStoryline.wrestler} onValueChange={(value) => setNewStoryline({...newStoryline, wrestler: value})}>
                    <SelectTrigger className="bg-slate-700 border-indigo-500/30 text-white">
                      <SelectValue placeholder="Select wrestler" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-indigo-500/30">
                      {wrestlers.map((wrestler) => (
                        <SelectItem key={wrestler.id} value={wrestler.name}>
                          {wrestler.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-indigo-200">Priority</Label>
                  <Select value={newStoryline.priority} onValueChange={(value) => setNewStoryline({...newStoryline, priority: value})}>
                    <SelectTrigger className="bg-slate-700 border-indigo-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-indigo-500/30">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-indigo-200">Status</Label>
                <Select value={newStoryline.status} onValueChange={(value) => setNewStoryline({...newStoryline, status: value})}>
                  <SelectTrigger className="bg-slate-700 border-indigo-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-indigo-500/30">
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description" className="text-indigo-200">Description</Label>
                <Textarea
                  id="description"
                  value={newStoryline.description || ""}
                  onChange={(e) => setNewStoryline({...newStoryline, description: e.target.value})}
                  className="bg-slate-700 border-indigo-500/30 text-white"
                  placeholder="Describe the storyline arc and key plot points"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="notes" className="text-indigo-200">Notes</Label>
                <Textarea
                  id="notes"
                  value={newStoryline.notes || ""}
                  onChange={(e) => setNewStoryline({...newStoryline, notes: e.target.value})}
                  className="bg-slate-700 border-indigo-500/30 text-white"
                  placeholder="Additional notes, ideas, or reminders"
                  rows={2}
                />
              </div>

              <Button onClick={addStoryline} className="w-full bg-indigo-600 hover:bg-indigo-700">
                Create Storyline
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Storylines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {storylines.map((storyline) => (
          <Card key={storyline.id} className="bg-slate-800/50 border-indigo-500/30 hover:border-indigo-400/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-white text-lg">{storyline.title}</CardTitle>
                <div className="flex space-x-2">
                  <Button size="sm" variant="ghost" className="text-indigo-400 hover:bg-indigo-500/20">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-red-400 hover:bg-red-500/20"
                    onClick={() => deleteStoryline(storyline.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge className={`${getStatusColor(storyline.status)} text-white`}>
                  {storyline.status}
                </Badge>
                <Badge className={`${getPriorityColor(storyline.priority)} text-white`}>
                  {storyline.priority} priority
                </Badge>
              </div>
              
              <p className="text-sm text-indigo-200">
                <Target className="w-4 h-4 inline mr-1" />
                <span className="font-medium">Wrestler:</span> {storyline.wrestler}
              </p>
              
              {storyline.description && (
                <p className="text-sm text-slate-400">{storyline.description}</p>
              )}
              
              {storyline.notes && (
                <div className="bg-slate-700/50 p-2 rounded text-xs text-slate-300">
                  <span className="font-medium">Notes:</span> {storyline.notes}
                </div>
              )}
              
              <div className="flex items-center text-xs text-indigo-200 mt-3">
                <Calendar className="w-4 h-4 mr-1" />
                Started: {new Date(storyline.startDate).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {storylines.length === 0 && (
        <Card className="bg-slate-800/50 border-indigo-500/30">
          <CardContent className="text-center py-12">
            <BookOpen className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Storylines Planned</h3>
            <p className="text-indigo-200 mb-4">
              Start planning character development and story arcs for your wrestlers.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Plan Your First Storyline
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
