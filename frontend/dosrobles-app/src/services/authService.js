// frontend/dosrobles-app/src/services/authService.js

import API_BASE_URL from "../api/apiConfig";

const API_URL = `${API_BASE_URL}/auth`;

export const authService = {
  // Login
  login: async (username, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al iniciar sesión");
      }

      // Guardar token en localStorage
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      const token = localStorage.getItem("token");

      if (token) {
        await fetch(`${API_URL}/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.warn("Advertencia en logout API:", error);
    } finally {
      localStorage.clear();
      console.log("✅ Sesión cerrada localmente");
    }
  },

  // Verificar token
  verificarToken: async (token) => {
    try {
      const response = await fetch(`${API_URL}/verificar`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Token inválido");
      }

      return data;
    } catch (error) {
      console.error("Error verificando token:", error);
      throw error;
    }
  },

  // Obtener usuario
  getUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // Obtener token
  getToken: () => {
    return localStorage.getItem("token");
  },

  // Verificar autenticación
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  // Verificar rol
  hasRole: (requiredRole) => {
    const user = authService.getUser();
    if (!user) return false;
    if (requiredRole instanceof Array) {
      return requiredRole.includes(user.role);
    }
    return user.role === requiredRole;
  },
};
