-- ================================================================
-- SHOPFLOW SEED — TechHub Demo Store + 20 Productos Electrónica
-- ================================================================
--
-- ANTES DE EJECUTAR:
--   1. Ve a Authentication → Users en tu proyecto Supabase
--   2. Crea (o copia el UUID de) el usuario que será dueño de la tienda demo
--   3. Reemplaza el UUID de v_owner_id con ese UUID
--
-- El v_store_id puede dejarse como está o cambiarse a cualquier UUID válido.
-- ================================================================

do $$
declare
  v_owner_id  uuid := '9e8b17e3-64c6-46ab-9989-dbbfe752e161'; -- ← CAMBIA ESTE UUID
  v_store_id  uuid := '00000000-0000-0000-0000-000000000010';
  v_cat_smartphones uuid;
  v_cat_laptops     uuid;
  v_cat_audio       uuid;
  v_cat_tablets     uuid;
  v_cat_gaming      uuid;
  v_cat_accesorios  uuid;
  v_cat_camaras     uuid;
  v_cat_smarthome   uuid;
begin

-- ============================================================
-- STORE: TechHub
-- ============================================================
insert into stores (id, owner_id, slug, name, description, currency, country, theme,
  contact, social, is_active, onboarding_completed)
values (
  v_store_id,
  v_owner_id,
  'techhub',
  'TechHub',
  'Tu destino de tecnología premium. Los mejores gadgets, laptops, smartphones y accesorios al mejor precio.',
  'USD',
  'PE',
  '{"primary":"#6366f1","secondary":"#06b6d4","accent":"#f59e0b","font":"inter"}',
  '{"email":"hola@techhub.pe","phone":"+51 999 123 456","whatsapp":"+51999123456","address":"Av. Javier Prado 123, Lima, Perú"}',
  '{"instagram":"@techhubpe","facebook":"techhubpe","tiktok":"@techhubpe"}',
  true,
  true
) on conflict (slug) do nothing;

-- ============================================================
-- CATEGORIES
-- ============================================================
insert into categories (id, store_id, name, slug, image_url, description, sort_order)
values
  (gen_random_uuid(), v_store_id, 'Smartphones', 'smartphones',
   'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
   'Los últimos modelos de las mejores marcas', 1)
returning id into v_cat_smartphones;

insert into categories (id, store_id, name, slug, image_url, description, sort_order)
values
  (gen_random_uuid(), v_store_id, 'Laptops', 'laptops',
   'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
   'Portátiles para trabajo y gaming', 2)
returning id into v_cat_laptops;

insert into categories (id, store_id, name, slug, image_url, description, sort_order)
values
  (gen_random_uuid(), v_store_id, 'Audio', 'audio',
   'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
   'Auriculares y parlantes de alta fidelidad', 3)
returning id into v_cat_audio;

insert into categories (id, store_id, name, slug, image_url, description, sort_order)
values
  (gen_random_uuid(), v_store_id, 'Tablets', 'tablets',
   'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80',
   'Tablets para trabajo y entretenimiento', 4)
returning id into v_cat_tablets;

insert into categories (id, store_id, name, slug, image_url, description, sort_order)
values
  (gen_random_uuid(), v_store_id, 'Gaming', 'gaming',
   'https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=800&q=80',
   'Consolas y accesorios gaming', 5)
returning id into v_cat_gaming;

insert into categories (id, store_id, name, slug, image_url, description, sort_order)
values
  (gen_random_uuid(), v_store_id, 'Accesorios', 'accesorios',
   'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80',
   'Cargadores, cables y más', 6)
returning id into v_cat_accesorios;

insert into categories (id, store_id, name, slug, image_url, description, sort_order)
values
  (gen_random_uuid(), v_store_id, 'Cámaras', 'camaras',
   'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
   'Cámaras y accesorios fotográficos', 7)
returning id into v_cat_camaras;

insert into categories (id, store_id, name, slug, image_url, description, sort_order)
values
  (gen_random_uuid(), v_store_id, 'Smart Home', 'smart-home',
   'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
   'Domótica y hogar inteligente', 8)
returning id into v_cat_smarthome;

