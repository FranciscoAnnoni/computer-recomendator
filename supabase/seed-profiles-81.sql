-- Phase 6: Seed 81 profiles with creative archetypes
-- workload x lifestyle x budget x os_preference = 3^4 = 81 rows
-- Names and descriptions reflect each archetype's personality and context.

INSERT INTO profiles (workload, lifestyle, budget, os_preference, laptop_ids, profile_name, profile_description)
VALUES

-- ─── PRODUCTIVIDAD & ESTUDIO ────────────────────────────────────────────────

-- maxima_portabilidad
('productividad_estudio', 'maxima_portabilidad', 'esencial', 'windows',
 '{}', 'El Estudiante Viajero',
 'Siempre con la mochila al hombro y el temario en la cabeza. Toma apuntes en el colectivo, estudia en la biblioteca y entrega trabajos desde cualquier lugar que tenga wifi.'),

('productividad_estudio', 'maxima_portabilidad', 'esencial', 'macos',
 '{}', 'El Becario con Gustos',
 'Su primer Mac lo consiguio con mucho esfuerzo y lo lleva a todos lados como si fuera de oro. Cafes, aulas y transporte publico son su oficina rotatoria.'),

('productividad_estudio', 'maxima_portabilidad', 'esencial', 'abierto',
 '{}', 'El Tesis en Linux',
 'Instalo una distro para la facu, escribe en LaTeX y no entiende por que sus companeros pagan licencias. La terminal es su mejor amiga y git su diario personal.'),

('productividad_estudio', 'maxima_portabilidad', 'equilibrado', 'windows',
 '{}', 'El Profesional Nomade',
 'Su oficina es cualquier lugar con enchufe. Trabaja desde cafes, aeropuertos y plazas sin que nada se lo impida. Nunca llega tarde a una reunion aunque este cruzando el pais.'),

('productividad_estudio', 'maxima_portabilidad', 'equilibrado', 'macos',
 '{}', 'El Freelancer de Cafe',
 'Tiene su playlist lista, el Mac abierto y el cafe caliente. Deliverables a tiempo sin importar desde que mesa trabaja. El ecosistema Apple le hace la vida mas facil.'),

('productividad_estudio', 'maxima_portabilidad', 'equilibrado', 'abierto',
 '{}', 'El Consultor Open Source',
 'Linux en la laptop, soluciones libres para el cliente y cero dependencias de licencias pagas. Trabaja rapido, viaja liviano y documenta todo en Markdown.'),

('productividad_estudio', 'maxima_portabilidad', 'premium', 'windows',
 '{}', 'El Ejecutivo Viajante',
 'Business class, sala VIP y Excel en vuelo. Todo tiene que funcionar perfecto a 10.000 metros. Un equipo que falla no entra en su vocabulario ni en su mochila.'),

('productividad_estudio', 'maxima_portabilidad', 'premium', 'macos',
 '{}', 'El Emprendedor Ligero',
 'Todo su negocio cabe en un MacBook Air. Lo abre en cualquier ciudad del mundo y en cinco minutos ya esta en reunion. Simple, rapido y sin friccion.'),

('productividad_estudio', 'maxima_portabilidad', 'premium', 'abierto',
 '{}', 'El Tech Lead Nomade',
 'Configuro su entorno de trabajo una vez y lo lleva consigo a donde sea. Sus dotfiles son su alma y su terminal, su refugio. Trabaja desde cualquier meridiano.'),

-- movil_flexible
('productividad_estudio', 'movil_flexible', 'esencial', 'windows',
 '{}', 'El Universitario Clasico',
 'Casa, facu y biblioteca. Windows lo conoce de toda la vida y no esta dispuesto a cambiar. Sus apuntes son un caos organizado que solo el entiende.'),

('productividad_estudio', 'movil_flexible', 'esencial', 'macos',
 '{}', 'El Estudiante Con Aspiraciones',
 'Hizo el esfuerzo de entrar al ecosistema Apple y no se arrepiente. Lleva el Mac cuando puede y en casa lo conecta al monitor que junto de regalo.'),

('productividad_estudio', 'movil_flexible', 'esencial', 'abierto',
 '{}', 'El Autodidacta Digital',
 'Todo lo aprendio de YouTube y Stack Overflow. Linux le da el control total que ningun otro sistema ofrece. Tiene cinco proyectos en paralelo y ninguno terminado.'),

('productividad_estudio', 'movil_flexible', 'equilibrado', 'windows',
 '{}', 'El Teletrabajador Hibrido',
 'Lunes en casa, miercoles en oficina. Windows porque el equipo de IT del trabajo no acepta otra cosa. Monitor en el escritorio y laptop para los dias de commute.'),

('productividad_estudio', 'movil_flexible', 'equilibrado', 'macos',
 '{}', 'El Profesional Apple',
 'Reuniones con el MacBook, AirPods siempre puestos y el ecosistema ya lo tiene atrapado. Esta bien con eso porque todo funciona sin pensar.'),

('productividad_estudio', 'movil_flexible', 'equilibrado', 'abierto',
 '{}', 'El Dev Full Stack',
 'VSCode, terminal y Docker: la santisima trinidad. Le da igual el sistema operativo mientras compile rapido y los containers levanten sin drama.'),

('productividad_estudio', 'movil_flexible', 'premium', 'windows',
 '{}', 'El Manager Productivo',
 'PowerPoints impecables, Excel avanzado y Teams que no cuelga jamas. Necesita performance sin compromisos y un equipo que este a la altura de sus reuniones.'),

('productividad_estudio', 'movil_flexible', 'premium', 'macos',
 '{}', 'El Profesional Premium',
 'MacBook Pro en la reunion, iPad en el vuelo, iPhone en la mano. Todo sincronizado sin esfuerzo. El ecosistema no es una eleccion, es un estilo de vida.'),

('productividad_estudio', 'movil_flexible', 'premium', 'abierto',
 '{}', 'El Arquitecto de Software',
 'Su equipo le envidia la terminal. Disena sistemas complejos en servilletas y los implementa antes del almuerzo. Tiene opiniones fuertes sobre todo y casi siempre tiene razon.'),

