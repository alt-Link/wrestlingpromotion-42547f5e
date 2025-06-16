
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
import { Calendar, Plus, Edit, Trash2, Trophy, Users, Clock, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUniverseData } from "@/hooks/useUniverseData";

interface Match {
  id: string;
  type: string;
  participants: string[];
  result?: string;
  notes?: string;
  championship?: string;
  stipulation?: string;
}

interface Show {
  id?: string;
  name: string;
  brand: string;
  date?: string;
  frequency: string;
  venue: string;
  description: string;
  matches: Match[];
  is_template?: boolean;
  instance_date?: string;
}

export const ShowBooking = () => {
  const { data, loading, saveShow, deleteRecord } = useUniverseData();
  const { toast } = useToast();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingShow, setEditingShow] = useState<Show | null>(null);
  const [newMatch, setNewMatch] = useState({
    type: "Singles Match",
    participants: [] as string[],
    championship: "",
    stipulation: "",
    notes: ""
  });

  const [newShow, setNewShow] = useState<Show>({
    name: "",
    brand: "Raw",
    frequency: "one-time",
    venue: "",
    description: "",
    matches: [],
    is_template: false
  });

  const shows = data.shows || [];
  const wrestlers = data.wrestlers || [];
  const championships = data.championships || [];

  const matchTypes = [
    "Singles Match",
    "Tag Team Match",
    "Triple Threat Match",
    "Fatal 4-Way",
    "Battle Royal",
    "Royal Rumble",
    "Ladder Match",
    "Tables Match",
    "Chairs Match",
    "TLC Match",
    "Hell in a Cell",
    "Steel Cage Match",
    "Last Man Standing",
    "I Quit Match",
    "Submission Match",
    "No Disqualification",
    "Street Fight",
    "Hardcore Match"
  ];

  const createShow = async () => {
    if (!newShow.name.trim() || !newShow.venue.trim()) {
      toast({
        title: "Error",
        description: "Show name and venue are required",
        variant: "destructive"
      });
      return;
    }

    const showData: Show = {
      name: newShow.name.trim(),
      brand: newShow.brand,
      frequency: newShow.frequency,
      venue: newShow.venue.trim(),
      description: newShow.description.trim(),
      matches: newShow.matches,
      is_template: newShow.frequency !== "one-time",
      date: newShow.date || new Date().toISOString()
    };

    if (newShow.frequency === "one-time") {
      showData.instance_date = newShow.date || new Date().toISOString();
      showData.is_template = false;
    }

    console.log('Creating show with data:', showData);

    const { error } = await saveShow(showData);
    
    if (error) {
      console.error('Error creating show:', error);
      toast({
        title: "Error",
        description: "Failed to create show. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    setNewShow({
      name: "",
      brand: "Raw",
      frequency: "one-time",
      venue: "",
      description: "",
      matches: [],
      is_template: false
    });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Show Created",
      description: `${showData.name} has been successfully scheduled.`
    });
  };

  const addMatchToShow = (targetShow: Show, setTargetShow: (show: Show) => void) => {
    if (newMatch.participants.length < 1) {
      toast({
        title: "Error",
        description: "At least one participant is required",
        variant: "destructive"
      });
      return;
    }

    const match: Match = {
      id: Date.now().toString(),
      type: newMatch.type,
      participants: [...newMatch.participants],
      championship: newMatch.championship || undefined,
      stipulation: newMatch.stipulation || undefined,
      notes: newMatch.notes || undefined
    };

    setTargetShow({
      ...targetShow,
      matches: [...targetShow.matches, match]
    });

    setNewMatch({
      type: "Singles Match",
      participants: [],
      championship: "",
      stipulation: "",
      notes: ""
    });

    toast({
      title: "Match Added",
      description: "Match has been added to the show."
    });
  };

  const removeMatchFromShow = (matchId: string, targetShow: Show, setTargetShow: (show: Show) => void) => {
    setTargetShow({
      ...targetShow,
      matches: targetShow.matches.filter(match => match.id !== matchId)
    });

    toast({
      title: "Match Removed",
      description: "Match has been removed from the show."
    });
  };

  const startEditShow = (show: any) => {
    setEditingShow({
      ...show,
      matches: show.matches || []
    });
    setIsEditDialogOpen(true);
  };

  const saveEditedShow = async () => {
    if (!editingShow) return;

    if (!editingShow.name.trim() || !editingShow.venue.trim()) {
      toast({
        title: "Error",
        description: "Show name and venue are required",
        variant: "destructive"
      });
      return;
    }

    const { error } = await saveShow(editingShow);
    
    if (error) {
      console.error('Error updating show:', error);
      toast({
        title: "Error",
        description: "Failed to update show. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    setEditingShow(null);
    setIsEditDialogOpen(false);
    
    toast({
      title: "Show Updated",
      description: "Show has been successfully updated."
    });
  };

  const handleDeleteShow = async (id: string) => {
    const { error } = await deleteRecord('shows', id);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete show. Please try again.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Show Deleted",
      description: "Show has been removed from your schedule."
    });
  };

  const toggleWrestlerInMatch = (wrestlerName: string, participants: string[], setParticipants: (participants: string[]) => void) => {
    if (participants.includes(wrestlerName)) {
      setParticipants(participants.filter(p => p !== wrestlerName));
    } else {
      setParticipants([...participants, wrestlerName]);
    }
  };

  const getBrandColor = (brand: string) => {
    switch (brand) {
      case "Raw": return "bg-red-500 text-white";
      case "SmackDown": return "bg-blue-500 text-white";
      case "NXT": return "bg-yellow-500 text-black";
      case "PPV": return "bg-purple-500 text-white";
      case "Special": return "bg-green-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case "weekly": return "🗓️";
      case "monthly": return "📅";
      case "one-time": return "⭐";
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
          <Calendar className="w-6 h-6 text-orange-400" />
          <h2 className="text-2xl font-bold text-white">Show Booking</h2>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Book New Show
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-orange-500/30 max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Book New Show</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="showName" className="text-orange-200">Show Name</Label>
                  <Input
                    id="showName"
                    value={newShow.name}
                    onChange={(e) => setNewShow({...newShow, name: e.target.value})}
                    className="bg-slate-700 border-orange-500/30 text-white"
                    placeholder="e.g. Monday Night Raw, SmackDown Live"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-orange-200">Brand</Label>
                    <Select value={newShow.brand} onValueChange={(value) => setNewShow({...newShow, brand: value})}>
                      <SelectTrigger className="bg-slate-700 border-orange-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-orange-500/30">
                        <SelectItem value="Raw">Raw</SelectItem>
                        <SelectItem value="SmackDown">SmackDown</SelectItem>
                        <SelectItem value="NXT">NXT</SelectItem>
                        <SelectItem value="PPV">PPV</SelectItem>
                        <SelectItem value="Special">Special Event</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-orange-200">Frequency</Label>
                    <Select value={newShow.frequency} onValueChange={(value) => setNewShow({...newShow, frequency: value})}>
                      <SelectTrigger className="bg-slate-700 border-orange-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-orange-500/30">
                        <SelectItem value="one-time">One-time Event</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="showDate" className="text-orange-200">
                    {newShow.frequency === "one-time" ? "Event Date" : "Start Date"}
                  </Label>
                  <Input
                    id="showDate"
                    type="datetime-local"
                    value={newShow.date?.slice(0, 16) || ""}
                    onChange={(e) => setNewShow({...newShow, date: e.target.value ? new Date(e.target.value).toISOString() : ""})}
                    className="bg-slate-700 border-orange-500/30 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="venue" className="text-orange-200">Venue</Label>
                  <Input
                    id="venue"
                    value={newShow.venue}
                    onChange={(e) => setNewShow({...newShow, venue: e.target.value})}
                    className="bg-slate-700 border-orange-500/30 text-white"
                    placeholder="e.g. Madison Square Garden"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-orange-200">Description</Label>
                  <Textarea
                    id="description"
                    value={newShow.description}
                    onChange={(e) => setNewShow({...newShow, description: e.target.value})}
                    className="bg-slate-700 border-orange-500/30 text-white"
                    placeholder="Show description and special notes"
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <h3 className="text-orange-200 font-medium mb-3">Add Match</h3>
                  
                  <div className="space-y-3">
                    <Select value={newMatch.type} onValueChange={(value) => setNewMatch({...newMatch, type: value})}>
                      <SelectTrigger className="bg-slate-600 border-orange-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-orange-500/30 max-h-48">
                        {matchTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div>
                      <Label className="text-orange-200 text-sm">Participants</Label>
                      <div className="bg-slate-600/50 p-3 rounded max-h-32 overflow-y-auto">
                        {wrestlers.length === 0 ? (
                          <p className="text-slate-400 text-sm">No wrestlers available. Add wrestlers to your roster first.</p>
                        ) : (
                          <div className="space-y-1">
                            {wrestlers.map((wrestler: any) => (
                              <div key={wrestler.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`new-match-wrestler-${wrestler.id}`}
                                  checked={newMatch.participants.includes(wrestler.name)}
                                  onCheckedChange={() => toggleWrestlerInMatch(wrestler.name, newMatch.participants, (participants) => setNewMatch({...newMatch, participants}))}
                                  className="border-orange-400"
                                />
                                <Label 
                                  htmlFor={`new-match-wrestler-${wrestler.id}`} 
                                  className="text-white text-sm cursor-pointer flex-1"
                                >
                                  {wrestler.name} <span className="text-slate-400">({wrestler.brand})</span>
                                </Label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {newMatch.participants.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {newMatch.participants.map((participant) => (
                            <Badge key={participant} className="bg-orange-600 text-white text-xs">
                              {participant}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <Select value={newMatch.championship} onValueChange={(value) => setNewMatch({...newMatch, championship: value})}>
                      <SelectTrigger className="bg-slate-600 border-orange-500/30 text-white">
                        <SelectValue placeholder="Championship (optional)" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-orange-500/30">
                        <SelectItem value="">No Championship</SelectItem>
                        {championships.filter((c: any) => !c.retired).map((championship: any) => (
                          <SelectItem key={championship.id} value={championship.name}>
                            {championship.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      placeholder="Stipulation (optional)"
                      value={newMatch.stipulation}
                      onChange={(e) => setNewMatch({...newMatch, stipulation: e.target.value})}
                      className="bg-slate-600 border-orange-500/30 text-white"
                    />

                    <Textarea
                      placeholder="Match notes (optional)"
                      value={newMatch.notes}
                      onChange={(e) => setNewMatch({...newMatch, notes: e.target.value})}
                      className="bg-slate-600 border-orange-500/30 text-white"
                      rows={2}
                    />

                    <Button 
                      onClick={() => addMatchToShow(newShow, setNewShow)} 
                      className="w-full bg-orange-600 hover:bg-orange-700"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Match
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-orange-200">Booked Matches ({newShow.matches.length})</Label>
                  <div className="max-h-64 overflow-y-auto space-y-2 mt-2">
                    {newShow.matches.length === 0 ? (
                      <p className="text-slate-400 text-sm text-center py-4">No matches booked yet</p>
                    ) : (
                      newShow.matches.map((match) => (
                        <div key={match.id} className="bg-slate-600/50 p-3 rounded flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white text-sm font-medium">{match.type}</span>
                              {match.championship && (
                                <Badge className="bg-yellow-600 text-white text-xs">
                                  <Trophy className="w-3 h-3 mr-1" />
                                  {match.championship}
                                </Badge>
                              )}
                            </div>
                            <div className="text-slate-300 text-xs mb-1">
                              {match.participants.join(" vs ")}
                            </div>
                            {match.stipulation && (
                              <div className="text-orange-400 text-xs">Stipulation: {match.stipulation}</div>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeMatchFromShow(match.id, newShow, setNewShow)}
                            className="text-red-400 hover:bg-red-500/20 ml-2"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-600">
              <Button 
                onClick={() => setIsAddDialogOpen(false)} 
                variant="outline"
                className="border-slate-500 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button onClick={createShow} className="bg-orange-600 hover:bg-orange-700">
                Create Show
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-800 border-orange-500/30 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Show</DialogTitle>
          </DialogHeader>
          {editingShow && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="editShowName" className="text-orange-200">Show Name</Label>
                  <Input
                    id="editShowName"
                    value={editingShow.name}
                    onChange={(e) => setEditingShow({...editingShow, name: e.target.value})}
                    className="bg-slate-700 border-orange-500/30 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-orange-200">Brand</Label>
                    <Select value={editingShow.brand} onValueChange={(value) => setEditingShow({...editingShow, brand: value})}>
                      <SelectTrigger className="bg-slate-700 border-orange-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-orange-500/30">
                        <SelectItem value="Raw">Raw</SelectItem>
                        <SelectItem value="SmackDown">SmackDown</SelectItem>
                        <SelectItem value="NXT">NXT</SelectItem>
                        <SelectItem value="PPV">PPV</SelectItem>
                        <SelectItem value="Special">Special Event</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-orange-200">Frequency</Label>
                    <Select value={editingShow.frequency} onValueChange={(value) => setEditingShow({...editingShow, frequency: value})}>
                      <SelectTrigger className="bg-slate-700 border-orange-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-orange-500/30">
                        <SelectItem value="one-time">One-time Event</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="editVenue" className="text-orange-200">Venue</Label>
                  <Input
                    id="editVenue"
                    value={editingShow.venue}
                    onChange={(e) => setEditingShow({...editingShow, venue: e.target.value})}
                    className="bg-slate-700 border-orange-500/30 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="editDescription" className="text-orange-200">Description</Label>
                  <Textarea
                    id="editDescription"
                    value={editingShow.description}
                    onChange={(e) => setEditingShow({...editingShow, description: e.target.value})}
                    className="bg-slate-700 border-orange-500/30 text-white"
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-700/50 p-4 rounded-lg">
                  <h3 className="text-orange-200 font-medium mb-3">Add Match</h3>
                  
                  <div className="space-y-3">
                    <Select value={newMatch.type} onValueChange={(value) => setNewMatch({...newMatch, type: value})}>
                      <SelectTrigger className="bg-slate-600 border-orange-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-orange-500/30 max-h-48">
                        {matchTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div>
                      <Label className="text-orange-200 text-sm">Participants</Label>
                      <div className="bg-slate-600/50 p-3 rounded max-h-32 overflow-y-auto">
                        {wrestlers.length === 0 ? (
                          <p className="text-slate-400 text-sm">No wrestlers available. Add wrestlers to your roster first.</p>
                        ) : (
                          <div className="space-y-1">
                            {wrestlers.map((wrestler: any) => (
                              <div key={wrestler.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`edit-match-wrestler-${wrestler.id}`}
                                  checked={newMatch.participants.includes(wrestler.name)}
                                  onCheckedChange={() => toggleWrestlerInMatch(wrestler.name, newMatch.participants, (participants) => setNewMatch({...newMatch, participants}))}
                                  className="border-orange-400"
                                />
                                <Label 
                                  htmlFor={`edit-match-wrestler-${wrestler.id}`} 
                                  className="text-white text-sm cursor-pointer flex-1"
                                >
                                  {wrestler.name} <span className="text-slate-400">({wrestler.brand})</span>
                                </Label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {newMatch.participants.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {newMatch.participants.map((participant) => (
                            <Badge key={participant} className="bg-orange-600 text-white text-xs">
                              {participant}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button 
                      onClick={() => addMatchToShow(editingShow, setEditingShow)} 
                      className="w-full bg-orange-600 hover:bg-orange-700"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Match
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-orange-200">Booked Matches ({editingShow.matches.length})</Label>
                  <div className="max-h-64 overflow-y-auto space-y-2 mt-2">
                    {editingShow.matches.length === 0 ? (
                      <p className="text-slate-400 text-sm text-center py-4">No matches booked yet</p>
                    ) : (
                      editingShow.matches.map((match) => (
                        <div key={match.id} className="bg-slate-600/50 p-3 rounded flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white text-sm font-medium">{match.type}</span>
                              {match.championship && (
                                <Badge className="bg-yellow-600 text-white text-xs">
                                  <Trophy className="w-3 h-3 mr-1" />
                                  {match.championship}
                                </Badge>
                              )}
                            </div>
                            <div className="text-slate-300 text-xs mb-1">
                              {match.participants.join(" vs ")}
                            </div>
                            {match.stipulation && (
                              <div className="text-orange-400 text-xs">Stipulation: {match.stipulation}</div>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeMatchFromShow(match.id, editingShow, setEditingShow)}
                            className="text-red-400 hover:bg-red-500/20 ml-2"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))
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
              <Button onClick={saveEditedShow} className="bg-orange-600 hover:bg-orange-700">
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shows.map((show: any) => (
          <Card key={show.id} className="bg-slate-800/50 border-orange-500/30 hover:border-orange-400/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-white text-lg">{show.name}</CardTitle>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-orange-400 hover:bg-orange-500/20"
                    onClick={() => startEditShow(show)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-red-400 hover:bg-red-500/20"
                    onClick={() => handleDeleteShow(show.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge className={getBrandColor(show.brand)}>
                  {show.brand}
                </Badge>
                <Badge className="bg-slate-600 text-white">
                  {getFrequencyIcon(show.frequency)} {show.frequency}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-orange-200">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{show.venue}</span>
                </div>
                {(show.date || show.instance_date) && (
                  <div className="flex items-center text-orange-200">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{new Date(show.date || show.instance_date).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex items-center text-orange-200">
                  <Users className="w-4 h-4 mr-1" />
                  <span>{show.matches?.length || 0} matches</span>
                </div>
              </div>
              
              {show.description && (
                <p className="text-sm text-slate-400">{show.description}</p>
              )}

              {show.matches && show.matches.length > 0 && (
                <div className="bg-slate-700/50 p-3 rounded">
                  <h4 className="text-sm font-medium text-orange-200 mb-2">Matches</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {show.matches.slice(0, 3).map((match: any, index: number) => (
                      <div key={match.id || index} className="text-xs text-slate-300">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{match.type}</span>
                          {match.championship && (
                            <Badge className="bg-yellow-600 text-white text-xs">
                              <Trophy className="w-2 h-2 mr-1" />
                              Title
                            </Badge>
                          )}
                        </div>
                        <div className="text-slate-400">
                          {match.participants?.join(" vs ") || "TBD"}
                        </div>
                      </div>
                    ))}
                    {show.matches.length > 3 && (
                      <p className="text-xs text-slate-400">+{show.matches.length - 3} more matches</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {shows.length === 0 && (
        <Card className="bg-slate-800/50 border-orange-500/30">
          <CardContent className="text-center py-12">
            <Calendar className="w-12 h-12 text-orange-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Shows Scheduled</h3>
            <p className="text-orange-200 mb-4">
              Start booking your first show to schedule matches and events.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Book Your First Show
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
