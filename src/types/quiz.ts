import type { Laptop } from "./laptop";

// Enum types matching Supabase profiles table enums exactly
export type Workload = "productividad_estudio" | "creacion_desarrollo" | "gaming_rendimiento";
export type Lifestyle = "maxima_portabilidad" | "escritorio_fijo";
export type Budget = "esencial" | "equilibrado" | "premium";
export type OsPreference = "windows" | "macos";

// Profile result from Supabase
export interface ProfileResult {
  id: string;
  workload: Workload;
  lifestyle: Lifestyle;
  budget: Budget;
  os_preference: OsPreference;
  laptop_ids: string[];
  profile_name: string;
  profile_description: string;
  profile_image_url: string | null;
}

// localStorage state shape
export interface QuizState {
  selections: [string | null, string | null, string | null, string | null];
  completedProfile: (ProfileResult & { laptops: Laptop[] }) | null;
}

// Quiz step option
export interface QuizOption {
  value: string;          // enum value sent to Supabase
  label: string;          // short card label
  sublabel: string;       // descriptive subtitle shown on card
  illustrationId: string; // key to look up illustration
}

// Quiz step definition — options can be 2 or 3
export interface QuizStepDef {
  id: number;
  heading: string;
  subheading: string;
  options: QuizOption[];
}

// The 4 quiz steps — source of truth for all quiz UI
export const QUIZ_STEPS: [QuizStepDef, QuizStepDef, QuizStepDef, QuizStepDef] = [
  {
    id: 0,
    heading: "¿Para qué vas a usar la PC principalmente?",
    subheading: "Filtra el cerebro de la PC: CPU y GPU",
    options: [
      {
        value: "productividad_estudio",
        label: "Trabajo",
        sublabel: "Productividad, estudio y navegación",
        illustrationId: "productivity",
      },
      {
        value: "creacion_desarrollo",
        label: "Diseño",
        sublabel: "Diseño, edición de video o desarrollo",
        illustrationId: "creation",
      },
      {
        value: "gaming_rendimiento",
        label: "Gaming",
        sublabel: "Jugar a tope y streaming",
        illustrationId: "gaming",
      },
    ],
  },
  {
    id: 1,
    heading: "¿Cómo es tu ritmo de movimiento?",
    subheading: "Filtra el formato físico y batería",
    options: [
      {
        value: "maxima_portabilidad",
        label: "Nómada",
        sublabel: "La llevo en la mochila todos los días",
        illustrationId: "portability",
      },
      {
        value: "escritorio_fijo",
        label: "Escritorio",
        sublabel: "Se queda fija en un escritorio",
        illustrationId: "power",
      },
    ],
  },
  {
    id: 2,
    heading: "Hablemos de presupuesto...",
    subheading: "Filtra la gama de componentes",
    options: [
      {
        value: "esencial",
        label: "Esencial",
        sublabel: "Gastar lo menos posible para que cumpla bien",
        illustrationId: "essential",
      },
      {
        value: "equilibrado",
        label: "Balanceado",
        sublabel: "La mejor relación calidad-precio",
        illustrationId: "balanced",
      },
      {
        value: "premium",
        label: "Premium",
        sublabel: "Lo mejor de lo mejor, que me dure años",
        illustrationId: "premium",
      },
    ],
  },
  {
    id: 3,
    heading: "¿Qué sistema operativo preferís?",
    subheading: "Filtra marca y compatibilidad final",
    options: [
      {
        value: "windows",
        label: "Windows",
        sublabel: "Quiero poder instalar de todo",
        illustrationId: "windows",
      },
      {
        value: "macos",
        label: "macOS",
        sublabel: "Tengo iPhone, quiero ese ecosistema",
        illustrationId: "macos",
      },
    ],
  },
];

export const QUIZ_STORAGE_KEY = "quiz_state";
export const PROFILE_STORAGE_KEY = "quiz_completed_profile";