-- escritorio_fijo
('productividad_estudio', 'escritorio_fijo', 'esencial', 'windows',
 '{}', 'El Estudiante de Base',
 'Escritorio en casa, auriculares puestos y cuatro pestanas de Chrome abiertas. Trabaja practicos, estudia para parciales y mira series cuando termina. El orden es opcional.'),

('productividad_estudio', 'escritorio_fijo', 'esencial', 'macos',
 '{}', 'El Fanatico Apple Fijo',
 'Eligio Mac para estudiar aunque costara el doble. Lo tiene en el escritorio conectado a un monitor de segunda mano y no lo cambiaria por nada del mundo.'),

('productividad_estudio', 'escritorio_fijo', 'esencial', 'abierto',
 '{}', 'El Geek Estudiantil',
 'Dual boot, servidor casero y wiki personal en Obsidian. Estudia e investiga al mismo tiempo. Sus companeros le piden ayuda tecnica sin entender la mitad de lo que hace.'),

('productividad_estudio', 'escritorio_fijo', 'equilibrado', 'windows',
 '{}', 'El Teletrabajador Estable',
 'Monitor externo, teclado mecanico y mouse ergonomico. Trabaja desde casa como si fuera la oficina pero con el cafe que el quiere y sin codigo de vestimenta.'),

('productividad_estudio', 'escritorio_fijo', 'equilibrado', 'macos',
 '{}', 'El Creativo Fijo',
 'Notion, correos y Figma abiertos en simultaneo sin que nada se cuelgue. El Mac conectado al monitor es su centro de operaciones y no necesita mas.'),

('productividad_estudio', 'escritorio_fijo', 'equilibrado', 'abierto',
 '{}', 'El Sysadmin Hogareno',
 'Tres terminales abiertas, un servidor en la habitacion y bash scripts para todo lo automatizable. Su casa es un datacenter y el no lo cambiaria.'),

('productividad_estudio', 'escritorio_fijo', 'premium', 'windows',
 '{}', 'El Director de Proyecto',
 'Setup con dos monitores y nada que falle en produccion. Sus reportes son la envidia del equipo y sus presentaciones el estandar al que todos aspiran.'),

('productividad_estudio', 'escritorio_fijo', 'premium', 'macos',
 '{}', 'El Mac Devotee',
 'Mac Pro o MacBook Pro en base dock. No concibe trabajar con otra cosa y probablemente tenga razon. El ecosistema Apple es su entorno natural y no hay vuelta atras.'),

('productividad_estudio', 'escritorio_fijo', 'premium', 'abierto',
 '{}', 'El Ingeniero de Infraestructura',
 'Workstation Linux, clusters locales para pruebas y un cafe que nunca se enfria. Disena la arquitectura que mueve todo sin que nadie sepa su nombre.'),

-- ─── CREACION & DESARROLLO ──────────────────────────────────────────────────

-- maxima_portabilidad
('creacion_desarrollo', 'maxima_portabilidad', 'esencial', 'windows',
 '{}', 'El Disenador Ambulante',
 'Wireframes en el colectivo, referencias guardadas en el telefono y entrega desde donde sea. No necesita un setup perfecto para producir trabajo que impacta.'),

('creacion_desarrollo', 'maxima_portabilidad', 'esencial', 'macos',
 '{}', 'El Disenador Aspiracional',
 'Su primer Mac para crear. Lo lleva a todos lados como si fuera su portfolio fisico. Cada proyecto que sale de esa pantalla construye su camino profesional.'),

('creacion_desarrollo', 'maxima_portabilidad', 'esencial', 'abierto',
 '{}', 'El Dev Indie Portable',
 'Laptop liviana, un editor de texto y git. Commit desde el tren, push desde el cafe. El codigo no necesita un escritorio para existir.'),

('creacion_desarrollo', 'maxima_portabilidad', 'equilibrado', 'windows',
 '{}', 'El Desarrollador Viajero',
 'IDE en la mochila, sprint planning por video y PR mergeado antes del aterrizaje. El avion es tiempo productivo y el aeropuerto una sala de espera con wifi.'),

('creacion_desarrollo', 'maxima_portabilidad', 'equilibrado', 'macos',
 '{}', 'El Indie Dev Movil',
 'Apps construidas en aviones y cafeterias. La App Store como meta constante. El MacBook es su fabrica portatil y cada viaje puede ser el lanzamiento de algo nuevo.'),

('creacion_desarrollo', 'maxima_portabilidad', 'equilibrado', 'abierto',
 '{}', 'El Contributor Nomade',
 'PRs a repos open source desde aeropuertos y trenes. GitHub verde todos los dias del calendario. Contribuye porque le gusta, no porque alguien lo pide.'),

('creacion_desarrollo', 'maxima_portabilidad', 'premium', 'windows',
 '{}', 'El Creador en Movimiento',
 'Graba, edita y publica 4K en el viaje de vuelta. Su canal crece mientras viaja y su laptop es la unica herramienta que necesita para que eso pase.'),

('creacion_desarrollo', 'maxima_portabilidad', 'premium', 'macos',
 '{}', 'El Artista Digital Nomade',
 'MacBook Pro que es la envidia del coworking. El render termina antes que el cafe. Crea con la misma calidad desde Buenos Aires que desde Berlin.'),

('creacion_desarrollo', 'maxima_portabilidad', 'premium', 'abierto',
 '{}', 'El Full Stack Sin Fronteras',
 'Stack completo siempre disponible. Deploya desde cualquier red con VPN propia. No hay ciudad donde no pueda trabajar y no hay problema que no pueda resolver.'),

-- movil_flexible
('creacion_desarrollo', 'movil_flexible', 'esencial', 'windows',
 '{}', 'El Aprendiz de Codigo',
 'Cursos de Udemy, proyectos de practica y un sueno que algun dia va a ser una startup. Cada linea de codigo es un paso mas hacia algo grande que todavia esta construyendo.'),

('creacion_desarrollo', 'movil_flexible', 'esencial', 'macos',
 '{}', 'El Designer Junior',
 'Figma free, Canva y mucho YouTube de diseno. El Mac le da el look que sus trabajos todavia estan construyendo. Un dia va a mirar para atras y se va a ver crecer.'),

