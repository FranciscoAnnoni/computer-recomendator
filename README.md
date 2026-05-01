# Computer Recomendator

Herramienta para ayudar a estudiantes de ingeniería que no saben qué laptop comprar. Responden 4 preguntas y el sistema les recomienda las mejores opciones según su perfil.

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS 4 + Framer Motion |
| Base de datos | Supabase (PostgreSQL en `us-west-2`) |
| Deploy | Vercel |
| Iconos | Lucide React |

## Estructura del proyecto

```
src/
├── app/                    # Rutas (Next.js App Router)
│   ├── page.tsx            # Landing / Hero
│   ├── quiz/page.tsx       # Quiz de 4 pasos
│   ├── catalog/page.tsx    # Catálogo completo de laptops
│   ├── compare/page.tsx    # Comparador lado a lado
│   ├── profile/page.tsx    # Resultado guardado del quiz
│   ├── robots.ts           # SEO
│   └── sitemap.ts          # SEO
├── components/
│   ├── catalog/            # CatalogClient, CatalogCard, DetailOverlay, filtros
│   ├── quiz/               # QuizShell, QuizStep, QuizResult, ProfileLaptopCard
│   ├── compare/            # ComparatorClient
│   ├── home/               # HeroSection
│   └── layout/             # Navbar, Footer, NeuralFog
├── lib/
│   ├── supabase.ts         # Cliente Supabase (singleton)
│   ├── catalog-data.ts     # fetchAllLaptops()
│   └── quiz-data.ts        # fetchProfile() + fetchLaptopsByIds()
└── types/
    ├── laptop.ts           # Interface Laptop
    └── quiz.ts             # Tipos del quiz + QUIZ_STEPS (fuente de verdad del quiz)

supabase/
├── schema.sql              # Tabla laptops
├── profiles-schema.sql     # Tabla profiles + 4 enums
├── seed.sql                # Laptops de ejemplo
└── seed-profiles-81.sql    # Los 81 perfiles pre-cargados
```

## Cómo funciona el quiz

El quiz tiene **4 preguntas**, cada una con 3 opciones. Las 4 respuestas forman una **clave única** (3⁴ = 81 combinaciones posibles) que se usa para buscar en la tabla `profiles`.

```
Pregunta 1: workload      → productividad_estudio | creacion_desarrollo | gaming_rendimiento
Pregunta 2: lifestyle     → maxima_portabilidad   | movil_flexible      | escritorio_fijo
Pregunta 3: budget        → esencial              | equilibrado         | premium
Pregunta 4: os_preference → windows               | macos               | abierto
```

**Flujo de datos:**

```
Usuario elige 4 opciones
        ↓
fetchProfile(workload, lifestyle, budget, os_preference)
  → SELECT * FROM profiles WHERE workload=? AND lifestyle=? AND budget=? AND os_preference=?
        ↓
profile.laptop_ids  ← array de UUIDs de laptops recomendadas
        ↓
fetchLaptopsByIds(laptop_ids)
  → SELECT * FROM laptops WHERE id IN (...)
        ↓
Muestra QuizResult con las laptops ordenadas por recommendation_score
```

El resultado se guarda en `localStorage` (clave `quiz_state`) para que persista si el usuario cierra la pestaña.

## Base de datos

### Tabla `laptops`

Cada fila es una laptop del catálogo. Campos importantes:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Clave primaria auto-generada |
| `name` | TEXT | Nombre del modelo |
| `brand` | TEXT | Marca (Apple, Lenovo, ASUS, etc.) |
| `price` | NUMERIC | Precio en USD |
| `cpu`, `ram`, `gpu`, `storage` | TEXT | Specs técnicos |
| `os`, `screen_size`, `weight`, `battery` | TEXT\|null | Specs opcionales |
| `simplified_tags` | TEXT[] | Tags en lenguaje simple ("Muy rápida", "Soporta Photoshop") |
| `usage_profiles` | TEXT[] | Perfiles de uso para filtrado en catálogo |
| `influencer_note` | TEXT | Nota editorial / recomendación personal |
| `recommendation_score` | INTEGER 0–10 | Score para ordenar recomendaciones |
| `affiliate_link` | TEXT | URL de compra |
| `image_url` | TEXT | Imagen principal |
| `gallery_images` | TEXT[] | Hasta 4 imágenes adicionales |
| `description` | TEXT | Párrafo descriptivo |
| `availability_warning` | BOOLEAN | Alerta si el stock es incierto |

