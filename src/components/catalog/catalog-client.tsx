"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { DetailOverlay } from "@/components/catalog/detail-overlay";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { CatalogCard } from "@/components/catalog/catalog-card";
import { CatalogSkeleton } from "@/components/catalog/catalog-skeleton";
import { FilterDrawer } from "@/components/catalog/filter-drawer";
import { ActiveFilterBar } from "@/components/catalog/active-filter-bar";
import { fetchAllLaptops } from "@/lib/catalog-data";
import type { Laptop } from "@/types/laptop";
import type { ProfileResult } from "@/types/quiz";
import { PROFILE_STORAGE_KEY, QUIZ_STORAGE_KEY } from "@/types/quiz";

// ---------- Types ----------

export interface CatalogFilters {
  brands: string[];
  priceMin: number | null;
  priceMax: number | null;
  os: string[];
  screenSizes: string[];
  storage: string[];
  portable: boolean;
  canPlayGames: boolean;
}

export const EMPTY_FILTERS: CatalogFilters = {
  brands: [],
  priceMin: null,
  priceMax: null,
  os: [],
  screenSizes: [],
  storage: [],
  portable: false,
  canPlayGames: false,
};

function parseWeightKg(weight: string | null): number | null {
  if (!weight) return null;
  const match = weight.match(/(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : null;
}

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
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
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

  useEffect(() => { setMounted(true); }, []);

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

    // Storage filter
    if (filters.storage.length > 0) {
      result = result.filter((l) => filters.storage.includes(l.storage));
    }

    // Portable filter (weight <= 1.8 kg)
    if (filters.portable) {
      result = result.filter((l) => {
        const w = parseWeightKg(l.weight);
        return w !== null && w <= 1.8;
      });
    }

    // Gaming filter
    if (filters.canPlayGames) {
      result = result.filter((l) =>
        l.usage_profiles.includes("gaming_rendimiento")
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
    const osOptions = [
      ...new Set(laptops.map((l) => l.os).filter((o): o is string => o !== null)),
    ].sort();
    const storageOptions = [...new Set(laptops.map((l) => l.storage))].sort();
    return { brands, screenSizes, osOptions, storageOptions };
  }, [laptops]);

  // ---------- Active filters check ----------

  const hasActiveFilters = useMemo(() => {
    return (
      filters.brands.length > 0 ||
      filters.priceMin !== null ||
      filters.priceMax !== null ||
      filters.os.length > 0 ||
      filters.screenSizes.length > 0 ||
      filters.storage.length > 0 ||
      filters.portable ||
      filters.canPlayGames ||
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
          case "os":
            return { ...prev, os: prev.os.filter((o) => o !== value) };
          case "screenSizes":
            return { ...prev, screenSizes: prev.screenSizes.filter((s) => s !== value) };
          case "storage":
            return { ...prev, storage: prev.storage.filter((s) => s !== value) };
          case "portable":
            return { ...prev, portable: false };
          case "canPlayGames":
            return { ...prev, canPlayGames: false };
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

  // ---------- Overlay navigation (local state — avoids Safari back-swipe double animation) ----------

  const [activeLaptop, setActiveLaptop] = useState<Laptop | null>(null);

  const handleVerMas = useCallback(
    (id: string) => {
      const found = laptops.find((l) => l.id === id) ?? null;
      setActiveLaptop(found);
    },
    [laptops]
  );

  const handleCloseOverlay = useCallback(() => {
    setActiveLaptop(null);
  }, []);

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
    <main>
    <Container className="py-16">
      {/* Section 1: Quiz Profile (conditional) */}
      {completedProfile && (
        <section
          className="rise mb-12"
          style={{
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem',
            padding: '1.25rem 1.5rem',
            borderRadius: '1.25rem',
            background: 'var(--ed-profile-card-bg)',
            boxShadow: 'inset 0 0 0 1px var(--ed-profile-card-border), var(--ed-shadow-card)',
            position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 0% 50%, var(--ed-profile-glow), transparent 60%)', pointerEvents: 'none' }} />
          <div style={{ flex: '1 1 140px', minWidth: 0 }}>
            <div className="label-ed-sm" style={{ marginBottom: 4 }}>Tu perfil</div>
            <div className="title-md" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{completedProfile.profile_name}</div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            <button
              className="btn-ed btn-ed-sm btn-primary-ed"
              onClick={() => { setProfileFilter(true); setPage(1); }}
            >
              Ver laptops del perfil
            </button>
            <button className="btn-ed btn-ed-sm btn-ghost-ed" onClick={handleRehacer}>
              Rehacer
            </button>
          </div>
        </section>
      )}

      {/* Heading */}
      <div className="rise-d1 mb-8">
        <div className="label-ed" style={{ color: 'var(--pr-fixed-dim)', marginBottom: 12 }}>— Catálogo completo</div>
        <h1 className="display-md" style={{ margin: 0 }}>Todos los laptops</h1>
        <p style={{ marginTop: 8, color: 'var(--on-sur-var)', fontSize: '0.9375rem' }}>
          {filteredLaptops.length} modelos · actualizado hoy
        </p>
      </div>

      {/* Search + filter bar */}
      <div className="rise-d2 grid gap-3 mb-6" style={{ gridTemplateColumns: '1fr auto' }}>
        <div className="search-bar-ed">
          <Search className="size-4 shrink-0" style={{ color: 'var(--on-sur-muted)' }} />
          <input
            type="text"
            value={inputValue}
            onChange={handleSearchChange}
            placeholder="Buscar por marca, modelo, CPU..."
            aria-label="Buscar laptops"
          />
        </div>
        <button className="btn-ed btn-ed-sm sm:btn-ed-md btn-ghost-ed shrink-0" onClick={() => setFilterDrawerOpen(true)}>
          <Filter className="size-4" /> Filtrar
        </button>
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
            className="flex flex-col gap-3 list-none p-0"
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
            <button className="btn-ed btn-ed-md btn-ghost-ed" onClick={() => setPage((p) => p + 1)}>
              Cargar más
            </button>
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
        brands={availableOptions.brands}
        osOptions={availableOptions.osOptions}
        screenSizes={availableOptions.screenSizes}
        storageOptions={availableOptions.storageOptions}
      />

      {/* Detail overlay — slides up with Framer Motion */}
      {mounted && createPortal(
        <AnimatePresence>
          {activeLaptop && (
            <motion.div
              key={activeLaptop.id}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              className="fixed inset-0 z-[200] bg-background/90 backdrop-blur-2xl"
            >
              <DetailOverlay laptop={activeLaptop} onClose={handleCloseOverlay} />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </Container>
    </main>
  );
}