('creacion_desarrollo', 'movil_flexible', 'esencial', 'abierto',
 '{}', 'El Coder Autodidacta',
 'Aprendio solo con tutoriales y proyectos propios que nadie mas entiende del todo. Linux le parece lo mas natural del mundo y eso ya lo dice todo sobre el.'),

('creacion_desarrollo', 'movil_flexible', 'equilibrado', 'windows',
 '{}', 'El Dev Freelance',
 'Clientes, deadlines y Slack siempre abierto. Trabaja desde casa la mayor parte del tiempo pero viaja cuando el proyecto lo requiere. Windows porque el cliente lo pide.'),

('creacion_desarrollo', 'movil_flexible', 'equilibrado', 'macos',
 '{}', 'El UX Designer',
 'Figma, Sketch y flujos de usuario que hacen sentido. El Mac es la herramienta estandar de su industria y no hay discusion que valga sobre ese punto.'),

('creacion_desarrollo', 'movil_flexible', 'equilibrado', 'abierto',
 '{}', 'El Backend Engineer',
 'Docker siempre corriendo, varias terminales abiertas y opiniones muy fuertes sobre bases de datos. El frontend es territorio ajeno y esta bien con eso.'),

('creacion_desarrollo', 'movil_flexible', 'premium', 'windows',
 '{}', 'El Creador de Contenido',
 'YouTube, streaming, edicion y redes sociales. Un setup que no perdona porque su audiencia tampoco lo hace. La calidad de su contenido empieza por la calidad de su equipo.'),

('creacion_desarrollo', 'movil_flexible', 'premium', 'macos',
 '{}', 'El Motion Designer',
 'After Effects, Final Cut y Lottie files. La manzana nunca falla cuando hay que renderizar. Sus animaciones tienen vida propia y eso no pasa con cualquier maquina.'),

('creacion_desarrollo', 'movil_flexible', 'premium', 'abierto',
 '{}', 'El Tech Architect',
 'Microservicios, Kubernetes y diagramas en Miro. Su codigo llega a millones de usuarios sin que nadie sepa su nombre. La escala no le da miedo, le da motivacion.'),

-- escritorio_fijo
('creacion_desarrollo', 'escritorio_fijo', 'esencial', 'windows',
 '{}', 'El Programador Hogareno',
 'Primer setup en casa, cursos online y el primer proyecto personal que algun dia va a terminar. El escritorio es su mundo y el codigo es su idioma favorito.'),

('creacion_desarrollo', 'escritorio_fijo', 'esencial', 'macos',
 '{}', 'El Disenador Novato Fijo',
 'Mac de entrada para disenar sin salir de casa. Canva, Figma free y mucha inspiracion en Pinterest. El talento ya esta, el equipo lo acompana.'),

('creacion_desarrollo', 'escritorio_fijo', 'esencial', 'abierto',
 '{}', 'El Linux Enthusiast',
 'Instalo Gentoo una vez por desafio. Ahora usa Fedora pero el orgullo quedo. Sus dotfiles son obra de arte y su terminal no tiene secretos para el.'),

('creacion_desarrollo', 'escritorio_fijo', 'equilibrado', 'windows',
 '{}', 'El Game Dev Indie',
 'Unity o Unreal en casa, un videojuego en desarrollo desde hace dos anos y una beta que llega proximamente. Siempre proximamente. Pero esta vez en serio.'),

('creacion_desarrollo', 'escritorio_fijo', 'equilibrado', 'macos',
 '{}', 'El Productor Musical',
 'Logic Pro abierto todo el dia, samples, plugins y auriculares de estudio que el vecino ya reconoce. La musica no es un hobby, es lo unico que tiene sentido.'),

('creacion_desarrollo', 'escritorio_fijo', 'equilibrado', 'abierto',
 '{}', 'El DevOps Domestico',
 'Pipelines, CI/CD local y VMs para todo. Su casa es un datacenter en miniatura y sus scripts automatizan hasta el desayuno. La eficiencia es su religion.'),

('creacion_desarrollo', 'escritorio_fijo', 'premium', 'windows',
 '{}', 'El Streamer Profesional',
 'OBS configurado al milimetro, edicion 4K y donaciones que ya pagan la electricidad. Su stream es su negocio y su setup es su principal inversion.'),

('creacion_desarrollo', 'escritorio_fijo', 'premium', 'macos',
 '{}', 'El Editor Profesional',
 'ProRes, DaVinci Resolve y Final Cut Pro sin limites. Clientela premium para un setup premium. Cada frame que entrega justifica cada peso invertido en el equipo.'),

('creacion_desarrollo', 'escritorio_fijo', 'premium', 'abierto',
 '{}', 'El Senior Dev de Casa',
 'Workstation brutal, monitores triple y la conviccion de que nunca va a necesitar salir de casa para hacer nada importante. Spoiler: probablemente tenga razon.'),

-- ─── GAMING & RENDIMIENTO ───────────────────────────────────────────────────

-- maxima_portabilidad
('gaming_rendimiento', 'maxima_portabilidad', 'esencial', 'windows',
 '{}', 'El Gamer Mochilero',
 'Laptop al hombro y torneo el fin de semana. Gana rondas en el colectivo antes de llegar al evento. Para el, el gaming no es algo que pasa en casa.'),

('gaming_rendimiento', 'maxima_portabilidad', 'esencial', 'macos',
 '{}', 'El Gamer Casual Apple',
 'Juega lo que el Mac le deja jugar: indie games, Apple Arcade y algo de estrategia. No le pide rendimiento bruto, le pide que todo se vea bien y funcione solo.'),

('gaming_rendimiento', 'maxima_portabilidad', 'esencial', 'abierto',
 '{}', 'El Gamer Retro Portable',
 'Emuladores de SNES, GBA y PSP en una laptop liviana con Linux. Un museo interactivo de la historia del gaming que cabe en la mochila del colegio.'),

('gaming_rendimiento', 'maxima_portabilidad', 'equilibrado', 'windows',
 '{}', 'El Competitivo Viajero',
 'Torneos regionales, squad en Discord y latencia lo suficientemente baja como para competir desde cualquier ciudad. El ping es su enemigo pero lo tiene bajo control.'),

