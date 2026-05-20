import type { Workload, Lifestyle, Budget, OsPreference } from "@/types/quiz";

export interface IdealSpecs {
  os: string;
  ram: string;
  storage: string;
  gpu: string;
  screen: string;
  battery: string;
  profileDescriptor: string;
}

export function computeIdealSpecs(
  workload: Workload,
  lifestyle: Lifestyle,
  budget: Budget,
  osPreference: OsPreference
): IdealSpecs {
  // RAM: esencial=8GB, equilibrado=16GB, premium+productividad=16GB, premium+other=32GB
  const ram =
    budget === "esencial"
      ? "8 GB"
      : budget === "equilibrado"
      ? "16 GB"
      : workload === "productividad_estudio"
      ? "16 GB"
      : "32 GB";

  // Storage: esencial=256GB, equilibrado=512GB, premium=1TB
  const storage =
    budget === "esencial"
      ? "256 GB SSD"
      : budget === "equilibrado"
      ? "512 GB SSD"
      : "1 TB SSD";

  // GPU matrix:
  //   productividad_estudio (any budget) -> Integrada
  //   creacion_desarrollo + esencial/equilibrado -> Integrada
  //   creacion_desarrollo + premium + macos -> Apple GPU 30 núcleos
  //   creacion_desarrollo + premium + windows -> Dedicada (RTX 4060)
  //   gaming_rendimiento + esencial -> Dedicada (RTX 4060)
  //   gaming_rendimiento + equilibrado -> Dedicada (RTX 4070)
  //   gaming_rendimiento + premium -> Dedicada (RTX 4090)
  const gpu: string = (() => {
    if (workload === "productividad_estudio") return "Integrada";
    if (workload === "creacion_desarrollo") {
      if (budget !== "premium") return "Integrada";
      return osPreference === "macos"
        ? "Apple GPU 30 núcleos"
        : "Dedicada (RTX 4060)";
    }
    // gaming_rendimiento
    if (budget === "esencial") return "Dedicada (RTX 4060)";
    if (budget === "equilibrado") return "Dedicada (RTX 4070)";
    return "Dedicada (RTX 4090)";
  })();

  // Screen size by lifestyle
  const screen =
    lifestyle === "maxima_portabilidad" ? '13"–14"' : '15"–17"';

  // Battery by lifestyle
  const battery =
    lifestyle === "maxima_portabilidad" ? "10+ horas" : "4–6 horas";

  // OS label
  const os = osPreference === "macos" ? "macOS" : "Windows 11";

  // Profile descriptor: workload x lifestyle (6 combinations)
  const descriptors: Record<Workload, Record<Lifestyle, string>> = {
    productividad_estudio: {
      maxima_portabilidad: "Para el estudiante que rinde en cualquier lugar",
      escritorio_fijo: "Para el profesional que trabaja desde casa",
    },
    creacion_desarrollo: {
      maxima_portabilidad: "Para el creativo siempre en movimiento",
      escritorio_fijo: "Para el diseñador con setup fijo",
    },
    gaming_rendimiento: {
      maxima_portabilidad: "Para el gamer que juega desde donde sea",
      escritorio_fijo: "Para el gamer con setup dedicado",
    },
  };

  return {
    os,
    ram,
    storage,
    gpu,
    screen,
    battery,
    profileDescriptor: descriptors[workload][lifestyle],
  };
}
