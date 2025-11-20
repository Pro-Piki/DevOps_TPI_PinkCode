// src/services/notificacionesService.js
// Servicio para gestionar notificaciones desde el frontend

import API_BASE_URL from "../api/apiConfig";

const API_URL = `${API_BASE_URL}/notificaciones`;

export const notificacionesService = {
  // Obtener todas las notificaciones (para gerentes/admin)
  obtenerTodasLasNotificaciones: async () => {
    try {
      const response = await fetch(`${API_URL}/todas`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error al obtener todas las notificaciones:", error);
      throw error;
    }
  },

  // Obtener todas las notificaciones de un empleado
  obtenerNotificaciones: async (empleadoId) => {
    try {
      const response = await fetch(`${API_URL}/empleado/${empleadoId}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error al obtener notificaciones:", error);
      throw error;
    }
  },

  // Obtener solo notificaciones no leídas de un empleado
  obtenerNotificacionesNoLeidas: async (empleadoId) => {
    try {
      const response = await fetch(
        `${API_URL}/empleado/${empleadoId}/no-leidas`
      );
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error al obtener notificaciones no leídas:", error);
      throw error;
    }
  },

  // Crear una nueva notificación
  crearNotificacion: async (datosNotificacion) => {
    try {
      const token = localStorage.getItem("token");

      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(datosNotificacion),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error al crear notificación:", error);
      throw error;
    }
  },

  // Marcar una notificación como leída
  marcarComoLeida: async (notificacionId) => {
    try {
      const response = await fetch(
        `${API_URL}/${notificacionId}/marcar-leida`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error al marcar notificación como leída:", error);
      throw error;
    }
  },

  // Marcar todas como leídas
  marcarTodasComoLeidas: async (empleadoId) => {
    try {
      const response = await fetch(
        `${API_URL}/empleado/${empleadoId}/marcar-todas-leidas`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(
        "Error al marcar todas las notificaciones como leídas:",
        error
      );
      throw error;
    }
  },

  // Eliminar una notificación
  eliminarNotificacion: async (notificacionId) => {
    try {
      const response = await fetch(`${API_URL}/${notificacionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error al eliminar notificación:", error);
      throw error;
    }
  },

  // Eliminar todas las notificaciones leídas
  eliminarNotificacionesLeidas: async (empleadoId) => {
    try {
      const response = await fetch(
        `${API_URL}/empleado/${empleadoId}/eliminar-leidas`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error al eliminar notificaciones leídas:", error);
      throw error;
    }
  },
};
