# Computer Recomendator — Page Description

Documento de referencia visual y funcional para agentes de diseño.

---

## Overview

**Computer Recomendator** es una web app en Next.js (React 19, TypeScript) que ayuda a usuarios a encontrar la laptop ideal. Flujo principal: quiz → perfil personalizado → catálogo con filtros → comparador.

- Idioma: Español
- Tema: Dark/Light (dark por defecto)
- Estilo visual: minimalista, inspirado en Apple
- Stack: Next.js 15, Tailwind CSS, Framer Motion, Supabase

---

## Rutas y Páginas

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/` | Home | Landing page con hero y CTA |
| `/quiz` | Quiz | Cuestionario interactivo de 4 pasos |
| `/profile` | Perfil | Resultados personalizados post-quiz |
| `/catalog` | Catálogo | Listado completo con búsqueda y filtros |
| `/compare` | Comparador | Comparación side-by-side de 2 laptops |

---

## Paleta de Colores

Usa OKLch como espacio de color.

### Dark Mode (default)
| Token | Valor | Descripción |
|-------|-------|-------------|
| `background` | `oklch(0.09 0 0)` | Casi negro (#0a0a0a) |
| `foreground` | `oklch(0.97 0 0)` | Blanco roto |
| `card` | `oklch(0.145 0 0)` | Gris muy oscuro |
| `muted` | `oklch(0.22 0 0)` | Gris oscuro |
| `muted-foreground` | `oklch(0.65 0 0)` | Gris medio |
| `primary` | `oklch(0.55 0.2 248)` | Azul Apple (#0071E3) |
| `border` | `oklch(1 0 0 / 12%)` | Blanco con alfa |

### Light Mode
| Token | Valor | Descripción |
|-------|-------|-------------|
| `background` | `oklch(1 0 0)` | Blanco puro |
| `foreground` | `oklch(0.145 0 0)` | Casi negro |
| `card` | `oklch(1 0 0)` | Blanco |
| `muted` | `oklch(0.97 0 0)` | Gris muy claro |
| `muted-foreground` | `oklch(0.556 0 0)` | Gris medio |
| `border` | `oklch(0.84 0 0)` | Gris claro |

---

## Tipografía

**Fuente:** Roboto (Google Fonts), pesos 400 / 500 / 700 / 900

| Elemento | Tamaño | Peso | Line-height |
|----------|--------|------|-------------|
| h1 (Heading) | 3.5rem | 900 | 1.1 |
| h2 (Subhead) | 1.75rem | 500 | 1.3 |
| Body | 1.0625rem | 400 | 1.5 |
| Caption / Label | 0.75rem | 400 | 1.4 |

---

## Layout Global

- **Container:** max-width 7xl (80rem), margin auto
- **Padding horizontal:** 1rem mobile / 1.5rem sm / 2rem lg
- **Navbar:** height 64px, sticky top-0, backdrop blur, sombra al scrollear
- **Footer:** py-8, texto centrado, minimal
- **Breakpoints:** sm 640px / md 768px / lg 1024px

---

## Componentes del Sistema de Diseño

### Primitivos
- **Button:** 6 variantes (default, outline, secondary, ghost, destructive, link) × 7 tamaños (xs, sm, default, lg, icon, icon-xs, icon-sm)
- **Card:** header / title / description / content / footer / action
- **Sheet:** modal con side configurable (left/right/top/bottom), drag-to-dismiss en mobile
- **ThemeToggle:** íconos Sun/Moon

### Compuestos
| Componente | Uso |
|------------|-----|
| `OptionCard` | Carta de opción en quiz: ilustración + label + efecto glow |
| `OptionCarousel` | Carrusel mobile (deck) / desktop (fila horizontal) |
| `CatalogCard` | Card de producto en catálogo |
| `DetailOverlay` | Overlay full-screen con galería + specs + CTA |
| `FilterDrawer` | Sheet de filtros multi-sección |
| `ComparatorClient` | Layout de 2 slots de comparación |
| `ProfileAvatar` | Círculo de color con inicial |
| `ProfileSheet` | Info rápida de perfil desde navbar |
| `ProfileLaptopCard` | Card de laptop recomendada en perfil |

---

## Páginas — Detalle Visual y Funcional

---

### 1. Home (`/`)

**Layout:** Viewport completo, contenido centrado verticalmente.

**Elementos:**
- Navbar sticky con logo, links de nav, ThemeToggle
- Hero section con stagger animations al cargar:
  - Heading grande: "Computer Recomendator"
  - Subheading muted: "Find the perfect laptop for your needs"
  - CTA Button primario: "Find My Laptop →" → link a `/quiz`
- Footer minimal con copyright

**Interacciones:**
- Click CTA → navega a `/quiz`
- ThemeToggle → alterna dark/light (persistido por next-themes)

---

### 2. Quiz (`/quiz`)

**Layout:** Viewport completo, scroll bloqueado. Un paso visible a la vez con slide animation.

**Estructura de cada paso:**
1. Progress bar — 4 segmentos, rellena al paso actual
2. Question heading — Bold, centrado
3. Subheading — Texto muted explicativo
4. OptionCarousel — 3 cartas de opción
5. Botones: `[Anterior]` `[Siguiente / Ver mis recomendaciones]`
6. Link "↩ Volver al Inicio"

**OptionCard:**
- Tamaño: 260×380px desktop / 200×270px mobile
- Fondo: `#0d0d0d`
- Estado activo: border blanco + glow `0 0 28px rgba(255,255,255,0.18)`
- Estructura: 70% ilustración SVG / 30% label uppercase + sublabel

