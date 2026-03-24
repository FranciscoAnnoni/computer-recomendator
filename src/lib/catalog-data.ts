import { supabase } from "@/lib/supabase";
import type { Laptop } from "@/types/laptop";

export async function fetchAllLaptops(): Promise<Laptop[]> {
  const { data, error } = await supabase
    .from("laptops")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as Laptop[]) ?? [];
}
