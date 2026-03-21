# Roadmap: Computer Recomendator

## Phase 1: Foundation & Project Setup
- [ ] Initialize Next.js project with Tailwind CSS.
- [ ] Set up design tokens (colors, typography for Apple-style aesthetic).
- [ ] Configure basic layout components (Navbar, Footer, Container).
- [ ] Define the data structure for laptops (JSON or initial DB schema).

**Requirements:** [RNF1.1, RNF1.2, RNF3.1, RF2.2, RNF2.1]
**Plans:** 3/3 plans complete

Plans:
- [ ] 01-01-PLAN.md — Initialize Next.js project with Tailwind, shadcn/ui, and Apple-minimalist design tokens
- [ ] 01-02-PLAN.md — Build layout shell: Navbar (frosted glass, mobile hamburger), Footer, Container
- [ ] 01-03-PLAN.md — Define laptop data model (TypeScript types, Supabase SQL schema, client config)

## Phase 2: Core Discovery Quiz
- [ ] Implement the multi-step quiz component.
- [ ] Develop the logic for mapping quiz answers to laptop categories/profiles.
- [ ] Create the "Recommendation Result" view.
- [ ] Add smooth transitions between quiz steps.

**Goal:** Working 3-step carousel quiz at /quiz that maps user answers to one of 27 Supabase profiles, displays 5 recommended laptops, and persists the quiz profile in the Navbar.

**Requirements:** [RF1.1, RF1.2, RF1.3, RNF1.1, RNF1.2, RNF1.3, RNF2.2, RNF3.1]
**Plans:** 3/5 plans executed

Plans:
- [x] 02-01-PLAN.md — Install dependencies (framer-motion, shadcn card), define quiz types/constants, create profiles DDL and Supabase query functions
- [x] 02-02-PLAN.md — Build quiz interaction UI: QuizShell state machine, carousel with drag/arrow nav, step transitions, 9 SVG illustrations
- [x] 02-03-PLAN.md — Build result view: profile header, 5 laptop cards, skeleton loading, error/empty states
- [ ] 02-04-PLAN.md — Navbar profile integration: ProfileAvatar, ProfileSheet, conditional CTA, end-to-end verification

## Phase 3: Product Catalog & Detail View
- [ ] Build the laptop catalog with a clean, grid-based layout.
- [ ] Implement filters and search functionality.
- [ ] Create the laptop detail page with technical and "human-readable" specs.
- [ ] Integrate influencer recommendation notes into the UI.

## Phase 4: Comparison Tool
- [ ] Implement the "Select to Compare" functionality.
- [ ] Build the Comparison View with visual side-by-side spec charts/icons.
- [ ] Optimize the comparison layout for mobile devices.

## Phase 5: Polish & Deployment
- [ ] Add final animations and micro-interactions.
- [ ] Conduct mobile-first responsive testing across devices.
- [ ] Performance optimization (Image lazy loading, asset optimization).
- [ ] Final deployment to Vercel/Netlify.
