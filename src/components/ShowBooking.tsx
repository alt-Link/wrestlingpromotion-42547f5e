
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Plus, Clock, Users, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Show {
  id: string;
  name: string;
  brand: string;
  date?: Date;
  frequency: string;
  venue: string;
  description: string;
  matches: Match[];
  isTemplate?: boolean;
  baseShowId?: string;
  instanceDate?: Date;
}

interface Match {
  id: string;
  type: string;
  participants: string[];
  result?: string;
  notes?: string;
  titleMatch?: boolean;
  championship?: string;
}

export const ShowBooking = () => {
  const [shows, setShows] = useState<Show[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingShow, setEditingShow] = useState<Show | null>(null);
  const { toast } = useToast();

  const [newShow, setNewShow] = useState<Partial<Show>>({
    name: "",
    brand: "Raw",
    frequency: "weekly",
    venue: "",
    description: "",
    matches: []
  });

  useEffect(() => {
    const savedShows = localStorage.getItem("shows");
    if (savedShows) {
      const parsed = JSON.parse(savedShows);
      const showsWithDates = parsed.map((show: any) => ({
        ...show,
        date: show.date ? new Date(show.date) : undefined,
        instanceDate: show.instanceDate ? new Date(show.instanceDate) : undefined,
        matches: show.matches || [],
        isTemplate: show.isTemplate !== undefined ? show.isTemplate : (show.frequency !== 'one-time')
      }));
      setShows(showsWithDates);
    }
  }, []);

  const saveShows = (updatedShows: Show[]) => {
    setShows(updatedShows);
    localStorage.setItem("shows", JSON.stringify(updatedShows));
  };

  const addShow = () => {
    if (!newShow.name?.trim()) {
      toast({
        title: "Error",
        description: "Show name is required",
        variant: "destructive"
      });
      return;
    }

    const show: Show = {
      id: Date.now().toString(),
      name: newShow.name!,
      brand: newShow.brand || "Raw",
      date: newShow.date,
      frequency: newShow.frequency || "weekly",
      venue: newShow.venue || "",
      description: newShow.description || "",
      matches: [],
      isTemplate: (newShow.frequency || "weekly") !== "one-time"
    };

    const updatedShows = [...shows, show];
    saveShows(updatedShows);
    
    setNewShow({
      name: "",
      brand: "Raw",
      frequency: "weekly",
      venue: "",
      description: "",
      matches: []
    });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Show Created",
      description: `${show.name} has been added to your calendar${show.isTemplate ? " as a recurring show template" : ""}.`
    });
  };

  const openEditDialog = (show: Show) => {
    // Only allow editing templates, not instances
    if (!show.isTemplate) {
      toast({
        title: "Cannot Edit Instance",
        description: "This is a specific show instance. Edit the base recurring show template instead.",
        variant: "destructive"
      });
      return;
    }
    setEditingShow(show);
    setIsEditDialogOpen(true);
  };

  const saveEditedShow = () => {
    if (!editingShow?.name?.trim()) {
      toast({
        title: "Error",
        description: "Show name is required",
        variant: "destructive"
      });
      return;
    }

    const updatedShows = shows.map(show => 
      show.id === editingShow.id ? editingShow : show
    );
    saveShows(updatedShows);
    
    setIsEditDialogOpen(false);
    setEditingShow(null);
    
    toast({
      title: "Show Updated",
      description: `${editingShow.name} template has been updated.`
    });
  };

  const deleteShow = (id: string) => {
    const showToDelete = shows.find(s => s.id === id);
    if (!showToDelete) return;

    if (showToDelete.isTemplate) {
      // If deleting a template, also delete all its instances
      const updatedShows = shows.filter(s => s.id !== id && s.baseShowId !== id);
      saveShows(updatedShows);
      toast({
        title: "Show Template Deleted",
        description: "Show template and all its instances have been removed."
      });
    } else {
      // Just delete the instance
      const updatedShows = shows.filter(s => s.id !== id);
      saveShows(updatedShows);
      toast({
        title: "Show Instance Deleted",
        description: "Show instance has been removed."
      });
    }
  };

  const getBrandColor = (brand: string) => {
    switch (brand) {
      case "Raw": return "bg-red-500";
      case "SmackDown": return "bg-blue-500";
      case "NXT": return "bg-yellow-500";
      case "Legends": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  // Filter to show only templates in the main view
  const displayShows = shows.filter(show => show.isTemplate);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Calendar className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Show Booking</h2>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Book New Show
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-blue-500/30 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Book New Show</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="showName" className="text-blue-200">Show Name</Label>
                  <Input
                    id="showName"
                    value={newShow.name || ""}
                    onChange={(e) => setNewShow({...newShow, name: e.target.value})}
                    className="bg-slate-700 border-blue-500/30 text-white"
                    placeholder="e.g. Monday Night Raw"
                  />
                </div>
                <div>
                  <Label className="text-blue-200">Brand</Label>
                  <Select value={newShow.brand} onValueChange={(value) => setNewShow({...newShow, brand: value})}>
                    <SelectTrigger className="bg-slate-700 border-blue-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-blue-500/30">
                      <SelectItem value="Raw">Raw</SelectItem>
                      <SelectItem value="SmackDown">SmackDown</SelectItem>
                      <SelectItem value="NXT">NXT</SelectItem>
                      <SelectItem value="PPV">Pay-Per-View</SelectItem>
                      <SelectItem value="Special">Special Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-blue-200">Show Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-slate-700 border-blue-500/30 text-white",
                          !newShow.date && "text-slate-400"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {newShow.date ? format(newShow.date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={newShow.date}
                        onSelect={(date) => setNewShow({...newShow, date})}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label className="text-blue-200">Frequency</Label>
                  <Select value={newShow.frequency} onValueChange={(value) => setNewShow({...newShow, frequency: value})}>
                    <SelectTrigger className="bg-slate-700 border-blue-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-blue-500/30">
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="one-time">One Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="venue" className="text-blue-200">Venue</Label>
                <Input
                  id="venue"
                  value={newShow.venue || ""}
                  onChange={(e) => setNewShow({...newShow, venue: e.target.value})}
                  className="bg-slate-700 border-blue-500/30 text-white"
                  placeholder="e.g. Madison Square Garden"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-blue-200">Description</Label>
                <Input
                  id="description"
                  value={newShow.description || ""}
                  onChange={(e) => setNewShow({...newShow, description: e.target.value})}
                  className="bg-slate-700 border-blue-500/30 text-white"
                  placeholder="Special notes or event details"
                />
              </div>

              <Button onClick={addShow} className="w-full bg-blue-600 hover:bg-blue-700">
                Create Show
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Show Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-800 border-blue-500/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Show Template</DialogTitle>
          </DialogHeader>
          {editingShow && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editShowName" className="text-blue-200">Show Name</Label>
                  <Input
                    id="editShowName"
                    value={editingShow.name}
                    onChange={(e) => setEditingShow({...editingShow, name: e.target.value})}
                    className="bg-slate-700 border-blue-500/30 text-white"
                    placeholder="e.g. Monday Night Raw"
                  />
                </div>
                <div>
                  <Label className="text-blue-200">Brand</Label>
                  <Select value={editingShow.brand} onValueChange={(value) => setEditingShow({...editingShow, brand: value})}>
                    <SelectTrigger className="bg-slate-700 border-blue-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-blue-500/30">
                      <SelectItem value="Raw">Raw</SelectItem>
                      <SelectItem value="SmackDown">SmackDown</SelectItem>
                      <SelectItem value="NXT">NXT</SelectItem>
                      <SelectItem value="PPV">Pay-Per-View</SelectItem>
                      <SelectItem value="Special">Special Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-blue-200">Show Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-slate-700 border-blue-500/30 text-white",
                          !editingShow.date && "text-slate-400"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {editingShow.date ? format(editingShow.date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={editingShow.date}
                        onSelect={(date) => setEditingShow({...editingShow, date})}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label className="text-blue-200">Frequency</Label>
                  <Select value={editingShow.frequency} onValueChange={(value) => setEditingShow({...editingShow, frequency: value})}>
                    <SelectTrigger className="bg-slate-700 border-blue-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-blue-500/30">
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="one-time">One Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="editVenue" className="text-blue-200">Venue</Label>
                <Input
                  id="editVenue"
                  value={editingShow.venue}
                  onChange={(e) => setEditingShow({...editingShow, venue: e.target.value})}
                  className="bg-slate-700 border-blue-500/30 text-white"
                  placeholder="e.g. Madison Square Garden"
                />
              </div>

              <div>
                <Label htmlFor="editDescription" className="text-blue-200">Description</Label>
                <Input
                  id="editDescription"
                  value={editingShow.description}
                  onChange={(e) => setEditingShow({...editingShow, description: e.target.value})}
                  className="bg-slate-700 border-blue-500/30 text-white"
                  placeholder="Special notes or event details"
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={saveEditedShow} className="flex-1 bg-blue-600 hover:bg-blue-700">
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

      {/* Shows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayShows.map((show) => {
          const instancesCount = shows.filter(s => s.baseShowId === show.id).length;
          const totalMatches = shows
            .filter(s => s.baseShowId === show.id)
            .reduce((total, instance) => total + (instance.matches?.length || 0), 0);
          
          return (
            <Card key={show.id} className="bg-slate-800/50 border-blue-500/30 hover:border-blue-400/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-white text-lg">{show.name}</CardTitle>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-blue-400 hover:bg-blue-500/20"
                      onClick={() => openEditDialog(show)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-red-400 hover:bg-red-500/20"
                      onClick={() => deleteShow(show.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs text-white ${getBrandColor(show.brand)}`}>
                    {show.brand}
                  </span>
                  <span className="px-2 py-1 rounded text-xs bg-slate-600 text-white">
                    {show.frequency}
                  </span>
                  {show.isTemplate && (
                    <span className="px-2 py-1 rounded text-xs bg-purple-600 text-white">
                      Template
                    </span>
                  )}
                </div>
                
                {show.date && (
                  <p className="text-sm text-blue-200">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Starts: {format(show.date, "PPP")}
                  </p>
                )}
                
                {show.venue && (
                  <p className="text-sm text-blue-200">
                    <span className="font-medium">Venue:</span> {show.venue}
                  </p>
                )}
                
                {show.description && (
                  <p className="text-sm text-slate-400">{show.description}</p>
                )}
                
                <div className="flex items-center text-sm text-blue-200 mt-3">
                  <Users className="w-4 h-4 mr-1" />
                  {instancesCount} shows booked, {totalMatches} total matches
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {displayShows.length === 0 && (
        <Card className="bg-slate-800/50 border-blue-500/30">
          <CardContent className="text-center py-12">
            <Calendar className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Shows Booked</h3>
            <p className="text-blue-200 mb-4">
              Start planning your wrestling events by booking your first show.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Book Your First Show
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
