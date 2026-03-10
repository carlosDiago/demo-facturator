-- =================================================================================
-- BASE DE DATOS FACTURATOR - SCRIPT DE INICIALIZACIÓN
-- Ejecuta este script íntegramente en el SQL Editor de tu proyecto Supabase
-- =================================================================================

-- 1. Tabla Perfiles (Profiles)
CREATE TABLE public.profiles (
  id UUID references auth.users(id) on delete cascade not null primary key,
  full_name TEXT,
  tax_id TEXT,
  email TEXT,
  address TEXT,
  zip_code TEXT,
  city TEXT,
  province TEXT,
  country TEXT DEFAULT 'España',
  payment_message TEXT,
  default_vat DECIMAL(5,2) DEFAULT 21.00,
  default_irpf DECIMAL(5,2) DEFAULT 0.00,
  language TEXT DEFAULT 'es',
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para Profiles
CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own profile."
  ON profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON profiles FOR UPDATE
  USING ( auth.uid() = id );

-- Configurar Trigger para crear un perfil vacío cada vez que se registre un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

-- Disparador asincrónico al registrarse en auth
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. Tabla Clientes (Agenda)
CREATE TABLE public.clients (
  id UUID DEFAULT uuid_generate_v4() primary key,
  user_id UUID references public.profiles(id) on delete cascade not null,
  name TEXT NOT NULL,
  tax_id TEXT,
  address TEXT,
  zip_code TEXT,
  city TEXT,
  province TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own clients."
  ON clients FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can insert their own clients."
  ON clients FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update their own clients."
  ON clients FOR UPDATE
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can delete their own clients."
  ON clients FOR DELETE
  USING ( auth.uid() = user_id );


-- 3. Tabla Invoices (Facturas)
CREATE TABLE public.invoices (
  id UUID DEFAULT uuid_generate_v4() primary key,
  user_id UUID references public.profiles(id) on delete cascade not null,
  invoice_number TEXT NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE,
  client_id UUID references public.clients(id) on delete set null,
  receiver_type TEXT CHECK (receiver_type IN ('B2B', 'B2C')),
  receiver_name TEXT NOT NULL,
  receiver_tax_id TEXT,
  receiver_address TEXT,
  subtotal DECIMAL(10,2) DEFAULT 0.00,
  tax_amount DECIMAL(10,2) DEFAULT 0.00,
  irpf_amount DECIMAL(10,2) DEFAULT 0.00,
  total_amount DECIMAL(10,2) DEFAULT 0.00,
  status TEXT CHECK (status IN ('Draft', 'Issued', 'Paid')) DEFAULT 'Draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own invoices."
  ON invoices FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can insert their own invoices."
  ON invoices FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update their own invoices."
  ON invoices FOR UPDATE
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can delete their own invoices."
  ON invoices FOR DELETE
  USING ( auth.uid() = user_id );


-- 4. Tabla Invoice Items (Líneas de concepto)
CREATE TABLE public.invoice_items (
  id UUID DEFAULT uuid_generate_v4() primary key,
  invoice_id UUID references public.invoices(id) on delete cascade not null,
  user_id UUID references public.profiles(id) on delete cascade not null,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1.00,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  tax_rate DECIMAL(5,2) NOT NULL DEFAULT 21.00,
  total DECIMAL(10,2) NOT NULL DEFAULT 0.00
);

ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own invoice items."
  ON invoice_items FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can insert their own invoice items."
  ON invoice_items FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update their own invoice items."
  ON invoice_items FOR UPDATE
  USING ( auth.uid() = user_id );

CREATE POLICY "Users can delete their own invoice items."
  ON invoice_items FOR DELETE
  USING ( auth.uid() = user_id );
  
-- =================================================================================
-- 5. Crear Storage Bucket para "logos"
-- =================================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('logos', 'logos', true);

CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'logos' );

CREATE POLICY "Users can upload their own logo."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'logos' AND auth.role() = 'authenticated' );
