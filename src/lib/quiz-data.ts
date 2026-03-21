import { supabase } from "@/lib/supabase";
import type { Workload, Lifestyle, Budget, OsPreference, ProfileResult } from "@/types/quiz";
import type { Laptop } from "@/types/laptop";

export async function fetchProfile(
  workload: Workload,
  lifestyle: Lifestyle,
  budget: Budget,
  osPreference: OsPreference
): Promise<ProfileResult> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("workload", workload)
    .eq("lifestyle", lifestyle)
    .eq("budget", budget)
    .eq("os_preference", osPreference)
    .single();

  if (error) throw error;
  return data as ProfileResult;
}

export async function fetchLaptopsByIds(ids: string[]): Promise<Laptop[]> {
  const { data, error } = await supabase
    .from("laptops")
    .select("*")
    .in("id", ids);

  if (error) throw error;
  return (data as Laptop[]) ?? [];
}
