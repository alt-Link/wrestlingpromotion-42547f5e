-- Create wrestlers table
CREATE TABLE public.wrestlers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  brand TEXT,
  status TEXT DEFAULT 'Active',
  ovr INTEGER DEFAULT 0,
  is_free_agent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shows table
CREATE TABLE public.shows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT,
  is_template BOOLEAN DEFAULT false,
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency TEXT,
  recurring_end_date DATE,
  matches JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create championships table
CREATE TABLE public.championships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  current_champion TEXT,
  champion_since DATE,
  title_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rivalries table
CREATE TABLE public.rivalries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  participants TEXT[] NOT NULL,
  intensity INTEGER DEFAULT 1,
  status TEXT DEFAULT 'Active',
  start_date DATE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.wrestlers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.championships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rivalries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for wrestlers
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

-- Create RLS policies for shows
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

-- Create RLS policies for championships
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

-- Create RLS policies for rivalries
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

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_wrestlers_updated_at
BEFORE UPDATE ON public.wrestlers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shows_updated_at
BEFORE UPDATE ON public.shows
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_championships_updated_at
BEFORE UPDATE ON public.championships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rivalries_updated_at
BEFORE UPDATE ON public.rivalries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();