-- ============================================================
-- PRODUCTS — Smartphones
-- ============================================================
insert into products (store_id, category_id, name, slug, description, short_desc,
  price, compare_price, stock, sku, images, tags, attributes, is_active, is_featured)
values
(v_store_id, v_cat_smartphones,
 'iPhone 15 Pro', 'iphone-15-pro',
 'El iPhone más potente hasta la fecha. Chip A17 Pro con arquitectura de 3 nm, marco de titanio grado 5, cámara de 48MP con zoom óptico 5x y Dynamic Island.',
 'Chip A17 Pro · Marco titanio · Cámara 48MP · Dynamic Island',
 1199.00, 1299.00, 25, 'APL-IP15P-256-NT',
 '[{"url":"https://images.unsplash.com/photo-1694985792571-5f6d741e4a9e?w=800&q=80","alt":"iPhone 15 Pro Natural Titanium","is_primary":true},{"url":"https://images.unsplash.com/photo-1696446701796-da61c2b0b9a4?w=800&q=80","alt":"iPhone 15 Pro pantalla","is_primary":false}]',
 ARRAY['apple','iphone','smartphone','5g','titanio','a17pro'],
 '{"marca":"Apple","modelo":"iPhone 15 Pro","almacenamiento":"256GB","color":"Natural Titanium","pantalla":"6.1 pulgadas","batería":"3274 mAh","sistema":"iOS 17"}',
 true, true),

(v_store_id, v_cat_smartphones,
 'Samsung Galaxy S24 Ultra', 'samsung-galaxy-s24-ultra',
 'El flagship definitivo de Samsung. Pantalla Dynamic AMOLED 2X de 6.8", S Pen integrado, cámara de 200MP, procesador Snapdragon 8 Gen 3.',
 'S Pen integrado · Cámara 200MP · Snapdragon 8 Gen 3 · 6.8"',
 1099.00, 1199.00, 18, 'SAM-S24U-256-TI',
 '[{"url":"https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80","alt":"Samsung S24 Ultra Titanium","is_primary":true}]',
 ARRAY['samsung','galaxy','smartphone','s-pen','200mp','5g'],
 '{"marca":"Samsung","modelo":"Galaxy S24 Ultra","almacenamiento":"256GB","color":"Titanium Black","pantalla":"6.8 pulgadas","batería":"5000 mAh","sistema":"Android 14"}',
 true, true),

(v_store_id, v_cat_smartphones,
 'Google Pixel 8 Pro', 'google-pixel-8-pro',
 'El smartphone con la mejor IA del mercado. Google Tensor G3, cámara de 50MP con Magic Eraser y Best Take, 7 años de actualizaciones garantizadas.',
 'Google Tensor G3 · IA avanzada · 7 años actualizaciones',
 899.00, 999.00, 12, 'GOO-PX8P-128-OB',
 '[{"url":"https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&q=80","alt":"Google Pixel 8 Pro Obsidian","is_primary":true}]',
 ARRAY['google','pixel','smartphone','ia','tensor','5g'],
 '{"marca":"Google","modelo":"Pixel 8 Pro","almacenamiento":"128GB","color":"Obsidian","pantalla":"6.7 pulgadas","batería":"5050 mAh","sistema":"Android 14"}',
 true, false),

(v_store_id, v_cat_smartphones,
 'Xiaomi 14 Ultra', 'xiaomi-14-ultra',
 'Colaboración entre Xiaomi y Leica. Cámara Leica Summilux de 1 pulgada, Snapdragon 8 Gen 3, pantalla AMOLED 6.73" con 120Hz adaptativo.',
 'Lente Leica 1" · Snapdragon 8 Gen 3 · 90W HyperCharge',
 999.00, 1099.00, 8, 'XIA-14U-512-BK',
 '[{"url":"https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&q=80","alt":"Xiaomi 14 Ultra Black","is_primary":true}]',
 ARRAY['xiaomi','leica','smartphone','ultra','snapdragon','5g'],
 '{"marca":"Xiaomi","modelo":"14 Ultra","almacenamiento":"512GB","color":"Black","pantalla":"6.73 pulgadas","batería":"5000 mAh","sistema":"Android 14 + HyperOS"}',
 true, false);

