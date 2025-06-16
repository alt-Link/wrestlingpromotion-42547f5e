
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

  // Auto-save function
  const saveData = async (type: keyof UniverseData, newData: any[]) => {
    if (!user) return;

    try {
      // For now, we'll handle saves through individual component updates
      // This hook provides the data loading and will be extended for saves
      console.log(`Saving ${type} data:`, newData);
    } catch (error) {
      console.error(`Error saving ${type}:`, error);
      toast({
        title: "Save Error",
        description: `Failed to save ${type}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const channels = [
      supabase
        .channel('wrestlers-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'wrestlers', filter: `user_id=eq.${user.id}` },
          () => loadData()
        )
        .subscribe(),
      
      supabase
        .channel('championships-changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'championships', filter: `user_id=eq.${user.id}` },
          () => loadData()
        )
        .subscribe(),
      
      supabase
        .channel('shows-changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'shows', filter: `user_id=eq.${user.id}` },
          () => loadData()
        )
        .subscribe(),
      
      supabase
        .channel('rivalries-changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'rivalries', filter: `user_id=eq.${user.id}` },
          () => loadData()
        )
        .subscribe(),
      
      supabase
        .channel('storylines-changes')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'storylines', filter: `user_id=eq.${user.id}` },
          () => loadData()
        )
        .subscribe()
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [user]);

  return {
    data,
    loading,
    refetch: loadData,
    saveData
  };
};
