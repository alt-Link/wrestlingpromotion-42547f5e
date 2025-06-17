
-- Add missing columns to storylines table for faction-specific features
ALTER TABLE public.storylines 
ADD COLUMN IF NOT EXISTS faction_betrayal_coming boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS faction_new_member_coming boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS faction_betrayal_description text,
ADD COLUMN IF NOT EXISTS faction_new_member_description text,
ADD COLUMN IF NOT EXISTS faction_new_member_wrestler text;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own wrestlers" ON public.wrestlers;
DROP POLICY IF EXISTS "Users can create their own wrestlers" ON public.wrestlers;
DROP POLICY IF EXISTS "Users can update their own wrestlers" ON public.wrestlers;
DROP POLICY IF EXISTS "Users can delete their own wrestlers" ON public.wrestlers;

DROP POLICY IF EXISTS "Users can view their own championships" ON public.championships;
DROP POLICY IF EXISTS "Users can create their own championships" ON public.championships;
DROP POLICY IF EXISTS "Users can update their own championships" ON public.championships;
DROP POLICY IF EXISTS "Users can delete their own championships" ON public.championships;

DROP POLICY IF EXISTS "Users can view their own shows" ON public.shows;
DROP POLICY IF EXISTS "Users can create their own shows" ON public.shows;
DROP POLICY IF EXISTS "Users can update their own shows" ON public.shows;
DROP POLICY IF EXISTS "Users can delete their own shows" ON public.shows;

DROP POLICY IF EXISTS "Users can view their own rivalries" ON public.rivalries;
DROP POLICY IF EXISTS "Users can create their own rivalries" ON public.rivalries;
DROP POLICY IF EXISTS "Users can update their own rivalries" ON public.rivalries;
DROP POLICY IF EXISTS "Users can delete their own rivalries" ON public.rivalries;

DROP POLICY IF EXISTS "Users can view their own storylines" ON public.storylines;
DROP POLICY IF EXISTS "Users can create their own storylines" ON public.storylines;
DROP POLICY IF EXISTS "Users can update their own storylines" ON public.storylines;
DROP POLICY IF EXISTS "Users can delete their own storylines" ON public.storylines;

-- Create RLS policies for wrestlers table
CREATE POLICY "Users can view their own wrestlers" 
  ON public.wrestlers 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wrestlers" 
  ON public.wrestlers 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wrestlers" 
  ON public.wrestlers 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wrestlers" 
  ON public.wrestlers 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for championships table
CREATE POLICY "Users can view their own championships" 
  ON public.championships 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own championships" 
  ON public.championships 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own championships" 
  ON public.championships 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own championships" 
  ON public.championships 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for shows table
CREATE POLICY "Users can view their own shows" 
  ON public.shows 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shows" 
  ON public.shows 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shows" 
  ON public.shows 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shows" 
  ON public.shows 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for rivalries table
CREATE POLICY "Users can view their own rivalries" 
  ON public.rivalries 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own rivalries" 
  ON public.rivalries 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rivalries" 
  ON public.rivalries 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rivalries" 
  ON public.rivalries 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for storylines table
CREATE POLICY "Users can view their own storylines" 
  ON public.storylines 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own storylines" 
  ON public.storylines 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own storylines" 
  ON public.storylines 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own storylines" 
  ON public.storylines 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable RLS on all tables
ALTER TABLE public.wrestlers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.championships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rivalries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storylines ENABLE ROW LEVEL SECURITY;
