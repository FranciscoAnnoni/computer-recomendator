-- Phase 6: Laptop catalog seed data
-- Source: MercadoLibre Argentina / Amazon.com listings, April 2026
-- Prices in ARS (approximate, subject to inflation)
-- Run via Supabase SQL Editor or `supabase db reset`
-- IMPORTANT: Run schema.sql and all migrations first

-- Clear existing test data (if any)
DELETE FROM laptops;

-- ============================================================
-- PRODUCTIVIDAD_ESTUDIO segment (8 laptops)
-- ============================================================

INSERT INTO laptops (
  name, brand, price, cpu, ram, gpu, storage, os, screen_size, weight, battery,
  simplified_tags, usage_profiles, influencer_note, recommendation_score,
  affiliate_link, image_url, description
) VALUES (
  'Lenovo IdeaPad 1 15IGL7',
  'Lenovo',
  180000,
  'Intel Celeron N4500',
  '8GB DDR4',
  'Intel UHD',
  '256GB eMMC',
  'Windows 11',
  '15.6"',
  '1.7 kg',
  'Up to 6h',
  ARRAY['Basica y confiable', 'Liviana', 'Ideal para Word y Google Docs'],
  ARRAY['productividad_estudio'],
  'Para empezar la facu sin gastar de mas. No es la mas rapida pero cumple para apuntes y navegacion.',
  6,
  'https://www.mercadolibre.com.ar/s?q=Lenovo+IdeaPad+1+15IGL7',
  'https://http2.mlstatic.com/D_NQ_NP_placeholder-lenovo-ideapad1.jpg',
  'Notebook basica y confiable para tareas universitarias esenciales. Perfecta para tomar apuntes, navegar y usar Office.'
);

INSERT INTO laptops (
  name, brand, price, cpu, ram, gpu, storage, os, screen_size, weight, battery,
  simplified_tags, usage_profiles, influencer_note, recommendation_score,
  affiliate_link, image_url, description
) VALUES (
  'Lenovo IdeaPad 15AMN8',
  'Lenovo',
  280000,
  'AMD Ryzen 5 7520U',
  '16GB DDR5',
  'AMD Radeon 610M',
  '512GB SSD NVMe',
  'Windows 11',
  '15.6" FHD',
  '1.6 kg',
  'Up to 8h',
  ARRAY['Rendimiento balanceado', 'Buena bateria', 'Ideal para estudio'],
  ARRAY['productividad_estudio'],
  'La mejor relacion calidad-precio para estudiantes. 16GB de RAM y Ryzen 5 son mas que suficiente.',
  8,
  'https://www.mercadolibre.com.ar/s?q=Lenovo+IdeaPad+15AMN8',
  'https://http2.mlstatic.com/D_NQ_NP_placeholder-lenovo-ideapad15amn8.jpg',
  'Excelente relacion calidad-precio con Ryzen 5 y 16GB de RAM DDR5. Ideal para estudiantes que quieren rendimiento sin pagar de mas.'
);

INSERT INTO laptops (
  name, brand, price, cpu, ram, gpu, storage, os, screen_size, weight, battery,
  simplified_tags, usage_profiles, influencer_note, recommendation_score,
  affiliate_link, image_url, description
) VALUES (
  'HP Pavilion 15',
  'HP',
  320000,
  'Intel Core i5-1235U',
  '8GB DDR4',
  'Intel Iris Xe',
  '512GB SSD',
  'Windows 11',
  '15.6" FHD',
  '1.75 kg',
  'Up to 7h',
  ARRAY['Marca de confianza', 'Intel de ultima gen', 'Pantalla Full HD'],
  ARRAY['productividad_estudio'],
  'HP nunca falla. Procesador Intel de 12va generacion y 512GB de SSD. Solida para oficina y estudio.',
  7,
  'https://www.mercadolibre.com.ar/s?q=HP+Pavilion+15+i5',
  'https://http2.mlstatic.com/D_NQ_NP_placeholder-hp-pavilion15.jpg',
  'Notebook confiable de HP con Intel Core i5 de 12va generacion y pantalla Full HD. Solida para el dia a dia universitario.'
);

