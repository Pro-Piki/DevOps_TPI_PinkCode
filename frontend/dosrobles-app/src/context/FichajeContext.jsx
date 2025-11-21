import React, { createContext, useState, useCallback, useEffect } from "react";

export const FichajeContext = createContext();

export const FichajeProvider = ({ children }) => {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const [estadoEquipo, setEstadoEquipo] = useState({
    fichados: 0,
    ausentes: 0,
    totalEmpleados: 0,
  });

  // Función para actualizar el estado del equipo
  const fetchEstadoEquipo = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/fichajes/estado`);
      if (res.ok) {
        const data = await res.json();
        setEstadoEquipo(data);
      }
    } catch (error) {
      console.error("Error al obtener estado del equipo:", error);
    }
  }, [API_BASE]);

  // Cargar estado inicial al montar
  useEffect(() => {
    fetchEstadoEquipo();
  }, [fetchEstadoEquipo]);

  // Función para notificar cambios en fichajes (inicio/salida)
  const notificarCambioFichaje = useCallback(async () => {
    // Actualizar el estado del equipo después de que alguien inicia/termina fichaje
    await fetchEstadoEquipo();
  }, [fetchEstadoEquipo]);

  const value = {
    estadoEquipo,
    fetchEstadoEquipo,
    notificarCambioFichaje,
  };

  return (
    <FichajeContext.Provider value={value}>
      {children}
    </FichajeContext.Provider>
  );
};
