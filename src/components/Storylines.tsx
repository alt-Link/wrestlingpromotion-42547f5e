
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { BookOpen, Plus, Edit, Trash2, Target, Calendar, Clock, MapPin, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUniverseData } from "@/hooks/useUniverseData";

interface Storyline {
  id: string;
  title: string;
  wrestlers: string[];
  status: string;
  priority: string;
  start_date: string;
  end_date?: string;
  description: string;
  notes: string;
  timeline: TimelineEvent[];
  storyline_type: 'individual' | 'faction' | 'tag_team';
  faction_betrayal_coming?: boolean;
  faction_new_member_coming?: boolean;
  history: HistoryEvent[];
}

interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  type: 'match' | 'promo' | 'milestone' | 'event';
  description: string;
  completed: boolean;
}

interface HistoryEvent {
  id: string;
  date: string;
  action: string;
  description: string;
  user_action: boolean;
}

export const Storylines = () => {
  const { data, loading, saveStoryline, deleteRecord } = useUniverseData();
  const { toast } = useToast();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStoryline, setEditingStoryline] = useState<Storyline | null>(null);
  const [newTimelineEvent, setNewTimelineEvent] = useState({
    title: "",
    date: "",
    type: "event" as const,
    description: ""
  });

  const [newStoryline, setNewStoryline] = useState<Partial<Storyline>>({
    title: "",
    wrestlers: [],
    status: "planning",
    priority: "medium",
    description: "",
    notes: "",
    timeline: [],
    storyline_type: "individual",
    faction_betrayal_coming: false,
    faction_new_member_coming: false,
    history: []
  });

  const storylines = data.storylines || [];
  const wrestlers = data.wrestlers || [];

  const generateTimeline = (storyline: Partial<Storyline>): TimelineEvent[] => {
    const timeline: TimelineEvent[] = [];
    
    if (!storyline.start_date || !storyline.end_date) return timeline;

    const startDate = new Date(storyline.start_date);
    const endDate = new Date(storyline.end_date);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (totalDays <= 0) return timeline;

    // Opening event
    timeline.push({
      id: `timeline-${Date.now()}-1`,
      title: `${storyline.title} Begins`,
      date: storyline.start_date,
      type: 'event' as const,
      description: `Start of ${storyline.title} storyline`,
      completed: false
    });

    // Mid-point development (25% through)
    if (totalDays > 7) {
      const midPoint1 = new Date(startDate.getTime() + (totalDays * 0.25 * 24 * 60 * 60 * 1000));
      timeline.push({
        id: `timeline-${Date.now()}-2`,
        title: 'First Major Development',
        date: midPoint1.toISOString(),
        type: 'promo' as const,
        description: 'Key character moment or plot advancement',
        completed: false
      });
    }

    // Climax build-up (75% through)
    if (totalDays > 14) {
      const climaxBuild = new Date(startDate.getTime() + (totalDays * 0.75 * 24 * 60 * 60 * 1000));
      timeline.push({
        id: `timeline-${Date.now()}-3`,
        title: 'Climax Build-Up',
        date: climaxBuild.toISOString(),
        type: 'match' as const,
        description: 'Major confrontation or turning point',
        completed: false
      });
    }

    // Resolution
    timeline.push({
      id: `timeline-${Date.now()}-4`,
      title: `${storyline.title} Conclusion`,
      date: storyline.end_date,
      type: 'milestone' as const,
      description: `Planned conclusion of ${storyline.title}`,
      completed: false
    });

    return timeline;
  };

  const addStoryline = async () => {
    if (!newStoryline.title?.trim() || (!newStoryline.wrestlers || newStoryline.wrestlers.length === 0)) {
      toast({
        title: "Error",
        description: "Title and at least one wrestler are required",
        variant: "destructive"
      });
      return;
    }

    const timeline = generateTimeline(newStoryline);
    const historyEvent = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      action: "created",
      description: "Storyline created",
      user_action: true
    };

    const storyline = {
      title: newStoryline.title!,
      wrestlers: newStoryline.wrestlers,
      status: newStoryline.status || "planning",
      priority: newStoryline.priority || "medium",
      start_date: newStoryline.start_date || new Date().toISOString(),
      end_date: newStoryline.end_date,
      description: newStoryline.description || "",
      notes: newStoryline.notes || "",
      timeline,
      storyline_type: newStoryline.storyline_type || "individual",
      faction_betrayal_coming: newStoryline.faction_betrayal_coming || false,
      faction_new_member_coming: newStoryline.faction_new_member_coming || false,
      history: [historyEvent]
    };

    const { error } = await saveStoryline(storyline);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to create storyline. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    setNewStoryline({
      title: "",
      wrestlers: [],
      status: "planning",
      priority: "medium",
      description: "",
      notes: "",
      timeline: [],
      storyline_type: "individual",
      faction_betrayal_coming: false,
      faction_new_member_coming: false,
      history: []
    });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Storyline Created",
      description: `${storyline.title} has been added to your planning.`
    });
  };

  const startEditStoryline = (storyline: any) => {
    setEditingStoryline({
      ...storyline,
      wrestlers: storyline.wrestlers || []
    });
    setIsEditDialogOpen(true);
  };

  const saveEditedStoryline = async () => {
    if (!editingStoryline) return;

    if (!editingStoryline.title?.trim() || (!editingStoryline.wrestlers || editingStoryline.wrestlers.length === 0)) {
      toast({
        title: "Error",
        description: "Title and at least one wrestler are required",
        variant: "destructive"
      });
      return;
    }

    const historyEvent = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      action: "updated",
      description: "Storyline updated",
      user_action: true
    };

    const updatedStoryline = {
      ...editingStoryline,
      history: [...(editingStoryline.history || []), historyEvent]
    };

    const { error } = await saveStoryline(updatedStoryline);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to update storyline. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    setEditingStoryline(null);
    setIsEditDialogOpen(false);
    
    toast({
      title: "Storyline Updated",
      description: "Storyline has been successfully updated."
    });
  };

  const addTimelineEvent = () => {
    if (!editingStoryline || !newTimelineEvent.title.trim() || !newTimelineEvent.date) {
      toast({
        title: "Error",
        description: "Title and date are required for timeline events",
        variant: "destructive"
      });
      return;
    }

    const timelineEvent: TimelineEvent = {
      id: Date.now().toString(),
      title: newTimelineEvent.title,
      date: new Date(newTimelineEvent.date).toISOString(),
      type: newTimelineEvent.type,
      description: newTimelineEvent.description,
      completed: false
    };

    setEditingStoryline({
      ...editingStoryline,
      timeline: [...(editingStoryline.timeline || []), timelineEvent].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )
    });

    setNewTimelineEvent({
      title: "",
      date: "",
      type: "event",
      description: ""
    });

    toast({
      title: "Timeline Event Added",
      description: "New event added to storyline timeline."
    });
  };

  const removeTimelineEvent = (eventId: string) => {
    if (!editingStoryline) return;

    setEditingStoryline({
      ...editingStoryline,
      timeline: editingStoryline.timeline.filter(event => event.id !== eventId)
    });

    toast({
      title: "Event Removed",
      description: "Timeline event has been removed."
    });
  };

  const toggleWrestlerSelection = (wrestlerName: string) => {
    if (!editingStoryline) return;

    const currentWrestlers = editingStoryline.wrestlers || [];
    const isSelected = currentWrestlers.includes(wrestlerName);
    
    let updatedWrestlers;
    if (isSelected) {
      updatedWrestlers = currentWrestlers.filter(w => w !== wrestlerName);
    } else {
      updatedWrestlers = [...currentWrestlers, wrestlerName];
    }

    setEditingStoryline({
      ...editingStoryline,
      wrestlers: updatedWrestlers
    });
  };

  const handleDeleteStoryline = async (id: string) => {
    const { error } = await deleteRecord('storylines', id);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete storyline. Please try again.",
        variant: "destructive"
      });
      return;
    }

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "match": return "🥊";
      case "promo": return "🎤";
      case "milestone": return "🏆";
      case "event": return "⭐";
      default: return "📝";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
      </div>
    );
  }

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

              <div>
                <Label className="text-indigo-200">Storyline Type</Label>
                <Select value={newStoryline.storyline_type} onValueChange={(value: any) => setNewStoryline({...newStoryline, storyline_type: value})}>
                  <SelectTrigger className="bg-slate-700 border-indigo-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-indigo-500/30">
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="faction">Faction</SelectItem>
                    <SelectItem value="tag_team">Tag Team</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newStoryline.storyline_type === 'faction' && (
                <div className="space-y-3 bg-slate-700/50 p-4 rounded-lg">
                  <h4 className="text-indigo-200 font-medium">Faction Options</h4>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="betrayalComing"
                      checked={newStoryline.faction_betrayal_coming || false}
                      onCheckedChange={(checked) => setNewStoryline({...newStoryline, faction_betrayal_coming: !!checked})}
                    />
                    <Label htmlFor="betrayalComing" className="text-white">Betrayal Coming?</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="newMemberComing"
                      checked={newStoryline.faction_new_member_coming || false}
                      onCheckedChange={(checked) => setNewStoryline({...newStoryline, faction_new_member_coming: !!checked})}
                    />
                    <Label htmlFor="newMemberComing" className="text-white">New Member Coming?</Label>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate" className="text-indigo-200">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newStoryline.start_date?.split('T')[0] || ""}
                    onChange={(e) => setNewStoryline({...newStoryline, start_date: e.target.value ? new Date(e.target.value).toISOString() : ""})}
                    className="bg-slate-700 border-indigo-500/30 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate" className="text-indigo-200">Estimated End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newStoryline.end_date?.split('T')[0] || ""}
                    onChange={(e) => setNewStoryline({...newStoryline, end_date: e.target.value ? new Date(e.target.value).toISOString() : ""})}
                    className="bg-slate-700 border-indigo-500/30 text-white"
                  />
                </div>
              </div>

              <div>
                <Label className="text-indigo-200">Wrestlers</Label>
                <div className="bg-slate-700/50 p-4 rounded-lg max-h-32 overflow-y-auto">
                  {wrestlers.length === 0 ? (
                    <p className="text-slate-400 text-sm">No wrestlers available. Add wrestlers to your roster first.</p>
                  ) : (
                    <div className="space-y-2">
                      {wrestlers.map((wrestler: any) => (
                        <div key={wrestler.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`new-wrestler-${wrestler.id}`}
                            checked={newStoryline.wrestlers?.includes(wrestler.name) || false}
                            onCheckedChange={(checked) => {
                              const currentWrestlers = newStoryline.wrestlers || [];
                              if (checked) {
                                setNewStoryline({...newStoryline, wrestlers: [...currentWrestlers, wrestler.name]});
                              } else {
                                setNewStoryline({...newStoryline, wrestlers: currentWrestlers.filter(w => w !== wrestler.name)});
                              }
                            }}
                            className="border-indigo-400"
                          />
                          <Label 
                            htmlFor={`new-wrestler-${wrestler.id}`} 
                            className="text-white text-sm cursor-pointer flex-1"
                          >
                            {wrestler.name} <span className="text-slate-400">({wrestler.brand})</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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

      {/* Enhanced Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-800 border-indigo-500/30 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Storyline</DialogTitle>
          </DialogHeader>
          {editingStoryline && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="editTitle" className="text-indigo-200">Storyline Title</Label>
                    <Input
                      id="editTitle"
                      value={editingStoryline.title}
                      onChange={(e) => setEditingStoryline({...editingStoryline, title: e.target.value})}
                      className="bg-slate-700 border-indigo-500/30 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-indigo-200">Storyline Type</Label>
                    <Select value={editingStoryline.storyline_type} onValueChange={(value: any) => setEditingStoryline({...editingStoryline, storyline_type: value})}>
                      <SelectTrigger className="bg-slate-700 border-indigo-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-indigo-500/30">
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="faction">Faction</SelectItem>
                        <SelectItem value="tag_team">Tag Team</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {editingStoryline.storyline_type === 'faction' && (
                    <div className="space-y-3 bg-slate-700/50 p-4 rounded-lg">
                      <h4 className="text-indigo-200 font-medium">Faction Options</h4>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="editBetrayalComing"
                          checked={editingStoryline.faction_betrayal_coming || false}
                          onCheckedChange={(checked) => setEditingStoryline({...editingStoryline, faction_betrayal_coming: !!checked})}
                        />
                        <Label htmlFor="editBetrayalComing" className="text-white">Betrayal Coming?</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="editNewMemberComing"
                          checked={editingStoryline.faction_new_member_coming || false}
                          onCheckedChange={(checked) => setEditingStoryline({...editingStoryline, faction_new_member_coming: !!checked})}
                        />
                        <Label htmlFor="editNewMemberComing" className="text-white">New Member Coming?</Label>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-indigo-200">Start Date</Label>
                      <Input
                        type="date"
                        value={editingStoryline.start_date?.split('T')[0] || ""}
                        onChange={(e) => setEditingStoryline({...editingStoryline, start_date: e.target.value ? new Date(e.target.value).toISOString() : editingStoryline.start_date})}
                        className="bg-slate-700 border-indigo-500/30 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-indigo-200">Estimated End Date</Label>
                      <Input
                        type="date"
                        value={editingStoryline.end_date?.split('T')[0] || ""}
                        onChange={(e) => setEditingStoryline({...editingStoryline, end_date: e.target.value ? new Date(e.target.value).toISOString() : ""})}
                        className="bg-slate-700 border-indigo-500/30 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-indigo-200">Status</Label>
                      <Select value={editingStoryline.status} onValueChange={(value) => setEditingStoryline({...editingStoryline, status: value})}>
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
                      <Label className="text-indigo-200">Priority</Label>
                      <Select value={editingStoryline.priority} onValueChange={(value) => setEditingStoryline({...editingStoryline, priority: value})}>
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
                    <Label className="text-indigo-200">Description</Label>
                    <Textarea
                      value={editingStoryline.description}
                      onChange={(e) => setEditingStoryline({...editingStoryline, description: e.target.value})}
                      className="bg-slate-700 border-indigo-500/30 text-white"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label className="text-indigo-200">Notes</Label>
                    <Textarea
                      value={editingStoryline.notes}
                      onChange={(e) => setEditingStoryline({...editingStoryline, notes: e.target.value})}
                      className="bg-slate-700 border-indigo-500/30 text-white"
                      rows={2}
                    />
                  </div>
                </div>

                {/* Right Column - Wrestlers, Timeline & History */}
                <div className="space-y-4">
                  {/* Wrestler Selection */}
                  <div>
                    <Label className="text-indigo-200 mb-3 block">Select Wrestlers</Label>
                    <div className="bg-slate-700/50 p-4 rounded-lg max-h-48 overflow-y-auto">
                      {wrestlers.length === 0 ? (
                        <p className="text-slate-400 text-sm">No wrestlers available. Add wrestlers to your roster first.</p>
                      ) : (
                        <div className="space-y-2">
                          {wrestlers.map((wrestler: any) => (
                            <div key={wrestler.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`wrestler-${wrestler.id}`}
                                checked={editingStoryline.wrestlers?.includes(wrestler.name) || false}
                                onCheckedChange={() => toggleWrestlerSelection(wrestler.name)}
                                className="border-indigo-400"
                              />
                              <Label 
                                htmlFor={`wrestler-${wrestler.id}`} 
                                className="text-white text-sm cursor-pointer flex-1"
                              >
                                {wrestler.name} <span className="text-slate-400">({wrestler.brand})</span>
                              </Label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {editingStoryline.wrestlers && editingStoryline.wrestlers.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {editingStoryline.wrestlers.map((wrestlerName) => (
                          <Badge key={wrestlerName} className="bg-indigo-600 text-white text-xs">
                            {wrestlerName}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Timeline Creation */}
                  <div>
                    <Label className="text-indigo-200 mb-3 block">Custom Timeline Events</Label>
                    
                    {/* Add Timeline Event Form */}
                    <div className="bg-slate-700/50 p-4 rounded-lg space-y-3 mb-4">
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Event title"
                          value={newTimelineEvent.title}
                          onChange={(e) => setNewTimelineEvent({...newTimelineEvent, title: e.target.value})}
                          className="bg-slate-600 border-indigo-500/30 text-white text-sm"
                        />
                        <Input
                          type="date"
                          value={newTimelineEvent.date}
                          onChange={(e) => setNewTimelineEvent({...newTimelineEvent, date: e.target.value})}
                          className="bg-slate-600 border-indigo-500/30 text-white text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Select 
                          value={newTimelineEvent.type} 
                          onValueChange={(value: any) => setNewTimelineEvent({...newTimelineEvent, type: value})}
                        >
                          <SelectTrigger className="bg-slate-600 border-indigo-500/30 text-white text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-indigo-500/30">
                            <SelectItem value="event">Event</SelectItem>
                            <SelectItem value="match">Match</SelectItem>
                            <SelectItem value="promo">Promo</SelectItem>
                            <SelectItem value="milestone">Milestone</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          onClick={addTimelineEvent}
                          size="sm"
                          className="bg-indigo-600 hover:bg-indigo-700 text-sm"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Event
                        </Button>
                      </div>
                      <Textarea
                        placeholder="Event description (optional)"
                        value={newTimelineEvent.description}
                        onChange={(e) => setNewTimelineEvent({...newTimelineEvent, description: e.target.value})}
                        className="bg-slate-600 border-indigo-500/30 text-white text-sm"
                        rows={2}
                      />
                    </div>

                    {/* Timeline Events List */}
                    <div className="max-h-32 overflow-y-auto space-y-2 mb-4">
                      {editingStoryline.timeline && editingStoryline.timeline.length > 0 ? (
                        editingStoryline.timeline
                          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                          .map((event) => (
                            <div key={event.id} className="bg-slate-600/50 p-3 rounded flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs">{getTypeIcon(event.type)}</span>
                                  <span className="text-white text-sm font-medium">{event.title}</span>
                                  <Badge className={`text-xs ${event.type === 'match' ? 'bg-red-500' : event.type === 'promo' ? 'bg-blue-500' : event.type === 'milestone' ? 'bg-purple-500' : 'bg-green-500'}`}>
                                    {event.type}
                                  </Badge>
                                </div>
                                <div className="text-slate-300 text-xs mb-1">
                                  {new Date(event.date).toLocaleDateString()}
                                </div>
                                {event.description && (
                                  <div className="text-slate-400 text-xs">{event.description}</div>
                                )}
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeTimelineEvent(event.id)}
                                className="text-red-400 hover:bg-red-500/20 ml-2"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))
                      ) : (
                        <p className="text-slate-400 text-sm text-center py-4">No timeline events yet</p>
                      )}
                    </div>
                  </div>

                  {/* History Section */}
                  <div>
                    <Label className="text-indigo-200 mb-3 block">Storyline History</Label>
                    <div className="bg-slate-700/50 p-4 rounded-lg max-h-32 overflow-y-auto">
                      {editingStoryline.history && editingStoryline.history.length > 0 ? (
                        <div className="space-y-2">
                          {editingStoryline.history
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map((historyEvent) => (
                              <div key={historyEvent.id} className="text-sm">
                                <div className="flex justify-between items-center">
                                  <span className="text-white font-medium">{historyEvent.action}</span>
                                  <span className="text-slate-400 text-xs">
                                    {new Date(historyEvent.date).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="text-slate-300 text-xs">{historyEvent.description}</div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-slate-400 text-sm">No history yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-600">
                <Button 
                  onClick={() => setIsEditDialogOpen(false)} 
                  variant="outline"
                  className="border-slate-500 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={saveEditedStoryline} 
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Storylines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {storylines.map((storyline: any) => (
          <Card key={storyline.id} className="bg-slate-800/50 border-indigo-500/30 hover:border-indigo-400/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-white text-lg">{storyline.title}</CardTitle>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-indigo-400 hover:bg-indigo-500/20"
                    onClick={() => startEditStoryline(storyline)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-red-400 hover:bg-red-500/20"
                    onClick={() => handleDeleteStoryline(storyline.id)}
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
                <Badge className="bg-purple-600 text-white">
                  {storyline.storyline_type?.replace('_', ' ') || 'individual'}
                </Badge>
              </div>
              
              <div className="text-sm text-indigo-200">
                <Target className="w-4 h-4 inline mr-1" />
                <span className="font-medium">Wrestlers:</span> {storyline.wrestlers?.join(', ') || 'None'}
              </div>
              
              {storyline.description && (
                <p className="text-sm text-slate-400">{storyline.description}</p>
              )}

              {storyline.storyline_type === 'faction' && (storyline.faction_betrayal_coming || storyline.faction_new_member_coming) && (
                <div className="bg-slate-700/50 p-2 rounded text-xs">
                  {storyline.faction_betrayal_coming && (
                    <div className="text-red-400">⚠️ Betrayal planned</div>
                  )}
                  {storyline.faction_new_member_coming && (
                    <div className="text-green-400">✨ New member coming</div>
                  )}
                </div>
              )}

              {/* Timeline Section */}
              {storyline.timeline && storyline.timeline.length > 0 && (
                <div className="bg-slate-700/50 p-3 rounded">
                  <h4 className="text-sm font-medium text-indigo-200 mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    Timeline
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {storyline.timeline.slice(0, 3).map((event: any) => (
                      <div key={event.id} className="text-xs text-slate-300 flex items-center">
                        <span className="mr-2">{getTypeIcon(event.type)}</span>
                        <div className="flex-1">
                          <span className="font-medium">{event.title}</span>
                          <div className="text-slate-400">
                            {new Date(event.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    {storyline.timeline.length > 3 && (
                      <p className="text-xs text-slate-400">+{storyline.timeline.length - 3} more events</p>
                    )}
                  </div>
                </div>
              )}
              
              {storyline.notes && (
                <div className="bg-slate-700/50 p-2 rounded text-xs text-slate-300">
                  <span className="font-medium">Notes:</span> {storyline.notes}
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-indigo-200 mt-3">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(storyline.start_date).toLocaleDateString()}
                </div>
                {storyline.end_date && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(storyline.end_date).toLocaleDateString()}
                  </div>
                )}
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