('gaming_rendimiento', 'maxima_portabilidad', 'equilibrado', 'macos',
 '{}', 'El Indie Gamer Mac',
 'Juegos de Steam que corren en Mac, control de Xbox conectado y un sillon comodo. Casual pero con criterio. No necesita 144 FPS para pasarla bien.'),

('gaming_rendimiento', 'maxima_portabilidad', 'equilibrado', 'abierto',
 '{}', 'El LAN Party Libre',
 'Proton y Lutris le abren el catalogo entero. Lleva Linux a la LAN y convierte a alguien a su causa en cada evento. El sistema abierto es su bandera.'),

('gaming_rendimiento', 'maxima_portabilidad', 'premium', 'windows',
 '{}', 'El Pro Gamer en Gira',
 'Laptop gamer de alto nivel para torneos en vivo. Su equipo le paga el viaje si clasifica y clasifico tres veces seguidas. El hardware no es un gasto, es una herramienta.'),

('gaming_rendimiento', 'maxima_portabilidad', 'premium', 'macos',
 '{}', 'El Gamer Ecosystem Apple',
 'Mac potente para Apple Arcade y los titulos AAA disponibles. Lo complementa con una consola para lo demas. No separa el gaming del resto de su vida digital.'),

('gaming_rendimiento', 'maxima_portabilidad', 'premium', 'abierto',
 '{}', 'El E-Sports Engineer',
 'Juega y desarrolla sus propias herramientas de analisis en Linux. Competidor y creador al mismo tiempo. Entiende el juego desde adentro porque lo construye.'),

-- movil_flexible
('gaming_rendimiento', 'movil_flexible', 'esencial', 'windows',
 '{}', 'El Gamer Entre Clases',
 'Fortnite despues de la facu y Minecraft los fines de semana. El gaming es el descanso que se merece despues de un dia largo. Sin complicaciones, solo diversion.'),

('gaming_rendimiento', 'movil_flexible', 'esencial', 'macos',
 '{}', 'El Noob Apple Gamer',
 'Nuevo en el gaming, eligio Mac porque ya tenia todo de Apple. Descubre los juegos de a poco y disfruta el proceso sin presion de nadie.'),

('gaming_rendimiento', 'movil_flexible', 'esencial', 'abierto',
 '{}', 'El Gamer Open Source',
 'Steam con Proton, emuladores y ROMs de todo. Conoce cada truco para sacarle el maximo a Linux sin gastar en licencias. El conocimiento es su ventaja competitiva.'),

('gaming_rendimiento', 'movil_flexible', 'equilibrado', 'windows',
 '{}', 'El Gamer Balanceado',
 'Trabaja de dia, juega de noche. Un setup decente que sirve para ambas cosas sin comprometer ninguna. La llave del equilibrio es no tener que elegir.'),

('gaming_rendimiento', 'movil_flexible', 'equilibrado', 'macos',
 '{}', 'El Creator Gamer',
 'Graba clips de gaming, edita en iMovie y los sube a TikTok. El gaming le genera contenido y el contenido le genera comunidad. Todo conectado sin esfuerzo.'),

('gaming_rendimiento', 'movil_flexible', 'equilibrado', 'abierto',
 '{}', 'El Gamer Tecnico',
 'Benchmarks, tweaks del kernel y comparativas de FPS en Linux vs Windows. Optimizar la configuracion es tan satisfactorio como ganar la partida.'),

('gaming_rendimiento', 'movil_flexible', 'premium', 'windows',
 '{}', 'El Streamer Hibrido',
 'Graba, transmite y compite desde donde este. El setup no tiene excusas porque el equipo no las tiene. Su stream es su trabajo y su trabajo es jugar bien.'),

('gaming_rendimiento', 'movil_flexible', 'premium', 'macos',
 '{}', 'El Creator Gamer Premium',
 'Mac de alta gama para produccion de contenido gaming de primera calidad. La calidad del video es tan importante como el gameplay. Su canal lo demuestra.'),

('gaming_rendimiento', 'movil_flexible', 'premium', 'abierto',
 '{}', 'El Linux Gamer Entusiasta',
 'Se nego a usar Windows para gaming, vencio la curva de aprendizaje y ahora tiene mejor performance que todos los que se rindieron antes. El esfuerzo valio.'),

-- escritorio_fijo
('gaming_rendimiento', 'escritorio_fijo', 'esencial', 'windows',
 '{}', 'El Gamer Casual Hogareno',
 'Setup basico en casa, Valorant con amigos los viernes y memes de gaming el resto del tiempo. No busca ser pro, busca pasarla bien. Y lo logra.'),

('gaming_rendimiento', 'escritorio_fijo', 'esencial', 'macos',
 '{}', 'El Gamer Apple de Base',
 'Prefiere Mac aunque le limite el catalogo de juegos. Juega lo que hay con gusto y complementa con consola cuando quiere algo mas intenso.'),

('gaming_rendimiento', 'escritorio_fijo', 'esencial', 'abierto',
 '{}', 'El Retrogamer Linux',
 'MAME, DOSBox y emuladores de todo. Un museo interactivo de la historia del gaming en su escritorio. Tiene juegos que sus amigos nunca escucharon nombrar.'),

('gaming_rendimiento', 'escritorio_fijo', 'equilibrado', 'windows',
 '{}', 'El Gamer Serio',
 'GPU dedicada, monitor de 144hz y headset con microfono. Sube de rango cada temporada y no tolera el lag. Para el el gaming es una actividad que se toma en serio.'),

('gaming_rendimiento', 'escritorio_fijo', 'equilibrado', 'macos',
 '{}', 'El Mac Gamer Dedicado',
 'Juega con lo que el Mac ofrece y lo disfruta de verdad. Crossplay con amigos en consola cuando puede. No se queja de los titulos disponibles, los aprovecha al maximo.'),

('gaming_rendimiento', 'escritorio_fijo', 'equilibrado', 'abierto',
 '{}', 'El LAN Master',
 'Organiza torneos locales, configura la red, instala Linux en todas las maquinas y todavia tiene tiempo para ganar el torneo. El de la organizacion siempre gana.'),

