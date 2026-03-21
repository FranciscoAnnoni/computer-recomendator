import type { Laptop } from "./laptop";

// Enum types matching Supabase profiles table enums exactly
export type Workload = "productividad_estudio" | "creacion_desarrollo" | "gaming_rendimiento";
export type Lifestyle = "maxima_portabilidad" | "potencia_bruta" | "ecosistema_apple";
export type Budget = "esencial" | "equilibrado" | "premium";

// Profile result from Supabase
export interface ProfileResult {
  id: string;
  workload: Workload;
  lifestyle: Lifestyle;
  budget: Budget;
  laptop_ids: string[];
  profile_name: string;
  profile_description: string;
  profile_image_url: string | null;
}

// localStorage state shape
export interface QuizState {
  selections: [string | null, string | null, string | null];
  completedProfile: (ProfileResult & { laptops: Laptop[] }) | null;
}

// Quiz step option
export interface QuizOption {
  value: string;       // enum value sent to Supabase
  label: string;       // display label in Spanish
  illustrationId: string;  // key to look up SVG illustration component
}

// Quiz step definition
export interface QuizStepDef {
  id: number;
  heading: string;     // Spanish question heading
  options: [QuizOption, QuizOption, QuizOption];
}

// The 3 quiz steps with their options — source of truth for all quiz UI
export const QUIZ_STEPS: [QuizStepDef, QuizStepDef, QuizStepDef] = [
  {
    id: 0,
    heading: "¿Como vas a usar tu laptop?",
    options: [
      { value: "productividad_estudio", label: "Productividad & Estudio", illustrationId: "productivity" },
      { value: "creacion_desarrollo", label: "Creacion & Desarrollo", illustrationId: "creation" },
      { value: "gaming_rendimiento", label: "Gaming & Rendimiento", illustrationId: "gaming" },
    ],
  },
  {
    id: 1,
    heading: "¿Que estilo se adapta a ti?",
    options: [
      { value: "maxima_portabilidad", label: "Maxima Portabilidad", illustrationId: "portability" },
      { value: "potencia_bruta", label: "Potencia Bruta", illustrationId: "power" },
      { value: "ecosistema_apple", label: "Ecosistema (Apple)", illustrationId: "ecosystem" },
    ],
  },
  {
    id: 2,
    heading: "¿Cual es tu presupuesto?",
    options: [
      { value: "esencial", label: "Esencial", illustrationId: "essential" },
      { value: "equilibrado", label: "Equilibrado", illustrationId: "balanced" },
      { value: "premium", label: "Premium / Sin Limites", illustrationId: "premium" },
    ],
  },
];

export const QUIZ_STORAGE_KEY = "quiz_state";
export const PROFILE_STORAGE_KEY = "quiz_completed_profile";
