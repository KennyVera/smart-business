# 9 Zonas de Planificación de Ecuador (SENPLADES) y subzonas provinciales.
# Tuplas: (id_nombre, codigo, nombre, descripcion)
ZONAS = [
    ("zona-1", 1, "Zona 1 — Norte", "Esmeraldas, Carchi, Imbabura y Sucumbíos"),
    ("zona-2", 2, "Zona 2 — Centro Norte", "Pichincha (excepto DMQ), Napo y Orellana"),
    ("zona-3", 3, "Zona 3 — Centro", "Cotopaxi, Tungurahua, Chimborazo y Pastaza"),
    ("zona-4", 4, "Zona 4 — Pacífico", "Manabí y Santo Domingo de los Tsáchilas"),
    ("zona-5", 5, "Zona 5 — Litoral", "Santa Elena, Guayas, Los Ríos, Bolívar y Galápagos"),
    ("zona-6", 6, "Zona 6 — Austro", "Azuay, Cañar y Morona Santiago"),
    ("zona-7", 7, "Zona 7 — Sur", "El Oro, Loja y Zamora Chinchipe"),
    ("zona-8", 8, "Zona 8 — Guayaquil", "Cantones Guayaquil, Samborondón y Durán"),
    ("zona-9", 9, "Zona 9 — Quito", "Distrito Metropolitano de Quito"),
]

# Tuplas: (id_nombre, nombre, zona_id)
SUBZONAS = [
    ("subzona-esmeraldas", "Esmeraldas", "zona-1"),
    ("subzona-carchi", "Carchi", "zona-1"),
    ("subzona-imbabura", "Imbabura", "zona-1"),
    ("subzona-sucumbios", "Sucumbíos", "zona-1"),
    ("subzona-pichincha", "Pichincha", "zona-2"),
    ("subzona-napo", "Napo", "zona-2"),
    ("subzona-orellana", "Orellana", "zona-2"),
    ("subzona-cotopaxi", "Cotopaxi", "zona-3"),
    ("subzona-tungurahua", "Tungurahua", "zona-3"),
    ("subzona-chimborazo", "Chimborazo", "zona-3"),
    ("subzona-pastaza", "Pastaza", "zona-3"),
    ("subzona-manabi", "Manabí", "zona-4"),
    ("subzona-santo-domingo", "Santo Domingo de los Tsáchilas", "zona-4"),
    ("subzona-santa-elena", "Santa Elena", "zona-5"),
    ("subzona-guayas", "Guayas", "zona-5"),
    ("subzona-los-rios", "Los Ríos", "zona-5"),
    ("subzona-bolivar", "Bolívar", "zona-5"),
    ("subzona-galapagos", "Galápagos", "zona-5"),
    ("subzona-azuay", "Azuay", "zona-6"),
    ("subzona-canar", "Cañar", "zona-6"),
    ("subzona-morona", "Morona Santiago", "zona-6"),
    ("subzona-el-oro", "El Oro", "zona-7"),
    ("subzona-loja", "Loja", "zona-7"),
    ("subzona-zamora", "Zamora Chinchipe", "zona-7"),
    ("subzona-distrito-guayaquil", "Distrito Guayaquil", "zona-8"),
    ("subzona-dmq", "Distrito Metropolitano de Quito", "zona-9"),
]
