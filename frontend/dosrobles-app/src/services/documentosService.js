// frontend/dosrobles-app/src/services/documentosService.js

import API_BASE_URL from "../api/apiConfig";

const API_URL = `${API_BASE_URL}/documentos`;

export const documentosService = {
  // Obtener documentos del empleado
  obtenerDocumentos: async (empleadoId) => {
    try {
      const response = await fetch(`${API_URL}?empleadoId=${empleadoId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al obtener documentos");
      }

      return data;
    } catch (error) {
      console.error("Error en obtenerDocumentos:", error);
      throw error;
    }
  },

  // Crear/subir nuevo documento con archivo
  crearDocumento: async (documentoData) => {
    try {
      const isFormData = documentoData instanceof FormData;

      const response = await fetch(API_URL, {
        method: "POST",
        headers: isFormData ? {} : { "Content-Type": "application/json" },
        body: isFormData ? documentoData : JSON.stringify(documentoData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al subir documento");
      }

      return data;
    } catch (error) {
      console.error("Error en crearDocumento:", error);
      throw error;
    }
  },

  // Obtener un documento por ID
  obtenerDocumentoById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al obtener documento");
      }

      return data;
    } catch (error) {
      console.error("Error en obtenerDocumentoById:", error);
      throw error;
    }
  },

  // Descargar archivo PDF
  descargarDocumento: async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}/descargar`);

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let data;

        if (contentType?.includes("application/json")) {
          data = await response.json();
        } else {
          data = { message: await response.text() };
        }

        throw new Error(data.message || "Error al descargar documento");
      }

      // Validar PDF
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/pdf")) {
        throw new Error("El archivo descargado no es un PDF válido");
      }

      const blob = await response.blob();

      // Nombre del archivo
      const contentDisposition = response.headers.get("content-disposition");
      let filename = "documento.pdf";

      if (contentDisposition) {
        let match =
          contentDisposition.match(/filename\*=UTF-8''(.+?)(?:;|$)/) ||
          contentDisposition.match(/filename="?([^";]+)"?/);

        if (match && match[1]) {
          try {
            filename = decodeURIComponent(match[1]);
          } catch {
            filename = match[1];
          }
        }

        if (!filename.endsWith(".pdf")) {
          filename += ".pdf";
        }
      }

      return { blob, filename };
    } catch (error) {
      console.error("Error en descargarDocumento:", error);
      throw error;
    }
  },

  // Eliminar documento
  eliminarDocumento: async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al eliminar documento");
      }

      return data;
    } catch (error) {
      console.error("Error en eliminarDocumento:", error);
      throw error;
    }
  },
};
