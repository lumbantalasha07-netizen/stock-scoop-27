-- Add calculated columns to daily_records table
ALTER TABLE public.daily_records 
ADD COLUMN closing_stock INTEGER,
ADD COLUMN amount_sold DECIMAL(10, 2),
ADD COLUMN profit DECIMAL(10, 2);

-- Update existing records with calculated values
UPDATE public.daily_records dr
SET 
  closing_stock = (dr.opening_stock + dr.added_stock) - dr.sold_stock,
  amount_sold = dr.sold_stock * p.selling_price,
  profit = dr.sold_stock * (p.selling_price - p.cost_price)
FROM public.products p
WHERE dr.product_id = p.id;

-- Now make the columns NOT NULL since we've populated them
ALTER TABLE public.daily_records 
ALTER COLUMN closing_stock SET NOT NULL,
ALTER COLUMN amount_sold SET NOT NULL,
ALTER COLUMN profit SET NOT NULL;

-- Create function to automatically calculate values before insert/update
CREATE OR REPLACE FUNCTION public.calculate_daily_record()
RETURNS TRIGGER AS $$
DECLARE
  product_cost DECIMAL(10, 2);
  product_selling DECIMAL(10, 2);
BEGIN
  -- Get product prices
  SELECT cost_price, selling_price INTO product_cost, product_selling
  FROM public.products
  WHERE id = NEW.product_id;
  
  -- Calculate closing stock
  NEW.closing_stock = (NEW.opening_stock + NEW.added_stock) - NEW.sold_stock;
  
  -- Calculate amount sold
  NEW.amount_sold = NEW.sold_stock * product_selling;
  
  -- Calculate profit
  NEW.profit = NEW.sold_stock * (product_selling - product_cost);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic calculations
CREATE TRIGGER calculate_daily_record_values
BEFORE INSERT OR UPDATE ON public.daily_records
FOR EACH ROW
EXECUTE FUNCTION public.calculate_daily_record();

-- Create function to get previous day's closing stock
CREATE OR REPLACE FUNCTION public.get_previous_closing_stock(
  p_product_id UUID,
  p_date DATE
)
RETURNS INTEGER AS $$
DECLARE
  prev_closing INTEGER;
BEGIN
  SELECT closing_stock INTO prev_closing
  FROM public.daily_records
  WHERE product_id = p_product_id
    AND date < p_date
  ORDER BY date DESC
  LIMIT 1;
  
  RETURN COALESCE(prev_closing, 0);
END;
$$ LANGUAGE plpgsql SET search_path = public STABLE;