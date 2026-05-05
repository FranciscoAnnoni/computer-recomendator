// /preview — staging review page
// Shows profile_recommendations joined with laptops_v2 and profiles.
// Only accessible by URL — not linked from the main nav.
// Run `npm run dev` and open http://localhost:3000/preview

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Rec = {
  rank: number;
  tier: string;
  laptops_v2: {
    id: string;
    name: string;
    brand: string;
    price: number | null;
    cpu: string | null;
    ram: string | null;
    gpu: string | null;
    os: string | null;
    form_factor: string;
    image_url: string | null;
    affiliate_link: string | null;
    recommendation_score: number | null;
  };
  profiles: {
    id: string;
    profile_name: string;
    workload: string;
    lifestyle: string;
    budget: string;
    os_preference: string;
  };
};

const TIER_COLORS: Record<string, string> = {
  barata:  "bg-emerald-900 text-emerald-300",
  mediana: "bg-blue-900 text-blue-300",
  cara:    "bg-purple-900 text-purple-300",
};

const WORKLOAD_LABELS: Record<string, string> = {
  productividad_estudio: "Productividad / Estudio",
  creacion_desarrollo:   "Creación / Desarrollo",
  gaming_rendimiento:    "Gaming / Rendimiento",
};

function fmt(price: number | null) {
  if (!price) return "—";
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(price);
}

async function fetchData(): Promise<Rec[]> {
  const { data, error } = await supabase
    .from("profile_recommendations")
    .select(`
      rank,
      tier,
      laptops_v2 ( id, name, brand, price, cpu, ram, gpu, os, form_factor, image_url, affiliate_link, recommendation_score ),
      profiles   ( id, profile_name, workload, lifestyle, budget, os_preference )
    `)
    .order("rank");

  if (error) {
    console.error("Preview fetch error:", error.message);
    return [];
  }
  return (data as unknown as Rec[]) ?? [];
}

export default async function PreviewPage() {
  const recs = await fetchData();

  if (recs.length === 0) {
    return (
      <main className="min-h-screen bg-black text-white p-12">
        <h1 className="text-2xl font-bold mb-4">Staging Preview</h1>
        <p className="text-zinc-400">
          No hay datos en <code>profile_recommendations</code>. Corré:
        </p>
        <pre className="mt-4 p-4 bg-zinc-900 rounded text-sm text-zinc-300">
          python3 scripts/import_to_staging.py{"\n"}
          python3 scripts/curate_profiles_v2.py --apply
        </pre>
      </main>
    );
  }

  // Group by profile
  const byProfile = new Map<string, { meta: Rec["profiles"]; laptops: Rec[] }>();
  for (const rec of recs) {
    const pid = rec.profiles.id;
    if (!byProfile.has(pid)) {
      byProfile.set(pid, { meta: rec.profiles, laptops: [] });
    }
    byProfile.get(pid)!.laptops.push(rec);
  }

  // Sort laptops within each profile by rank
  for (const entry of byProfile.values()) {
    entry.laptops.sort((a, b) => a.rank - b.rank);
  }

  // Group profiles by workload
  const byWorkload = new Map<string, typeof byProfile>();
  const workloadOrder = ["productividad_estudio", "creacion_desarrollo", "gaming_rendimiento"];
  for (const wl of workloadOrder) {
    byWorkload.set(wl, new Map());
  }
  for (const [pid, entry] of byProfile.entries()) {
    const wl = entry.meta.workload;
    if (!byWorkload.has(wl)) byWorkload.set(wl, new Map());
    byWorkload.get(wl)!.set(pid, entry);
  }

  const totalProfiles = byProfile.size;
  const totalLaptops  = recs.length;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex items-baseline gap-4 mb-2">
          <h1 className="text-3xl font-bold tracking-tight">Staging Preview</h1>
          <span className="text-zinc-500 text-sm">feature/new-pipeline</span>
        </div>
        <p className="text-zinc-400 text-sm">
          {totalProfiles} perfiles · {totalLaptops} recomendaciones ·{" "}
          <span className="text-emerald-400">barata</span> ·{" "}
          <span className="text-blue-400">mediana</span> ·{" "}
          <span className="text-purple-400">cara</span>
        </p>
        <p className="text-zinc-600 text-xs mt-1">
          Si todo se ve bien: <code>python3 scripts/curate_profiles_v2.py --apply --table laptops</code> en main.
        </p>
      </div>

      {/* Profiles grouped by workload */}
      {workloadOrder.map((wl) => {
        const profilesInWl = byWorkload.get(wl);
        if (!profilesInWl || profilesInWl.size === 0) return null;

        return (
          <section key={wl} className="max-w-7xl mx-auto mb-16">
            <h2 className="text-xl font-semibold text-zinc-200 mb-6 pb-2 border-b border-zinc-800">
              {WORKLOAD_LABELS[wl] ?? wl}
            </h2>

            <div className="grid gap-8">
              {Array.from(profilesInWl.values()).map(({ meta, laptops }) => (
                <div key={meta.id} className="bg-zinc-900 rounded-xl p-5">
                  {/* Profile header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-white text-base">
                        {meta.profile_name}
                      </h3>
                      <p className="text-zinc-500 text-xs mt-0.5">
                        {meta.lifestyle} · {meta.budget} · {meta.os_preference}
                      </p>
                    </div>
                    <span className="text-zinc-600 text-xs">{laptops.length}/5 laptops</span>
                  </div>

                  {/* Laptop rows */}
                  <div className="space-y-2">
                    {laptops.map((rec) => {
                      const l = rec.laptops_v2;
                      return (
                        <div
                          key={`${meta.id}-${rec.rank}`}
                          className="flex items-center gap-3 bg-zinc-800 rounded-lg px-4 py-3"
                        >
                          {/* Rank */}
                          <span className="text-zinc-500 text-xs w-4 shrink-0">{rec.rank}</span>

                          {/* Tier badge */}
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${TIER_COLORS[rec.tier] ?? "bg-zinc-700 text-zinc-300"}`}>
                            {rec.tier}
                          </span>

                          {/* Thumbnail */}
                          {l.image_url ? (
                            <img
                              src={l.image_url}
                              alt={l.name}
                              className="w-10 h-10 object-contain rounded shrink-0 bg-zinc-700"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-zinc-700 rounded shrink-0" />
                          )}

                          {/* Name + brand */}
                          <div className="flex-1 min-w-0">
                            <a
                              href={l.affiliate_link || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-white hover:text-blue-400 truncate block"
                            >
                              {l.name}
                            </a>
                            <p className="text-zinc-500 text-xs">{l.brand}</p>
                          </div>

                          {/* Specs */}
                          <div className="hidden md:flex gap-4 text-xs text-zinc-400 shrink-0">
                            <span className="w-32 truncate" title={l.cpu ?? ""}>{l.cpu ?? "—"}</span>
                            <span className="w-14 text-center">{l.ram ?? "—"}</span>
                            <span className="w-28 truncate" title={l.gpu ?? ""}>{l.gpu ?? "—"}</span>
                          </div>

                          {/* Price */}
                          <span className="text-sm font-medium text-zinc-200 shrink-0 w-28 text-right">
                            {fmt(l.price)}
                          </span>

                          {/* Score */}
                          <span className="text-xs text-zinc-500 shrink-0 w-8 text-right">
                            {l.recommendation_score ?? "—"}/10
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}