**OptionCarousel:**
- Desktop: fila horizontal, 3 cartas visibles, flechas de navegación
- Mobile: deck/stack, cartas arriba/abajo, drag habilitado

**Los 4 pasos del quiz:**

| Paso | Pregunta | Opciones |
|------|----------|---------|
| 1 — Workload | ¿Para qué vas a usar la PC? | Trabajar / Crear / Gaming |
| 2 — Lifestyle | ¿Cómo es tu ritmo de movimiento? | Nómada / Mixto / Escritorio |
| 3 — Budget | Hablemos de presupuesto... | Esencial / Inteligente / Premium |
| 4 — OS | ¿Qué sistema operativo preferís? | Windows / macOS / Abierto |

**Completion flow:**
1. Paso 4 completado → botón "Ver mis recomendaciones"
2. Click → fetch a Supabase (match 4 selecciones → perfil)
3. **Celebration overlay** (2.2s):
   - Backdrop `bg-black/70`
   - 90 piezas de confetti cayendo (3–5s, rotate 360°)
   - 4 sparkle emojis en esquinas (pulsing)
   - Card central: emoji laptop bouncing + "¡Tu perfil está listo!" + mensaje
4. Auto-redirect a `/profile`

**Estado en localStorage:** cada selección se guarda inmediatamente.

---

### 3. Perfil (`/profile`)

**Protección:** Requiere datos en localStorage; redirige a `/quiz` si están vacíos.

**Layout:** Container max-w-2xl, centrado, padding py-16 px-4, layout vertical.

**Sección A — Profile Header:**
- Avatar circle w-24 h-24, color dinámico HSL basado en índice de perfil (hue distribuido 0–360°, saturation 60–75%, lightness 48–60%)
- Letra inicial "P" centrada
- Nombre del perfil (heading)
- Descripción del perfil (muted text)
- Botón "Rehacer quiz" (outline) → limpia storage y va a `/quiz`
- Fade-in animation al montar

**Sección B — Laptops Recomendadas:**
- Heading: "Recomendados para vos:"
- Lista de `ProfileLaptopCard` con stagger animations (fade + slide up)

**ProfileLaptopCard:**
- Layout horizontal: imagen izq (112–144px) + contenido der
- Brand label, nombre (semibold)
- Influencer note opcional (gris, truncada a 2 líneas)
- Specs row: CPU + RAM + Storage (íconos + texto)
- Precio (bold, grande) bottom-right
- Hover: border se ilumina + sombra
- Click → abre DetailOverlay

**Estado vacío:** "Aún no hay laptops cargadas para este perfil. Volvé pronto."

---

### 4. Catálogo (`/catalog`)

**Layout:** Full-width container, padding py-16. Dos secciones.

