from django.db import models


class Rol(models.Model):
    id_rol = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50)
    descripcion = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        db_table = "rol"
        managed = False
        verbose_name = "Rol"
        verbose_name_plural = "Roles"
        ordering = ["id_rol"]

    def __str__(self):
        return self.nombre


class SucursalExistente(models.Model):
    id_sucursal = models.AutoField(primary_key=True)
    id_canton = models.IntegerField()
    nombre = models.CharField(max_length=150)
    direccion = models.CharField(max_length=255)
    fecha_apertura = models.DateField()
    fecha_cierre = models.DateField(null=True, blank=True)
    estado_activa = models.BooleanField(default=True)

    class Meta:
        db_table = "sucursal"
        managed = False

    def __str__(self):
        return self.nombre


class Usuario(models.Model):
    id_usuario = models.AutoField(primary_key=True)
    sucursal = models.ForeignKey(
        SucursalExistente,
        db_column="id_sucursal",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="usuarios",
    )
    rol = models.ForeignKey(
        Rol,
        db_column="id_rol",
        on_delete=models.PROTECT,
        related_name="usuarios",
    )
    username = models.CharField(max_length=50)
    password_hash = models.CharField(max_length=255)
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    email = models.CharField(max_length=100, blank=True, null=True)
    foto_perfil = models.ImageField(
        upload_to="perfiles/",
        max_length=255,
        blank=True,
        null=True,
    )
    estado_activo = models.BooleanField(default=True)

    class Meta:
        db_table = "usuario"
        managed = False
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"
        ordering = ["id_usuario"]

    def __str__(self):
        return self.username

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False


class SesionUsuario(models.Model):
    id_sesion = models.AutoField(primary_key=True)
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.PROTECT,
        related_name="sesiones",
    )
    token_sesion = models.CharField(max_length=64, unique=True)
    fecha_inicio = models.DateTimeField(auto_now_add=True)
    fecha_fin = models.DateTimeField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "sesion_usuario"
        verbose_name = "Sesión de usuario"
        verbose_name_plural = "Sesiones de usuario"
        ordering = ["-fecha_inicio"]

    def __str__(self):
        return f"{self.usuario_id} {self.token_sesion[:8]}"


class Notificacion(models.Model):
    """Avisos in-app para el gerente (descuadres, inventario, sistema)."""

    CAJA = "CAJA"
    INVENTARIO = "INVENTARIO"
    SISTEMA = "SISTEMA"
    TIPOS = [
        (CAJA, "Caja"),
        (INVENTARIO, "Inventario"),
        (SISTEMA, "Sistema"),
    ]

    id_notificacion = models.AutoField(primary_key=True)
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name="notificaciones",
    )
    titulo = models.CharField(max_length=100)
    mensaje = models.TextField()
    tipo = models.CharField(max_length=20, choices=TIPOS, default=SISTEMA)
    leida = models.BooleanField(default=False)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "notificacion"
        verbose_name = "Notificación"
        verbose_name_plural = "Notificaciones"
        ordering = ["-fecha_creacion", "-id_notificacion"]

    def __str__(self):
        return f"{self.titulo} → {self.usuario_id}"
