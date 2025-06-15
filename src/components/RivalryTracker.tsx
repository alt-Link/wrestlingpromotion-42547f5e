import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Zap, Plus, Edit, Trash2, Calendar, Clock, Users, History, Eye, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Rivalry {
  id: string;
  participants: string[];
  title: string;
  description: string;
  status: "active" | "concluded";
  startDate: Date;
  endDate?: Date;
  intensity: "low" | "medium" | "high";
  timeline: RivalryEvent[];
}

interface RivalryEvent {
  id: string;
  date: Date;
  type: "match" | "promo" | "attack" | "other";
  description: string;
  participants: string[];
  result?: string;
}

export const RivalryTracker = () => {
  const [rivalries, setRivalries] = useState<Rivalry[]>([]);
  const [wrestlers, setWrestlers] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTimelineDialogOpen, setIsTimelineDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [editingRivalry, setEditingRivalry] = useState<Rivalry | null>(null);
  const [viewingRivalry, setViewingRivalry] = useState<Rivalry | null>(null);
  const [newTimelineEvent, setNewTimelineEvent] = useState<Partial<RivalryEvent>>({
    type: "match",
    description: "",
    participants: []
  });
  const { toast } = useToast();

  const [newRivalry, setNewRivalry] = useState<Partial<Rivalry>>({
    participants: [],
    title: "",
    description: "",
    status: "active",
    intensity: "medium",
    timeline: []
  });

  useEffect(() => {
    const savedRivalries = localStorage.getItem("rivalries");
    if (savedRivalries) {
      const parsed = JSON.parse(savedRivalries);
      const rivalriesWithDates = parsed.map((rivalry: any) => ({
        ...rivalry,
        startDate: new Date(rivalry.startDate),
        endDate: rivalry.endDate ? new Date(rivalry.endDate) : undefined,
        timeline: rivalry.timeline?.map((event: any) => ({
          ...event,
          date: new Date(event.date)
        })) || []
      }));
      setRivalries(rivalriesWithDates);
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
    if (!newRivalry.participants?.length || newRivalry.participants.length < 2) {
      toast({
        title: "Error",
        description: "At least 2 participants are required for a rivalry",
        variant: "destructive"
      });
      return;
    }

    if (!newRivalry.title?.trim()) {
      toast({
        title: "Error",
        description: "Rivalry title is required",
        variant: "destructive"
      });
      return;
    }

    const rivalry: Rivalry = {
      id: Date.now().toString(),
      participants: newRivalry.participants!,
      title: newRivalry.title!,
      description: newRivalry.description || "",
      status: "active",
      startDate: new Date(),
      intensity: newRivalry.intensity || "medium",
      timeline: []
    };

    const updatedRivalries = [...rivalries, rivalry];
    saveRivalries(updatedRivalries);
    
    setNewRivalry({
      participants: [],
      title: "",
      description: "",
      status: "active",
      intensity: "medium",
      timeline: []
    });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Rivalry Created",
      description: `${rivalry.title} has been added to your rivalry tracker.`
    });
  };

  const openEditDialog = (rivalry: Rivalry) => {
    setEditingRivalry({ ...rivalry });
    setIsEditDialogOpen(true);
  };

  const saveEditedRivalry = () => {
    if (!editingRivalry?.title?.trim()) {
      toast({
        title: "Error",
        description: "Rivalry title is required",
        variant: "destructive"
      });
      return;
    }

    const updatedRivalries = rivalries.map(rivalry => 
      rivalry.id === editingRivalry.id ? editingRivalry : rivalry
    );
    saveRivalries(updatedRivalries);
    
    setIsEditDialogOpen(false);
    setEditingRivalry(null);
    
    toast({
      title: "Rivalry Updated",
      description: `${editingRivalry.title} has been updated.`
    });
  };

  const concludeRivalry = (id: string) => {
    const updatedRivalries = rivalries.map(rivalry => 
      rivalry.id === id 
        ? { ...rivalry, status: "concluded" as const, endDate: new Date() }
        : rivalry
    );
    saveRivalries(updatedRivalries);
    
    toast({
      title: "Rivalry Concluded",
      description: "The rivalry has been marked as concluded."
    });
  };

  const deleteRivalry = (id: string) => {
    const updatedRivalries = rivalries.filter(r => r.id !== id);
    saveRivalries(updatedRivalries);
    toast({
      title: "Rivalry Deleted",
      description: "Rivalry has been removed from your tracker."
    });
  };

  const openTimelineDialog = (rivalry: Rivalry) => {
    setEditingRivalry({ ...rivalry });
    setIsTimelineDialogOpen(true);
  };

  const addTimelineEvent = () => {
    if (!newTimelineEvent.description?.trim()) {
      toast({
        title: "Error",
        description: "Event description is required",
        variant: "destructive"
      });
      return;
    }

    const event: RivalryEvent = {
      id: Date.now().toString(),
      date: new Date(),
      type: newTimelineEvent.type || "match",
      description: newTimelineEvent.description!,
      participants: newTimelineEvent.participants || [],
      result: newTimelineEvent.result
    };

    if (editingRivalry) {
      const updatedRivalry = {
        ...editingRivalry,
        timeline: [...editingRivalry.timeline, event]
      };
      setEditingRivalry(updatedRivalry);
      
      const updatedRivalries = rivalries.map(rivalry => 
        rivalry.id === editingRivalry.id ? updatedRivalry : rivalry
      );
      saveRivalries(updatedRivalries);
    }

    setNewTimelineEvent({
      type: "match",
      description: "",
      participants: []
    });
    
    toast({
      title: "Event Added",
      description: "Timeline event has been added to the rivalry."
    });
  };

  const deleteTimelineEvent = (eventId: string) => {
    if (editingRivalry) {
      const updatedRivalry = {
        ...editingRivalry,
        timeline: editingRivalry.timeline.filter(event => event.id !== eventId)
      };
      setEditingRivalry(updatedRivalry);
      
      const updatedRivalries = rivalries.map(rivalry => 
        rivalry.id === editingRivalry.id ? updatedRivalry : rivalry
      );
      saveRivalries(updatedRivalries);
      
      toast({
        title: "Event Deleted",
        description: "Timeline event has been removed."
      });
    }
  };

  const openHistoryDialog = (rivalry: Rivalry) => {
    setViewingRivalry(rivalry);
    setIsHistoryDialogOpen(true);
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "low": return "bg-green-500";
      case "medium": return "bg-yellow-500";
      case "high": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-green-500" : "bg-gray-500";
  };

  const activeRivalries = rivalries.filter(r => r.status === "active");
  const concludedRivalries = rivalries.filter(r => r.status === "concluded");

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
                <Label htmlFor="rivalryTitle" className="text-red-200">Rivalry Title</Label>
                <Input
                  id="rivalryTitle"
                  value={newRivalry.title || ""}
                  onChange={(e) => setNewRivalry({...newRivalry, title: e.target.value})}
                  className="bg-slate-700 border-red-500/30 text-white"
                  placeholder="e.g. The Battle for Supremacy"
                />
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
                <Label className="text-red-200">Intensity Level</Label>
                <Select value={newRivalry.intensity} onValueChange={(value) => setNewRivalry({...newRivalry, intensity: value as "low" | "medium" | "high"})}>
                  <SelectTrigger className="bg-slate-700 border-red-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-red-500/30">
                    <SelectItem value="low">Low Intensity</SelectItem>
                    <SelectItem value="medium">Medium Intensity</SelectItem>
                    <SelectItem value="high">High Intensity</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="rivalryDescription" className="text-red-200">Description</Label>
                <Textarea
                  id="rivalryDescription"
                  value={newRivalry.description || ""}
                  onChange={(e) => setNewRivalry({...newRivalry, description: e.target.value})}
                  className="bg-slate-700 border-red-500/30 text-white"
                  placeholder="Describe the backstory and motivation for this rivalry"
                  rows={3}
                />
              </div>

              <Button onClick={addRivalry} className="w-full bg-red-600 hover:bg-red-700">
                <Plus className="w-4 h-4 mr-2" />
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
                <Label htmlFor="editRivalryTitle" className="text-red-200">Rivalry Title</Label>
                <Input
                  id="editRivalryTitle"
                  value={editingRivalry.title}
                  onChange={(e) => setEditingRivalry({...editingRivalry, title: e.target.value})}
                  className="bg-slate-700 border-red-500/30 text-white"
                />
              </div>

              <div>
                <Label className="text-red-200">Participants</Label>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {wrestlers.map((wrestler) => (
                      <label key={wrestler.id} className="flex items-center space-x-2 text-sm text-white">
                        <input
                          type="checkbox"
                          checked={editingRivalry.participants.includes(wrestler.name)}
                          onChange={(e) => {
                            const participants = editingRivalry.participants;
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
                </div>
              </div>

              <div>
                <Label className="text-red-200">Intensity Level</Label>
                <Select value={editingRivalry.intensity} onValueChange={(value) => setEditingRivalry({...editingRivalry, intensity: value as "low" | "medium" | "high"})}>
                  <SelectTrigger className="bg-slate-700 border-red-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-red-500/30">
                    <SelectItem value="low">Low Intensity</SelectItem>
                    <SelectItem value="medium">Medium Intensity</SelectItem>
                    <SelectItem value="high">High Intensity</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-red-200">Status</Label>
                <Select value={editingRivalry.status} onValueChange={(value) => setEditingRivalry({...editingRivalry, status: value as "active" | "concluded"})}>
                  <SelectTrigger className="bg-slate-700 border-red-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-red-500/30">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="concluded">Concluded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="editRivalryDescription" className="text-red-200">Description</Label>
                <Textarea
                  id="editRivalryDescription"
                  value={editingRivalry.description}
                  onChange={(e) => setEditingRivalry({...editingRivalry, description: e.target.value})}
                  className="bg-slate-700 border-red-500/30 text-white"
                  rows={3}
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={saveEditedRivalry} className="flex-1 bg-red-600 hover:bg-red-700">
                  Save Changes
                </Button>
                <Button 
                  onClick={() => setIsEditDialogOpen(false)} 
                  variant="outline" 
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Timeline Management Dialog */}
      <Dialog open={isTimelineDialogOpen} onOpenChange={setIsTimelineDialogOpen}>
        <DialogContent className="bg-slate-800 border-red-500/30 max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Manage Timeline - {editingRivalry?.title}</DialogTitle>
          </DialogHeader>
          {editingRivalry && (
            <div className="space-y-6">
              {/* Add New Event Section */}
              <div className="border border-red-500/30 rounded-lg p-4 space-y-4">
                <h3 className="text-lg font-semibold text-red-200">Add New Event</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-red-200">Event Type</Label>
                    <Select value={newTimelineEvent.type} onValueChange={(value) => setNewTimelineEvent({...newTimelineEvent, type: value as "match" | "promo" | "attack" | "other"})}>
                      <SelectTrigger className="bg-slate-700 border-red-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-red-500/30">
                        <SelectItem value="match">Match</SelectItem>
                        <SelectItem value="promo">Promo</SelectItem>
                        <SelectItem value="attack">Attack</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="eventResult" className="text-red-200">Result (Optional)</Label>
                    <Input
                      id="eventResult"
                      value={newTimelineEvent.result || ""}
                      onChange={(e) => setNewTimelineEvent({...newTimelineEvent, result: e.target.value})}
                      className="bg-slate-700 border-red-500/30 text-white"
                      placeholder="e.g. John Cena wins"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="eventDescription" className="text-red-200">Event Description</Label>
                  <Textarea
                    id="eventDescription"
                    value={newTimelineEvent.description || ""}
                    onChange={(e) => setNewTimelineEvent({...newTimelineEvent, description: e.target.value})}
                    className="bg-slate-700 border-red-500/30 text-white"
                    placeholder="Describe what happened in this event"
                    rows={2}
                  />
                </div>
                <Button onClick={addTimelineEvent} className="bg-red-600 hover:bg-red-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Event
                </Button>
              </div>

              {/* Timeline Events List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-red-200">Timeline Events</h3>
                {editingRivalry.timeline.length > 0 ? (
                  <div className="space-y-3">
                    {editingRivalry.timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((event) => (
                      <div key={event.id} className="bg-slate-700/50 border border-red-500/30 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`px-2 py-1 rounded text-xs text-white ${
                                event.type === "match" ? "bg-blue-500" :
                                event.type === "promo" ? "bg-green-500" :
                                event.type === "attack" ? "bg-red-500" : "bg-gray-500"
                              }`}>
                                {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                              </span>
                              <span className="text-sm text-slate-400">
                                {new Date(event.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-white">{event.description}</p>
                            {event.result && (
                              <p className="text-green-400 text-sm mt-1">Result: {event.result}</p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:bg-red-500/20"
                            onClick={() => deleteTimelineEvent(event.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400">No timeline events yet. Add some events to track the rivalry's progress.</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* History Dialog for Concluded Rivalries */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="bg-slate-800 border-red-500/30 max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Rivalry History - {viewingRivalry?.title}</DialogTitle>
          </DialogHeader>
          {viewingRivalry && (
            <div className="space-y-6">
              <div className="bg-slate-700/50 border border-red-500/30 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-200 mb-2">Rivalry Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Participants:</span>
                    <p className="text-white">{viewingRivalry.participants.join(", ")}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Duration:</span>
                    <p className="text-white">
                      {new Date(viewingRivalry.startDate).toLocaleDateString()} - {viewingRivalry.endDate ? new Date(viewingRivalry.endDate).toLocaleDateString() : "Ongoing"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Intensity:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs text-white ${getIntensityColor(viewingRivalry.intensity)}`}>
                      {viewingRivalry.intensity.charAt(0).toUpperCase() + viewingRivalry.intensity.slice(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs text-white ${getStatusColor(viewingRivalry.status)}`}>
                      {viewingRivalry.status.charAt(0).toUpperCase() + viewingRivalry.status.slice(1)}
                    </span>
                  </div>
                </div>
                {viewingRivalry.description && (
                  <div className="mt-4">
                    <span className="text-slate-400">Description:</span>
                    <p className="text-white mt-1">{viewingRivalry.description}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-red-200">Complete Timeline</h3>
                {viewingRivalry.timeline.length > 0 ? (
                  <div className="space-y-3">
                    {viewingRivalry.timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((event) => (
                      <div key={event.id} className="bg-slate-700/50 border border-red-500/30 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs text-white ${
                            event.type === "match" ? "bg-blue-500" :
                            event.type === "promo" ? "bg-green-500" :
                            event.type === "attack" ? "bg-red-500" : "bg-gray-500"
                          }`}>
                            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                          </span>
                          <span className="text-sm text-slate-400">
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-white">{event.description}</p>
                        {event.result && (
                          <p className="text-green-400 text-sm mt-1">Result: {event.result}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400">No events recorded for this rivalry.</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Active Rivalries */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Active Rivalries</h3>
        {activeRivalries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeRivalries.map((rivalry) => (
              <Card key={rivalry.id} className="bg-slate-800/50 border-red-500/30 hover:border-red-400/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-white text-lg">{rivalry.title}</CardTitle>
                    <div className="flex space-x-1">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-blue-400 hover:bg-blue-500/20"
                        onClick={() => openTimelineDialog(rivalry)}
                      >
                        <Calendar className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-yellow-400 hover:bg-yellow-500/20"
                        onClick={() => openEditDialog(rivalry)}
                      >
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
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs text-white ${getStatusColor(rivalry.status)}`}>
                      {rivalry.status.charAt(0).toUpperCase() + rivalry.status.slice(1)}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs text-white ${getIntensityColor(rivalry.intensity)}`}>
                      {rivalry.intensity.charAt(0).toUpperCase() + rivalry.intensity.slice(1)} Intensity
                    </span>
                  </div>
                  
                  <div className="text-sm text-red-200">
                    <Users className="w-4 h-4 inline mr-1" />
                    {rivalry.participants.join(" vs ")}
                  </div>
                  
                  <div className="text-sm text-red-200">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Started: {new Date(rivalry.startDate).toLocaleDateString()}
                  </div>
                  
                  {rivalry.description && (
                    <p className="text-sm text-slate-400">{rivalry.description}</p>
                  )}
                  
                  <div className="text-sm text-blue-200">
                    Timeline: {rivalry.timeline.length} events
                  </div>
                  
                  <Button 
                    onClick={() => concludeRivalry(rivalry.id)} 
                    className="w-full bg-orange-600 hover:bg-orange-700 mt-3"
                    size="sm"
                  >
                    Conclude Rivalry
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-slate-400">No active rivalries. Create your first rivalry to get started!</p>
        )}
      </div>

      {/* Concluded Rivalries */}
      {concludedRivalries.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Concluded Rivalries</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {concludedRivalries.map((rivalry) => (
              <Card key={rivalry.id} className="bg-slate-800/30 border-gray-500/30 hover:border-gray-400/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-gray-300 text-lg">{rivalry.title}</CardTitle>
                    <div className="flex space-x-1">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-blue-400 hover:bg-blue-500/20"
                        onClick={() => openHistoryDialog(rivalry)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-yellow-400 hover:bg-yellow-500/20"
                        onClick={() => openEditDialog(rivalry)}
                      >
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
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs text-white ${getStatusColor(rivalry.status)}`}>
                      Concluded
                    </span>
                    <span className={`px-2 py-1 rounded text-xs text-white ${getIntensityColor(rivalry.intensity)}`}>
                      {rivalry.intensity.charAt(0).toUpperCase() + rivalry.intensity.slice(1)} Intensity
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-300">
                    <Users className="w-4 h-4 inline mr-1" />
                    {rivalry.participants.join(" vs ")}
                  </div>
                  
                  <div className="text-sm text-gray-300">
                    <Clock className="w-4 h-4 inline mr-1" />
                    {new Date(rivalry.startDate).toLocaleDateString()} - {rivalry.endDate ? new Date(rivalry.endDate).toLocaleDateString() : "Unknown"}
                  </div>
                  
                  <div className="text-sm text-blue-200">
                    <History className="w-4 h-4 inline mr-1" />
                    {rivalry.timeline.length} events in history
                  </div>
                  
                  <Button 
                    onClick={() => openHistoryDialog(rivalry)} 
                    className="w-full bg-blue-600 hover:bg-blue-700 mt-3"
                    size="sm"
                  >
                    View History
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {rivalries.length === 0 && (
        <Card className="bg-slate-800/50 border-red-500/30">
          <CardContent className="text-center py-12">
            <Zap className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Rivalries Yet</h3>
            <p className="text-red-200 mb-4">
              Start tracking the dramatic conflicts and feuds in your wrestling universe.
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
