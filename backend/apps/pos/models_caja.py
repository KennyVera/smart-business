from django.db import models

from apps.usuarios.models import SucursalExistente, Usuario


class MetodoPago(models.Model):
    """Forma de cobro (Efectivo, Tarjeta, Transferencia...)."""

    id_metodo_pago = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50)

    class Meta:
        db_table = "metodo_pago"
        managed = False
        verbose_name = "Método de pago"
        verbose_name_plural = "Métodos de pago"
        ordering = ["id_metodo_pago"]

    def __str__(self):
        return self.nombre


class TerminalPOS(models.Model):
    """Caja física instalada en una sucursal."""

    id_terminal = models.AutoField(primary_key=True)
    sucursal = models.ForeignKey(
        SucursalExistente,
        db_column="id_sucursal",
        on_delete=models.PROTECT,
        related_name="terminales",
    )
    numero_serie = models.CharField(max_length=50)
    estado_activo = models.BooleanField(default=True)

    class Meta:
        db_table = "terminal_pos"
        managed = False
        verbose_name = "Terminal POS"
        verbose_name_plural = "Terminales POS"
        ordering = ["id_terminal"]

    def __str__(self):
        return self.numero_serie


class TurnoCaja(models.Model):
    """Turno de un cajero en una terminal: se abre, se vende y se cierra."""

    id_turno = models.AutoField(primary_key=True)
    terminal = models.ForeignKey(
        TerminalPOS,
        db_column="id_terminal",
        on_delete=models.PROTECT,
        related_name="turnos",
    )
    usuario = models.ForeignKey(
        Usuario,
        db_column="id_usuario",
        on_delete=models.PROTECT,
        related_name="turnos",
    )
    fecha_apertura = models.DateTimeField(auto_now_add=True)
    fecha_cierre = models.DateTimeField(null=True, blank=True)
    monto_apertura = models.DecimalField(max_digits=10, decimal_places=2)
    monto_cierre_declarado = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )

    class Meta:
        db_table = "turno_caja"
        managed = False
        verbose_name = "Turno de caja"
        verbose_name_plural = "Turnos de caja"
        ordering = ["-fecha_apertura", "-id_turno"]

    def __str__(self):
        return f"Turno {self.id_turno} ({self.usuario_id})"

    @property
    def esta_abierto(self):
        return self.fecha_cierre is None

    @property
    def sucursal_id(self):
        """La sucursal de la venta es donde está la terminal, no la del perfil."""
        return self.terminal.sucursal_id