('gaming_rendimiento', 'escritorio_fijo', 'premium', 'windows',
 '{}', 'El Gamer Hardcore',
 'RTX ultimo modelo, 240hz, teclado mecanico y mouse de 25.000 DPI. No duerme bien despues de una derrota. La perfeccion tecnica es el minimo aceptable.'),

('gaming_rendimiento', 'escritorio_fijo', 'premium', 'macos',
 '{}', 'El Studio Gamer',
 'Mac Studio o Pro con pantalla enorme. Edita clips de gaming y juega sin compromisos. Su setup es tema de conversacion en cada llamada de video.'),

('gaming_rendimiento', 'escritorio_fijo', 'premium', 'abierto',
 '{}', 'El Rey del Benchmark',
 'Arch Linux, overclock documentado y el score de Cinebench como carta de presentacion. Temperatura monitoreada, FPS mas altos que su ego. Casi.')

ON CONFLICT (workload, lifestyle, budget, os_preference)
DO UPDATE SET
  profile_name        = EXCLUDED.profile_name,
  profile_description = EXCLUDED.profile_description;

-- ─── Phase 13: laptop_ids assignments (fix-2: score ordering + RAM filter + GPU for designers) ──────────
-- Generated from live DB state after curate_profiles.py Fix 2 (2026-05-01).

UPDATE profiles SET laptop_ids = ARRAY['d8d84f9f-1dd4-40d5-8b18-5e51a66fa30c'::uuid, 'aa000022-0000-0000-0000-000000000022'::uuid, 'a96bb526-8bb4-47f8-bc78-83bda5899fbe'::uuid, 'a2bb2e6b-f8a4-4d0e-9db9-abaca12f7a48'::uuid, '521c6fbe-05b5-40af-b9f1-e0e785265733'::uuid]::uuid[]
 WHERE workload = 'creacion_desarrollo'
   AND lifestyle = 'escritorio_fijo'
   AND budget = 'equilibrado'
   AND os_preference = 'macos';

UPDATE profiles SET laptop_ids = ARRAY['c18e32b0-33b4-4907-9de5-416d50cddfdf'::uuid, '26c2b835-82ed-44ab-b6c5-f173b4b19374'::uuid, 'a74b0d02-8635-499d-9c93-c6dea592059f'::uuid, 'aa000008-0000-0000-0000-000000000008'::uuid, 'aa000011-0000-0000-0000-000000000011'::uuid]::uuid[]
 WHERE workload = 'creacion_desarrollo'
   AND lifestyle = 'escritorio_fijo'
   AND budget = 'equilibrado'
   AND os_preference = 'windows';

UPDATE profiles SET laptop_ids = ARRAY['b3a3a01b-176e-4345-b8fe-38a11b74aeb8'::uuid, 'd8d84f9f-1dd4-40d5-8b18-5e51a66fa30c'::uuid, 'aa000022-0000-0000-0000-000000000022'::uuid, 'a96bb526-8bb4-47f8-bc78-83bda5899fbe'::uuid, 'a2bb2e6b-f8a4-4d0e-9db9-abaca12f7a48'::uuid]::uuid[]
 WHERE workload = 'creacion_desarrollo'
   AND lifestyle = 'escritorio_fijo'
   AND budget = 'esencial'
   AND os_preference = 'macos';

UPDATE profiles SET laptop_ids = ARRAY['9ae96979-7cdc-43bc-8e50-1d1f29095b93'::uuid, 'fc7c1881-a52d-4264-8fb9-40dc0cc44482'::uuid, '321f2377-b9fa-48a2-8522-74393165ff70'::uuid, 'bdc65ab4-5eed-4fa6-b84b-6a9595918594'::uuid, 'eaa464c7-a925-4273-9b19-ea2350dc3a78'::uuid]::uuid[]
 WHERE workload = 'creacion_desarrollo'
   AND lifestyle = 'escritorio_fijo'
   AND budget = 'esencial'
   AND os_preference = 'windows';

UPDATE profiles SET laptop_ids = ARRAY['aa000010-0000-0000-0000-000000000010'::uuid, 'aa000021-0000-0000-0000-000000000021'::uuid, 'd8d84f9f-1dd4-40d5-8b18-5e51a66fa30c'::uuid, 'aa000022-0000-0000-0000-000000000022'::uuid, 'a96bb526-8bb4-47f8-bc78-83bda5899fbe'::uuid]::uuid[]
 WHERE workload = 'creacion_desarrollo'
   AND lifestyle = 'escritorio_fijo'
   AND budget = 'premium'
   AND os_preference = 'macos';

UPDATE profiles SET laptop_ids = ARRAY['c3bb1a5f-560a-450d-b221-bf3b59fdb5e7'::uuid, '428d0b26-bf13-4680-b50a-46f0908a1781'::uuid, 'c0193479-7b16-4f90-8e43-5660332824ac'::uuid, '7456016b-1e2d-4757-9ed7-df296d2b75c7'::uuid, 'aa000005-0000-0000-0000-000000000005'::uuid]::uuid[]
 WHERE workload = 'creacion_desarrollo'
   AND lifestyle = 'escritorio_fijo'
   AND budget = 'premium'
   AND os_preference = 'windows';

UPDATE profiles SET laptop_ids = ARRAY['aa000022-0000-0000-0000-000000000022'::uuid, 'a96bb526-8bb4-47f8-bc78-83bda5899fbe'::uuid, 'a2bb2e6b-f8a4-4d0e-9db9-abaca12f7a48'::uuid, '521c6fbe-05b5-40af-b9f1-e0e785265733'::uuid, '173d70d4-fa6e-4a06-98b8-88b587c14783'::uuid]::uuid[]
 WHERE workload = 'creacion_desarrollo'
   AND lifestyle = 'maxima_portabilidad'
   AND budget = 'equilibrado'
   AND os_preference = 'macos';

UPDATE profiles SET laptop_ids = ARRAY['c18e32b0-33b4-4907-9de5-416d50cddfdf'::uuid, '26c2b835-82ed-44ab-b6c5-f173b4b19374'::uuid, 'a74b0d02-8635-499d-9c93-c6dea592059f'::uuid, 'acac6672-641f-4b62-9fa4-cc167f3eed78'::uuid, 'd46d104c-e75c-4f8c-92ba-2c0f753af62b'::uuid]::uuid[]
 WHERE workload = 'creacion_desarrollo'
   AND lifestyle = 'maxima_portabilidad'
   AND budget = 'equilibrado'
   AND os_preference = 'windows';

