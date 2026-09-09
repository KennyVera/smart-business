import os

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from django.db import connection

SQL = """
select table_name, column_name, is_identity, identity_generation, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in ('venta', 'turno_caja', 'metodo_pago', 'terminal_pos', 'cliente', 'lote_caducidad')
  and column_name like 'id%%'
order by table_name, ordinal_position
"""

with connection.cursor() as cursor:
    cursor.execute(SQL)
    for fila in cursor.fetchall():
        print(fila)
