import Documento from "../models/Documento.js";
import Empleado from "../models/Empleado.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, "../../uploads/documentos");

// Obtener TODOS los documentos (para debug)
export const obtenerTodosLosDocumentos = async (req, res) => {
  try {
    const documentos = await Documento.find().populate("empleadoId", "nombre apellido legajo").sort({
      fechaCarga: -1,
    });

    return res.status(200).json({
      success: true,
      data: documentos,
      total: documentos.length,
    });
  } catch (error) {
    console.error("Error al obtener todos los documentos:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener documentos",
      error: error.message,
    });
  }
};

// Obtener documentos del empleado
export const obtenerDocumentos = async (req, res) => {
  try {
    const { empleadoId } = req.query;

    if (!empleadoId) {
      return res.status(400).json({
        success: false,
        message: "empleadoId es requerido",
      });
    }

    // Verificar que el empleado existe
    const empleado = await Empleado.findById(empleadoId);
    if (!empleado) {
      return res.status(404).json({
        success: false,
        message: "Empleado no encontrado",
      });
    }

    // Obtener documentos ordenados por fecha descendente
    const documentos = await Documento.find({ empleadoId }).sort({
      fechaCarga: -1,
    });

    return res.status(200).json({
      success: true,
      data: documentos,
    });
  } catch (error) {
    console.error("Error al obtener documentos:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener documentos",
      error: error.message,
    });
  }
};

// Crear nuevo documento con archivo
export const crearDocumento = async (req, res) => {
  try {
    const archivo = req.file;

    // Con FormData y multer, los campos pueden estar en req.body o como arrays
    // Multer pone cada campo de texto como un array: { empleadoId: ['valor'] }
    const obtenerCampo = (obj, clave) => {
      const valor = obj?.[clave];
      return Array.isArray(valor) ? valor[0] : valor;
    };

    const empleadoId = obtenerCampo(req.body, "empleadoId");
    const tipoDocumento = obtenerCampo(req.body, "tipoDocumento");
    const tipoNombre = obtenerCampo(req.body, "tipoNombre");
    const descripcion = obtenerCampo(req.body, "descripcion");

    // Validar entrada
    if (!empleadoId || !tipoDocumento || !tipoNombre) {
      if (archivo && fs.existsSync(archivo.path)) {
        fs.unlinkSync(archivo.path);
      }
      return res.status(400).json({
        success: false,
        message: "Faltan campos requeridos",
      });
    }

    // Validar que haya archivo
    if (!archivo) {
      return res.status(400).json({
        success: false,
        message: "No se proporcionó archivo",
      });
    }

    // Validar que sea PDF
    if (archivo.mimetype !== "application/pdf") {
      fs.unlinkSync(archivo.path);
      return res.status(400).json({
        success: false,
        message: "Solo se permiten archivos PDF",
      });
    }

    // Verificar que el empleado existe
    const empleado = await Empleado.findById(empleadoId);
    if (!empleado) {
      fs.unlinkSync(archivo.path);
      return res.status(404).json({
        success: false,
        message: "Empleado no encontrado",
      });
    }

    // Crear directorio si no existe
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    // Generar nombre único para el archivo
    const nombreUnico = `${Date.now()}_${archivo.originalname}`;
    const rutaArchivo = path.join(UPLOAD_DIR, nombreUnico);

    // Guardar archivo en la ubicación final
    fs.renameSync(archivo.path, rutaArchivo);

    // Crear documento en la base de datos
    const documento = new Documento({
      empleadoId,
      tipoDocumento,
      tipoNombre,
      nombreArchivo: archivo.originalname,
      rutaArchivo: rutaArchivo,
      nombreUnico: nombreUnico,
      descripcion,
      tamanio: archivo.size,
    });

    await documento.save();

    return res.status(201).json({
      success: true,
      message: "Documento subido exitosamente",
      data: documento,
    });
  } catch (error) {
    console.error("Error al crear documento:", error);
    // Limpiar archivo si existe
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      success: false,
      message: "Error al subir documento",
      error: error.message,
    });
  }
};

// Obtener documento por ID
export const obtenerDocumentoById = async (req, res) => {
  try {
    const { id } = req.params;

    const documento = await Documento.findById(id).populate("empleadoId");

    if (!documento) {
      return res.status(404).json({
        success: false,
        message: "Documento no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      data: documento,
    });
  } catch (error) {
    console.error("Error al obtener documento:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener documento",
      error: error.message,
    });
  }
};

// Descargar documento (archivo guardado)
export const descargarDocumento = async (req, res) => {
  try {
    const { id } = req.params;

    const documento = await Documento.findById(id);

    if (!documento) {
      return res.status(404).json({
        success: false,
        message: "Documento no encontrado",
      });
    }

    // Verificar que el archivo existe
    if (!documento.rutaArchivo || !fs.existsSync(documento.rutaArchivo)) {
      return res.status(404).json({
        success: false,
        message: "El archivo no se encontró en el servidor",
      });
    }

    // Configurar headers para descarga
    res.setHeader("Content-Type", "application/pdf");

    // Usar el nombre original con encoding UTF-8
    const nombreEncodeado = encodeURIComponent(documento.nombreArchivo);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${nombreEncodeado}`
    );

    // Leer y enviar el archivo
    const fileStream = fs.createReadStream(documento.rutaArchivo);
    fileStream.pipe(res);

    fileStream.on("error", (error) => {
      console.error("Error al leer archivo:", error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Error al descargar documento",
        });
      }
    });
  } catch (error) {
    console.error("Error al descargar documento:", error);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Error al descargar documento",
        error: error.message,
      });
    }
  }
};

// Eliminar documento y su archivo
export const eliminarDocumento = async (req, res) => {
  try {
    const { id } = req.params;

    const documento = await Documento.findByIdAndDelete(id);

    if (!documento) {
      return res.status(404).json({
        success: false,
        message: "Documento no encontrado",
      });
    }

    // Eliminar el archivo del filesystem si existe
    if (documento.rutaArchivo && fs.existsSync(documento.rutaArchivo)) {
      try {
        fs.unlinkSync(documento.rutaArchivo);
      } catch (err) {
        console.error("Error al eliminar archivo del filesystem:", err);
        // No fallar la operación si no se puede eliminar el archivo
      }
    }

    return res.status(200).json({
      success: true,
      message: "Documento eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar documento:", error);
    return res.status(500).json({
      success: false,
      message: "Error al eliminar documento",
      error: error.message,
    });
  }
};
