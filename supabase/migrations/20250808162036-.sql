-- Add missing columns to wrestlers table
ALTER TABLE public.wrestlers 
ADD COLUMN alignment TEXT DEFAULT 'Face',
ADD COLUMN gender TEXT DEFAULT 'Male',
ADD COLUMN titles TEXT[] DEFAULT '{}',
ADD COLUMN manager TEXT,
ADD COLUMN faction TEXT,
ADD COLUMN injured BOOLEAN DEFAULT false,
ADD COLUMN on_break BOOLEAN DEFAULT false,
ADD COLUMN custom_attributes JSONB DEFAULT '{}'::jsonb;