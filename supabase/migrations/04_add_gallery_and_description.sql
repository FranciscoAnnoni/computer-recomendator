-- Add gallery images array and description text to laptops table
ALTER TABLE laptops
  ADD COLUMN IF NOT EXISTS gallery_images text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS description text;