INSERT INTO laptops (
  name, brand, price, cpu, ram, gpu, storage, os, screen_size, weight, battery,
  simplified_tags, usage_profiles, influencer_note, recommendation_score,
  affiliate_link, image_url, description
) VALUES (
  'Acer Aspire A315-42',
  'Acer',
  350000,
  'AMD Ryzen 7 7730U',
  '16GB DDR5',
  'AMD Radeon',
  '512GB SSD',
  'Windows 11',
  '15.6" FHD',
  '1.9 kg',
  'Up to 8h',
  ARRAY['Potencia profesional', 'Ryzen 7', 'Multitarea sin limites'],
  ARRAY['productividad_estudio'],
  'Ryzen 7 para los que necesitan mas potencia en productividad. Excel pesado, muchas pestanas, lo que sea.',
  8,
  'https://www.mercadolibre.com.ar/s?q=Acer+Aspire+A315+Ryzen+7',
  'https://http2.mlstatic.com/D_NQ_NP_placeholder-acer-aspire-a315.jpg',
  'Potencia de Ryzen 7 para los que manejan muchas tareas a la vez. Perfecta para investigacion, presentaciones y multitarea intensa.'
);

INSERT INTO laptops (
  name, brand, price, cpu, ram, gpu, storage, os, screen_size, weight, battery,
  simplified_tags, usage_profiles, influencer_note, recommendation_score,
  affiliate_link, image_url, description
) VALUES (
  'MacBook Air M2 13"',
  'Apple',
  850000,
  'Apple M2',
  '8GB Unified',
  '8-core GPU',
  '256GB SSD',
  'macOS Sequoia',
  '13.6"',
  '1.24 kg',
  'Up to 18h',
  ARRAY['Ultra liviana', 'Bateria todo el dia', 'Silenciosa sin ventilador'],
  ARRAY['productividad_estudio', 'creacion_desarrollo'],
  'Si te alcanza el presupuesto, es imbatible. 18 horas de bateria y pesa poco mas de 1 kilo.',
  9,
  'https://www.amazon.com/s?k=MacBook+Air+M2+13',
  'https://http2.mlstatic.com/D_NQ_NP_placeholder-macbook-air-m2.jpg',
  'La notebook mas popular de Apple con chip M2, bateria de hasta 18 horas y solo 1.24 kg. Perfecta para llevar a todos lados.'
);

INSERT INTO laptops (
  name, brand, price, cpu, ram, gpu, storage, os, screen_size, weight, battery,
  simplified_tags, usage_profiles, influencer_note, recommendation_score,
  affiliate_link, image_url, description
) VALUES (
  'MacBook Air M3 15"',
  'Apple',
  1100000,
  'Apple M3',
  '8GB Unified',
  '10-core GPU',
  '256GB SSD',
  'macOS Sequoia',
  '15.3"',
  '1.51 kg',
  'Up to 18h',
  ARRAY['Pantalla grande', 'Chip de ultima gen', 'Productividad premium'],
  ARRAY['productividad_estudio', 'creacion_desarrollo'],
  'La mejor MacBook Air que existe. Pantalla de 15 pulgadas y el chip M3 vuela.',
  10,
  'https://www.amazon.com/s?k=MacBook+Air+M3+15',
  'https://http2.mlstatic.com/D_NQ_NP_placeholder-macbook-air-m3-15.jpg',
  'La MacBook Air mas grande con chip M3 y pantalla de 15.3 pulgadas. Bateria de todo el dia y rendimiento excepcional para cualquier tarea.'
);

