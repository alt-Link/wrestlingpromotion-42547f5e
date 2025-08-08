import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  break: boolean;
  customAttributes: Record<string, string>;
  status?: string;
  ovr?: number;
  isFreeAgent?: boolean;
}

interface Show {
  id: string;
  name: string;
  brand: string;
  date: string;
  location?: string;
  isTemplate?: boolean;
  isRecurring?: boolean;
  recurringFrequency?: string;
  recurringEndDate?: string;
  matches: any[];
}

interface Championship {
  id: string;
  name: string;
  brand: string;
  currentChampion?: string;
  championSince?: string;
  titleHistory: any[];
}

interface Rivalry {
  id: string;
  name: string;
  participants: string[];
  intensity: number;
  status: string;
  startDate?: string;
  description?: string;
}

export const useSupabaseData = () => {
  const [wrestlers, setWrestlers] = useState<Wrestler[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [championships, setChampionships] = useState<Championship[]>([]);
  const [rivalries, setRivalries] = useState<Rivalry[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Migrate data from localStorage on first load
  const migrateFromLocalStorage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check per-table if this user already has data in Supabase
      const [
        { data: existingWrestlers },
        { data: existingShows },
        { data: existingChampionships },
        { data: existingRivalries }
      ] = await Promise.all([
        supabase.from('wrestlers').select('id').eq('user_id', user.id).limit(1),
        supabase.from('shows').select('id').eq('user_id', user.id).limit(1),
        supabase.from('championships').select('id').eq('user_id', user.id).limit(1),
        supabase.from('rivalries').select('id').eq('user_id', user.id).limit(1),
      ]);

      let didMigrate = false;

      // Migrate wrestlers
      const localWrestlers = JSON.parse(localStorage.getItem("wrestlers") || "[]");
      const localFreeAgents = JSON.parse(localStorage.getItem("freeAgents") || "[]");
      
      const allWrestlers = [
        ...localWrestlers.map((w: any) => ({ 
          ...w, 
          is_free_agent: false, 
          user_id: user.id,
          on_break: w.break || false,
          custom_attributes: w.customAttributes || {}
        })),
        ...localFreeAgents.map((w: any) => ({ 
          ...w, 
          is_free_agent: true, 
          user_id: user.id,
          on_break: w.break || false,
          custom_attributes: w.customAttributes || {}
        }))
      ];

      if ((existingWrestlers?.length ?? 0) === 0 && allWrestlers.length > 0) {
        await supabase.from('wrestlers').insert(allWrestlers);
        didMigrate = true;
      }

      // Migrate shows
      const localShows = JSON.parse(localStorage.getItem("shows") || "[]");
      if ((existingShows?.length ?? 0) === 0 && localShows.length > 0) {
        const showsWithUserId = localShows.map((show: any) => ({
          ...show,
          user_id: user.id,
          is_template: show.isTemplate,
          is_recurring: show.isRecurring,
          recurring_frequency: show.recurringFrequency,
          recurring_end_date: show.recurringEndDate
        }));
        await supabase.from('shows').insert(showsWithUserId);
        didMigrate = true;
      }

      // Migrate championships
      const localChampionships = JSON.parse(localStorage.getItem("championships") || "[]");
      if ((existingChampionships?.length ?? 0) === 0 && localChampionships.length > 0) {
        const championshipsWithUserId = localChampionships.map((championship: any) => ({
          ...championship,
          user_id: user.id,
          current_champion: championship.currentChampion,
          champion_since: championship.championSince,
          title_history: championship.titleHistory
        }));
        await supabase.from('championships').insert(championshipsWithUserId);
        didMigrate = true;
      }

      // Migrate rivalries
      const localRivalries = JSON.parse(localStorage.getItem("rivalries") || "[]");
      if ((existingRivalries?.length ?? 0) === 0 && localRivalries.length > 0) {
        const rivalriesWithUserId = localRivalries.map((rivalry: any) => ({
          ...rivalry,
          user_id: user.id,
          start_date: rivalry.startDate
        }));
        await supabase.from('rivalries').insert(rivalriesWithUserId);
        didMigrate = true;
      }

      if (didMigrate) {
        toast({
          title: "Data Migrated",
          description: "Your wrestling promotion data has been successfully migrated to the cloud!",
        });
      }
    } catch (error) {
      console.error('Migration error:', error);
      toast({
        title: "Migration Error",
        description: "There was an issue migrating your data. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Fetch all data from Supabase
  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const [wrestlersResult, showsResult, championshipsResult, rivalriesResult] = await Promise.all([
        supabase.from('wrestlers').select('*').eq('user_id', user.id),
        supabase.from('shows').select('*').eq('user_id', user.id),
        supabase.from('championships').select('*').eq('user_id', user.id),
        supabase.from('rivalries').select('*').eq('user_id', user.id)
      ]);

      if (wrestlersResult.data) {
        const processedWrestlers = wrestlersResult.data.map(w => ({
          id: w.id,
          name: w.name,
          brand: w.brand || '',
          alignment: w.alignment || 'Face',
          gender: w.gender || 'Male',
          titles: Array.isArray(w.titles) ? w.titles : [],
          manager: w.manager,
          faction: w.faction,
          injured: w.injured || false,
          break: w.on_break || false,
          customAttributes: typeof w.custom_attributes === 'object' && w.custom_attributes !== null ? w.custom_attributes as Record<string, string> : {},
          status: w.status,
          ovr: w.ovr,
          isFreeAgent: w.is_free_agent
        }));
        setWrestlers(processedWrestlers);
      }

      if (showsResult.data) {
        const processedShows = showsResult.data.map(show => ({
          ...show,
          isTemplate: show.is_template,
          isRecurring: show.is_recurring,
          recurringFrequency: show.recurring_frequency,
          recurringEndDate: show.recurring_end_date,
          matches: Array.isArray(show.matches) ? show.matches : []
        }));
        setShows(processedShows);
      }

      if (championshipsResult.data) {
        const processedChampionships = championshipsResult.data.map(championship => ({
          ...championship,
          currentChampion: championship.current_champion,
          championSince: championship.champion_since,
          titleHistory: Array.isArray(championship.title_history) ? championship.title_history : []
        }));
        setChampionships(processedChampionships);
      }

      if (rivalriesResult.data) {
        const processedRivalries = rivalriesResult.data.map(rivalry => ({
          ...rivalry,
          startDate: rivalry.start_date
        }));
        setRivalries(processedRivalries);
      }

      setLoading(false);
    } catch (error) {
      console.error('Fetch error:', error);
      setLoading(false);
    }
  };

  // Save functions
  const saveWrestlers = async (newWrestlers: Wrestler[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete existing wrestlers and insert new ones
      await supabase.from('wrestlers').delete().eq('user_id', user.id);
      
      if (newWrestlers.length > 0) {
        const wrestlersToInsert = newWrestlers.map(wrestler => ({
          ...wrestler,
          user_id: user.id,
          is_free_agent: wrestler.isFreeAgent || false,
          on_break: wrestler.break || false,
          custom_attributes: wrestler.customAttributes || {}
        }));
        await supabase.from('wrestlers').insert(wrestlersToInsert);
      }
      
      setWrestlers(newWrestlers);
    } catch (error) {
      console.error('Save wrestlers error:', error);
      toast({
        title: "Save Error",
        description: "Failed to save wrestlers data.",
        variant: "destructive"
      });
    }
  };

  const saveShows = async (newShows: Show[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('shows').delete().eq('user_id', user.id);
      
      if (newShows.length > 0) {
        const showsToInsert = newShows.map(show => ({
          ...show,
          user_id: user.id,
          is_template: show.isTemplate,
          is_recurring: show.isRecurring,
          recurring_frequency: show.recurringFrequency,
          recurring_end_date: show.recurringEndDate
        }));
        await supabase.from('shows').insert(showsToInsert);
      }
      
      setShows(newShows);
    } catch (error) {
      console.error('Save shows error:', error);
      toast({
        title: "Save Error",
        description: "Failed to save shows data.",
        variant: "destructive"
      });
    }
  };

  const saveChampionships = async (newChampionships: Championship[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('championships').delete().eq('user_id', user.id);
      
      if (newChampionships.length > 0) {
        const championshipsToInsert = newChampionships.map(championship => ({
          ...championship,
          user_id: user.id,
          current_champion: championship.currentChampion,
          champion_since: championship.championSince,
          title_history: championship.titleHistory
        }));
        await supabase.from('championships').insert(championshipsToInsert);
      }
      
      setChampionships(newChampionships);
    } catch (error) {
      console.error('Save championships error:', error);
      toast({
        title: "Save Error",
        description: "Failed to save championships data.",
        variant: "destructive"
      });
    }
  };

  const saveRivalries = async (newRivalries: Rivalry[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('rivalries').delete().eq('user_id', user.id);
      
      if (newRivalries.length > 0) {
        const rivalriesToInsert = newRivalries.map(rivalry => ({
          ...rivalry,
          user_id: user.id,
          start_date: rivalry.startDate
        }));
        await supabase.from('rivalries').insert(rivalriesToInsert);
      }
      
      setRivalries(newRivalries);
    } catch (error) {
      console.error('Save rivalries error:', error);
      toast({
        title: "Save Error",
        description: "Failed to save rivalries data.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      await migrateFromLocalStorage();
      await fetchData();
    };

    initializeData();
  }, []);

  return {
    wrestlers,
    shows,
    championships,
    rivalries,
    loading,
    saveWrestlers,
    saveShows,
    saveChampionships,
    saveRivalries,
    refreshData: fetchData
  };
};