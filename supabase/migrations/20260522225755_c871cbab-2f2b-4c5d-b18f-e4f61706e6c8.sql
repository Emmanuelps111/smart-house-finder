-- 1. Profile role enum + column
CREATE TYPE public.profile_role AS ENUM ('renter', 'landlord', 'admin');

ALTER TABLE public.profiles
  ADD COLUMN role public.profile_role NOT NULL DEFAULT 'renter';

-- 2. Property status enum
CREATE TYPE public.property_status AS ENUM ('pending', 'approved', 'rejected');

-- 3. Booking status enum
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled');

-- 4. Helper: is_admin (security definer, avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin'
  )
$$;

-- 5. Properties table
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  landlord_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  status public.property_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_properties_landlord ON public.properties(landlord_id);
CREATE INDEX idx_properties_status ON public.properties(status);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view approved properties"
  ON public.properties FOR SELECT
  TO authenticated
  USING (status = 'approved');

CREATE POLICY "Landlords view their own properties"
  ON public.properties FOR SELECT
  TO authenticated
  USING (auth.uid() = landlord_id);

CREATE POLICY "Admins view all properties"
  ON public.properties FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Landlords insert their own properties"
  ON public.properties FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "Landlords update their own properties"
  ON public.properties FOR UPDATE
  TO authenticated
  USING (auth.uid() = landlord_id);

CREATE POLICY "Admins update any property"
  ON public.properties FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Landlords delete their own properties"
  ON public.properties FOR DELETE
  TO authenticated
  USING (auth.uid() = landlord_id);

CREATE POLICY "Admins delete any property"
  ON public.properties FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  renter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  status public.booking_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (check_out > check_in)
);

CREATE INDEX idx_bookings_property ON public.bookings(property_id);
CREATE INDEX idx_bookings_renter ON public.bookings(renter_id);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Renters view own bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = renter_id);

CREATE POLICY "Landlords view bookings on their properties"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_id AND p.landlord_id = auth.uid()
  ));

CREATE POLICY "Admins view all bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Renters create their own bookings"
  ON public.bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = renter_id);

CREATE POLICY "Renters update their own bookings"
  ON public.bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = renter_id);

CREATE POLICY "Landlords update bookings on their properties"
  ON public.bookings FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_id AND p.landlord_id = auth.uid()
  ));

CREATE POLICY "Admins update any booking"
  ON public.bookings FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();