INSERT INTO laptops (
  name, brand, price, cpu, ram, gpu, storage, os, screen_size, weight, battery,
  simplified_tags, usage_profiles, influencer_note, recommendation_score,
  affiliate_link, image_url, description
) VALUES (
  'Lenovo ThinkPad E14 Gen 5',
  'Lenovo',
  400000,
  'Intel Core i5-1340P',
  '16GB DDR5',
  'Intel Iris Xe',
  '512GB SSD',
  'Windows 11',
  '14" FHD',
  '1.59 kg',
  'Up to 10h',
  ARRAY['Teclado legendario', 'Ultraportatil', 'Construccion robusta'],
  ARRAY['productividad_estudio'],
  'El teclado de las ThinkPad es famoso por algo. Si escribis mucho, esta es tu maquina.',
  8,
  'https://www.mercadolibre.com.ar/s?q=Lenovo+ThinkPad+E14+Gen+5',
  'https://http2.mlstatic.com/D_NQ_NP_placeholder-thinkpad-e14.jpg',
  'La ThinkPad E14 con Intel i5 de 13va generacion y teclado de clase empresarial. Ideal para quien escribe mucho y necesita bateria duradera.'
);

INSERT INTO laptops (
  name, brand, price, cpu, ram, gpu, storage, os, screen_size, weight, battery,
  simplified_tags, usage_profiles, influencer_note, recommendation_score,
  affiliate_link, image_url, description
) VALUES (
  'Samsung Galaxy Book3',
  'Samsung',
  250000,
  'Intel Core i3-1315U',
  '8GB DDR4',
  'Intel UHD',
  '256GB SSD',
  'Windows 11',
  '15.6" FHD',
  '1.58 kg',
  'Up to 8h',
  ARRAY['Pantalla Full HD', 'Diseno elegante', 'Buena para empezar'],
  ARRAY['productividad_estudio'],
  'Bonita, liviana y con pantalla Full HD. Samsung hace notebooks lindas y esta no decepciona.',
  7,
  'https://www.mercadolibre.com.ar/s?q=Samsung+Galaxy+Book3',
  'https://http2.mlstatic.com/D_NQ_NP_placeholder-samsung-galaxybook3.jpg',
  'Notebook elegante de Samsung con pantalla Full HD y diseno premium. Liviana y bonita, perfecta para el dia a dia universitario.'
);

-- ============================================================
-- CREACION_DESARROLLO segment (7 laptops)
-- ============================================================

INSERT INTO laptops (
  name, brand, price, cpu, ram, gpu, storage, os, screen_size, weight, battery,
  simplified_tags, usage_profiles, influencer_note, recommendation_score,
  affiliate_link, image_url, description
) VALUES (
  'Asus VivoBook Pro 16 OLED',
  'Asus',
  950000,
  'AMD Ryzen 9 7945HX',
  '16GB DDR5',
  'NVIDIA RTX 4060',
  '512GB SSD',
  'Windows 11',
  '16" OLED',
  '1.9 kg',
  'Up to 6h',
  ARRAY['Pantalla OLED increible', 'RTX 4060', 'Ideal para diseno'],
  ARRAY['creacion_desarrollo'],
  'La pantalla OLED cambia todo. Colores reales para diseno, video y fotografia. La RTX 4060 es un plus enorme.',
  9,
  'https://www.mercadolibre.com.ar/s?q=Asus+VivoBook+Pro+16+OLED',
  'https://http2.mlstatic.com/D_NQ_NP_placeholder-asus-vivobook-pro16.jpg',
  'Pantalla OLED de 16 pulgadas con colores perfectos para diseno grafico y edicion de fotos. RTX 4060 para renderizado rapido.'
);

