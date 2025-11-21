// frontend/dosrobles-app/src/services/fichajesService.js
const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000") + "/fichajes";

export async function getFichajesPorEmpleado(empleadoId) {
  const res = await fetch(`${API_URL}/empleado/${empleadoId}`);
  if (res.status === 404) return [];
  if (!res.ok) throw new Error("Error al obtener los fichajes");
  return res.json();
}

export async function updateFichaje(fichajeId, payload) {
  const res = await fetch(`${API_URL}/${fichajeId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => null);
    throw new Error(`Error al actualizar fichaje: ${res.status} ${text || ""}`);
  }
  return res.json();
}

export async function deleteFichaje(fichajeId) {
  const res = await fetch(`${API_URL}/${fichajeId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => null);
    throw new Error(`Error al eliminar fichaje: ${res.status} ${text || ""}`);
  }
  return res.json();
}

export async function crearFichaje(payload) {
  const res = await fetch(`${API_URL}/crear`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => null);
    throw new Error(`Error al crear fichaje: ${res.status} ${text || ""}`);
  }

  return res.json();
}
