import { AtSign, IdCard, Lock, Shield, Store, UserRound } from "lucide-react";
import { LIMITES } from "../validacion";
import CampoClave from "./CampoClave";
import UsuarioFormCampo from "./UsuarioFormCampo";

function UsuarioFormCampos({ form, roles, sucursales, editando, esAdmin, onCampo }) {
  return (
    <>
      <UsuarioFormCampo icon={AtSign} label="Usuario" ayuda="4 a 30. Empieza con letra.">
        <input
          className="form-control"
          value={form.username}
          maxLength={LIMITES.username}
          autoComplete="off"
          required
          onChange={(event) => onCampo("username", event.target.value)}
        />
      </UsuarioFormCampo>
      <UsuarioFormCampo icon={UserRound} label="Nombre" ayuda="Solo letras, 2 a 40.">
        <input
          className="form-control"
          value={form.nombre}
          maxLength={LIMITES.nombre}
          required
          onChange={(event) => onCampo("nombre", event.target.value)}
        />
      </UsuarioFormCampo>
      <UsuarioFormCampo icon={IdCard} label="Apellido" ayuda="Solo letras, 2 a 40.">
        <input
          className="form-control"
          value={form.apellido}
          maxLength={LIMITES.apellido}
          required
          onChange={(event) => onCampo("apellido", event.target.value)}
        />
      </UsuarioFormCampo>
      <UsuarioFormCampo icon={Shield} label="Rol">
        <select
          className="form-select"
          value={form.rol}
          required
          onChange={(event) => onCampo("rol", event.target.value)}
        >
          <option value="">Seleccione un rol</option>
          {roles.map((rol) => (
            <option key={rol.id_rol} value={rol.id_rol}>{rol.nombre}</option>
          ))}
        </select>
      </UsuarioFormCampo>
      <UsuarioFormCampo icon={Store} label="Sucursal">
        <select
          className="form-select"
          value={form.sucursal}
          required={!esAdmin}
          disabled={esAdmin}
          onChange={(event) => onCampo("sucursal", event.target.value)}
        >
          <option value="">{esAdmin ? "Administración central" : "Seleccione una sucursal"}</option>
          {sucursales.map((item) => (
            <option key={item.id_sucursal} value={item.id_sucursal}>{item.nombre}</option>
          ))}
        </select>
      </UsuarioFormCampo>
      {editando ? null : (
        <UsuarioFormCampo
          icon={Lock}
          label="Contraseña inicial"
          ayuda="8 a 64 caracteres, con al menos una letra y un número."
        >
          <CampoClave
            value={form.clave}
            maxLength={LIMITES.clave}
            minLength={8}
            autoComplete="new-password"
            required
            onChange={(event) => onCampo("clave", event.target.value)}
          />
        </UsuarioFormCampo>
      )}
    </>
  );
}

export default UsuarioFormCampos;
