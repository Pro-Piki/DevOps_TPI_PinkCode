// src/pages/empleados/HistorialFichajes.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CustomTable from "../../components/ui/CustomTable";
import ModalCard from "../../components/ui/ModalCard";
import ModalDialog from "../../components/ui/ModalDialog";
import { PrimaryButton } from "../../components/ui/Buttons";
import {
  getFichajesPorEmpleado,
  updateFichaje,
  deleteFichaje,
  crearFichaje,
} from "../../services/fichajesService";
import { useFichaje } from "../../context/fichajeContextHelper";

const HistorialFichajes = () => {
  const navigate = useNavigate();
  const { notificarCambioFichaje } = useFichaje();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [empleado, setEmpleado] = useState(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);

  // Modal
  const [openModal, setOpenModal] = useState(false);
  const [fichajeEdit, setFichajeEdit] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [fichajeToDelete, setFichajeToDelete] = useState(null);

  // Estados para validación de horario
  const [createErrors, setCreateErrors] = useState({
    horaEntrada: "",
    horaSalida: "",
  });
  const [editErrors, setEditErrors] = useState({
    horaEntrada: "",
    horaSalida: "",
  });

  // Función para validar formato HH:MM
  const validateTimeFormat = (time) => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  const { empleadoId } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isAdminView = searchParams.get("admin") === "true";
  const mesParam = searchParams.get("mes");
  const anioParam = searchParams.get("anio");

  // Obtener el empleadoId del usuario logueado
  const user = JSON.parse(localStorage.getItem("user"));
  const userEmpleadoId = user?.empleadoId;

  // Si hay parámetro, usarlo; si no, usar el del usuario logueado
  const idFinal = empleadoId || userEmpleadoId;

  // ===== Toast
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const columns = [
    "Fecha",
    "Hora Ingreso",
    "Hora Salida",
    "Hs Trabajadas",
    "Hs Estimadas",
    ...(isAdminView ? ["Acciones"] : []),
  ];

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        let data = await getFichajesPorEmpleado(idFinal);

        // Filtrar por mes y año si están especificados en la URL
        data = filterFichajesByMonthYear(data);

        // Intentar extraer el nombre y apellido del primer fichaje (si viene populate)
        let empleadoInfo = {
          nombre: "Empleado",
          apellido: "",
        };

        if (Array.isArray(data) && data.length > 0) {
          // Si el first fichaje tiene empleadoId como objeto populate, usarlo
          if (data[0].empleadoId?.nombre) {
            empleadoInfo = {
              nombre: data[0].empleadoId.nombre || "Empleado",
              apellido: data[0].empleadoId.apellido || "",
            };
          } else {
            // Si no, hacer fetch al endpoint de empleados
            const API_BASE =
              import.meta.env.VITE_API_URL || "http://localhost:4000";
            const empleadoResponse = await fetch(
              `${API_BASE}/empleados/${idFinal}`
            );
            const empleadoData = await empleadoResponse.json();

            empleadoInfo = {
              nombre: empleadoData.nombre || "Empleado",
              apellido: empleadoData.apellido || "",
            };
          }

          setEmpleado(empleadoInfo);
          const formattedRows = data.map((fichaje) => formatRow(fichaje));
          setRows(formattedRows);
        } else {
          setError("No hay fichajes registrados para este empleado");
        }
      } catch (err) {
        console.error(err);
        setError("Error al cargar los fichajes");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [idFinal, isAdminView, mesParam, anioParam]);

  // === Función para filtrar fichajes por mes y año ===
  const filterFichajesByMonthYear = (data) => {
    if (mesParam && anioParam && Array.isArray(data)) {
      return data.filter((fichaje) => {
        const fechaFichaje = new Date(fichaje.fecha);
        const mesFichaje = fechaFichaje.getMonth() + 1;
        const anioFichaje = fechaFichaje.getFullYear();
        return mesFichaje === parseInt(mesParam) && anioFichaje === parseInt(anioParam);
      });
    }
    return data;
  };

  // === Formateador de filas ===
  const formatRow = (fichaje) => {
    const fechaObj = new Date(fichaje.fecha);
    const opcionesDia = { weekday: "short" };
    const opcionesMes = { day: "2-digit", month: "short" };

    return {
      _id: fichaje._id,
      fecha: (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography sx={{ fontWeight: 600 }}>
            {fechaObj.toLocaleDateString("es-AR", opcionesMes)}
          </Typography>
          <Typography variant="body2" sx={{ color: "#808080" }}>
            {fechaObj.toLocaleDateString("es-AR", opcionesDia)}
          </Typography>
        </Box>
      ),
      horaIngreso: fichaje.horaEntrada ? `${fichaje.horaEntrada} hs` : "-",
      horaSalida: fichaje.horaSalida ? `${fichaje.horaSalida} hs` : "-",
      hsTrabajadas: fichaje.totalTrabajado || "-",
      hsEstimadas: "08:00 hs",
      ...(isAdminView && {
        acciones: (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleEdit(fichaje)}
            >
              Editar
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => handleDeleteClick(fichaje)}
            >
              Eliminar
            </Button>
          </Box>
        ),
      }),
    };
  };

  // === Abrir modal de edición ===
  const handleEdit = (fichaje) => {
    setFichajeEdit(fichaje);
    setOpenModal(true);
  };

  // === Guardar cambios del modal ===
  const handleSave = async (e) => {
    e.preventDefault();

    const horaEntrada = e.target.horaEntrada.value.trim();
    const horaSalida = e.target.horaSalida.value.trim();
    const errors = { horaEntrada: "", horaSalida: "" };

    // Validar que no estén vacíos
    if (!horaEntrada || !horaSalida) {
      setToast({
        open: true,
        message: "Debes completar las horas de entrada y salida.",
        severity: "warning",
      });
      return;
    }

    // Validar formato HH:MM
    if (!validateTimeFormat(horaEntrada)) {
      errors.horaEntrada = "Formato inválido. Usa HH:MM (ej: 09:00)";
    }
    if (!validateTimeFormat(horaSalida)) {
      errors.horaSalida = "Formato inválido. Usa HH:MM (ej: 17:00)";
    }

    // Si hay errores, mostrarlos y retornar
    if (errors.horaEntrada || errors.horaSalida) {
      setEditErrors(errors);
      setToast({
        open: true,
        message: "El formato de horario debe ser HH:MM (ej: 09:00)",
        severity: "error",
      });
      return;
    }

    const updatedData = {
      fecha: new Date(e.target.fecha?.value + "T00:00:00").toISOString(),
      horaEntrada,
      horaSalida,
      tipoFichaje: e.target.tipoFichaje.value.trim(),
    };

    try {
      await updateFichaje(fichajeEdit._id, updatedData);
      setOpenModal(false);
      setEditErrors({ horaEntrada: "", horaSalida: "" });

      let refreshed = await getFichajesPorEmpleado(idFinal);
      // Aplicar el mismo filtro que en el useEffect
      refreshed = filterFichajesByMonthYear(refreshed);
      setRows(refreshed.map((f) => formatRow(f)));
      setToast({
        open: true,
        message: "Fichaje actualizado con éxito",
        severity: "success",
      });
      // Notificar al contexto para actualizar el estado del equipo
      await notificarCambioFichaje();
    } catch (err) {
      console.error("❌ Error al actualizar fichaje:", err);
      setToast({
        open: true,
        message: "Error al actualizar el fichaje",
        severity: "error",
      });
    }
  };

  // === Abrir modal de confirmación para eliminar ===
  const handleDeleteClick = (fichaje) => {
    setFichajeToDelete(fichaje);
    setDeleteConfirmOpen(true);
  };

  // === Cancelar eliminación ===
  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setFichajeToDelete(null);
  };

  // === Confirmar y ejecutar eliminación ===
  const handleConfirmDelete = async () => {
    if (!fichajeToDelete) return;

    try {
      await deleteFichaje(fichajeToDelete._id);
      setRows((prev) => prev.filter((f) => f._id !== fichajeToDelete._id));
      setDeleteConfirmOpen(false);
      setFichajeToDelete(null);
      setToast({
        open: true,
        message: "✅ Fichaje eliminado correctamente",
        severity: "success",
      });
      // Notificar al contexto para actualizar el estado del equipo
      await notificarCambioFichaje();
    } catch (err) {
      console.error(err);
      setToast({
        open: true,
        message:
          "❌ Error al eliminar el fichaje. Ver consola para más detalles.",
        severity: "error",
      });
    }
  };

  //=====Crear fichaje manual=====
  const handleCreate = async (e) => {
    e.preventDefault();

    const tipoFichaje = e.target.tipoFichaje.value.trim().toLowerCase();
    const horaEntrada = e.target.horaEntrada.value.trim();
    const horaSalida = e.target.horaSalida.value.trim();
    let fechaInput = e.target.fecha?.value; // formato YYYY-MM-DD
    const errors = { horaEntrada: "", horaSalida: "" };

    if (!horaEntrada || !horaSalida) {
      setToast({
        open: true,
        message: "Debes completar las horas de entrada y salida.",
        severity: "warning",
      });
      return;
    }

    // Validar formato HH:MM
    if (!validateTimeFormat(horaEntrada)) {
      errors.horaEntrada = "Formato inválido. Usa HH:MM (ej: 09:00)";
    }
    if (!validateTimeFormat(horaSalida)) {
      errors.horaSalida = "Formato inválido. Usa HH:MM (ej: 17:00)";
    }

    // Si hay errores, mostrarlos y retornar
    if (errors.horaEntrada || errors.horaSalida) {
      setCreateErrors(errors);
      setToast({
        open: true,
        message: "El formato de horario debe ser HH:MM (ej: 09:00)",
        severity: "error",
      });
      return;
    }

    // Ajuste de fecha para que no reste un día
    const fecha = fechaInput ? new Date(fechaInput + "T00:00:00") : new Date();
    const fechaISO = fecha.toISOString(); // enviamos ISO al backend

    // Definir ubicación según tipo
    const ubicacion =
      tipoFichaje === "oficina"
        ? { lat: -34.61, lon: -58.38 }
        : { lat: undefined, lon: undefined };

    const nuevoFichaje = {
      empleadoId: idFinal,
      fecha: fechaISO,
      horaEntrada,
      horaSalida,
      tipoFichaje,
      ubicacion,
      ubicacionSalida: { lat: null, lon: null },
      pausas: [],
    };

    try {
      await crearFichaje(nuevoFichaje);
      setOpenCreateModal(false);
      setCreateErrors({ horaEntrada: "", horaSalida: "" });

      let refreshed = await getFichajesPorEmpleado(idFinal);
      // Aplicar el mismo filtro que en el useEffect
      refreshed = filterFichajesByMonthYear(refreshed);
      setRows(refreshed.map((f) => formatRow(f)));
      setError(null);
      setToast({
        open: true,
        message: "Fichaje creado con éxito",
        severity: "success",
      });
      // Notificar al contexto para actualizar el estado del equipo
      await notificarCambioFichaje();
    } catch (err) {
      console.error("❌ Error al crear fichaje:", err);
      setToast({
        open: true,
        message: "Error al crear el fichaje",
        severity: "error",
      });
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* === Encabezado === */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 600, color: "#585858", mb: 1 }}
        >
          {isAdminView
            ? `Historial de ${
                empleado
                  ? `${empleado.nombre} ${empleado.apellido}`
                  : "Empleado"
              }`
            : "Mis Fichajes"}
        </Typography>
        {isAdminView ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color: "#808080",
            }}
          >
            <Typography variant="body2">
              Podés revisar y editar los fichajes del personal.
            </Typography>
            {empleado && (
              <Typography
                variant="body2"
                sx={{ fontStyle: "italic", fontWeight: 500 }}
              >
                Empleado: {empleado.nombre} {empleado.apellido}
              </Typography>
            )}
          </Box>
        ) : (
          <Typography variant="body2" sx={{ color: "#808080" }}>
            Visualizá tu historial de fichajes recientes y compará las horas
            trabajadas con las estimadas.
          </Typography>
        )}
      </Box>

      {/* === Contenido Dinámico === */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : rows.length > 0 ? (
        <CustomTable columns={columns} rows={rows} maxHeight="600px" />
      ) : (
        <Typography sx={{ color: "error.main", mt: 2, textAlign: "center" }}>
          {error || "No hay fichajes registrados para este empleado."}
        </Typography>
      )}

      {/* === Modal de edición === */}
      {openModal && (
        <ModalCard
          open={openModal}
          onClose={() => setOpenModal(false)}
          title="Editar Fichaje"
        >
          <form onSubmit={handleSave}>
            <TextField
              name="fecha"
              label="Fecha"
              type="date"
              defaultValue={
                fichajeEdit.fecha
                  ? new Date(fichajeEdit.fecha).toISOString().split("T")[0]
                  : new Date().toISOString().split("T")[0]
              }
              fullWidth
              margin="normal"
            />
            <TextField
              name="horaEntrada"
              label="Hora de entrada"
              placeholder="HH:MM (ej: 09:00)"
              defaultValue={fichajeEdit.horaEntrada}
              fullWidth
              margin="normal"
              error={!!editErrors.horaEntrada}
              helperText={editErrors.horaEntrada}
              onChange={() => setEditErrors({ ...editErrors, horaEntrada: "" })}
            />
            <TextField
              name="horaSalida"
              label="Hora de salida"
              placeholder="HH:MM (ej: 17:00)"
              defaultValue={fichajeEdit.horaSalida}
              fullWidth
              margin="normal"
              error={!!editErrors.horaSalida}
              helperText={editErrors.horaSalida}
              onChange={() => setEditErrors({ ...editErrors, horaSalida: "" })}
            />
            <TextField
              name="tipoFichaje"
              label="Tipo de fichaje"
              defaultValue={fichajeEdit.tipoFichaje}
              fullWidth
              margin="normal"
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button onClick={() => setOpenModal(false)} sx={{ mr: 2 }}>
                Cancelar
              </Button>
              <Button type="submit" variant="contained">
                Guardar
              </Button>
            </Box>
          </form>
        </ModalCard>
      )}

      {/* === Modal de creación === */}
      {openCreateModal && (
        <ModalCard
          open={openCreateModal}
          onClose={() => setOpenCreateModal(false)}
          title="Nuevo Fichaje"
        >
          <form onSubmit={handleCreate}>
            <TextField
              name="fecha"
              label="Fecha"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              fullWidth
              margin="normal"
            />
            <TextField
              name="horaEntrada"
              label="Hora de entrada"
              placeholder="HH:MM (ej: 09:00)"
              fullWidth
              margin="normal"
              error={!!createErrors.horaEntrada}
              helperText={createErrors.horaEntrada}
              onChange={() => setCreateErrors({ ...createErrors, horaEntrada: "" })}
            />
            <TextField
              name="horaSalida"
              label="Hora de salida"
              placeholder="HH:MM (ej: 17:00)"
              fullWidth
              margin="normal"
              error={!!createErrors.horaSalida}
              helperText={createErrors.horaSalida}
              onChange={() => setCreateErrors({ ...createErrors, horaSalida: "" })}
            />
            <TextField
              name="tipoFichaje"
              label="Tipo de fichaje (oficina / remoto)"
              defaultValue="oficina"
              fullWidth
              margin="normal"
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button onClick={() => setOpenCreateModal(false)} sx={{ mr: 2 }}>
                Cancelar
              </Button>
              <Button type="submit" variant="contained">
                Guardar
              </Button>
            </Box>
          </form>
        </ModalCard>
      )}

      {/* === Modal de confirmación para eliminar === */}
      <ModalDialog
        open={deleteConfirmOpen}
        onClose={handleCancelDelete}
        title="Confirmar eliminación"
        content={
          fichajeToDelete
            ? `¿Estás seguro de que deseas eliminar el fichaje del ${new Date(
                fichajeToDelete.fecha
              ).toLocaleDateString("es-AR")}?`
            : "¿Estás seguro de que deseas eliminar este fichaje?"
        }
        actions={[
          {
            label: "Cancelar",
            variant: "outlined",
            onClick: handleCancelDelete,
          },
          {
            label: "Eliminar",
            variant: "contained",
            color: "error",
            onClick: handleConfirmDelete,
          },
        ]}
      />

      {/* === Botones de acción === */}
      {isAdminView && (
        <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => {
              // Volver a FichajeEmpleados con los parámetros mes y año
              const query = mesParam && anioParam ? `?mes=${mesParam}&anio=${anioParam}` : "";
              navigate(`/fichaje/empleados${query}`);
            }}
            sx={{ textTransform: "none", color: "#585858" }}
          >
            Volver
          </Button>
          <Box sx={{ flex: 1 }}>
            <PrimaryButton fullWidth onClick={() => setOpenCreateModal(true)}>
              Agregar fichaje
            </PrimaryButton>
          </Box>
        </Box>
      )}

      {/* === Snackbar Toast === */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }} // <- aquí
        sx={{
          position: "absolute",
          top: 50,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2000,
        }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HistorialFichajes;