-- ============================================================
-- PRODUCTS — Laptops
-- ============================================================
insert into products (store_id, category_id, name, slug, description, short_desc,
  price, compare_price, stock, sku, images, tags, attributes, is_active, is_featured)
values
(v_store_id, v_cat_laptops,
 'MacBook Pro 14" M3', 'macbook-pro-14-m3',
 'El portátil más avanzado de Apple. Chip M3 de 8 núcleos CPU, pantalla Liquid Retina XDR 14.2", hasta 22h de batería, MagSafe 3.',
 'Chip M3 · Liquid Retina XDR · 22h batería · MagSafe 3',
 1999.00, 2199.00, 10, 'APL-MBP14-M3-8G',
 '[{"url":"https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80","alt":"MacBook Pro 14 Space Black","is_primary":true}]',
 ARRAY['apple','macbook','laptop','m3','macos','profesional'],
 '{"marca":"Apple","modelo":"MacBook Pro 14","procesador":"Apple M3","ram":"8GB","almacenamiento":"512GB SSD","pantalla":"14.2 Liquid Retina XDR","sistema":"macOS Sonoma"}',
 true, true),

(v_store_id, v_cat_laptops,
 'Dell XPS 15 (2024)', 'dell-xps-15-2024',
 'El portátil Windows más premium. Intel Core Ultra 9, pantalla OLED 3.5K touchscreen, NVIDIA RTX 4070, 64GB RAM, diseño ultrafino.',
 'Core Ultra 9 · OLED 3.5K · RTX 4070 · 64GB RAM',
 2199.00, 2499.00, 6, 'DEL-XPS15-9530-64',
 '[{"url":"https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80","alt":"Dell XPS 15","is_primary":true}]',
 ARRAY['dell','xps','laptop','oled','rtx4070','profesional'],
 '{"marca":"Dell","modelo":"XPS 15 9530","procesador":"Intel Core Ultra 9","ram":"64GB DDR5","almacenamiento":"2TB SSD","gráfica":"NVIDIA RTX 4070","pantalla":"15.6 OLED 3.5K"}',
 true, false),

(v_store_id, v_cat_laptops,
 'ASUS ROG Zephyrus G14', 'asus-rog-zephyrus-g14',
 'El gaming laptop más equilibrado. AMD Ryzen 9 8945HS, RTX 4070 8GB, pantalla QHD+ 165Hz, 18h batería, diseño AniMe Matrix lid.',
 'Ryzen 9 8945HS · RTX 4070 · QHD+ 165Hz · 18h batería',
 1799.00, 1999.00, 9, 'ASU-ROG-G14-2024',
 '[{"url":"https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80","alt":"ASUS ROG Zephyrus G14","is_primary":true}]',
 ARRAY['asus','rog','laptop','gaming','rtx4070','ryzen9'],
 '{"marca":"ASUS","modelo":"ROG Zephyrus G14 2024","procesador":"AMD Ryzen 9 8945HS","ram":"32GB DDR5","almacenamiento":"1TB SSD","gráfica":"NVIDIA RTX 4070","pantalla":"14 QHD+ 165Hz"}',
 true, true);

-- ============================================================
-- PRODUCTS — Audio
-- ============================================================
insert into products (store_id, category_id, name, slug, description, short_desc,
  price, compare_price, stock, sku, images, tags, attributes, is_active, is_featured)
values
(v_store_id, v_cat_audio,
 'Sony WH-1000XM5', 'sony-wh-1000xm5',
 'Los mejores auriculares con cancelación de ruido del mercado. 8 micrófonos, 30h batería, procesador HD QN1, diseño plegable, llamadas manos libres.',
 'ANC líder · 30h batería · 8 micrófonos · Diseño plegable',
 349.00, 399.00, 30, 'SNY-WH1000XM5-BK',
 '[{"url":"https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80","alt":"Sony WH-1000XM5 Black","is_primary":true}]',
 ARRAY['sony','auriculares','anc','bluetooth','noise-cancelling','headphones'],
 '{"marca":"Sony","modelo":"WH-1000XM5","color":"Black","conectividad":"Bluetooth 5.2","batería":"30 horas","cancelación":"ANC adaptativo","códecs":"LDAC, AAC, SBC"}',
 true, true),

