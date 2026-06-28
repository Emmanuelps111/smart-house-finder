
CREATE TABLE public.property_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (property_id, reviewer_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.property_reviews TO authenticated;
GRANT ALL ON public.property_reviews TO service_role;

ALTER TABLE public.property_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are readable by signed-in users"
  ON public.property_reviews FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create their own reviews"
  ON public.property_reviews FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own reviews"
  ON public.property_reviews FOR UPDATE TO authenticated
  USING (auth.uid() = reviewer_id) WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users or admins can delete reviews"
  ON public.property_reviews FOR DELETE TO authenticated
  USING (auth.uid() = reviewer_id OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_property_reviews_updated_at
  BEFORE UPDATE ON public.property_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_property_reviews_property ON public.property_reviews(property_id);