UPDATE profiles SET laptop_ids = ARRAY['b3a3a01b-176e-4345-b8fe-38a11b74aeb8'::uuid, 'aa000022-0000-0000-0000-000000000022'::uuid, 'a96bb526-8bb4-47f8-bc78-83bda5899fbe'::uuid, 'a2bb2e6b-f8a4-4d0e-9db9-abaca12f7a48'::uuid, '521c6fbe-05b5-40af-b9f1-e0e785265733'::uuid]::uuid[]
 WHERE workload = 'creacion_desarrollo'
   AND lifestyle = 'maxima_portabilidad'
   AND budget = 'esencial'
   AND os_preference = 'macos';

UPDATE profiles SET laptop_ids = ARRAY['9ae96979-7cdc-43bc-8e50-1d1f29095b93'::uuid, 'fc7c1881-a52d-4264-8fb9-40dc0cc44482'::uuid, '321f2377-b9fa-48a2-8522-74393165ff70'::uuid, 'bdc65ab4-5eed-4fa6-b84b-6a9595918594'::uuid, 'eaa464c7-a925-4273-9b19-ea2350dc3a78'::uuid]::uuid[]
 WHERE workload = 'creacion_desarrollo'
   AND lifestyle = 'maxima_portabilidad'
   AND budget = 'esencial'
   AND os_preference = 'windows';

UPDATE profiles SET laptop_ids = ARRAY['aa000021-0000-0000-0000-000000000021'::uuid, 'aa000022-0000-0000-0000-000000000022'::uuid, 'a96bb526-8bb4-47f8-bc78-83bda5899fbe'::uuid, 'a2bb2e6b-f8a4-4d0e-9db9-abaca12f7a48'::uuid, '521c6fbe-05b5-40af-b9f1-e0e785265733'::uuid]::uuid[]
 WHERE workload = 'creacion_desarrollo'
   AND lifestyle = 'maxima_portabilidad'
   AND budget = 'premium'
   AND os_preference = 'macos';

UPDATE profiles SET laptop_ids = ARRAY['c3bb1a5f-560a-450d-b221-bf3b59fdb5e7'::uuid, '428d0b26-bf13-4680-b50a-46f0908a1781'::uuid, 'c0193479-7b16-4f90-8e43-5660332824ac'::uuid, '7456016b-1e2d-4757-9ed7-df296d2b75c7'::uuid, '288339fd-34e5-4438-a680-a23eb1e34a54'::uuid]::uuid[]
 WHERE workload = 'creacion_desarrollo'
   AND lifestyle = 'maxima_portabilidad'
   AND budget = 'premium'
   AND os_preference = 'windows';

UPDATE profiles SET laptop_ids = ARRAY['d8d84f9f-1dd4-40d5-8b18-5e51a66fa30c'::uuid, 'aa000022-0000-0000-0000-000000000022'::uuid, '6bd3cfa5-5e24-43fe-85a5-8a4ede62342c'::uuid, 'a96bb526-8bb4-47f8-bc78-83bda5899fbe'::uuid, 'a2bb2e6b-f8a4-4d0e-9db9-abaca12f7a48'::uuid]::uuid[]
 WHERE workload = 'gaming_rendimiento'
   AND lifestyle = 'escritorio_fijo'
   AND budget = 'equilibrado'
   AND os_preference = 'macos';

UPDATE profiles SET laptop_ids = ARRAY['c3bb1a5f-560a-450d-b221-bf3b59fdb5e7'::uuid, '428d0b26-bf13-4680-b50a-46f0908a1781'::uuid, 'c0193479-7b16-4f90-8e43-5660332824ac'::uuid, '7456016b-1e2d-4757-9ed7-df296d2b75c7'::uuid, 'aa000005-0000-0000-0000-000000000005'::uuid]::uuid[]
 WHERE workload = 'gaming_rendimiento'
   AND lifestyle = 'escritorio_fijo'
   AND budget = 'equilibrado'
   AND os_preference = 'windows';

UPDATE profiles SET laptop_ids = ARRAY['aa000020-0000-0000-0000-000000000020'::uuid, 'd8d84f9f-1dd4-40d5-8b18-5e51a66fa30c'::uuid, 'aa000022-0000-0000-0000-000000000022'::uuid, '6bd3cfa5-5e24-43fe-85a5-8a4ede62342c'::uuid, 'a96bb526-8bb4-47f8-bc78-83bda5899fbe'::uuid]::uuid[]
 WHERE workload = 'gaming_rendimiento'
   AND lifestyle = 'escritorio_fijo'
   AND budget = 'esencial'
   AND os_preference = 'macos';

UPDATE profiles SET laptop_ids = ARRAY['c3bb1a5f-560a-450d-b221-bf3b59fdb5e7'::uuid, '914da3c1-9cdf-4355-9c23-93289581f261'::uuid, '0e82bcd6-a83d-43d1-88a9-03d9f1a6cd19'::uuid, 'c0193479-7b16-4f90-8e43-5660332824ac'::uuid, '0682b0e1-6aef-43ff-8150-688d6e2e82df'::uuid]::uuid[]
 WHERE workload = 'gaming_rendimiento'
   AND lifestyle = 'escritorio_fijo'
   AND budget = 'esencial'
   AND os_preference = 'windows';

UPDATE profiles SET laptop_ids = ARRAY['aa000010-0000-0000-0000-000000000010'::uuid, 'aa000021-0000-0000-0000-000000000021'::uuid, 'd8d84f9f-1dd4-40d5-8b18-5e51a66fa30c'::uuid, 'aa000022-0000-0000-0000-000000000022'::uuid, '6bd3cfa5-5e24-43fe-85a5-8a4ede62342c'::uuid]::uuid[]
 WHERE workload = 'gaming_rendimiento'
   AND lifestyle = 'escritorio_fijo'
   AND budget = 'premium'
   AND os_preference = 'macos';