(v_store_id, v_cat_audio,
 'AirPods Pro 2da Gen', 'airpods-pro-2',
 'La experiencia de audio premium de Apple. Chip H2, ANC adaptativo, audio espacial personalizado, resistencia al agua IPX4, estuche con altavoz.',
 'Chip H2 · ANC adaptativo · Audio espacial · IPX4',
 249.00, 279.00, 45, 'APL-APP2-MQD83',
 '[{"url":"https://images.unsplash.com/photo-1588423771073-b8903fead714?w=800&q=80","alt":"AirPods Pro 2","is_primary":true}]',
 ARRAY['apple','airpods','auriculares','anc','bluetooth','ios'],
 '{"marca":"Apple","modelo":"AirPods Pro 2da Gen","color":"White","conectividad":"Bluetooth 5.3","batería":"6h (30h con estuche)","resistencia":"IPX4","chip":"H2"}',
 true, true),

(v_store_id, v_cat_audio,
 'JBL Charge 5', 'jbl-charge-5',
 'Parlante Bluetooth portátil con batería powerbank integrada. IP67 resistente al agua y polvo, 20h de reproducción, sonido JBL Pro con graves potentes.',
 'IP67 · 20h batería · Powerbank integrado · JBL Pro Sound',
 179.00, 199.00, 22, 'JBL-CHG5-BK',
 '[{"url":"https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80","alt":"JBL Charge 5 Black","is_primary":true}]',
 ARRAY['jbl','parlante','bluetooth','portatil','ip67','waterproof'],
 '{"marca":"JBL","modelo":"Charge 5","color":"Black","conectividad":"Bluetooth 5.1","batería":"20 horas","resistencia":"IP67","potencia":"30W RMS"}',
 true, false);

-- ============================================================
-- PRODUCTS — Tablets
-- ============================================================
insert into products (store_id, category_id, name, slug, description, short_desc,
  price, compare_price, stock, sku, images, tags, attributes, is_active, is_featured)
values
(v_store_id, v_cat_tablets,
 'iPad Pro 12.9" M2', 'ipad-pro-129-m2',
 'La tablet más potente del mercado. Chip M2, pantalla Liquid Retina XDR con ProMotion 120Hz, compatible con Apple Pencil 2 y Magic Keyboard, USB-C Thunderbolt 4.',
 'Chip M2 · Liquid Retina XDR 12.9" · Thunderbolt 4 · ProMotion',
 1099.00, 1199.00, 14, 'APL-IPP129-M2-256',
 '[{"url":"https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80","alt":"iPad Pro 12.9 M2 Space Gray","is_primary":true}]',
 ARRAY['apple','ipad','tablet','m2','profesional','dibujo'],
 '{"marca":"Apple","modelo":"iPad Pro 12.9 6ta Gen","procesador":"Apple M2","almacenamiento":"256GB","pantalla":"12.9 Liquid Retina XDR","conectividad":"Wi-Fi + 5G","sistema":"iPadOS 17"}',
 true, true),

(v_store_id, v_cat_tablets,
 'Samsung Galaxy Tab S9 Ultra', 'samsung-galaxy-tab-s9-ultra',
 'La tablet Android definitiva. Pantalla Dynamic AMOLED 14.6", S Pen incluido, Snapdragon 8 Gen 2, 12GB RAM, batería 11200mAh, diseño ultra-fino de 5.5mm.',
 'AMOLED 14.6" · S Pen incluido · Snapdragon 8 Gen 2 · 11200mAh',
 999.00, 1099.00, 7, 'SAM-TAB-S9U-256',
 '[{"url":"https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&q=80","alt":"Samsung Tab S9 Ultra Graphite","is_primary":true}]',
 ARRAY['samsung','tablet','s-pen','amoled','android','productividad'],
 '{"marca":"Samsung","modelo":"Galaxy Tab S9 Ultra","procesador":"Snapdragon 8 Gen 2","ram":"12GB","almacenamiento":"256GB","pantalla":"14.6 Dynamic AMOLED 2X","sistema":"Android 13 + One UI 5.1"}',
 true, false);

-- ============================================================
-- PRODUCTS — Gaming
-- ============================================================
insert into products (store_id, category_id, name, slug, description, short_desc,
  price, compare_price, stock, sku, images, tags, attributes, is_active, is_featured)
