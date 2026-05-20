import type { Workload, Lifestyle, Budget } from "@/types/quiz";

export interface Trait {
  k: string;
  v: string;
}

const WORKLOAD_TRAITS: Record<Workload, Trait> = {
  productividad_estudio: {
    k: "Uso productivo",
    v: "ofimática, navegación y videollamadas fluidas",
  },
  creacion_desarrollo: {
    k: "Creación de contenido",
    v: "edición, renders y desarrollo sin tiempos de espera",
  },
  gaming_rendimiento: {
    k: "Gaming intensivo",
    v: "máximo rendimiento en juegos y streaming",
  },
};

const LIFESTYLE_TRAITS: Record<Lifestyle, Trait> = {
  maxima_portabilidad: {
    k: "Setup nómada",
    v: "liviana, con batería para todo el día",
  },
  escritorio_fijo: {
    k: "Setup fijo",
    v: "no necesita batería, prioriza potencia",
  },
};

const BUDGET_TRAITS: Record<Budget, Trait> = {
  esencial: {
    k: "Presupuesto esencial",
    v: "lo justo bien hecho, sin pagar de más",
  },
  equilibrado: {
    k: "Relación precio-calidad",
    v: "componentes sólidos que duran varios años",
  },
  premium: {
    k: "Sin compromisos",
    v: "lo mejor disponible, que dure una década",
  },
};

export function deriveTraits(
  workload: Workload,
  lifestyle: Lifestyle,
  budget: Budget
): [Trait, Trait, Trait] {
  return [
    WORKLOAD_TRAITS[workload],
    LIFESTYLE_TRAITS[lifestyle],
    BUDGET_TRAITS[budget],
  ];
}