UPDATE profiles SET laptop_ids = ARRAY['c3bb1a5f-560a-450d-b221-bf3b59fdb5e7'::uuid, '428d0b26-bf13-4680-b50a-46f0908a1781'::uuid, 'c0193479-7b16-4f90-8e43-5660332824ac'::uuid, '7456016b-1e2d-4757-9ed7-df296d2b75c7'::uuid, 'aa000005-0000-0000-0000-000000000005'::uuid]::uuid[]
 WHERE workload = 'gaming_rendimiento'
   AND lifestyle = 'escritorio_fijo'
   AND budget = 'premium'
   AND os_preference = 'windows';

UPDATE profiles SET laptop_ids = ARRAY['aa000022-0000-0000-0000-000000000022'::uuid, '6bd3cfa5-5e24-43fe-85a5-8a4ede62342c'::uuid, 'a96bb526-8bb4-47f8-bc78-83bda5899fbe'::uuid, 'a2bb2e6b-f8a4-4d0e-9db9-abaca12f7a48'::uuid, '22f5c13b-d6c7-42bf-9db2-43ff93dafadc'::uuid]::uuid[]
 WHERE workload = 'gaming_rendimiento'
   AND lifestyle = 'maxima_portabilidad'
   AND budget = 'equilibrado'
   AND os_preference = 'macos';

UPDATE profiles SET laptop_ids = ARRAY['c3bb1a5f-560a-450d-b221-bf3b59fdb5e7'::uuid, '428d0b26-bf13-4680-b50a-46f0908a1781'::uuid, 'c0193479-7b16-4f90-8e43-5660332824ac'::uuid, '7456016b-1e2d-4757-9ed7-df296d2b75c7'::uuid, '288339fd-34e5-4438-a680-a23eb1e34a54'::uuid]::uuid[]
 WHERE workload = 'gaming_rendimiento'
   AND lifestyle = 'maxima_portabilidad'
   AND budget = 'equilibrado'
   AND os_preference = 'windows';

UPDATE profiles SET laptop_ids = ARRAY['aa000020-0000-0000-0000-000000000020'::uuid, 'aa000022-0000-0000-0000-000000000022'::uuid, '6bd3cfa5-5e24-43fe-85a5-8a4ede62342c'::uuid, 'a96bb526-8bb4-47f8-bc78-83bda5899fbe'::uuid, 'a2bb2e6b-f8a4-4d0e-9db9-abaca12f7a48'::uuid]::uuid[]
 WHERE workload = 'gaming_rendimiento'
   AND lifestyle = 'maxima_portabilidad'
   AND budget = 'esencial'
   AND os_preference = 'macos';

UPDATE profiles SET laptop_ids = ARRAY['c3bb1a5f-560a-450d-b221-bf3b59fdb5e7'::uuid, '914da3c1-9cdf-4355-9c23-93289581f261'::uuid, '0e82bcd6-a83d-43d1-88a9-03d9f1a6cd19'::uuid, 'c0193479-7b16-4f90-8e43-5660332824ac'::uuid, '0682b0e1-6aef-43ff-8150-688d6e2e82df'::uuid]::uuid[]
 WHERE workload = 'gaming_rendimiento'
   AND lifestyle = 'maxima_portabilidad'
   AND budget = 'esencial'
   AND os_preference = 'windows';

UPDATE profiles SET laptop_ids = ARRAY['aa000021-0000-0000-0000-000000000021'::uuid, 'aa000022-0000-0000-0000-000000000022'::uuid, '6bd3cfa5-5e24-43fe-85a5-8a4ede62342c'::uuid, 'a96bb526-8bb4-47f8-bc78-83bda5899fbe'::uuid, 'a2bb2e6b-f8a4-4d0e-9db9-abaca12f7a48'::uuid]::uuid[]
 WHERE workload = 'gaming_rendimiento'
   AND lifestyle = 'maxima_portabilidad'
   AND budget = 'premium'
   AND os_preference = 'macos';

UPDATE profiles SET laptop_ids = ARRAY['c3bb1a5f-560a-450d-b221-bf3b59fdb5e7'::uuid, '428d0b26-bf13-4680-b50a-46f0908a1781'::uuid, 'c0193479-7b16-4f90-8e43-5660332824ac'::uuid, '7456016b-1e2d-4757-9ed7-df296d2b75c7'::uuid, '288339fd-34e5-4438-a680-a23eb1e34a54'::uuid]::uuid[]
 WHERE workload = 'gaming_rendimiento'
   AND lifestyle = 'maxima_portabilidad'
   AND budget = 'premium'
   AND os_preference = 'windows';

UPDATE profiles SET laptop_ids = ARRAY['d8d84f9f-1dd4-40d5-8b18-5e51a66fa30c'::uuid, 'aa000022-0000-0000-0000-000000000022'::uuid, '6bd3cfa5-5e24-43fe-85a5-8a4ede62342c'::uuid, '22f5c13b-d6c7-42bf-9db2-43ff93dafadc'::uuid, '92ccdffe-f654-4095-93a4-06b856ee3b81'::uuid]::uuid[]
 WHERE workload = 'productividad_estudio'
   AND lifestyle = 'escritorio_fijo'
   AND budget = 'equilibrado'
   AND os_preference = 'macos';

UPDATE profiles SET laptop_ids = ARRAY['1f0ff760-c414-4255-b86e-e08ae9e404a1'::uuid, '26bc2b10-40e8-4ede-990c-92b000b2a0be'::uuid, '65bf201a-0794-4dec-8c70-c4875a5ad061'::uuid, 'd04cbb37-0165-4ea9-a9db-683a1e668f29'::uuid, '27226113-8e41-4bd9-9d78-93542233ed96'::uuid]::uuid[]
 WHERE workload = 'productividad_estudio'
   AND lifestyle = 'escritorio_fijo'
   AND budget = 'equilibrado'
   AND os_preference = 'windows';

