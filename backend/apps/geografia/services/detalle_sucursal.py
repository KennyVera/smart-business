from django.db import connection


def terminales_de(nombre_sucursal):
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT t.id_terminal, t.numero_serie, t.estado_activo
            FROM terminal_pos t
            INNER JOIN sucursal s ON s.id_sucursal = t.id_sucursal
            WHERE LOWER(s.nombre) = LOWER(%s)
            """,
            [nombre_sucursal],
        )
        return [
            {
                "id_terminal": fila[0],
                "numero_serie": fila[1],
                "estado_activo": fila[2],
            }
            for fila in cursor.fetchall()
        ]