INSERT INTO laptops (
  name, brand, price, cpu, ram, gpu, storage, os, screen_size, weight, battery,
  simplified_tags, usage_profiles, influencer_note, recommendation_score,
  affiliate_link, image_url, description
) VALUES (
  'Lenovo Yoga Pro 7i',
  'Lenovo',
  680000,
  'Intel Core Ultra 5',
  '16GB LPDDR5',
  'Intel Arc',
  '512GB SSD',
  'Windows 11',
  '14"',
  '1.4 kg',
  'Up to 10h',
  ARRAY['Ultraliviana 2-en-1', 'Pantalla tactil', 'Ideal para creativos moviles'],
  ARRAY['creacion_desarrollo'],
  'Para los creativos que se mueven mucho. 1.4 kg, pantalla tactil y buena GPU integrada.',
  8,
  'https://www.mercadolibre.com.ar/s?q=Lenovo+Yoga+Pro+7i',
  'https://http2.mlstatic.com/D_NQ_NP_placeholder-lenovo-yoga-pro7i.jpg',
  'Ultrabook 2-en-1 con pantalla tactil y Intel Core Ultra. Liviana y versatil para creativos que trabajan en movimiento.'
);

INSERT INTO laptops (
  name, brand, price, cpu, ram, gpu, storage, os, screen_size, weight, battery,
  simplified_tags, usage_profiles, influencer_note, recommendation_score,
  affiliate_link, image_url, description
) VALUES (
  'HP Envy x360 15',
  'HP',
  760000,
  'AMD Ryzen 7 8840U',
  '16GB DDR5',
  'AMD Radeon 780M',
  '512GB SSD',
  'Windows 11',
  '15.6" OLED',
  '1.9 kg',
  'Up to 7h',
  ARRAY['Pantalla OLED', 'Convertible 360', 'Potencia creativa'],
  ARRAY['creacion_desarrollo'],
  'Convertible con pantalla OLED. Dibuja con el stylus, edita video, hace de todo.',
  8,
  'https://www.mercadolibre.com.ar/s?q=HP+Envy+x360+15+Ryzen+7',
  'https://http2.mlstatic.com/D_NQ_NP_placeholder-hp-envy-x360-15.jpg',
  'Convertible 360 grados con pantalla OLED y Ryzen 7. Perfecta para ilustradores y editores de contenido en movimiento.'
);

INSERT INTO laptops (
  name, brand, price, cpu, ram, gpu, storage, os, screen_size, weight, battery,
  simplified_tags, usage_profiles, influencer_note, recommendation_score,
  affiliate_link, image_url, description
) VALUES (
  'Dell XPS 15 9530',
  'Dell',
  1400000,
  'Intel Core i7-13700H',
  '16GB DDR5',
  'NVIDIA RTX 4060',
  '512GB SSD',
  'Windows 11',
  '15.6" OLED 3.5K',
  '1.86 kg',
  'Up to 8h',
  ARRAY['Pantalla 3.5K OLED', 'Construccion premium', 'La mejor de Dell'],
  ARRAY['creacion_desarrollo'],
  'La XPS es la laptop premium de Dell. Pantalla OLED 3.5K que deja a todos con la boca abierta.',
  9,
  'https://www.mercadolibre.com.ar/s?q=Dell+XPS+15+9530',
  'https://http2.mlstatic.com/D_NQ_NP_placeholder-dell-xps15-9530.jpg',
  'La notebook premium de Dell con pantalla OLED 3.5K de 15.6 pulgadas. RTX 4060 para profesionales de diseno y video.'
);

INSERT INTO laptops (
  name, brand, price, cpu, ram, gpu, storage, os, screen_size, weight, battery,
  simplified_tags, usage_profiles, influencer_note, recommendation_score,
  affiliate_link, image_url, description
) VALUES (
  'MacBook Pro M3 14"',
  'Apple',
  1900000,
  'Apple M3 Pro',
  '18GB Unified',
  '18-core GPU',
  '512GB SSD',
  'macOS Sequoia',
  '14.2" Liquid Retina XDR',
  '1.61 kg',
  'Up to 17h',
  ARRAY['Potencia profesional', 'Pantalla XDR', 'El sueno del creativo'],
  ARRAY['creacion_desarrollo'],
  'El rey de la creacion de contenido. Video 4K, desarrollo, diseno — lo que le tires lo maneja.',
  10,
  'https://www.amazon.com/s?k=MacBook+Pro+M3+14',
  'https://http2.mlstatic.com/D_NQ_NP_placeholder-macbook-pro-m3-14.jpg',
  'La MacBook Pro con chip M3 Pro y pantalla Liquid Retina XDR de 14.2 pulgadas. El estandar de la industria para creadores de contenido profesional.'
);