UPDATE profiles SET laptop_ids = ARRAY['aa000020-0000-0000-0000-000000000020'::uuid, 'd8d84f9f-1dd4-40d5-8b18-5e51a66fa30c'::uuid, 'aa000022-0000-0000-0000-000000000022'::uuid, '6bd3cfa5-5e24-43fe-85a5-8a4ede62342c'::uuid, '22f5c13b-d6c7-42bf-9db2-43ff93dafadc'::uuid]::uuid[]
 WHERE workload = 'productividad_estudio'
   AND lifestyle = 'escritorio_fijo'
   AND budget = 'esencial'
   AND os_preference = 'macos';

UPDATE profiles SET laptop_ids = ARRAY['9ae96979-7cdc-43bc-8e50-1d1f29095b93'::uuid, 'fc7c1881-a52d-4264-8fb9-40dc0cc44482'::uuid, '321f2377-b9fa-48a2-8522-74393165ff70'::uuid, 'bdc65ab4-5eed-4fa6-b84b-6a9595918594'::uuid, 'eaa464c7-a925-4273-9b19-ea2350dc3a78'::uuid]::uuid[]
 WHERE workload = 'productividad_estudio'
   AND lifestyle = 'escritorio_fijo'
   AND budget = 'esencial'
   AND os_preference = 'windows';

UPDATE profiles SET laptop_ids = ARRAY['aa000010-0000-0000-0000-000000000010'::uuid, 'aa000021-0000-0000-0000-000000000021'::uuid, 'd8d84f9f-1dd4-40d5-8b18-5e51a66fa30c'::uuid, 'aa000022-0000-0000-0000-000000000022'::uuid, '6bd3cfa5-5e24-43fe-85a5-8a4ede62342c'::uuid]::uuid[]
 WHERE workload = 'productividad_estudio'
   AND lifestyle = 'escritorio_fijo'
   AND budget = 'premium'
   AND os_preference = 'macos';

UPDATE profiles SET laptop_ids = ARRAY['266d1336-1fc2-4ba9-8cd5-ce71e7281b63'::uuid, '72f5af81-c86f-4910-a010-cab3df35e8b4'::uuid, '3374f39f-9577-418e-bb19-bd4d08118d2a'::uuid, '0474dd01-cbe6-4f79-8a7a-73ee28e5c230'::uuid, '886ef4f6-7a5b-4061-8c6a-b0d15791efe0'::uuid]::uuid[]
 WHERE workload = 'productividad_estudio'
   AND lifestyle = 'escritorio_fijo'
   AND budget = 'premium'
   AND os_preference = 'windows';

UPDATE profiles SET laptop_ids = ARRAY['aa000022-0000-0000-0000-000000000022'::uuid, '6bd3cfa5-5e24-43fe-85a5-8a4ede62342c'::uuid, '22f5c13b-d6c7-42bf-9db2-43ff93dafadc'::uuid, '92ccdffe-f654-4095-93a4-06b856ee3b81'::uuid, '521c6fbe-05b5-40af-b9f1-e0e785265733'::uuid]::uuid[]
 WHERE workload = 'productividad_estudio'
   AND lifestyle = 'maxima_portabilidad'
   AND budget = 'equilibrado'
   AND os_preference = 'macos';

UPDATE profiles SET laptop_ids = ARRAY['1f0ff760-c414-4255-b86e-e08ae9e404a1'::uuid, '26bc2b10-40e8-4ede-990c-92b000b2a0be'::uuid, '65bf201a-0794-4dec-8c70-c4875a5ad061'::uuid, 'd04cbb37-0165-4ea9-a9db-683a1e668f29'::uuid, '27226113-8e41-4bd9-9d78-93542233ed96'::uuid]::uuid[]
 WHERE workload = 'productividad_estudio'
   AND lifestyle = 'maxima_portabilidad'
   AND budget = 'equilibrado'
   AND os_preference = 'windows';

UPDATE profiles SET laptop_ids = ARRAY['aa000020-0000-0000-0000-000000000020'::uuid, 'aa000022-0000-0000-0000-000000000022'::uuid, '6bd3cfa5-5e24-43fe-85a5-8a4ede62342c'::uuid, '22f5c13b-d6c7-42bf-9db2-43ff93dafadc'::uuid, '92ccdffe-f654-4095-93a4-06b856ee3b81'::uuid]::uuid[]
 WHERE workload = 'productividad_estudio'
   AND lifestyle = 'maxima_portabilidad'
   AND budget = 'esencial'
   AND os_preference = 'macos';

UPDATE profiles SET laptop_ids = ARRAY['9ae96979-7cdc-43bc-8e50-1d1f29095b93'::uuid, 'fc7c1881-a52d-4264-8fb9-40dc0cc44482'::uuid, '321f2377-b9fa-48a2-8522-74393165ff70'::uuid, 'bdc65ab4-5eed-4fa6-b84b-6a9595918594'::uuid, 'eaa464c7-a925-4273-9b19-ea2350dc3a78'::uuid]::uuid[]
 WHERE workload = 'productividad_estudio'
   AND lifestyle = 'maxima_portabilidad'
   AND budget = 'esencial'
   AND os_preference = 'windows';

UPDATE profiles SET laptop_ids = ARRAY['aa000021-0000-0000-0000-000000000021'::uuid, 'aa000022-0000-0000-0000-000000000022'::uuid, '6bd3cfa5-5e24-43fe-85a5-8a4ede62342c'::uuid, '22f5c13b-d6c7-42bf-9db2-43ff93dafadc'::uuid, '92ccdffe-f654-4095-93a4-06b856ee3b81'::uuid]::uuid[]
 WHERE workload = 'productividad_estudio'
   AND lifestyle = 'maxima_portabilidad'
   AND budget = 'premium'
   AND os_preference = 'macos';

UPDATE profiles SET laptop_ids = ARRAY['266d1336-1fc2-4ba9-8cd5-ce71e7281b63'::uuid, '72f5af81-c86f-4910-a010-cab3df35e8b4'::uuid, '3374f39f-9577-418e-bb19-bd4d08118d2a'::uuid, '0474dd01-cbe6-4f79-8a7a-73ee28e5c230'::uuid, '886ef4f6-7a5b-4061-8c6a-b0d15791efe0'::uuid]::uuid[]
 WHERE workload = 'productividad_estudio'
   AND lifestyle = 'maxima_portabilidad'
   AND budget = 'premium'
   AND os_preference = 'windows';

