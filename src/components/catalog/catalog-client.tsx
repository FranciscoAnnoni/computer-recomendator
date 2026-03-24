"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { DetailOverlay } from "@/components/catalog/detail-overlay";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CatalogCard } from "@/components/catalog/catalog-card";
import { CatalogSkeleton } from "@/components/catalog/catalog-skeleton";
import { FilterDrawer } from "@/components/catalog/filter-drawer";
import { ActiveFilterBar } from "@/components/catalog/active-filter-bar";
import { fetchAllLaptops } from "@/lib/catalog-data";
import type { Laptop, UsageProfile } from "@/types/laptop";
import type { ProfileResult } from "@/types/quiz";
import { PROFILE_STORAGE_KEY, QUIZ_STORAGE_KEY } from "@/types/quiz";

// ---------- Types ----------

export interface CatalogFilters {
  brands: string[];
  priceMin: number | null;
  priceMax: number | null;
  screenSizes: string[];
  weights: string[];
  usageProfiles: UsageProfile[];
  os: string[];
}

export const EMPTY_FILTERS: CatalogFilters = {
  brands: [],
  priceMin: null,
  priceMax: null,
  screenSizes: [],
  weights: [],
  usageProfiles: [],
  os: [],
};

// ---------- Animation variants ----------

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" as const } },
};

// ---------- Constants ----------

const PAGE_SIZE = 100;

// ---------- Sub-components ----------

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center py-16 text-center gap-4">
      <h3 className="text-[17px] font-medium text-foreground">Sin resultados</h3>
      <p className="text-[17px] text-muted-foreground max-w-xs">
        No encontramos laptops con estos filtros. Probá quitando alguno.
      </p>
      <Button variant="outline" onClick={onClear}>
        Limpiar filtros
      </Button>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center py-16 text-center gap-4">
      <p className="text-[17px] text-muted-foreground max-w-xs">{message}</p>
      <Button variant="outline" onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  );
}

// ---------- Main component ----------

