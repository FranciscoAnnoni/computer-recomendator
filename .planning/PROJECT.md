# Project: Computer Recomendator

## Context & Vision
"Computer Recomendator" is a mobile-first web application designed to help young university students choose the right laptop. The platform aims to solve the common problem of not knowing what computer to buy, especially for those with little to no technical knowledge of hardware or software.

The experience will be intuitive and visually appealing, following a minimalist Apple-style aesthetic. It will feature a simplified "for dummies" approach using icons, colors, and software-specific compatibility descriptions (e.g., "Supports Adobe Creative Cloud," "Very Fast") instead of just technical specs. (remember this has to be optional, so you can chose with a switch to change the web for dummies or not, so you can also se the tecnicals specs)

## Core Problem
Students (often first-time buyers) are overwhelmed by technical specifications (RAM, CPU, GPU) and don't know which laptop fits their specific needs (design, programming, general study).

## Proposed Solution
A guided discovery experience through an intuitive quiz, leading to a curated catalog of laptops with simplified, easy-to-understand descriptions and a comparison tool.

## Key Features
- **Intuitive Quiz:** 3-4 simple questions to define the user profile (Major/Usage, OS preference, Budget) - like cards that are down and when you chose the card thats has your option, the card flips showing the front of the card (with a magic drow).
- **Curated Catalog:** A beautiful, minimalist list of laptops with both technical specs and "translated" human-readable benefits.
- **Product Comparison:** Side-by-side comparison of selected laptops.
- **Simplified Specs:** Use of icons and color-coding to indicate performance and software compatibility.
- **Mixed Data Source:** Technical specs supplemented by personal influencer recommendations.

## Tech Stack (Preliminary)
- **Frontend:** React or Next.js (for SEO and performance).
- **Styling:** Tailwind CSS (for minimalist Apple-like design).
- **UI Components:** Framer Motion (for smooth, high-quality transitions).
- **Database:** Supabase (to store catalog and recommendations).
- **Deployment:** Vercel or Netlify.

## Brand & Aesthetic
- **Style:** Apple Minimalist. Clean typography, generous white space, high-quality imagery, and subtle animations.
- **Tone:** Helpful, expert, and approachable. No jargon unless explained.

## Current Milestone: v1.1 Launch-Ready Polish

**Goal:** Mejorar el diseño mobile, SEO, feedback de usuarios, avatares de perfiles, y hacer deploy de la app.

**Target features:**
- Rediseño mobile — UX/UI mejorado para uso en celular
- SEO mejorado — meta tags, structured data, OG images
- Modal de feedback — botón junto al toggle de tema, abre modal para que el usuario deje comentarios
- Avatares por perfil — 81 imágenes únicas (pixel art), una por cada perfil del recomendador
- Deploy a producción — Vercel

## Current State

Phase 12 complete (2026-05-01) — Catalog refresh workflow operational: `catalog_product_id` column live in Supabase, `scripts/refresh_catalog.py` single-command orchestrator with 6-stage pipeline (scrape → enrich → stale-detect → affiliate-regen → upsert → audit), 17 tests passing.

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

Last updated: 2026-05-01 — Phase 12 (Catalog Refresh) complete