INSERT INTO laptops (
  name, brand, price, cpu, ram, gpu, storage, os, screen_size, weight, battery,
  simplified_tags, usage_profiles, influencer_note, recommendation_score,
  affiliate_link, image_url, description
) VALUES (
  'Asus ZenBook 14 OLED',
  'Asus',
  480000,
  'Intel Core i5-1340P',
  '16GB LPDDR5',
  'Intel Iris Xe',
  '512GB SSD',
  'Windows 11',
  '14" OLED',
  '1.39 kg',
  'Up to 9h',
  ARRAY['OLED accesible', 'Compacta y potente', 'Para programadores'],
  ARRAY['creacion_desarrollo'],
  'OLED a buen precio. Ideal para devs que quieren buena pantalla sin vender un rinon.',
  8,
  'https://www.mercadolibre.com.ar/s?q=Asus+ZenBook+14+OLED',
  'https://http2.mlstatic.com/D_NQ_NP_placeholder-asus-zenbook14-oled.jpg',
  'ZenBook ultra compacta con pantalla OLED de 14 pulgadas. Perfecta para programadores que pasan horas frente a la pantalla.'
);

INSERT INTO laptops (
  name, brand, price, cpu, ram, gpu, storage, os, screen_size, weight, battery,
  simplified_tags, usage_profiles, influencer_note, recommendation_score,
  affiliate_link, image_url, description
) VALUES (
  'Lenovo IdeaPad Creator 5',
  'Lenovo',
  520000,
  'AMD Ryzen 5 7535HS',
  '16GB DDR5',
  'NVIDIA RTX 3050',
  '512GB SSD',
  'Windows 11',
  '16" FHD',
  '2.0 kg',
  'Up to 7h',
  ARRAY['GPU dedicada accesible', 'Pantalla grande', 'Primer paso creativo'],
  ARRAY['creacion_desarrollo'],
  'RTX 3050 a buen precio. No es la mas potente pero alcanza para edicion basica y 3D liviano.',
  7,
  'https://www.mercadolibre.com.ar/s?q=Lenovo+IdeaPad+Creator+5',
  'https://http2.mlstatic.com/D_NQ_NP_placeholder-lenovo-creator5.jpg',
  'Notebook creativa con Ryzen 5 y RTX 3050 a precio accesible. Ideal para estudiantes de diseno que dan sus primeros pasos en edicion.'
);

-- ============================================================
-- GAMING_RENDIMIENTO segment (7 laptops)
-- ============================================================

INSERT INTO laptops (
  name, brand, price, cpu, ram, gpu, storage, os, screen_size, weight, battery,
  simplified_tags, usage_profiles, influencer_note, recommendation_score,
  affiliate_link, image_url, description
) VALUES (
  'Lenovo IdeaPad Gaming 3 Gen 7',
  'Lenovo',
  500000,
  'AMD Ryzen 5 6600H',
  '16GB DDR5',
  'NVIDIA RTX 3050',
  '512GB SSD',
  'Windows 11',
  '15.6" FHD 120Hz',
  '2.2 kg',
  'Up to 5h',
  ARRAY['Gaming accesible', 'Pantalla 120Hz', 'Buen primer paso gamer'],
  ARRAY['gaming_rendimiento'],
  'La puerta de entrada al gaming. RTX 3050 mueve los juegos populares a seteos medios sin problema.',
  7,
  'https://www.mercadolibre.com.ar/s?q=Lenovo+IdeaPad+Gaming+3+Gen+7',
  'https://http2.mlstatic.com/D_NQ_NP_placeholder-lenovo-gaming3.jpg',
  'La notebook gaming de entrada mas recomendada de Lenovo. RTX 3050 y pantalla 120Hz para Fortnite, Minecraft y CS2 sin problemas.'
);

