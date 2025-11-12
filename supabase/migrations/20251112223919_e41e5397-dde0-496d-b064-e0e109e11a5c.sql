-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  cost_price DECIMAL(10, 2) NOT NULL,
  selling_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily_records table
CREATE TABLE public.daily_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  opening_stock INTEGER NOT NULL DEFAULT 0,
  added_stock INTEGER NOT NULL DEFAULT 0,
  sold_stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_records ENABLE ROW LEVEL SECURITY;

-- Create policies for products (public read, no auth needed for this app)
CREATE POLICY "Anyone can view products" 
ON public.products 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert products" 
ON public.products 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update products" 
ON public.products 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete products" 
ON public.products 
FOR DELETE 
USING (true);

-- Create policies for daily_records
CREATE POLICY "Anyone can view daily records" 
ON public.daily_records 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert daily records" 
ON public.daily_records 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update daily records" 
ON public.daily_records 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete daily records" 
ON public.daily_records 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_records_updated_at
BEFORE UPDATE ON public.daily_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample products
INSERT INTO public.products (name, category, cost_price, selling_price) VALUES
('Coca-Cola', 'Drinks', 0.80, 1.50),
('Water', 'Drinks', 0.30, 0.80),
('Fanta', 'Drinks', 0.80, 1.50),
('Sprite', 'Drinks', 0.80, 1.50),
('Chicken', 'Meat & Protein', 5.00, 8.00),
('Fish', 'Meat & Protein', 6.00, 10.00),
('Pork', 'Meat & Protein', 4.50, 7.50),
('Sausage', 'Meat & Protein', 3.00, 5.00),
('Meatballs', 'Meat & Protein', 3.50, 6.00),
('Beans', 'Meat & Protein', 1.00, 2.50),
('Samosas', 'Snacks', 0.50, 1.20),
('Scones', 'Snacks', 0.40, 1.00),
('Fritters', 'Snacks', 0.45, 1.10),
('Crackers', 'Snacks', 1.00, 2.00),
('Two-Crunch', 'Snacks', 0.60, 1.50),
('Lay''s', 'Snacks', 1.20, 2.50),
('Popcorn', 'Snacks', 0.80, 2.00);