**Sección A — Tu Perfil (condicional, solo si completó quiz):**
- Heading: "Tu perfil" + nombre del perfil
- Botón "Ver laptops del perfil" (primary)
- Botón "Rehacer quiz" (outline)

**Sección B — Todas las Laptops:**
- Search bar: icono Search (gris), placeholder "Buscar laptops...", debounce 200ms, h-10
- Botón "Filtrar" (derecha)
- Active filter bar (scrollable, chips con X para remover)
- Contador: "N laptops"
- Lista de `CatalogCard`
- Botón "Cargar mas" para paginación (100 items/página)

**CatalogCard:**
- Layout horizontal: imagen | contenido | precio | botón
- Imagen (100–155px): foto de producto o fallback de marca; ★ si tiene influencer note; badge "Stock limitado" si `availability_warning: true`
- Contenido: nombre (bold, truncado) + tags (primeros 3, separados por •) + specs (CPU | RAM | Storage)
- Precio: bold, grande (solo desktop)
- Botón "Ver más" (outline) desktop / chevron derecho mobile
- Hover: border `foreground/30`
- Click → abre DetailOverlay

**Estados:**
- Loading: skeleton cards pulsantes
- Error: mensaje + botón "Reintentar"
- Empty: "Sin resultados" + botón "Limpiar filtros"

---

### 5. Filter Drawer

**Trigger:** botón "Filtrar" en catálogo.

**Layout:**
- Desktop: side sheet izquierdo (320px)
- Mobile: bottom sheet (88vh), drag-to-dismiss

**Header:** título "Filtros" + badge con count de filtros activos.

**Secciones:**
1. **Precio (USD):** dos inputs numéricos "Mín" / "Máx"
2. **Portabilidad:** toggle — laptops ≤1.8 kg
3. **Gaming:** toggle — laptops gaming
4. **Marca:** chips toggle por marca
5. **Sistema operativo:** chips toggle por OS
6. **Tamaño de pantalla:** chips toggle por pulgadas
7. **Almacenamiento:** chips toggle por tipo

**Footer:**
- Botón "Aplicar" (primary, muestra count activos)
- Botón "Limpiar todo" (si hay filtros activos)

**Comportamiento:** cambios son locales hasta "Aplicar". X cierra sin aplicar.

---

### 6. Detail Overlay

**Trigger:** click en cualquier laptop card (catálogo, perfil, comparador).

**Layout:** overlay full-screen con backdrop blur. Header sticky + área scrolleable.

**Header sticky:**
- Drag-pill indicator (barra blanca centrada arriba)
- Botón X (top-left)

**Contenido:**

**A. Hero section:**
- Desktop: izquierda imagen / derecha info (side-by-side)
- Mobile: apilado verticalmente
- **Galería:** imagen principal 16:9 rounded-2xl + thumbnails (border cambia al seleccionar)
- **Info:**
  - Nombre laptop (36–44px)
  - Precio (32–36px, bold)
  - Descripción (15px, gris)
  - Tags (chip, rounded-full)
  - Botón "Comprar Ahora" (primary, large) → abre link afiliado en nueva tab
  - Botón "Comparar" (outline, large) → `/compare?laptop={id}`

**B. Specs Grid:**
- Grid 2–3 columnas (responsive)
- Cada spec: ícono + label uppercase gris + valor
- Specs: CPU / RAM / GPU / Storage / Pantalla / Batería / OS / Peso

**C. Recommendation Box (si existe `influencer_note`):**
- Border redondeado, fondo claro
- 💡 "Recomendación" (small, primary color)
- Texto cursiva (15px, gris)
- "Puntaje: X/10" si existe `recommendation_score`

**Gestos para cerrar:**
- Tecla Escape
- Swipe right (dx > 90px)
- Swipe down desde top (dy > 110px, solo si scrolled a top)
- Click X

---

### 7. Comparador (`/compare`)

**Query param:** `?laptop={id}` pre-carga el slot 0.

**Layout:** container max-w-5xl, centrado. Header + dos columnas.

**Header:** título "Comparador" + badge "[2]" (monospace).