values
(v_store_id, v_cat_gaming,
 'PlayStation 5 Slim', 'playstation-5-slim',
 'La última versión de PS5. Diseño compacto 30% más pequeño, misma potencia que el original, lector de discos extraíble opcional, 1TB SSD.',
 'Diseño compacto · 1TB SSD · Lector extraíble · 4K 120fps',
 449.00, 499.00, 15, 'SNY-PS5-SLIM-W',
 '[{"url":"https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&q=80","alt":"PlayStation 5 Slim White","is_primary":true}]',
 ARRAY['sony','ps5','consola','gaming','4k','playstation'],
 '{"marca":"Sony","modelo":"PlayStation 5 Slim","almacenamiento":"1TB SSD","resolución":"4K 120fps","conectividad":"Wi-Fi 6 + Bluetooth 5.1","color":"White"}',
 true, true),

(v_store_id, v_cat_gaming,
 'Xbox Series X', 'xbox-series-x',
 'La consola más potente de Microsoft. 12 teraflops de GPU, 1TB NVMe SSD, retrocompatible con miles de juegos Xbox, Game Pass compatible.',
 '12 TFLOPS · 1TB NVMe · 4K 120fps · Quick Resume',
 499.00, 549.00, 11, 'MSF-XSX-1TB-BK',
 '[{"url":"https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800&q=80","alt":"Xbox Series X Black","is_primary":true}]',
 ARRAY['microsoft','xbox','consola','gaming','4k','game-pass'],
 '{"marca":"Microsoft","modelo":"Xbox Series X","almacenamiento":"1TB SSD Custom NVMe","resolución":"4K 120fps","conectividad":"Wi-Fi 5 + Bluetooth 5.0","color":"Black"}',
 true, false);

-- ============================================================
-- PRODUCTS — Accesorios
-- ============================================================
insert into products (store_id, category_id, name, slug, description, short_desc,
  price, compare_price, stock, sku, images, tags, attributes, is_active, is_featured)
values
(v_store_id, v_cat_accesorios,
 'Anker 67W GaN Charger', 'anker-67w-gan-charger',
 'Cargador compacto GaN de 3 puertos. 2x USB-C + 1x USB-A, 67W total, tamaño de un cargador de 20W, carga rápida iPhone 15 al 50% en 30min.',
 '67W total · 3 puertos · GaN · Tamaño mini',
 45.00, 59.00, 60, 'ANK-A2668-67W',
 '[{"url":"https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80","alt":"Anker 67W GaN Charger","is_primary":true}]',
 ARRAY['anker','cargador','gan','usb-c','carga-rapida','accesorio'],
 '{"marca":"Anker","modelo":"Nano Pro 67W","puertos":"2x USB-C + 1x USB-A","potencia":"67W total","tecnología":"GaN II","compatibilidad":"PD 3.0 / PPS / QC 4.0"}',
 true, false),

(v_store_id, v_cat_accesorios,
 'Apple MagSafe Charger', 'apple-magsafe-charger',
 'Carga inalámbrica magnética oficial de Apple. 15W de carga rápida para iPhone 12 y superior, alineación magnética perfecta, cable de 1 metro.',
 'Carga MagSafe 15W · Alineación magnética · Oficial Apple',
 39.00, 45.00, 80, 'APL-MHXH3-MAGSAFE',
 '[{"url":"https://images.unsplash.com/photo-1609592415292-2c3f03fb2cf8?w=800&q=80","alt":"Apple MagSafe Charger","is_primary":true}]',
 ARRAY['apple','magsafe','cargador','inalambrico','qi','iphone'],
 '{"marca":"Apple","modelo":"MagSafe Charger","potencia":"15W","compatibilidad":"iPhone 12 y superior","cable":"1 metro USB-C","tecnología":"MagSafe / Qi"}',
 true, false);

-- ============================================================
-- PRODUCTS — Cámaras
-- ============================================================
insert into products (store_id, category_id, name, slug, description, short_desc,
  price, compare_price, stock, sku, images, tags, attributes, is_active, is_featured)