INSERT INTO laptops (
  name, brand, price, cpu, ram, gpu, storage, os, screen_size, weight, battery,
  simplified_tags, usage_profiles, influencer_note, recommendation_score,
  affiliate_link, image_url, description
) VALUES (
  'Acer Nitro 5 AN515',
  'Acer',
  650000,
  'AMD Ryzen 5 7535HS',
  '16GB DDR5',
  'NVIDIA RTX 4050',
  '512GB SSD',
  'Windows 11',
  '15.6" FHD 144Hz',
  '2.5 kg',
  'Up to 5h',
  ARRAY['RTX 4050', 'Pantalla 144Hz', 'Gaming serio'],
  ARRAY['gaming_rendimiento'],
  'RTX 4050 y 144Hz. Aca ya jugamos en serio. Fortnite, Valorant, todo al maximo.',
  8,
  'https://www.mercadolibre.com.ar/s?q=Acer+Nitro+5+AN515+RTX+4050',
  'https://http2.mlstatic.com/D_NQ_NP_placeholder-acer-nitro5.jpg',
  'Acer Nitro 5 con RTX 4050 y pantalla 144Hz. El salto de calidad que los gamers serios necesitan para jugar en alto rendimiento.'
);

INSERT INTO laptops (
  name, brand, price, cpu, ram, gpu, storage, os, screen_size, weight, battery,
  simplified_tags, usage_profiles, influencer_note, recommendation_score,
  affiliate_link, image_url, description
) VALUES (
  'HP Victus 16',
  'HP',
  550000,
  'Intel Core i7-12650H',
  '16GB DDR4',
  'NVIDIA RTX 3050 Ti',
  '512GB SSD',
  'Windows 11',
  '16.1" FHD 144Hz',
  '2.37 kg',
  'Up to 5h',
  ARRAY['Pantalla grande gamer', 'Intel i7', 'Buena relacion precio'],
  ARRAY['gaming_rendimiento'],
  'HP Victus: pantalla de 16 pulgadas, 144Hz y RTX 3050 Ti. Solida para gaming casual y competitivo.',
  7,
  'https://www.mercadolibre.com.ar/s?q=HP+Victus+16+i7+RTX',
  'https://http2.mlstatic.com/D_NQ_NP_placeholder-hp-victus16.jpg',
  'HP Victus con pantalla de 16 pulgadas a 144Hz e Intel Core i7. Una gaming notebook grande y potente a precio razonable.'
);

INSERT INTO laptops (
  name, brand, price, cpu, ram, gpu, storage, os, screen_size, weight, battery,
  simplified_tags, usage_profiles, influencer_note, recommendation_score,
  affiliate_link, image_url, description
) VALUES (
  'Asus TUF Gaming A15 2024',
  'Asus',
  850000,
  'AMD Ryzen 7 7745HX',
  '16GB DDR5',
  'NVIDIA RTX 4060',
  '512GB SSD',
  'Windows 11',
  '15.6" FHD 144Hz',
  '2.2 kg',
  'Up to 6h',
  ARRAY['RTX 4060 gamer', 'Construccion militar', 'Para jugar en serio'],
  ARRAY['gaming_rendimiento'],
  'TUF es sinonimo de durabilidad. RTX 4060 para gaming AAA sin problemas. De las mejores en su rango.',
  9,
  'https://www.mercadolibre.com.ar/s?q=Asus+TUF+Gaming+A15+2024',
  'https://http2.mlstatic.com/D_NQ_NP_placeholder-asus-tuf-a15.jpg',
  'Asus TUF Gaming con certificacion militar y RTX 4060. Resistente, potente y capaz de correr cualquier juego AAA sin problemas.'
);

