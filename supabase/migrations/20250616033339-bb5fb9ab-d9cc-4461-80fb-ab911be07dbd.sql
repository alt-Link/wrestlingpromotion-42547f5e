
-- Add missing columns to wrestlers table
ALTER TABLE public.wrestlers 
ADD COLUMN IF NOT EXISTS alignment TEXT DEFAULT 'face',
ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'male',
ADD COLUMN IF NOT EXISTS manager TEXT,
ADD COLUMN IF NOT EXISTS faction TEXT,
ADD COLUMN IF NOT EXISTS injured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS on_break BOOLEAN DEFAULT false;

-- Add missing columns to championships table
ALTER TABLE public.championships 
ADD COLUMN IF NOT EXISTS event TEXT,
ADD COLUMN IF NOT EXISTS reign_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS history JSONB DEFAULT '[]'::jsonb;

-- Add missing columns to shows table
ALTER TABLE public.shows 
ADD COLUMN IF NOT EXISTS venue TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS base_show_id UUID;

-- Add missing columns to rivalries table
ALTER TABLE public.rivalries 
ADD COLUMN IF NOT EXISTS timeline JSONB DEFAULT '[]'::jsonb;

-- Create storylines table
CREATE TABLE IF NOT EXISTS public.storylines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  wrestlers TEXT[] DEFAULT '{}',
  priority TEXT DEFAULT 'medium',
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active',
  description TEXT,
  notes TEXT,
  timeline JSONB DEFAULT '[]'::jsonb,
  custom_events JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_settings table for storing user preferences
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  auto_save BOOLEAN DEFAULT true,
  show_match_ratings BOOLEAN DEFAULT true,
  enable_ai_suggestions BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.wrestlers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.championships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rivalries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storylines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for wrestlers
DROP POLICY IF EXISTS "Users can view their own wrestlers" ON public.wrestlers;
DROP POLICY IF EXISTS "Users can create their own wrestlers" ON public.wrestlers;
DROP POLICY IF EXISTS "Users can update their own wrestlers" ON public.wrestlers;
DROP POLICY IF EXISTS "Users can delete their own wrestlers" ON public.wrestlers;

CREATE POLICY "Users can view their own wrestlers" ON public.wrestlers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wrestlers" ON public.wrestlers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wrestlers" ON public.wrestlers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wrestlers" ON public.wrestlers
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for championships
DROP POLICY IF EXISTS "Users can view their own championships" ON public.championships;
DROP POLICY IF EXISTS "Users can create their own championships" ON public.championships;
DROP POLICY IF EXISTS "Users can update their own championships" ON public.championships;
DROP POLICY IF EXISTS "Users can delete their own championships" ON public.championships;

CREATE POLICY "Users can view their own championships" ON public.championships
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own championships" ON public.championships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own championships" ON public.championships
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own championships" ON public.championships
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for shows
DROP POLICY IF EXISTS "Users can view their own shows" ON public.shows;
DROP POLICY IF EXISTS "Users can create their own shows" ON public.shows;
DROP POLICY IF EXISTS "Users can update their own shows" ON public.shows;
DROP POLICY IF EXISTS "Users can delete their own shows" ON public.shows;

CREATE POLICY "Users can view their own shows" ON public.shows
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shows" ON public.shows
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shows" ON public.shows
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shows" ON public.shows
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for rivalries
DROP POLICY IF EXISTS "Users can view their own rivalries" ON public.rivalries;
DROP POLICY IF EXISTS "Users can create their own rivalries" ON public.rivalries;
DROP POLICY IF EXISTS "Users can update their own rivalries" ON public.rivalries;
DROP POLICY IF EXISTS "Users can delete their own rivalries" ON public.rivalries;

CREATE POLICY "Users can view their own rivalries" ON public.rivalries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own rivalries" ON public.rivalries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rivalries" ON public.rivalries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rivalries" ON public.rivalries
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for storylines
CREATE POLICY "Users can view their own storylines" ON public.storylines
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own storylines" ON public.storylines
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own storylines" ON public.storylines
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own storylines" ON public.storylines
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_settings
CREATE POLICY "Users can view their own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.wrestlers;
DROP TRIGGER IF EXISTS set_updated_at ON public.championships;
DROP TRIGGER IF EXISTS set_updated_at ON public.shows;
DROP TRIGGER IF EXISTS set_updated_at ON public.rivalries;
DROP TRIGGER IF EXISTS set_updated_at ON public.storylines;
DROP TRIGGER IF EXISTS set_updated_at ON public.user_settings;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.wrestlers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.championships
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.shows
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.rivalries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.storylines
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
