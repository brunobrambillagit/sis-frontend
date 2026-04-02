import { useState } from "react";
import { cambiarPassword } from "../api/authApi";

export default function CambiarPasswordModal({ onClose, onSuccess }) {
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");

  const handleSubmit = async () => {
    try {
      await cambiarPassword({ passwordActual, passwordNueva });
      onSuccess("Contraseña actualizada correctamente");
      onClose();
    } catch (e) {
      onSuccess(e.response?.data || "Error al cambiar contraseña");
    }
  };

  return (
    <div className="modal">
      <h3>Cambiar contraseña</h3>

      <input
        type="password"
        placeholder="Contraseña actual"
        value={passwordActual}
        onChange={(e) => setPasswordActual(e.target.value)}
      />

      <input
        type="password"
        placeholder="Nueva contraseña"
        value={passwordNueva}
        onChange={(e) => setPasswordNueva(e.target.value)}
      />

      <button onClick={handleSubmit}>Guardar</button>
      <button onClick={onClose}>Cancelar</button>
    </div>
  );
}