#!/usr/bin/env python3
"""
enrich_descriptions.py
======================
Adds descriptions and influencer_notes to laptops that are missing them in Supabase.
Prioritized by number of profiles that use each laptop.

Usage:
  cd /Users/FranciscoAnnoni/Proyectos/computer-recomendator
  python3 scripts/enrich_descriptions.py
  python3 scripts/enrich_descriptions.py --dry-run   # preview without writing
"""

import json
import os
import sys
import time
import argparse
import urllib.request
import urllib.error
import urllib.parse
from pathlib import Path


def load_env(path=".env.local") -> dict:
    env = {}
    try:
        with open(path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    env[k.strip()] = v.strip().strip('"').strip("'")
    except FileNotFoundError:
        pass
    return env


def sb_request(base_url: str, token: str, method: str, path: str, body=None, params: dict = None) -> tuple:
    url = f"{base_url}/rest/v1/{path}"
    if params:
        url += "?" + urllib.parse.urlencode(params)
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(
        url,
        data=data,
        method=method,
        headers={
            "apikey":        token,
            "Authorization": f"Bearer {token}",
            "Content-Type":  "application/json",
            "Accept":        "application/json",
            "Prefer":        "return=representation",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            resp = r.read()
            return r.status, json.loads(resp) if resp.strip() else {}
    except urllib.error.HTTPError as e:
        body_str = e.read().decode("utf-8", errors="ignore")
        print(f"  HTTP {e.code}: {body_str[:200]}", file=sys.stderr)
        return e.code, {"error": body_str[:200]}


def get_laptop_id_by_name(base_url: str, token: str, name: str):
    status, data = sb_request(base_url, token, "GET", "laptops", params={
        "select": "id,name",
        "name":   f"eq.{name}",
        "limit":  "1",
    })
    if status == 200 and data:
        return data[0]["id"] if isinstance(data, list) else None
    return None


def patch_laptop(base_url: str, token: str, laptop_id: str, updates: dict, dry_run: bool) -> bool:
    if dry_run:
        print(f"    [dry-run] PATCH {laptop_id[:8]}… → {list(updates.keys())}")
        return True
    status, data = sb_request(base_url, token, "PATCH", "laptops", body=updates, params={
        "id": f"eq.{laptop_id}",
    })
    return status in (200, 204)


# ── Enrichment data ────────────────────────────────────────────────────────────
# Each entry: name (exact match to DB), description, influencer_note (optional)
# Only include fields that are empty/poor in current DB

ENRICHMENTS = [
    # ── Apple (curated, missing descriptions) ─────────────────────────────────

    {
        "name": 'MacBook Air M2 13" 8GB/512GB',
        "description": (
            "La laptop más recomendada para la mayoría de usuarios. El chip M2 de Apple entrega "
            "rendimiento excepcional con hasta 18 horas de batería real. Los 8GB de memoria unificada "
            "manejan perfectamente trabajo diario, diseño básico, desarrollo web y productividad. "
            "512GB de SSD da espacio cómodo para instalar apps, proyectos y archivos sin administrar "
            "storage constantemente. Sin ventilador, sin ruido, pantalla Liquid Retina calibrada. "
            "La mejor relación precio-autonomía-rendimiento del mercado para la mayoría de los casos."
        ),
    },
    {
        "name": 'MacBook Air M2 13" 8GB/256GB',
        "description": (
            "MacBook Air M2 en configuración base. Perfecta para estudiantes y profesionales de "
            "oficina que usan apps livianas. El SSD de 256GB puede quedarse justo si guardás mucho "
            "localmente, pero combinado con iCloud Drive o Google Drive es más que suficiente. "
            "Misma autonomía de día completo y misma pantalla Liquid Retina que la versión de 512GB. "
            "Ideal si priorizás el precio más bajo del ecosistema Apple sin sacrificar calidad de build."
        ),
    },
    {
        "name": 'MacBook Air M4 13" 16GB/256GB',
        "description": (
            "MacBook Air M4 con 16GB de memoria unificada: un salto generacional sobre el M2 y M3. "
            "El chip M4 con 10 núcleos de CPU y Neural Engine de última generación maneja sin problema "
            "diseño en Figma, desarrollo en Xcode, video 4K en Final Cut y multitarea pesada. "
            "16GB de RAM eliminan los cuellos de botella del M2/M3 base. Pantalla Liquid Retina 13\" "
            "con amplio gamut P3, hasta 18 horas de batería y cero ruido. El Air más recomendable "
            "si tu presupuesto llega."
        ),
    },
    {
        "name": 'MacBook Air M4 13" 16GB/512GB',
        "description": (
            "MacBook Air M4 en la configuración más equilibrada. Con 16GB de RAM unificada y 512GB "
            "de almacenamiento, esta es la versión que recomendamos sin reservas a creadores, "
            "desarrolladores y profesionales. El M4 supera al M3 en rendimiento CPU y GPU, y los "
            "16GB dan margen para abrir decenas de pestañas, apps de diseño y compilación sin "
            "paging. Autonomía de 18 horas. La mejor MacBook Air jamás fabricada."
        ),
    },
    {
        "name": 'MacBook Air M2 15" 8GB/256GB',
        "description": (
            "MacBook Air M2 de 15 pulgadas: la misma eficiencia del M2 pero con más espacio de "
            "pantalla para multitarea visual. La Liquid Retina de 15.3 pulgadas hace que usar "
            "varias ventanas simultáneas sea mucho más cómodo. Ideal para estudiantes que trabajan "
            "con documentos y quieren pantalla grande sin el peso ni el precio de un Pro. "
            "Sin ventilador, toda la batería del día real, y el mismo teclado Magic Keyboard "
            "con Touch ID que el modelo de 13 pulgadas."
        ),
        "influencer_note": (
            "Ideal si querés la pantalla grande sin pagar el premium del Pro. El Air M2 15\" "
            "tiene la misma autonomía y silencio del M2 13\" pero con mucho más espacio visual "
            "para trabajar cómodo. Si pasás horas frente a la laptop y tenés pantallas abiertas "
            "en paralelo, la diferencia de tamaño vale la pena."
        ),
    },
    {
        "name": 'Mac mini M4 16GB/256GB',
        "description": (
            "La mejor relación precio-potencia del ecosistema Apple. El Mac mini M4 con 16GB de "
            "memoria unificada es una workstation capaz en un formato de 12 × 12 cm. Perfecto para "
            "armar un setup de escritorio fijo con tu propio monitor. Incluye dos puertos Thunderbolt 4, "
            "HDMI 2.1, tres USB-A, Ethernet y Wi-Fi 6E. Compatible con hasta dos pantallas 4K "
            "simultáneas. El M4 maneja compilaciones pesadas, edición de video y diseño sin "
            "transpirar. Si ya tenés periféricos, es la forma más económica de entrar a Apple."
        ),
    },
    {
        "name": 'MacBook Pro M3 14" 16GB/512GB',
        "description": (
            "El MacBook Pro M3 14 pulgadas es el primer escalón del poder profesional de Apple. "
            "Con 16GB de RAM y pantalla Liquid Retina XDR de hasta 1000 nits, está diseñado para "
            "creadores de contenido, desarrolladores y diseñadores que necesitan más que un Air. "
            "ProMotion adapta la tasa de refresco hasta 120Hz. El M3 supera ampliamente al M2 en "
            "carga de GPU y tareas de IA. Puerto HDMI, lector SD y MagSafe integrados. La opción "
            "para quienes el Air ya no alcanza."
        ),
        "influencer_note": (
            "Si el Air se te queda corto pero no llegás al M3 Pro, este es tu punto de entrada al "
            "Pro. El M3 base da un salto real en GPU sobre el M2, especialmente para video 4K, "
            "diseño 3D y modelos de machine learning locales. La pantalla XDR con ProMotion 120Hz "
            "es notablemente mejor que la del Air. La pantalla sola justifica el precio extra."
        ),
    },
    {
        "name": 'MacBook Pro M4 14" 16GB/512GB',
        "description": (
            "MacBook Pro M4 14 pulgadas: el estándar de referencia en rendimiento portátil 2025. "
            "El chip M4 supera al M3 en CPU y GPU, con soporte nativo de ray tracing por hardware "
            "y Neural Engine de nueva generación. Pantalla Liquid Retina XDR ProMotion 120Hz con "
            "1000 nits de brillo en condiciones de uso normales. Puerto HDMI 2.1, Thunderbolt 4, "
            "lector SD y MagSafe. Ideal para editores de video, arquitectos que usan CAD y "
            "desarrolladores de apps Apple."
        ),
        "influencer_note": (
            "El M4 Pro es mejor, pero el M4 base ya es una bestia para la mayoría de los usos "
            "profesionales. Si editás video 4K o 6K en Final Cut o DaVinci, trabajás con Xcode, "
            "Blender o Cinema 4D, este MacBook Pro M4 te da rendimiento que antes requería un Pro. "
            "La pantalla XDR es la mejor en cualquier laptop portátil disponible."
        ),
    },
    {
        "name": 'MacBook Pro M4 Pro 14" 24GB/512GB',
        "description": (
            "MacBook Pro M4 Pro con 24GB de RAM unificada: el chip para cargas de trabajo exigentes. "
            "El M4 Pro tiene 12 núcleos de CPU y 20 de GPU, diseñado para edición multicámara en 4K, "
            "compilaciones masivas, renders en Blender y modelos de IA locales. Con 24GB de RAM "
            "podés tener Xcode, Docker, Figma y Slack abiertos sin que nada se frene. Pantalla "
            "Liquid Retina XDR con ProMotion 120Hz y True Tone. La herramienta de trabajo definitiva "
            "para profesionales técnicos y creativos."
        ),
        "influencer_note": (
            "Para profesionales que necesitan el mejor hardware portátil sin discusión. El M4 Pro "
            "con 24GB maneja renders 3D, edición multicámara 4K, compilaciones pesadas y modelos "
            "de IA locales sin transpirar. Si trabajás con Resolve, After Effects, Xcode o Unity "
            "de forma intensiva, esta es tu máquina. El M4 base ya no te alcanza si llegás a este nivel."
        ),
    },
    {
        "name": 'MacBook Pro M4 Pro 14" 24GB/1TB',
        "description": (
            "MacBook Pro M4 Pro en la configuración de máximo equilibrio: 24GB de RAM y 1TB de "
            "almacenamiento. El 1TB resuelve el problema de storage para proyectos de video pesados, "
            "librerías de fotos RAW y bases de código grandes. El M4 Pro con 12 núcleos de CPU "
            "y 20 de GPU es la placa de referencia para trabajo creativo profesional. "
            "Thunderbolt 4, HDMI 2.1, lector SD y MagSafe. La elección para quienes no quieren "
            "comprometerse ni en rendimiento ni en espacio."
        ),
    },
    {
        "name": 'MacBook Pro M4 Pro 16" 24GB/512GB',
        "description": (
            "MacBook Pro M4 Pro de 16 pulgadas: la mejor pantalla portátil del mercado. Liquid "
            "Retina XDR de 16.2 pulgadas con ProMotion 120Hz, contraste infinito y 1000 nits de "
            "brillo. El chip M4 Pro con 12 núcleos de CPU y 20 de GPU procesa las cargas más "
            "exigentes con hasta 22 horas de batería según Apple. El formato de 16 pulgadas hace "
            "diferencia cuando trabajás horas frente a código, diseño o video. Para creadores "
            "que priorizan la pantalla grande y la potencia sobre la portabilidad."
        ),
        "influencer_note": (
            "La pantalla de 16 pulgadas hace diferencia real cuando trabajás todo el día. "
            "El M4 Pro da potencia de workstation portátil: si tenés el presupuesto y priorizás "
            "pantalla grande más potencia sobre peso reducido, vale cada peso. Ideal para "
            "diseñadores, editores de video y arquitectos que viajan pero trabajan intensivo."
        ),
    },
    {
        "name": 'Apple Mac Studio M4 Max 36GB/512GB',
        "influencer_note": (
            "La workstation de escritorio más potente de Apple en formato compacto. El M4 Max "
            "con 36GB de RAM unificada y GPU de 40 núcleos maneja renders de producción, modelos "
            "3D pesados, color grading en 8K y flujos de IA complejos. Si trabajás en producción "
            "audiovisual profesional o VFX y querés la mejor relación precio-rendimiento en "
            "hardware Apple, el Mac Studio es imbatible. Requiere comprar monitor y periféricos."
        ),
    },

    # ── Windows laptops / desktops ─────────────────────────────────────────────

    {
        "name": "Portátil HP Elitebook 845 G8 Amd Ryzen 5 Pro 5650u 16 GB de RAM 256 GB Ssd Windows 11 Pro",
        "influencer_note": (
            "Excelente relación precio-potencia en el segmento usado/reacondicionado. "
            "El Ryzen 5 Pro 5650U con 6 núcleos ofrece rendimiento sólido para oficina, "
            "programación liviana y multitarea. Construcción empresarial HP robusta, teclado "
            "cómodo y buena autonomía. Si buscás una notebook confiable para trabajo y no "
            "querés pagar precio de nueva, esta es una de las mejores opciones disponibles."
        ),
    },
    {
        "name": "PC Gamer Armada RTX 3060 32GB/960GB",
        "influencer_note": (
            "Escritorio gaming con RTX 3060 que maneja todos los juegos actuales en 1080p con "
            "altos detalles y 60+ FPS estables. Con 32GB de RAM tenés margen para gaming + "
            "streaming + Discord simultáneos. La mejor opción si ya tenés monitor y periféricos "
            "y querés el máximo rendimiento por pesos sin armar la PC desde cero."
        ),
        "description": (
            "PC gamer completa con RTX 3060 12GB GDDR6 y 32GB de RAM DDR4. La RTX 3060 maneja "
            "todos los juegos actuales en 1080p en configuraciones altas y muchos títulos en 1440p. "
            "Los 32GB de RAM dan margen para gaming + streaming en OBS + Discord abiertos sin "
            "problemas. SSD de 960GB para cargas rápidas de juegos. Incluye Windows 11."
        ),
    },
    {
        "name": "PC Gamer Armada RTX 3070 Ti 32GB/1TB",
        "influencer_note": (
            "El salto a la RTX 3070 Ti vale la pena si jugás en 1440p o querés máximos detalles. "
            "También excelente para renderizado, IA local y juegos exigentes a máxima calidad. "
            "Con 1TB SSD tenés espacio para toda tu biblioteca de juegos sin comprometer "
            "velocidades de carga. La opción premium de escritorio gaming."
        ),
        "description": (
            "PC gamer de alta gama con RTX 3070 Ti 8GB GDDR6X y 32GB de RAM. La RTX 3070 Ti "
            "es una bestia en 1440p y puede con 4K en muchos títulos. Excelente para "
            "streaming mientras jugás sin perder performance. Con 1TB SSD todos los juegos "
            "cargan rápido. Los 32GB son el estándar para gaming serio y creación de contenido."
        ),
    },
    {
        "name": "PC Gamer Mexx G6550 Ryzen 7 5700 32GB/1TB RTX 3050",
        "influencer_note": (
            "Escritorio gaming equilibrado con Ryzen 7 5700 y RTX 3050. El Ryzen 7 5700 con "
            "8 núcleos da músculo real para gaming + streaming + tareas paralelas. La RTX 3050 "
            "maneja la mayoría de los juegos en 1080p con buenos detalles. Buena opción si "
            "necesitás CPU fuerte y no priorizás GPU de alta gama."
        ),
        "description": (
            "PC gamer con AMD Ryzen 7 5700, 32GB de RAM y RTX 3050 4GB. El Ryzen 7 5700 con "
            "8 núcleos es sólido para gaming, streaming en OBS y multitarea. La RTX 3050 maneja "
            "la mayoría de juegos en 1080p en configuraciones medias-altas. Con 1TB SSD las "
            "cargas de juegos son rápidas. Buena relación precio cuando priorizás CPU sobre GPU."
        ),
    },
    {
        "name": "Mini PC B-Max B6 Plus i3 12GB/512GB",
        "influencer_note": (
            "Mini PC compacto para trabajo de escritorio de bajo costo. El Intel i3 con 12GB "
            "de RAM maneja navegación, documentos, videollamadas y videos sin problemas. "
            "Ocupa casi nada de espacio, consume poca energía y es silencioso. Ideal como PC "
            "familiar, para estudiantes, mayores o para armar un segundo puesto de trabajo."
        ),
    },
    {
        "name": "Mini PC CX Ryzen 3 8GB/240GB",
        "influencer_note": (
            "Mini PC económico para usuarios que necesitan Windows y poco más. El Ryzen 3 "
            "maneja navegación, documentos y videollamadas cómodamente. La opción más accesible "
            "para armar un escritorio básico con cualquier monitor HDMI. Ideal para mayores, "
            "uso escolar o segundo puesto de trabajo donde el presupuesto es la prioridad."
        ),
    },
    {
        "name": "Minisforum UM790 Pro Ryzen 9 64GB/1TB",
        "influencer_note": (
            "Mini PC de alto rendimiento para usuarios exigentes. El Ryzen 9 con 64GB de RAM "
            "es insólitamente potente para su tamaño: compila, virtualiza y ejecuta cargas de "
            "trabajo de desarrollo serio. Perfecto para desarrolladores que quieren un escritorio "
            "fijo potente en formato ultra-compacto. Los 64GB de RAM son raros a este precio."
        ),
    },
    {
        "name": "GMKtec Nucbox M6 Ryzen 5 6600H 16GB",
        "influencer_note": (
            "Mini PC sorprendentemente capaz para su precio. El Ryzen 5 6600H con GPU Radeon "
            "680M integrada maneja gaming liviano, desarrollo web y multitarea sin problema. "
            "Buen punto de entrada si querés escritorio fijo potente sin pagar el premium de "
            "una laptop. Los 16GB de RAM permiten tener decenas de pestañas y apps abiertas."
        ),
    },
    {
        "name": "Notebook Lenovo IdeaPad Gaming 3 15ARH05",
        "description": (
            "Lenovo IdeaPad Gaming 3 con AMD Ryzen 5 4600H y placa gráfica dedicada Nvidia GTX. "
            "Diseñada para gaming de entrada: pantalla de 15.6 pulgadas, teclado retroiluminado "
            "básico y construcción sólida. El Ryzen 5 4600H de 6 núcleos da buen rendimiento "
            "en juegos del catálogo 2019-2022 en configuraciones medias. Ideal para el primer "
            "equipo de gaming sin presupuesto premium."
        ),
        "influencer_note": (
            "Laptop gaming de entrada, ideal para empezar. El Ryzen 5 4600H ofrece buen "
            "rendimiento en juegos de generaciones anteriores. Si el presupuesto es limitado "
            "y querés gaming, es una opción sólida. A partir del 2025 puede quedar corta en "
            "juegos AAA de nueva generación, pero el catálogo de Steam sigue siendo enorme."
        ),
    },
    {
        "name": "PC Gamer Noxi Armada Ryzen 7 5700G 16GB",
        "influencer_note": (
            "PC de escritorio con Ryzen 7 5700G que incluye gráficos Radeon Vega integrados de "
            "alta performance. Si el gaming no es la prioridad pero sí la productividad, "
            "compilación y multitarea, el 5700G es una excelente base. No necesita GPU externa "
            "para tareas de oficina, desarrollo y juegos livianos."
        ),
    },
    {
        "name": "Lenovo Yoga 7i 16 I7 16gb 1tb Ssd",
        "influencer_note": (
            "Laptop 2-en-1 premium de 16 pulgadas. El i7 con 16GB de RAM maneja creatividad, "
            "desarrollo y multitarea exigente. La pantalla grande y la capacidad táctil con "
            "stylus la hacen ideal para diseñadores y creadores que quieren flexibilidad de "
            "forma entre laptop y tablet. Equilibrio entre rendimiento y versatilidad."
        ),
    },
    {
        "name": "Lenovo Loq 15iax9e I7-12650hx 12gb 1tb Rtx 4050 6gb",
        "influencer_note": (
            "Laptop gaming sólida con RTX 4050 y un i7-12650HX de 10 núcleos. La RTX 4050 "
            "maneja la mayoría de los juegos actuales en 1080p con buenos FPS. El i7-12650HX "
            "tiene núcleos híbridos que dan buen rendimiento para gaming + streaming simultáneos. "
            "Buena compra si querés RTX 40 series sin pagar el premium del RTX 4060 o superior."
        ),
    },
    {
        "name": "Lenovo Yoga 7 16 Ryzen 7 350 16gb 1tb Ssd",
        "influencer_note": (
            "Laptop 2-en-1 de 16 pulgadas con Ryzen 7 y 16GB de RAM. Grande para cargar, "
            "potente para crear. La pantalla de 16 pulgadas con opción táctil la hace versátil "
            "como laptop de estudio o trabajo creativo. El Ryzen AI 7 350 tiene NPU integrado "
            "para funciones de IA en Windows 11. Buena opción premium-Windows."
        ),
    },
    {
        "name": "Notebook Hp 255 G10 Amd Ryzen 5 7520u 16gb Ram 512gb Ssd 15.6 Full Hd Gráficos Integrados Radeon 610m Windows 11 Home",
        "influencer_note": (
            "Notebook de ofimática sólida con excelente relación precio-potencia. El Ryzen 5 "
            "7520U con 16GB de RAM maneja perfectamente trabajo en múltiples apps, reuniones "
            "de Zoom, edición de documentos pesados y navegación intensa. El SSD de 512GB "
            "da espacio cómodo. Si buscás Windows confiable para trabajo sin gastar de más, "
            "la HP 255 G10 Ryzen 5 es una de las mejores opciones disponibles."
        ),
    },
    {
        "name": "Notebook Hp Victus Gaming 15-fa0027la I5 8gb Ram 512gb Win11 Negro",
        "influencer_note": (
            "HP Victus: gaming accesible con Intel Core i5 y placa dedicada GTX/RTX. "
            "El i5 da buen rendimiento en juegos y la placa dedicada hace diferencia sobre "
            "gráficos integrados. Buena opción de entrada para gaming en notebook si no "
            "llegás a las opciones Lenovo LOQ o Nitro. Teclado retroiluminado y pantalla "
            "FHD estándar."
        ),
    },
    {
        "name": "Notebook Hp Victus Victus 15-fa2013dx Plateado 15.6 Disco Ssd 512 Gb Intel 13420h 8gb De Ram",
        "influencer_note": (
            "HP Victus con RTX 2050: gaming de entrada con una tarjeta de última generación. "
            "La RTX 2050 con soporte DLSS 3 mejora los FPS en juegos compatibles. Buen punto "
            "de entrada si querés ray tracing y DLSS sin pagar el premium de la RTX 4050. "
            "Los 8GB de RAM son el mínimo para gaming; considerar si puede actualizarse."
        ),
    },
    {
        "name": "Notebook LG Gram 17 I7-1360p 1tb Ssd 16gb Ddr5 Ips Win11 Color Negro",
        "influencer_note": (
            "La notebook más liviana de 17 pulgadas del mercado. El LG Gram 17 pesa menos de "
            "1.35 kg — increíble para su tamaño. El i7-1360P con 16GB DDR5 da rendimiento "
            "sólido para productividad exigente. Si viajás frecuente y querés pantalla grande "
            "sin cargar un ladrillo, esta es la única opción que cumple ese requisito."
        ),
    },
    {
        "name": "Notebook Lenovo V15 Ryzen 5 7520U 16Gb Ssd 512Gb 15.6 Wind 11 Pro",
        "influencer_note": (
            "Notebook de ofimática directa y confiable. El Ryzen 5 7520U con 16GB da "
            "rendimiento más que suficiente para trabajo de oficina, múltiples ventanas "
            "y reuniones virtuales. La V15 es la serie de Lenovo orientada a negocios: "
            "construida para durar, sin extras innecesarios. Buena compra para trabajo "
            "del día a día sin presupuesto premium."
        ),
    },
    {
        "name": "Notebook Asus Vivobook 14 Intel Core I3 1215u 16gb De Ram 512gb Ssd Full Hd Windows 11 Home",
        "influencer_note": (
            "Notebook liviana y equilibrada para trabajo de oficina. El i3-1215U con 16GB "
            "de RAM es más capaz de lo que el nombre sugiere: maneja multitarea, múltiples "
            "pestañas y apps de productividad sin cuellos de botella. El formato de 14 "
            "pulgadas la hace portátil y cómoda. Buena compra si priorizás RAM sobre CPU."
        ),
    },
]


def fetch_all_laptops(base_url: str, token: str) -> dict:
    """Returns a dict of {name: {id, description, influencer_note}}"""
    all_laptops = {}
    offset = 0
    BATCH = 100
    while True:
        url = f"{base_url}/rest/v1/laptops?select=id,name,description,influencer_note&limit={BATCH}&offset={offset}"
        req = urllib.request.Request(url, headers={
            "apikey":        token,
            "Authorization": f"Bearer {token}",
            "Accept":        "application/json",
        })
        try:
            with urllib.request.urlopen(req, timeout=20) as r:
                data = json.loads(r.read())
        except Exception as e:
            print(f"  Error fetching laptops: {e}")
            break
        if not data:
            break
        for l in data:
            all_laptops[l["name"]] = l
        if len(data) < BATCH:
            break
        offset += BATCH
    return all_laptops


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    env = load_env()
    sb_url   = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")       or env.get("NEXT_PUBLIC_SUPABASE_URL")
    sb_token = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")  or env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

    if not sb_url or not sb_token:
        print("Error: Supabase credentials required")
        sys.exit(1)

    print("\nCargando laptops desde Supabase…")
    all_db_laptops = fetch_all_laptops(sb_url, sb_token)
    print(f"  → {len(all_db_laptops)} laptops en DB\n")

    print(f"Enriqueciendo {len(ENRICHMENTS)} laptops…\n")
    if args.dry_run:
        print("[DRY RUN — no writes]\n")

    updated = 0
    skipped = 0
    not_found = 0

    for entry in ENRICHMENTS:
        name = entry["name"]
        short_name = name[:60]
        print(f"  {short_name}…", end="", flush=True)

        laptop = all_db_laptops.get(name)
        if not laptop:
            # Try case-insensitive partial match
            name_lower = name.lower()
            for db_name, db_l in all_db_laptops.items():
                if db_name.lower() == name_lower:
                    laptop = db_l
                    break

        if not laptop:
            print(f" ⚠️  no encontrado en DB")
            not_found += 1
            continue

        laptop_id = laptop["id"]

        # Only update fields that are empty/missing
        updates = {}
        new_desc = entry.get("description", "")
        new_note = entry.get("influencer_note", "")

        if new_desc and not (laptop.get("description") or "").strip():
            updates["description"] = new_desc
        if new_note and not (laptop.get("influencer_note") or "").strip():
            updates["influencer_note"] = new_note

        if not updates:
            print(" ↩  ya tiene datos, sin cambios")
            skipped += 1
            continue

        fields_str = ", ".join(updates.keys())
        if args.dry_run:
            print(f" [dry-run] → actualizaría: {fields_str}")
            updated += 1
            continue

        patch_status, _ = sb_request(sb_url, sb_token, "PATCH", "laptops", body=updates, params={
            "id": f"eq.{laptop_id}",
        })
        if patch_status in (200, 204):
            print(f" ✓ ({fields_str})")
            updated += 1
        else:
            print(f" ✗ PATCH error ({patch_status})")

        time.sleep(0.2)

    print(f"\n{'═'*50}")
    print(f"  Actualizadas : {updated}")
    print(f"  Sin cambios  : {skipped}")
    print(f"  No halladas  : {not_found}")
    print(f"{'═'*50}\n")

    if not_found > 0:
        print("Los 'no encontrado' tienen nombres distintos en DB.")
        print("Nombres disponibles en DB (que contienen 'MacBook'):")
        for k in all_db_laptops:
            if "macbook" in k.lower() or "mac" in k.lower():
                print(f"  {k}")


if __name__ == "__main__":
    main()
