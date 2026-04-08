#!/usr/bin/env node
/**
 * ml-fetch-laptops.js
 * Fetches the top-selling notebooks from MercadoLibre Argentina,
 * ranks top sellers, and generates supabase/seed.sql
 *
 * Usage:
 *   node scripts/ml-fetch-laptops.js
 *   node scripts/ml-fetch-laptops.js --limit 150 --out supabase/seed-fresh.sql
 *
 * Options:
 *   --limit N      Number of laptops to fetch (default: 100)
 *   --out PATH     Output SQL file (default: prints to stdout)
 *   --sellers      Only show top sellers report, don't generate SQL
 *   --dry-run      Print fetched JSON, don't generate SQL
 *
 * Requirements: Node 18+ (uses native fetch)
 * No npm packages needed.
 */

const SITE = "MLA"; // Argentina
const CATEGORY = "MLA1652"; // Computación > Laptops y Accesorios > Laptops
const ML_API = "https://api.mercadolibre.com";

// ─── CLI args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const getArg = (flag, def) => {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
};
const hasFlag = (flag) => args.includes(flag);

const LIMIT = parseInt(getArg("--limit", "100"), 10);
const OUT_FILE = getArg("--out", null);
const SELLERS_ONLY = hasFlag("--sellers");
const DRY_RUN = hasFlag("--dry-run");

// ─── Usage profile mapping ────────────────────────────────────────────────────
// Infer usage profile from keywords in laptop title/specs
function inferProfiles(title, specs) {
  const text = (title + " " + specs).toLowerCase();
  const profiles = [];

  const gamingKw = ["gaming", "gamer", "tuf", "rog", "omen", "nitro", "legion", "predator",
    "strix", "rtx", "gtx", "katana", "victus", "loq", "g15", "g17", "scar"];
  const creativeKw = ["oled", "creator", "studio", "pro", "zenbook", "spectre", "envy",
    "xps", "macbook", "rtx 3050", "rtx 4050", "rtx 4060", "rtx 3060"];
  const studyKw = ["ideapad", "aspire", "vivobook", "pavilion", "inspiron", "vostro",
    "thinkbook", "255 g", "celeron", "pentium", "ryzen 3", "core i3"];

  const isGaming = gamingKw.some((k) => text.includes(k));
  const isCreative = creativeKw.some((k) => text.includes(k));
  const isStudy = studyKw.some((k) => text.includes(k)) || (!isGaming && !isCreative);

  if (isGaming) profiles.push("gaming_rendimiento");
  if (isCreative && !isGaming) profiles.push("creacion_desarrollo");
  if (isStudy && !isGaming) profiles.push("productividad_estudio");
  if (profiles.length === 0) profiles.push("productividad_estudio");

  return profiles;
}

// ─── Extract spec from attributes ────────────────────────────────────────────
function attr(attributes, ...ids) {
  for (const id of ids) {
    const found = attributes.find(
      (a) => a.id === id || a.name?.toLowerCase().includes(id.toLowerCase())
    );
    if (found?.value_name) return found.value_name;
  }
  return null;
}

function extractSpecs(attributes) {
  return {
    cpu: attr(attributes, "PROCESSOR_MODEL", "PROCESSOR_BRAND", "processor") || "Ver descripción",
    ram: attr(attributes, "RAM", "ram") || "Ver descripción",
    storage: attr(attributes, "INTERNAL_MEMORY", "SSD_CAPACITY", "storage") || "Ver descripción",
    gpu: attr(attributes, "GPU_MODEL", "VIDEO_RAM", "graphics") || "Integrada",
    screen_size: attr(attributes, "SCREEN_SIZE", "display_size", "screen") || null,
    os: attr(attributes, "OPERATING_SYSTEM", "os") || "Windows 11",
    weight: attr(attributes, "WEIGHT", "weight") || null,
    battery: null,
  };
}

function inferOS(item) {
  const text = (item.title + " " + (item.attributes?.map((a) => a.value_name).join(" ") || "")).toLowerCase();
  if (text.includes("macos") || text.includes("mac os") || text.includes("macbook")) return "macOS Sequoia";
  if (text.includes("linux") || text.includes("ubuntu") || text.includes("sin sistema")) return "Linux";
  return "Windows 11";
}