export function CatalogClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [laptops, setLaptops] = useState<Laptop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState<CatalogFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [profileFilter, setProfileFilter] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [completedProfile, setCompletedProfile] = useState<
    (ProfileResult & { laptops: Laptop[] }) | null
  >(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---------- Data fetching ----------

  const loadLaptops = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllLaptops();
      setLaptops(data);
    } catch {
      setError(
        "No pudimos cargar los laptops. Verificá tu conexión e intentá de nuevo."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLaptops();

    try {
      const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ProfileResult & { laptops: Laptop[] };
        setCompletedProfile(parsed);
      }
    } catch {
      // ignore malformed localStorage
    }
  }, [loadLaptops]);

  // ---------- Search debounce ----------

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setSearchText(value);
        setPage(1);
      }, 200);
    },
    []
  );

  // ---------- Filtering ----------

  const filteredLaptops = useMemo(() => {
    let result = laptops;

    // Profile filter
    if (profileFilter && completedProfile) {
      result = result.filter((l) =>
        completedProfile.laptop_ids.includes(l.id)
      );
    }

    // Text search
    if (searchText.trim()) {
      const q = searchText.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.brand.toLowerCase().includes(q) ||
          l.simplified_tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    // Brand filter
    if (filters.brands.length > 0) {
      result = result.filter((l) => filters.brands.includes(l.brand));
    }

    // Price range
    if (filters.priceMin !== null) {
      result = result.filter((l) => l.price >= filters.priceMin!);
    }
    if (filters.priceMax !== null) {
      result = result.filter((l) => l.price <= filters.priceMax!);
    }

    // OS filter
    if (filters.os.length > 0) {
      result = result.filter((l) => l.os !== null && filters.os.includes(l.os));
    }

    // Screen size filter
    if (filters.screenSizes.length > 0) {
      result = result.filter(
        (l) => l.screen_size !== null && filters.screenSizes.includes(l.screen_size)
      );
    }

    // Weight filter
    if (filters.weights.length > 0) {
      result = result.filter(
        (l) => l.weight !== null && filters.weights.includes(l.weight)
      );
    }

    // Usage profile filter
    if (filters.usageProfiles.length > 0) {
      result = result.filter((l) =>
        l.usage_profiles.some((p) => filters.usageProfiles.includes(p))
      );
    }

    return result;
  }, [laptops, searchText, filters, profileFilter, completedProfile]);

  // ---------- Pagination ----------

  const visibleLaptops = useMemo(
    () => filteredLaptops.slice(0, page * PAGE_SIZE),
    [filteredLaptops, page]
  );

  // ---------- Available filter options (derived from full dataset) ----------

  const availableOptions = useMemo(() => {
    const brands = [...new Set(laptops.map((l) => l.brand))].sort();
    const screenSizes = [
      ...new Set(laptops.map((l) => l.screen_size).filter((s): s is string => s !== null)),
    ].sort();
    const weights = [
      ...new Set(laptops.map((l) => l.weight).filter((w): w is string => w !== null)),
    ].sort();
    const osOptions = [
      ...new Set(laptops.map((l) => l.os).filter((o): o is string => o !== null)),
    ].sort();
    const usageProfiles = [
      ...new Set(laptops.flatMap((l) => l.usage_profiles)),
    ] as UsageProfile[];
    return { brands, screenSizes, weights, osOptions, usageProfiles };
  }, [laptops]);

  // ---------- Active filters check ----------

  const hasActiveFilters = useMemo(() => {
    return (
      filters.brands.length > 0 ||
      filters.priceMin !== null ||
      filters.priceMax !== null ||
      filters.screenSizes.length > 0 ||
      filters.weights.length > 0 ||
      filters.usageProfiles.length > 0 ||
      filters.os.length > 0 ||
      profileFilter ||
      searchText.trim().length > 0
    );
  }, [filters, profileFilter, searchText]);

  // ---------- Actions ----------

  const clearAllFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setSearchText("");
    setInputValue("");
    setProfileFilter(false);
    setPage(1);
  }, []);

  const handleRemoveFilter = useCallback(
    (key: string, value?: string) => {
      setFilters((prev) => {
        switch (key) {
          case "brands":
            return { ...prev, brands: prev.brands.filter((b) => b !== value) };
          case "priceMin":
            return { ...prev, priceMin: null };
          case "priceMax":
            return { ...prev, priceMax: null };
          case "screenSizes":
            return {
              ...prev,
              screenSizes: prev.screenSizes.filter((s) => s !== value),
            };
          case "weights":
            return {
              ...prev,
              weights: prev.weights.filter((w) => w !== value),
            };
          case "usageProfiles":
            return {
              ...prev,
              usageProfiles: prev.usageProfiles.filter(
                (p) => p !== (value as UsageProfile)
              ),
            };
          case "os":
            return { ...prev, os: prev.os.filter((o) => o !== value) };
          default:
            return prev;
        }
      });
      if (key === "profileFilter") setProfileFilter(false);
      if (key === "searchText") {
        setSearchText("");
        setInputValue("");
      }
      setPage(1);
    },
    []
  );

  const handleApplyFilters = useCallback((newFilters: CatalogFilters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const handleRehacer = useCallback(() => {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    localStorage.removeItem(QUIZ_STORAGE_KEY);
    router.push("/quiz");
  }, [router]);

  // ---------- Overlay navigation ----------

  const activeLaptopId = searchParams.get("laptop");

  const activeLaptop = useMemo(
    () => laptops.find((l) => l.id === activeLaptopId) ?? null,
    [laptops, activeLaptopId]
  );

  const handleVerMas = useCallback(
    (id: string) => {
      router.push(`/catalog?laptop=${id}`, { scroll: false });
    },
    [router]
  );

  const handleCloseOverlay = useCallback(() => {
    router.push("/catalog", { scroll: false });
  }, [router]);

  // Body scroll lock when overlay is open
  useEffect(() => {
    if (activeLaptop) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeLaptop]);

  // ---------- Render ----------

  return (
    <main className="px-4 sm:px-8 py-16">
      {/* Section 1: Quiz Profile (conditional) */}
      {completedProfile && (
        <section className="mb-12">
          <h2 className="text-[28px] font-medium leading-[1.3]">Tu perfil</h2>
          <p className="text-[17px] text-muted-foreground mt-1">
            {completedProfile.profile_name}
          </p>
          <div className="flex gap-3 mt-4">
            <Button
              variant="default"
              onClick={() => {
                setProfileFilter(true);
                setPage(1);
              }}
            >
              Ver laptops del perfil
            </Button>
            <Button variant="outline" onClick={handleRehacer}>
              Rehacer quiz
            </Button>
          </div>
        </section>
      )}

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          value={inputValue}
          onChange={handleSearchChange}
          placeholder="Buscar laptops..."
          aria-label="Buscar laptops"
          className="w-full h-10 pl-10 pr-4 rounded-lg border bg-background text-[17px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Filter button row */}
      <div className="flex justify-end mt-3">
        <Button variant="ghost" onClick={() => setFilterDrawerOpen(true)}>
          <Filter className="size-4" />
          Filtrar
        </Button>
      </div>

      {/* Active filter bar */}
      {hasActiveFilters && (
        <ActiveFilterBar
          filters={filters}
          profileFilter={profileFilter}
          searchText={searchText}
          onRemoveFilter={handleRemoveFilter}
          onClearAll={clearAllFilters}
        />
      )}

      {/* Section 2: Global Catalog */}
      <section className="mt-6">
        <h2 className="text-[28px] font-medium leading-[1.3]">Todos los laptops</h2>
        <p className="text-[12px] text-muted-foreground mt-1">
          {filteredLaptops.length} laptops
        </p>

        {/* Loading state */}
        {loading && <div className="mt-4"><CatalogSkeleton count={6} /></div>}

        {/* Error state */}
        {!loading && error && (
          <ErrorState message={error} onRetry={loadLaptops} />
        )}

        {/* Empty state */}
        {!loading && !error && filteredLaptops.length === 0 && (
          <EmptyState onClear={clearAllFilters} />
        )}

        {/* Card list with stagger animation */}
        {!loading && !error && filteredLaptops.length > 0 && (
          <motion.ul
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-6 mt-4 list-none p-0"
          >
            {visibleLaptops.map((laptop) => (
              <motion.li key={laptop.id} variants={cardVariants}>
                <CatalogCard laptop={laptop} onVerMas={handleVerMas} />
              </motion.li>
            ))}
          </motion.ul>
        )}

        {/* Load more */}
        {visibleLaptops.length < filteredLaptops.length && (
          <div className="flex justify-center mt-8">
            <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
              Cargar mas
            </Button>
          </div>
        )}
      </section>

      {/* FilterDrawer */}
      <FilterDrawer
        open={filterDrawerOpen}
        onOpenChange={setFilterDrawerOpen}
        filters={filters}
        onApply={handleApplyFilters}
        onClear={clearAllFilters}
        availableOptions={availableOptions}
      />

      {/* Detail overlay — slides up with Framer Motion */}
      <AnimatePresence>
        {activeLaptop && (
          <motion.div
            key={activeLaptop.id}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-50 bg-background overflow-y-auto"
          >
            <DetailOverlay laptop={activeLaptop} onClose={handleCloseOverlay} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
