
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Show } from "@/types/show";
import { ShowBookingHeader } from "./ShowBookingHeader";
import { AddShowDialog } from "./AddShowDialog";
import { EditShowDialog } from "./EditShowDialog";
import { ShowCard } from "./ShowCard";
import { EmptyShowsState } from "./EmptyShowsState";

export const ShowBooking = () => {
  const [shows, setShows] = useState<Show[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingShow, setEditingShow] = useState<Show | null>(null);
  const { toast } = useToast();

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
    } else {
      // Start with empty shows
      setShows([]);
    }
  }, []);

  const saveShows = (updatedShows: Show[]) => {
    setShows(updatedShows);
    localStorage.setItem("shows", JSON.stringify(updatedShows));
  };

  const addShow = (newShowData: Partial<Show>) => {
    if (!newShowData.name?.trim()) {
      toast({
        title: "Error",
        description: "Show name is required",
        variant: "destructive"
      });
      return;
    }

    const show: Show = {
      id: Date.now().toString(),
      name: newShowData.name!,
      brand: newShowData.brand || "",
      date: newShowData.date,
      frequency: newShowData.frequency || "weekly",
      venue: newShowData.venue || "",
      description: newShowData.description || "",
      matches: [],
      isTemplate: (newShowData.frequency || "weekly") !== "one-time"
    };

    const updatedShows = [...shows, show];
    saveShows(updatedShows);
    
    setIsAddDialogOpen(false);
    
    toast({
      title: "Show Created",
      description: `${show.name} has been added to your calendar${show.isTemplate ? " as a recurring show template" : ""}.`
    });
  };

  const openEditDialog = (show: Show) => {
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
      const updatedShows = shows.filter(s => s.id !== id && s.baseShowId !== id);
      saveShows(updatedShows);
      toast({
        title: "Show Template Deleted",
        description: "Show template and all its instances have been removed."
      });
    } else {
      const updatedShows = shows.filter(s => s.id !== id);
      saveShows(updatedShows);
      toast({
        title: "Show Instance Deleted",
        description: "Show instance has been removed."
      });
    }
  };

  const getBrandColor = (brand: string) => {
    // Generate consistent colors based on brand name hash
    const colors = [
      "bg-red-500", "bg-blue-500", "bg-yellow-500", "bg-green-500", 
      "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-orange-500",
      "bg-teal-500", "bg-cyan-500"
    ];
    
    let hash = 0;
    for (let i = 0; i < brand.length; i++) {
      hash = brand.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const displayShows = shows.filter(show => show.isTemplate);

  return (
    <div className="space-y-6">
      <ShowBookingHeader onAddClick={() => setIsAddDialogOpen(true)} />

      <AddShowDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddShow={addShow}
      />

      <EditShowDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        editingShow={editingShow}
        onEditShow={setEditingShow}
        onSave={saveEditedShow}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayShows.map((show) => {
          const instancesCount = shows.filter(s => s.baseShowId === show.id).length;
          const totalMatches = shows
            .filter(s => s.baseShowId === show.id)
            .reduce((total, instance) => total + (instance.matches?.length || 0), 0);
          
          return (
            <ShowCard
              key={show.id}
              show={show}
              instancesCount={instancesCount}
              totalMatches={totalMatches}
              onEdit={openEditDialog}
              onDelete={deleteShow}
              getBrandColor={getBrandColor}
            />
          );
        })}
      </div>

      {displayShows.length === 0 && (
        <EmptyShowsState onAddClick={() => setIsAddDialogOpen(true)} />
      )}
    </div>
  );
};