function inferBudget(price) {
  if (price <= 550000) return "esencial";
  if (price <= 950000) return "equilibrado";
  return "premium";
}

function inferScore(item) {
  const sold = item.sold_quantity || 0;
  const rating = item.seller_reputation?.transactions?.ratings?.positive || 0;
  let score = 5;
  if (sold > 5000) score = 9;
  else if (sold > 1000) score = 8;
  else if (sold > 500) score = 7;
  else if (sold > 100) score = 6;
  if (rating > 0.95) score = Math.min(10, score + 1);
  return score;
}

// ─── Fetch helpers ────────────────────────────────────────────────────────────
async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJSON(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (compatible; laptop-seed-fetcher/1.0)",
        },
      });
      if (!res.ok) {
        if (res.status === 429) {
          console.error(`[rate-limit] Waiting 5s...`);
          await sleep(5000);
          continue;
        }
        throw new Error(`HTTP ${res.status}: ${url}`);
      }
      return await res.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      await sleep(1000 * (i + 1));
    }
  }
}

// ─── Fetch laptop listings ────────────────────────────────────────────────────
async function fetchListings(total) {
  const items = [];
  const pageSize = 50;

  for (let offset = 0; offset < total; offset += pageSize) {
    const batchSize = Math.min(pageSize, total - offset);
    const url =
      `${ML_API}/sites/${SITE}/search` +
      `?category=${CATEGORY}` +
      `&sort=sold_quantity_desc` +
      `&limit=${batchSize}` +
      `&offset=${offset}`;

    process.stderr.write(`Fetching listings ${offset + 1}-${offset + batchSize}...\n`);

    try {
      const data = await fetchJSON(url);
      if (!data.results?.length) break;
      items.push(...data.results);
    } catch (err) {
      process.stderr.write(`Warning: batch failed (${err.message}). Stopping at ${items.length} items.\n`);
      break;
    }

    if (offset + pageSize < total) await sleep(300); // be polite
  }

  return items;
}

// ─── Fetch item details (specs) ───────────────────────────────────────────────
async function enrichItems(items) {
  const enriched = [];
  const BATCH = 20;

  for (let i = 0; i < items.length; i += BATCH) {
    const batch = items.slice(i, i + BATCH);
    const ids = batch.map((it) => it.id).join(",");

    process.stderr.write(`Fetching specs for items ${i + 1}-${Math.min(i + BATCH, items.length)}...\n`);

    try {
      const data = await fetchJSON(`${ML_API}/items?ids=${ids}`);
      for (const entry of data) {
        if (entry.code === 200) {
          const base = items.find((x) => x.id === entry.body.id) || {};
          enriched.push({ ...base, ...entry.body });
        }
      }
    } catch (err) {
      process.stderr.write(`Warning: specs batch failed (${err.message})\n`);
      enriched.push(...batch);
    }

    await sleep(300);
  }

  return enriched;
}

// ─── Fetch seller details ─────────────────────────────────────────────────────
async function fetchSellerDetails(sellerIds) {
  const details = {};
  const ids = [...new Set(sellerIds)];

  process.stderr.write(`Fetching details for ${ids.length} sellers...\n`);

  for (const id of ids) {
    try {
      const data = await fetchJSON(`${ML_API}/users/${id}`);
      details[id] = data;
    } catch {
      details[id] = { id, nickname: `seller-${id}` };
    }
    await sleep(150);
  }

  return details;
}

// ─── Top sellers report ───────────────────────────────────────────────────────
function buildSellersReport(items, sellerDetails) {
  const map = {};

  for (const item of items) {
    const sid = item.seller?.id || item.seller_id;
    if (!sid) continue;
    if (!map[sid]) {
      const d = sellerDetails[sid] || {};
      map[sid] = {
        id: sid,
        nickname: d.nickname || item.seller?.nickname || `seller-${sid}`,
        items_sold: 0,
        listing_count: 0,
        rating: d.seller_reputation?.transactions?.ratings?.positive ?? null,
        level: d.seller_reputation?.level_id ?? null,
        link: `https://www.mercadolibre.com.ar/perfil/${d.nickname || sid}`,
      };
    }
    map[sid].listing_count++;
    map[sid].items_sold += item.sold_quantity || 0;
  }

  return Object.values(map)
    .sort((a, b) => b.items_sold - a.items_sold)
    .slice(0, 20);
}