INSERT INTO laptops (
  name, brand, price, cpu, ram, gpu, storage, os, screen_size, weight, battery,
  simplified_tags, usage_profiles, influencer_note, recommendation_score,
  affiliate_link, image_url, description
) VALUES (
  'Asus ROG Strix G15',
  'Asus',
  1200000,
  'AMD Ryzen 9 6900HX',
  '32GB DDR5',
  'NVIDIA RTX 3070 Ti',
  '1TB SSD',
  'Windows 11',
  '15.6" QHD 240Hz',
  '2.3 kg',
  'Up to 5h',
  ARRAY['32GB RAM', 'Pantalla QHD 240Hz', 'Gaming premium'],
  ARRAY['gaming_rendimiento'],
  '32GB de RAM, QHD a 240Hz y RTX 3070 Ti. Para los que quieren lo mejor sin llegar al tope de precio.',
  9,
  'https://www.mercadolibre.com.ar/s?q=Asus+ROG+Strix+G15+RTX+3070',
  'https://http2.mlstatic.com/D_NQ_NP_placeholder-asus-rog-strix-g15.jpg',
  'ROG Strix con Ryzen 9, 32GB de RAM y pantalla QHD a 240Hz. Para gamers que exigen la mejor experiencia visual posible.'
);

INSERT INTO laptops (
  name, brand, price, cpu, ram, gpu, storage, os, screen_size, weight, battery,
  simplified_tags, usage_profiles, influencer_note, recommendation_score,
  affiliate_link, image_url, description
) VALUES (
  'Lenovo Legion 5 Pro',
  'Lenovo',
  1450000,
  'AMD Ryzen 7 7745HX',
  '16GB DDR5',
  'NVIDIA RTX 4070',
  '512GB SSD',
  'Windows 11',
  '16" WQXGA 165Hz',
  '2.49 kg',
  'Up to 5h',
  ARRAY['RTX 4070', 'Pantalla WQXGA', 'La bestia gamer'],
  ARRAY['gaming_rendimiento'],
  'La Legion 5 Pro es la notebook gamer mas popular por algo. RTX 4070 y pantalla WQXGA de 165Hz. Un monstruo.',
  10,
  'https://www.mercadolibre.com.ar/s?q=Lenovo+Legion+5+Pro+RTX+4070',
  'https://http2.mlstatic.com/D_NQ_NP_placeholder-lenovo-legion5pro.jpg',
  'La Legion 5 Pro es el estandar de las gaming notebooks. RTX 4070 y pantalla WQXGA de 165Hz para gaming competitivo de elite.'
);

INSERT INTO laptops (
  name, brand, price, cpu, ram, gpu, storage, os, screen_size, weight, battery,
  simplified_tags, usage_profiles, influencer_note, recommendation_score,
  affiliate_link, image_url, description
) VALUES (
  'MSI Katana 15',
  'MSI',
  580000,
  'Intel Core i5-12450H',
  '16GB DDR5',
  'NVIDIA RTX 4050',
  '512GB SSD',
  'Windows 11',
  '15.6" FHD 144Hz',
  '2.25 kg',
  'Up to 5h',
  ARRAY['RTX 4050 accesible', 'Diseno gamer sutil', 'Buen rendimiento'],
  ARRAY['gaming_rendimiento'],
  'MSI Katana a buen precio con RTX 4050. Diseño mas sutil que otras gaming, la podes llevar a la facu.',
  7,
  'https://www.mercadolibre.com.ar/s?q=MSI+Katana+15+RTX+4050',
  'https://http2.mlstatic.com/D_NQ_NP_placeholder-msi-katana15.jpg',
  'MSI Katana con RTX 4050 y diseno mas discreto que otras gaming. Ideal para el gamer universitario que tambien la lleva a clases.'
);

-- Verification: run these to confirm seed data
-- SELECT count(*) FROM laptops; -- should return 22
-- SELECT p, count(*) FROM laptops, unnest(usage_profiles) AS p GROUP BY p;
-- SELECT brand, count(*) FROM laptops GROUP BY brand ORDER BY count(*) DESC;
