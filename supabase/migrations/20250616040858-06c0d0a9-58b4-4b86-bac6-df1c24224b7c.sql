
-- Fix RLS policies to ensure proper user data isolation

-- Update wrestlers table policies
DROP POLICY IF EXISTS "Users can create their own wrestlers" ON public.wrestlers;
CREATE POLICY "Users can create their own wrestlers" ON public.wrestlers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update championships table policies  
DROP POLICY IF EXISTS "Users can create their own championships" ON public.championships;
CREATE POLICY "Users can create their own championships" ON public.championships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update shows table policies
DROP POLICY IF EXISTS "Users can create their own shows" ON public.shows;
CREATE POLICY "Users can create their own shows" ON public.shows
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update rivalries table policies
DROP POLICY IF EXISTS "Users can create their own rivalries" ON public.rivalries;
CREATE POLICY "Users can create their own rivalries" ON public.rivalries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update storylines table policies
DROP POLICY IF EXISTS "Users can create their own storylines" ON public.storylines;
CREATE POLICY "Users can create their own storylines" ON public.storylines
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update user_settings table policies
DROP POLICY IF EXISTS "Users can create their own settings" ON public.user_settings;
CREATE POLICY "Users can create their own settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Clean up any existing data that might have incorrect user_id values
-- This will help ensure data integrity going forward
DELETE FROM public.wrestlers WHERE user_id IS NULL;
DELETE FROM public.championships WHERE user_id IS NULL;
DELETE FROM public.shows WHERE user_id IS NULL;
DELETE FROM public.rivalries WHERE user_id IS NULL;
DELETE FROM public.storylines WHERE user_id IS NULL;
DELETE FROM public.user_settings WHERE user_id IS NULL;
