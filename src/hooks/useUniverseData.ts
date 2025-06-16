
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UniverseData {
  wrestlers: any[];
  championships: any[];
  shows: any[];
  rivalries: any[];
  storylines: any[];
  settings: any;
}

type TableName = 'wrestlers' | 'championships' | 'shows' | 'rivalries' | 'storylines' | 'user_settings';

export const useUniverseData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<UniverseData>({
    wrestlers: [],
    championships: [],
    shows: [],
    rivalries: [],
    storylines: [],
    settings: null
  });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Load all data in parallel
      const [
        wrestlersResult,
        championshipsResult,
        showsResult,
        rivalriesResult,
        storylinesResult,
        settingsResult
      ] = await Promise.all([
        supabase.from('wrestlers').select('*').eq('user_id', user.id),
        supabase.from('championships').select('*').eq('user_id', user.id),
        supabase.from('shows').select('*').eq('user_id', user.id),
        supabase.from('rivalries').select('*').eq('user_id', user.id),
        supabase.from('storylines').select('*').eq('user_id', user.id),
        supabase.from('user_settings').select('*').eq('user_id', user.id).maybeSingle()
      ]);

      // Check for errors
      const errors = [
        wrestlersResult.error,
        championshipsResult.error,
        showsResult.error,
        rivalriesResult.error,
        storylinesResult.error,
        settingsResult.error
      ].filter(Boolean);

      if (errors.length > 0) {
        console.error('Errors loading data:', errors);
        toast({
          title: "Error Loading Data",
          description: "Some data could not be loaded. Please refresh the page.",
          variant: "destructive",
        });
      }

      setData({
        wrestlers: wrestlersResult.data || [],
        championships: championshipsResult.data || [],
        shows: showsResult.data || [],
        rivalries: rivalriesResult.data || [],
        storylines: storylinesResult.data || [],
        settings: settingsResult.data
      });

    } catch (error) {
      console.error('Error loading universe data:', error);
      toast({
        title: "Error",
        description: "Failed to load your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Enhanced save function with proper user_id handling
  const saveWrestler = async (wrestler: any) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const wrestlerData = {
        ...wrestler,
        user_id: user.id // Ensure user_id is always set
      };

      if (wrestler.id) {
        // Update existing
        const { error } = await supabase
          .from('wrestlers')
          .update(wrestlerData)
          .eq('id', wrestler.id)
          .eq('user_id', user.id); // Ensure user can only update their own data
        
        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('wrestlers')
          .insert(wrestlerData);
        
        if (error) throw error;
      }

      await loadData(); // Refresh data
      return { error: null };
    } catch (error) {
      console.error('Error saving wrestler:', error);
      return { error };
    }
  };

  const saveChampionship = async (championship: any) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const championshipData = {
        ...championship,
        user_id: user.id
      };

      if (championship.id) {
        const { error } = await supabase
          .from('championships')
          .update(championshipData)
          .eq('id', championship.id)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('championships')
          .insert(championshipData);
        
        if (error) throw error;
      }

      await loadData();
      return { error: null };
    } catch (error) {
      console.error('Error saving championship:', error);
      return { error };
    }
  };

  const saveShow = async (show: any) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const showData = {
        ...show,
        user_id: user.id
      };

      if (show.id) {
        const { error } = await supabase
          .from('shows')
          .update(showData)
          .eq('id', show.id)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('shows')
          .insert(showData);
        
        if (error) throw error;
      }

      await loadData();
      return { error: null };
    } catch (error) {
      console.error('Error saving show:', error);
      return { error };
    }
  };

  const saveRivalry = async (rivalry: any) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const rivalryData = {
        ...rivalry,
        user_id: user.id
      };

      if (rivalry.id) {
        const { error } = await supabase
          .from('rivalries')
          .update(rivalryData)
          .eq('id', rivalry.id)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('rivalries')
          .insert(rivalryData);
        
        if (error) throw error;
      }

      await loadData();
      return { error: null };
    } catch (error) {
      console.error('Error saving rivalry:', error);
      return { error };
    }
  };

  const saveStoryline = async (storyline: any) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const storylineData = {
        ...storyline,
        user_id: user.id
      };

      if (storyline.id) {
        const { error } = await supabase
          .from('storylines')
          .update(storylineData)
          .eq('id', storyline.id)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('storylines')
          .insert(storylineData);
        
        if (error) throw error;
      }

      await loadData();
      return { error: null };
    } catch (error) {
      console.error('Error saving storyline:', error);
      return { error };
    }
  };

  const deleteRecord = async (table: TableName, id: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Ensure user can only delete their own data
      
      if (error) throw error;
      
      await loadData();
      return { error: null };
    } catch (error) {
      console.error(`Error deleting ${table} record:`, error);
      return { error };
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Set up real-time subscriptions with proper cleanup
  useEffect(() => {
    if (!user) return;

    console.log('Setting up realtime subscriptions for user:', user.id);

    // Create a single channel for all table changes
    const channel = supabase
      .channel(`user-${user.id}-changes`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'wrestlers', filter: `user_id=eq.${user.id}` },
        (payload) => {
          console.log('Wrestlers change detected:', payload);
          loadData();
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'championships', filter: `user_id=eq.${user.id}` },
        (payload) => {
          console.log('Championships change detected:', payload);
          loadData();
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'shows', filter: `user_id=eq.${user.id}` },
        (payload) => {
          console.log('Shows change detected:', payload);
          loadData();
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'rivalries', filter: `user_id=eq.${user.id}` },
        (payload) => {
          console.log('Rivalries change detected:', payload);
          loadData();
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'storylines', filter: `user_id=eq.${user.id}` },
        (payload) => {
          console.log('Storylines change detected:', payload);
          loadData();
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up realtime subscriptions');
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    data,
    loading,
    refetch: loadData,
    saveWrestler,
    saveChampionship,
    saveShow,
    saveRivalry,
    saveStoryline,
    deleteRecord
  };
};
