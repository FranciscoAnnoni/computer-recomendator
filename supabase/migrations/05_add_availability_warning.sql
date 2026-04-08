-- Add availability_warning flag to laptops
-- TRUE = no Platinum/Gold seller found on MercadoLibre — show red label in UI
ALTER TABLE laptops ADD COLUMN IF NOT EXISTS availability_warning BOOLEAN DEFAULT FALSE;