values
(v_store_id, v_cat_camaras,
 'Sony Alpha a7 IV', 'sony-alpha-a7-iv',
 'Cámara mirrorless full-frame profesional. Sensor BSI-CMOS de 33MP, BIONZ XR, video 4K 60p, estabilización en 5 ejes, AF con IA de seguimiento.',
 '33MP Full-frame · 4K 60fps · AF con IA · IBIS 5 ejes',
 2499.00, 2799.00, 4, 'SNY-A7IV-BODY',
 '[{"url":"https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80","alt":"Sony Alpha a7 IV","is_primary":true}]',
 ARRAY['sony','camara','mirrorless','full-frame','4k','profesional','fotografia'],
 '{"marca":"Sony","modelo":"Alpha a7 IV","sensor":"33MP Full-frame BSI-CMOS","video":"4K 60fps","estabilización":"IBIS 5 ejes","montura":"Sony E","formato":"sin espejo"}',
 true, true),

(v_store_id, v_cat_camaras,
 'GoPro HERO12 Black', 'gopro-hero12-black',
 'La acción cam más avanzada. Video 5.3K 60fps, fotos 27MP, HyperSmooth 6.0, resistente al agua hasta 10m, TimeWarp 3.0, transmisión en vivo.',
 '5.3K 60fps · HyperSmooth 6.0 · 10m waterproof · 27MP',
 399.00, 449.00, 20, 'GPR-HERO12-BK',
 '[{"url":"https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80","alt":"GoPro HERO12 Black","is_primary":true}]',
 ARRAY['gopro','camara','accion','4k','waterproof','deporte','aventura'],
 '{"marca":"GoPro","modelo":"HERO12 Black","video":"5.3K 60fps","fotos":"27MP","estabilización":"HyperSmooth 6.0","resistencia":"10m waterproof","batería":"Enduro 1720mAh"}',
 true, false);

-- ============================================================
-- PRODUCTS — Smart Home
-- ============================================================
insert into products (store_id, category_id, name, slug, description, short_desc,
  price, compare_price, stock, sku, images, tags, attributes, is_active, is_featured)
values
(v_store_id, v_cat_smarthome,
 'Echo Show 10 (3ra Gen)', 'echo-show-10-3gen',
 'El altavoz inteligente con pantalla giratoria. Pantalla HD 10.1" que te sigue automáticamente, cámara 13MP, altavoz de alta fidelidad, Alexa integrado.',
 'Pantalla 10.1" giratoria · Alexa · Cámara 13MP · Smart Home hub',
 249.00, 299.00, 18, 'AMZ-ESHOW10-CH',
 '[{"url":"https://images.unsplash.com/photo-1512446816042-444d641267d4?w=800&q=80","alt":"Echo Show 10 Charcoal","is_primary":true}]',
 ARRAY['amazon','echo','alexa','smart-home','altavoz','inteligente'],
 '{"marca":"Amazon","modelo":"Echo Show 10 3ra Gen","pantalla":"10.1 HD","cámara":"13MP con seguimiento","audio":"altavoz 3\" + tweeter","conectividad":"Wi-Fi + Bluetooth","hub":"Zigbee, Sidewalk, Thread"}',
 true, false),

(v_store_id, v_cat_smarthome,
 'Ring Video Doorbell Pro 2', 'ring-doorbell-pro-2',
 'El timbre inteligente con radar 3D. Detección de movimiento con precisión 3D, video 1536p HDR, visión cabeza a los pies, alertas de zona inteligente.',
 '1536p HDR · Radar 3D · Detección movimiento · Alexa',
 249.00, 279.00, 13, 'RNG-VDB-PRO2-SL',
 '[{"url":"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80","alt":"Ring Doorbell Pro 2 Silver","is_primary":true}]',
 ARRAY['ring','amazon','timbre','seguridad','smart-home','video','alexa'],
 '{"marca":"Ring","modelo":"Video Doorbell Pro 2","video":"1536p HDR","detección":"Radar 3D + IA","visión":"Cabeza a los pies","conectividad":"Wi-Fi Dual Band","alimentación":"Cableado"}',
 true, false);

-- Actualizar contador de productos en la tienda
update stores set products_count = (
  select count(*) from products where store_id = v_store_id and is_active = true
) where id = v_store_id;

end $$;
