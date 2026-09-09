# 008 — Data model: PreferenciaUsuario

Tabla gestionada por Django: `preferencia_usuario`.

| Campo | Tipo | Notas |
|-------|------|--------|
| `id_preferencia` | PK | Auto |
| `usuario` | OneToOne → `usuario` | `related_name=preferencias`, CASCADE |
| `color_sidebar` | Char(20) | Hex `#RRGGBB`, default `#000000` (negro) |
| `color_graficos` | Char(20) | Hex, default `#00AA5D` |
| `color_logs` | Char(20) | Hex confirmaciones/avisos, default `#00AA5D` |
| `logo_personalizado` | ImageField | `upload_to=logos_usuarios/`, nullable |
| `filas_por_pagina` | PositiveSmallInteger | 10 \| 25 \| 50 \| 100 |

## Archivos backend

- `apps/usuarios/models_preferencias.py`
- `apps/usuarios/serializers_preferencias.py`
- `apps/usuarios/views_preferencias.py`
- Signal `post_save` en `signals.py`
- Migración `0009_preferencia_usuario`
