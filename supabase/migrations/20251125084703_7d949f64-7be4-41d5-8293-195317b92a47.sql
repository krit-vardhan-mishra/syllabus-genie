-- Fix function search path security issue
DROP TRIGGER IF EXISTS update_syllabi_updated_at ON public.syllabi;
DROP FUNCTION IF EXISTS public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SET search_path = public
SECURITY DEFINER;

CREATE TRIGGER update_syllabi_updated_at
  BEFORE UPDATE ON public.syllabi
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();