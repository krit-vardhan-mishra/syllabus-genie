-- Create syllabi table to store uploaded syllabi
CREATE TABLE IF NOT EXISTS public.syllabi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on syllabi
ALTER TABLE public.syllabi ENABLE ROW LEVEL SECURITY;

-- RLS policies for syllabi
CREATE POLICY "Users can view their own syllabi"
  ON public.syllabi FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own syllabi"
  ON public.syllabi FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own syllabi"
  ON public.syllabi FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own syllabi"
  ON public.syllabi FOR DELETE
  USING (auth.uid() = user_id);

-- Create topics table to store extracted important topics
CREATE TABLE IF NOT EXISTS public.topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  syllabus_id UUID NOT NULL REFERENCES public.syllabi(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  importance TEXT NOT NULL CHECK (importance IN ('high', 'medium', 'low')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on topics
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

-- RLS policies for topics
CREATE POLICY "Users can view topics for their syllabi"
  ON public.topics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.syllabi
      WHERE syllabi.id = topics.syllabus_id
      AND syllabi.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create topics for their syllabi"
  ON public.topics FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.syllabi
      WHERE syllabi.id = topics.syllabus_id
      AND syllabi.user_id = auth.uid()
    )
  );

-- Create updated_at trigger for syllabi
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_syllabi_updated_at
  BEFORE UPDATE ON public.syllabi
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();