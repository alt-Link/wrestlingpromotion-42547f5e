
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Show } from "@/types/show";
import { ShowBookingHeader } from "./ShowBookingHeader";
import { AddShowDialog } from "./AddShowDialog";
import { EditShowDialog } from "./EditShowDialog";
import { ShowCard } from "./ShowCard";
import { EmptyShowsState } from "./EmptyShowsState";
import { useUniverseData } from "@/hooks/useUniverseData";

export const ShowBooking = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingShow, setEditingShow] = useState<Show | null>(null);
  const { toast } = useToast();
  const { data, loading, saveShow, deleteRecord } = useUniverseData();

  const shows = data.shows || [];

  const addShow = async (newShowData: Partial<Show>) => {
    if (!newShowData.name?.trim()) {
      toast({
        title: "Error",
        description: "Show name is required",
        variant: "destructive"
      });
      return;
    }

    const show = {
      name: newShowData.name!,
      brand: newShowData.brand || "Raw",
      date: newShowData.date,
      frequency: newShowData.frequency || "weekly",
      venue: newShowData.venue || "",
      description: newShowData.description || "",
      matches: [],
      is_template: (newShowData.frequency || "weekly") !== "one-time"
    };

    const { error } = await saveShow(show);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to create show. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    setIsAddDialogOpen(false);
    
    toast({
      title: "Show Created",
      description: `${show.name} has been added to your calendar${show.is_template ? " as a recurring show template" : ""}.`
    });
  };

  const openEditDialog = (show: Show) => {
    if (!show.is_template) {
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

  const saveEditedShow = async () => {
    if (!editingShow?.name?.trim()) {
      toast({
        title: "Error",
        description: "Show name is required",
        variant: "destructive"
      });
      return;
    }

    const { error } = await saveShow(editingShow);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to update show. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    setIsEditDialogOpen(false);
    setEditingShow(null);
    
    toast({
      title: "Show Updated",
      description: `${editingShow.name} template has been updated.`
    });
  };

  const deleteShow = async (id: string) => {
    const showToDelete = shows.find(s => s.id === id);
    if (!showToDelete) return;

    const { error } = await deleteRecord('shows', id);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete show. Please try again.",
        variant: "destructive"
      });
      return;
    }

    if (showToDelete.is_template) {
      // Also delete instances if this was a template
      const instances = shows.filter(s => s.base_show_id === id);
      for (const instance of instances) {
        await deleteRecord('shows', instance.id);
      }
      
      toast({
        title: "Show Template Deleted",
        description: "Show template and all its instances have been removed."
      });
    } else {
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

  const displayShows = shows.filter(show => show.is_template);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
      </div>
    );
  }

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
          const instancesCount = shows.filter(s => s.base_show_id === show.id).length;
          const totalMatches = shows
            .filter(s => s.base_show_id === show.id)
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