### Tabla `profiles`

81 filas, una por combinación posible del quiz. Campos importantes:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `workload` | ENUM | Una de las 3 opciones de pregunta 1 |
| `lifestyle` | ENUM | Una de las 3 opciones de pregunta 2 |
| `budget` | ENUM | Una de las 3 opciones de pregunta 3 |
| `os_preference` | ENUM | Una de las 3 opciones de pregunta 4 |
| `laptop_ids` | UUID[] | Array con los IDs de laptops recomendadas para este perfil |
| `profile_name` | TEXT | Nombre del perfil ("El Estudiante Nómada", etc.) |
| `profile_description` | TEXT | Descripción del perfil en español |

La combinación `(workload, lifestyle, budget, os_preference)` tiene `UNIQUE constraint`, garantizando exactamente 1 fila por perfil.

## Setup local

### 1. Clonar y instalar

```bash
git clone <repo>
cd computer-recomendator
npm install
```

### 2. Variables de entorno

Crear `.env.local` en la raíz:

```env
NEXT_PUBLIC_SUPABASE_URL=https://orxstqqcsxatxaprqyvq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
```

Las variables `NEXT_PUBLIC_*` son seguras de exponer en el navegador — la anon key de Supabase es una clave publicable, no un secreto.

### 3. Correr en local

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Deploy en Vercel

1. Conectar el repositorio en [vercel.com](https://vercel.com)
2. Agregar las variables de entorno en **Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy automático en cada push a `main`

No hay build steps especiales — Vercel detecta Next.js automáticamente.

## Actualizar el catálogo de laptops

### Agregar una laptop nueva

Ir al **SQL Editor** de Supabase y ejecutar:

```sql
INSERT INTO laptops (
  name, brand, price, cpu, ram, gpu, storage,
  os, screen_size, weight, battery,
  simplified_tags, usage_profiles,
  influencer_note, recommendation_score,
  affiliate_link, image_url, description
) VALUES (
  'MacBook Air M4', 'Apple', 1099,
  'Apple M4', '16GB', 'GPU integrada 10 núcleos', '256GB SSD',
  'macOS Sequoia', '13"', '1.24 kg', 'Hasta 18h',
  ARRAY['Muy silenciosa', 'Batería increíble', 'Perfecta para estudiantes'],
  ARRAY['productividad_estudio', 'creacion_desarrollo'],
  'La mejor laptop para estudiantes que priorizan batería y silencio.',
  9,
  'https://amzn.to/...', 'https://...imagen.jpg',
  'La MacBook Air M4 es la evolución perfecta para estudiantes...'
);
```

### Asignar una laptop a perfiles del quiz

Después de agregar la laptop, copiar su `id` (UUID) y agregarlo al array `laptop_ids` del perfil correspondiente:

```sql
UPDATE profiles
SET laptop_ids = array_append(laptop_ids, '<nuevo-uuid>'::uuid)
WHERE workload = 'productividad_estudio'
  AND lifestyle = 'maxima_portabilidad'
  AND budget = 'equilibrado'
  AND os_preference = 'macos';
```

### Editar una laptop existente

```sql
UPDATE laptops
SET influencer_note = 'Nuevo texto editorial',
    recommendation_score = 8
WHERE name = 'MacBook Air M3';
```

## Problemas comunes

### La DB no responde / endpoint da error

Supabase pausa los proyectos gratuitos tras ~1 semana sin actividad. Para reactivar:

1. Ir a [supabase.com/dashboard](https://supabase.com/dashboard) → proyecto `computer-recomendator`
2. Hacer clic en **Restore project**
3. Esperar ~2 minutos hasta que el status cambie a `ACTIVE_HEALTHY`

### El quiz no encuentra el perfil

Si `fetchProfile()` lanza error, verificar que los 81 perfiles estén cargados:

```sql
SELECT COUNT(*) FROM profiles;  -- debe retornar 81
```

Si no están, re-ejecutar `supabase/seed-profiles-81.sql` en el SQL Editor.

### Warning de Next.js sobre workspace root

Resuelto con `outputFileTracingRoot` en `next.config.ts`. Si reaparece, verificar que el archivo tenga:

```ts
import path from "path";
// dentro del objeto de config:
outputFileTracingRoot: path.join(__dirname),
```
