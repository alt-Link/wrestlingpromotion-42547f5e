import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Zap, Plus, Users, Edit, Trash2, Target, Calendar, History } from "lucide-react";
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
  title: string;
}

export const RivalryTracker = () => {
  const [rivalries, setRivalries] = useState<Rivalry[]>([]);
  const [wrestlers, setWrestlers] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTimelineDialogOpen, setIsTimelineDialogOpen] = useState(false);
  const [editingRivalry, setEditingRivalry] = useState<Rivalry | null>(null);
  const [selectedRivalry, setSelectedRivalry] = useState<Rivalry | null>(null);
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

  const [newEvent, setNewEvent] = useState<Partial<RivalryEvent>>({
    title: "",
    type: "confrontation",
    description: "",
    date: new Date().toISOString().split('T')[0]
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

  const editRivalry = (rivalry: Rivalry) => {
    setEditingRivalry({...rivalry});
    setIsEditDialogOpen(true);
  };

  const saveEditedRivalry = () => {
    if (!editingRivalry?.name?.trim() || !editingRivalry?.participants?.length || editingRivalry.participants.length < 2) {
      toast({
        title: "Error",
        description: "Rivalry name and at least 2 participants are required",
        variant: "destructive"
      });
      return;
    }

    const updatedRivalries = rivalries.map(r => 
      r.id === editingRivalry.id ? editingRivalry : r
    );
    saveRivalries(updatedRivalries);
    
    setEditingRivalry(null);
    setIsEditDialogOpen(false);
    
    toast({
      title: "Rivalry Updated",
      description: `${editingRivalry.name} has been updated.`
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

  const viewTimeline = (rivalry: Rivalry) => {
    setSelectedRivalry(rivalry);
    setIsTimelineDialogOpen(true);
  };

  const addEventToTimeline = () => {
    if (!newEvent.title?.trim() || !selectedRivalry) {
      toast({
        title: "Error",
        description: "Event title is required",
        variant: "destructive"
      });
      return;
    }

    const event: RivalryEvent = {
      id: Date.now().toString(),
      title: newEvent.title!,
      type: newEvent.type || "confrontation",
      description: newEvent.description || "",
      date: newEvent.date || new Date().toISOString()
    };

    const updatedEvents = [...(selectedRivalry.events || []), event];
    const updatedRivalry = { ...selectedRivalry, events: updatedEvents };
    
    const updatedRivalries = rivalries.map(r => 
      r.id === selectedRivalry.id ? updatedRivalry : r
    );
    
    saveRivalries(updatedRivalries);
    setSelectedRivalry(updatedRivalry);
    
    setNewEvent({
      title: "",
      type: "confrontation",
      description: "",
      date: new Date().toISOString().split('T')[0]
    });
    
    toast({
      title: "Event Added",
      description: "Timeline event has been added to the rivalry."
    });
  };

  const deleteEvent = (eventId: string) => {
    if (!selectedRivalry) return;

    const updatedEvents = selectedRivalry.events.filter(e => e.id !== eventId);
    const updatedRivalry = { ...selectedRivalry, events: updatedEvents };
    
    const updatedRivalries = rivalries.map(r => 
      r.id === selectedRivalry.id ? updatedRivalry : r
    );
    
    saveRivalries(updatedRivalries);
    setSelectedRivalry(updatedRivalry);
    
    toast({
      title: "Event Deleted",
      description: "Timeline event has been removed."
    });
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

      {/* Edit Rivalry Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-800 border-red-500/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Rivalry</DialogTitle>
          </DialogHeader>
          {editingRivalry && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editRivalryName" className="text-red-200">Rivalry Name</Label>
                <Input
                  id="editRivalryName"
                  value={editingRivalry.name}
                  onChange={(e) => setEditingRivalry({...editingRivalry, name: e.target.value})}
                  className="bg-slate-700 border-red-500/30 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-red-200">Rivalry Type</Label>
                  <Select value={editingRivalry.type} onValueChange={(value) => setEditingRivalry({...editingRivalry, type: value})}>
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
                    value={editingRivalry.intensity}
                    onChange={(e) => setEditingRivalry({...editingRivalry, intensity: parseInt(e.target.value)})}
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
                            checked={editingRivalry.participants?.includes(wrestler.name) || false}
                            onChange={(e) => {
                              const participants = editingRivalry.participants || [];
                              if (e.target.checked) {
                                setEditingRivalry({...editingRivalry, participants: [...participants, wrestler.name]});
                              } else {
                                setEditingRivalry({...editingRivalry, participants: participants.filter(p => p !== wrestler.name)});
                              }
                            }}
                            className="rounded border-red-500/30"
                          />
                          <span>{wrestler.name}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm">No wrestlers found.</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="editDescription" className="text-red-200">Description</Label>
                <Input
                  id="editDescription"
                  value={editingRivalry.description}
                  onChange={(e) => setEditingRivalry({...editingRivalry, description: e.target.value})}
                  className="bg-slate-700 border-red-500/30 text-white"
                />
              </div>

              <div className="flex space-x-3">
                <Button onClick={saveEditedRivalry} className="flex-1 bg-red-600 hover:bg-red-700">
                  Save Changes
                </Button>
                <Button 
                  onClick={() => viewTimeline(editingRivalry)} 
                  variant="outline" 
                  className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/20"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Edit Timeline
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Timeline Dialog */}
      <Dialog open={isTimelineDialogOpen} onOpenChange={setIsTimelineDialogOpen}>
        <DialogContent className="bg-slate-800 border-red-500/30 max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedRivalry?.name} - Timeline
              {!selectedRivalry?.active && (
                <Badge className="ml-2 bg-gray-500">Concluded</Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Add New Event */}
            <div className="border border-red-500/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-200 mb-3">Add Timeline Event</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eventTitle" className="text-red-200">Event Title</Label>
                  <Input
                    id="eventTitle"
                    value={newEvent.title || ""}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    className="bg-slate-700 border-red-500/30 text-white"
                    placeholder="e.g. First Confrontation"
                  />
                </div>
                <div>
                  <Label htmlFor="eventDate" className="text-red-200">Date</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={newEvent.date || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                    className="bg-slate-700 border-red-500/30 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Label className="text-red-200">Event Type</Label>
                  <Select value={newEvent.type} onValueChange={(value) => setNewEvent({...newEvent, type: value})}>
                    <SelectTrigger className="bg-slate-700 border-red-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-red-500/30">
                      <SelectItem value="confrontation">Confrontation</SelectItem>
                      <SelectItem value="match">Match</SelectItem>
                      <SelectItem value="promo">Promo/Segment</SelectItem>
                      <SelectItem value="interference">Interference</SelectItem>
                      <SelectItem value="betrayal">Betrayal</SelectItem>
                      <SelectItem value="alliance">Alliance Formed</SelectItem>
                      <SelectItem value="stipulation">Stipulation Added</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="eventDescription" className="text-red-200">Description</Label>
                  <Input
                    id="eventDescription"
                    value={newEvent.description || ""}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    className="bg-slate-700 border-red-500/30 text-white"
                    placeholder="Brief description of the event"
                  />
                </div>
              </div>
              <Button onClick={addEventToTimeline} className="w-full mt-4 bg-red-600 hover:bg-red-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </div>

            {/* Timeline Events */}
            <div>
              <h3 className="text-lg font-semibold text-red-200 mb-3">Timeline Events</h3>
              {selectedRivalry?.events?.length ? (
                <div className="space-y-3">
                  {selectedRivalry.events
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((event) => (
                    <Card key={event.id} className="bg-slate-700/50 border-red-500/20">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold text-white">{event.title}</h4>
                              <Badge variant="outline" className="border-red-500/30 text-red-200">
                                {event.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-300 mb-1">{event.description}</p>
                            <p className="text-xs text-red-200">
                              {new Date(event.date).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteEvent(event.id)}
                            className="text-red-400 hover:bg-red-500/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">
                  No timeline events yet. Add events to track the rivalry's progression.
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rivalries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rivalries.map((rivalry) => (
          <Card key={rivalry.id} className="bg-slate-800/50 border-red-500/30 hover:border-red-400/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-white text-lg">{rivalry.name}</CardTitle>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-red-400 hover:bg-red-500/20"
                    onClick={() => editRivalry(rivalry)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {!rivalry.active && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-red-400 hover:bg-red-500/20"
                      onClick={() => viewTimeline(rivalry)}
                    >
                      <History className="w-4 h-4" />
                    </Button>
                  )}
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
                  {rivalry.events?.length > 0 && (
                    <span className="ml-2 text-slate-400">
                      ({rivalry.events.length} events)
                    </span>
                  )}
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