**Slot lleno (CompareCard):**
- Border redondeado, fondo claro
- Botón X (top-right) para remover
- Imagen square full-width
- Nombre del modelo (13px, semibold)
- 5 filas de specs: GPU / CPU / RAM / Storage / Precio (monospace 12px, border entre filas)

**Slot vacío (EmptySlot):**
- Border dashed, hoverable
- Ícono + + "Seleccionar PC N..."
- Click → abre LaptopPicker

**LaptopPicker Sheet:**
- Desktop: side sheet izquierdo
- Mobile: bottom sheet
- Header: "Seleccionar laptop"
- Input de búsqueda (debounced, auto-focus)
- Lista scrolleable de laptops (excluyendo ya seleccionados)
- Cada fila: thumbnail + nombre + marca/precio

**Estados:**
- Loading: skeleton (imagen + nombre + 5 filas de specs)
- Items ya seleccionados: griseados/deshabilitados

---

## Animaciones

| Animación | Implementación | Detalles |
|-----------|----------------|---------|
| Entrada de componentes | Framer Motion | fade + slide up, y: 16→0, stagger 0.04–0.08s |
| Slides del quiz | Framer Motion | left-right slide, 0.3s |
| Carrusel de opciones | Framer Motion spring | stiffness 300, damping 30 |
| Detail overlay | Framer Motion | y: 100%→0, 0.25s, ease [0.32, 0.72, 0, 1] |
| Confetti | CSS keyframes | caída 3–5s, rotate 360°, 90 piezas |
| Sparkles | CSS animation | scale pulse 2s, opacity cycling |
| Bounce (emoji) | CSS animation | up-down |
| Hover en cards | CSS transition | border color, box-shadow, 0.2–0.35s |
| Botones activos | CSS | translate-y-px |

---

## Responsividad

| Elemento | Mobile | Desktop |
|----------|--------|---------|
| Quiz carousel | Deck apilado 200×270px, drag | Fila horizontal 260×380px, flechas |
| Navbar | Hamburger menu (Sheet), solo ThemeToggle visible | Links inline, botón CTA, ThemeToggle |
| Filter Drawer | Bottom sheet 88vh, drag | Side sheet 320px |
| Catalog Card | Imagen 100px, precio inline, chevron | Imagen 155px, precio derecha, "Ver más" |
| Detail Overlay | Imagen y info apilados | Side-by-side |
| Comparador | Cards apiladas | Dos columnas side-by-side |

**Safe areas:** `env(safe-area-inset-*)` aplicado en sheets para soporte de notch (iPhone).

---

## Flujos de Usuario

### Flujo Principal: Quiz → Perfil
1. Home → click "Find My Laptop"
2. Quiz paso 1–4: seleccionar opción → siguiente
3. Paso 4 completado → "Ver mis recomendaciones" → celebration overlay → `/profile`
4. Ver laptops recomendadas → click card → DetailOverlay
5. "Comprar Ahora" → link externo | "Comparar" → `/compare?laptop={id}`

### Flujo Catálogo
1. Navegar a `/catalog`
2. Buscar / filtrar laptops
3. Click en card → DetailOverlay
4. "Comparar" → comparador

### Flujo Comparador
1. Llegar desde overlay ("Comparar") o directo a `/compare`
2. Click en slot vacío → LaptopPicker → seleccionar laptop
3. Repetir para slot 2
4. Comparar specs side-by-side

---

## Datos y Backend

- **Base de datos:** Supabase (PostgreSQL)
- **Tabla principal:** laptops con campos: nombre, brand, CPU, RAM, GPU, storage, price, tags, OS, weight, screen_size, gallery_images, influencer_note, recommendation_score, availability_warning, affiliate_link
- **Perfil de usuario:** 81 combinaciones posibles (3⁴ del quiz), lookup en Supabase
- **Persistencia local:** localStorage para estado del quiz y datos de perfil
- **Imágenes:** optimizadas con Next.js Image component

---

## Accesibilidad

- HTML semántico (`<article>`, `<section>`, `<nav>`)
- ARIA labels en botones e interactivos
- Focus ring visible (ring-2 ring-primary)
- Navegación por teclado (Tab, Escape)
- Feedback háptico en selección de cards (`navigator.vibrate`)