function printSellersReport(sellers) {
  console.log("\n╔══════════════════════════════════════════════════════════════════════════════╗");
  console.log("║  TOP SELLERS — MercadoLibre Argentina (Notebooks)                           ║");
  console.log("╚══════════════════════════════════════════════════════════════════════════════╝\n");
  console.log(
    "#   " +
    "Vendedor".padEnd(30) +
    "Unidades vendidas".padEnd(20) +
    "Publicaciones".padEnd(16) +
    "Rating".padEnd(10) +
    "Nivel"
  );
  console.log("─".repeat(90));

  sellers.forEach((s, i) => {
    const rank = String(i + 1).padStart(2) + ". ";
    const nick = s.nickname.substring(0, 28).padEnd(30);
    const sold = String(s.items_sold).padEnd(20);
    const count = String(s.listing_count).padEnd(16);
    const rating = s.rating !== null ? `${(s.rating * 100).toFixed(1)}%`.padEnd(10) : "N/A".padEnd(10);
    const level = s.level || "—";
    console.log(`${rank}${nick}${sold}${count}${rating}${level}`);
  });

  console.log("\n→ Visita los perfiles en mercadolibre.com.ar para ver sus tiendas oficiales.\n");
}

// ─── SQL generation ───────────────────────────────────────────────────────────
function esc(str) {
  if (str === null || str === undefined) return "NULL";
  return "'" + String(str).replace(/'/g, "''") + "'";
}

function arrLiteral(arr) {
  if (!arr?.length) return "'{}'";
  return "ARRAY[" + arr.map(esc).join(", ") + "]";
}

function toSQL(item) {
  const specs = extractSpecs(item.attributes || []);
  const profiles = inferProfiles(item.title, Object.values(specs).join(" "));
  const os = specs.os || inferOS(item);
  const score = inferScore(item);
  const budget = inferBudget(item.price);

  // Simplified tags from title
  const tags = [];
  const t = item.title.toLowerCase();
  if (t.includes("oled")) tags.push("Pantalla OLED");
  if (t.includes("16gb") || t.includes("32gb")) tags.push("16GB+ de RAM");
  if (t.includes("ssd")) tags.push("SSD rapido");
  if (t.includes("ryzen 7") || t.includes("i7") || t.includes("ultra 7") || t.includes("m3")) tags.push("Alto rendimiento");
  if (t.includes("144hz") || t.includes("165hz") || t.includes("240hz")) tags.push("Pantalla alta frecuencia");
  if (t.includes("rtx 40") || t.includes("rtx 4")) tags.push("GPU RTX 40xx");
  if (t.includes("gaming") || t.includes("rog") || t.includes("tuf")) tags.push("Gaming");
  if (profiles.includes("productividad_estudio")) tags.push("Para estudio");
  if (tags.length === 0) tags.push("Buen rendimiento general");

  const influencer =
    `${item.sold_quantity ? `Mas de ${item.sold_quantity} unidades vendidas en MercadoLibre. ` : ""}` +
    `Ideal para ${profiles.includes("gaming_rendimiento") ? "gaming y alto rendimiento" :
      profiles.includes("creacion_desarrollo") ? "diseno, desarrollo y creacion de contenido" :
        "estudio y productividad universitaria"}.`;

  const affiliate = item.permalink || `https://www.mercadolibre.com.ar/s?q=${encodeURIComponent(item.title)}`;
  const image = item.thumbnail?.replace(/\-I\.jpg$/, "-O.jpg") || "";

  return `INSERT INTO laptops (
  name, brand, price, cpu, ram, gpu, storage, os, screen_size, weight, battery,
  simplified_tags, usage_profiles, influencer_note, recommendation_score,
  affiliate_link, image_url, description
) VALUES (
  ${esc(item.title.substring(0, 120))},
  ${esc(item.brand || extractBrand(item.title))},
  ${Math.round(item.price)},
  ${esc(specs.cpu)},
  ${esc(specs.ram)},
  ${esc(specs.gpu)},
  ${esc(specs.storage)},
  ${esc(os)},
  ${esc(specs.screen_size)},
  ${esc(specs.weight)},
  NULL,
  ${arrLiteral(tags.slice(0, 4))},
  ${arrLiteral(profiles)},
  ${esc(influencer.substring(0, 250))},
  ${score},
  ${esc(affiliate)},
  ${esc(image)},
  ${esc(`Notebook real de MercadoLibre Argentina. ${item.sold_quantity ? `Mas de ${item.sold_quantity} vendidas.` : ""}`)}
);\n`;
}

function extractBrand(title) {
  const brands = ["Lenovo", "HP", "Asus", "Acer", "Dell", "Apple", "Samsung",
    "MSI", "LG", "Microsoft", "Huawei", "Xiaomi", "Razer", "Alienware",
    "Gigabyte", "Exo", "BGH", "Positivo", "Toshiba"];
  for (const b of brands) {
    if (title.toLowerCase().includes(b.toLowerCase())) return b;
  }
  return title.split(" ")[0];
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  process.stderr.write(`\nml-fetch-laptops.js — fetching top ${LIMIT} notebooks from MercadoLibre Argentina\n`);
  process.stderr.write(`Category: ${CATEGORY} | Sort: sold_quantity_desc\n\n`);

  // 1. Fetch listings
  const raw = await fetchListings(LIMIT);
  if (!raw.length) {
    console.error("Error: no results from ML API. Check network access and try again.");
    process.exit(1);
  }
  process.stderr.write(`\nFetched ${raw.length} listings.\n`);

  if (DRY_RUN) {
    console.log(JSON.stringify(raw, null, 2));
    return;
  }

  // 2. Enrich with full item details (attributes/specs)
  const items = await enrichItems(raw);

  // 3. Fetch seller details for top sellers report
  const sellerIds = [...new Set(items.map((x) => x.seller?.id || x.seller_id).filter(Boolean))];
  const sellerDetails = await fetchSellerDetails(sellerIds.slice(0, 50)); // top 50 unique sellers

  // 4. Top sellers report (always printed to stderr so it doesn't pollute SQL)
  const sellers = buildSellersReport(items, sellerDetails);

  if (SELLERS_ONLY) {
    printSellersReport(sellers);
    return;
  }

  // Print sellers to stderr (visible but not in SQL output)
  const savedLog = console.log;
  console.log = (...a) => process.stderr.write(a.join(" ") + "\n");
  printSellersReport(sellers);
  console.log = savedLog;

  // 5. Generate SQL
  const now = new Date().toISOString().split("T")[0];
  const lines = [
    `-- Auto-generated by scripts/ml-fetch-laptops.js`,
    `-- Source: MercadoLibre Argentina (API) — sorted by sold_quantity_desc`,
    `-- Generated: ${now} | Count: ${items.length} laptops`,
    `-- Category: ${CATEGORY} | Site: MLA`,
    ``,
    `-- IMPORTANT: Run schema.sql and all migrations first`,
    `DELETE FROM laptops;`,
    ``,
    `-- ═══════════════════════════════════════════════════════════════`,
    `-- TOP SELLERS (by total units sold across their listings)`,
    `-- ═══════════════════════════════════════════════════════════════`,
    `-- Rank | Vendedor                      | Unidades | Rating`,
    ...sellers.slice(0, 10).map((s, i) =>
      `-- ${String(i + 1).padStart(2)}   | ${s.nickname.substring(0, 28).padEnd(28)} | ${String(s.items_sold).padEnd(8)} | ${s.rating !== null ? (s.rating * 100).toFixed(1) + "%" : "N/A"}`
    ),
    ``,
    `-- ═══════════════════════════════════════════════════════════════`,
    `-- LAPTOP INSERT STATEMENTS`,
    `-- ═══════════════════════════════════════════════════════════════`,
    ``,
    ...items.map((item, i) => `-- #${i + 1} | sold: ${item.sold_quantity || "?"} | ${item.title?.substring(0, 60)}\n${toSQL(item)}`),
    `-- Verification:`,
    `-- SELECT count(*) FROM laptops; -- should return ${items.length}`,
    `-- SELECT brand, count(*) FROM laptops GROUP BY brand ORDER BY count(*) DESC;`,
  ];

  const sql = lines.join("\n");

  if (OUT_FILE) {
    const fs = await import("fs");
    fs.writeFileSync(OUT_FILE, sql, "utf8");
    process.stderr.write(`\n✓ Wrote ${items.length} laptops to ${OUT_FILE}\n`);
  } else {
    console.log(sql);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
