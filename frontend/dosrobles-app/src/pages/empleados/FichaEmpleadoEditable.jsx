// src/pages/empleados/FichaEmpleadoEditable.jsx
import React, { useEffect, useState } from "react";
import ModalCard from "../../components/ui/ModalCard";
import ModalDialog from "../../components/ui/ModalDialog";
import FichaEmpleadoBase from "./FichaEmpleadoBase";
import SendMessageModal from "../../components/modales/SendMessageModal";
import { CircularProgress, Box } from "@mui/material";
import API_BASE_URL from "../../api/apiConfig.js";


const FichaEmpleadoEditable = ({ open, onClose, empleado, onEmpleadoActualizado }) => {
  const [empleadoData, setEmpleadoData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nuevaFoto, setNuevaFoto] = useState(null);

  // Estados para el modal de notificaciones
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success");
  const [notificationCallback, setNotificationCallback] = useState(null);

  // Estados para el modal de confirmación de eliminación
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);

  // Estado para el modal de envío de mensaje
  const [messageModalOpen, setMessageModalOpen] = useState(false);

  // Mapeo inverso (backend → frontend)
  const mapBackendToFrontend = (backendData) => {
    const mapped = {
      _id: backendData._id,
      legajo: backendData.numeroLegajo || "-",
      nombre: backendData.nombre || "",
      apellido: backendData.apellido || "",
      tipoDocumento: backendData.tipoDocumento || "",
      fechaAlta: backendData.fechaAlta || "",
      numeroDocumento: backendData.numeroDocumento || "",
      cuil: backendData.cuil || "",
      telefono: backendData.telefono || "",
      email: backendData.email || "",
      area: (backendData.areaTrabajo || "").toString().trim(),
      puesto: backendData.puesto || "",
      categoria: backendData.categoria || "",
      modalidad: backendData.modalidad || "",
      jornada: backendData.jornada || "",
      horario: backendData.horario || "",
      obraSocial: backendData.obraSocial || "",
      art: backendData.art || "",
      tipoRemuneracion: (backendData.tipoRemuneracion || "").toString().trim(),
      sueldo: (backendData.sueldoBruto || "").toString().trim(),
      banco: (backendData.banco || "").toString().trim(),
      cbu: backendData.cbu || "",
      vencimientoContrato: backendData.vencimientoContrato || "",
      categoriaImpositiva: (backendData.categoriaImpositiva || "").toString().trim(),
      estado: backendData.estado || "activo",
      foto:
        backendData._id
          ? `${API_BASE_URL}/empleados/${backendData._id}/imagen?${Date.now()}`
          : "/src/assets/empleados/default-avatar.png",
    };

    return mapped;
  };

  // Cargar datos del empleado
  useEffect(() => {
    if (open && empleado?._id) {
      const fetchEmpleado = async () => {
        try {
          setLoading(true);
          const res = await fetch(`${API_BASE_URL}/empleados/${empleado._id}`);
          if (!res.ok) throw new Error("Error al obtener empleado");
          const data = await res.json();

          const empleadoFormateado = mapBackendToFrontend(data);

          setEmpleadoData(empleadoFormateado);
          setOriginalData(empleadoFormateado);
          setNuevaFoto(null);
        } catch (error) {
          console.error("❌ Error al cargar empleado:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchEmpleado();
    }
  }, [open, empleado]);

  // Maneja cambios de campos
  const handleChange = (field, value) => {
    setEmpleadoData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Maneja cambio de imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNuevaFoto(file);
      const previewURL = URL.createObjectURL(file);
      setEmpleadoData((prev) => ({ ...prev, foto: previewURL }));
    }
  };

  // Mostrar notificación modal
  const showNotification = (title, message, type = "success", callback = null) => {
    setNotificationTitle(title);
    setNotificationMessage(message);
    setNotificationType(type);
    setNotificationCallback(() => callback);
    setNotificationOpen(true);
  };

  // Cerrar notificación
  const handleCloseNotification = () => {
    setNotificationOpen(false);
    if (notificationCallback) {
      notificationCallback();
    }
  };

  // Mapeo de nombres de campos (frontend → backend)
  const mapFieldsToBackend = (data) => {
    const mapping = {
      legajo: "numeroLegajo",
      area: "areaTrabajo",
      sueldo: "sueldoBruto",
    };

    const mapped = {};
    for (const [key, value] of Object.entries(data)) {
      if (key === "foto" || key === "_id") continue;
      const backendKey = mapping[key] || key;
      mapped[backendKey] = value || "";
    }
    return mapped;
  };

  // Guardar cambios
  const handleSave = async () => {
    if (!empleadoData?._id) return;

    try {
      setSaving(true);
      const formData = new FormData();
      const mappedData = mapFieldsToBackend(empleadoData);

      for (const [key, value] of Object.entries(mappedData)) {
        formData.append(key, value);
      }
      if (nuevaFoto) formData.append("imagenPerfil", nuevaFoto);

      const res = await fetch(
        `${API_BASE_URL}/empleados/${empleadoData._id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Error al guardar cambios");

      // Refrescar los datos del empleado para ver la nueva imagen
      const refreshed = await fetch(
        `${API_BASE_URL}/empleados/${empleadoData._id}`
      );
      const updated = await refreshed.json();

      // Mapear los datos del backend a nombres del frontend
      const empleadoActualizado = mapBackendToFrontend(updated);

      setEmpleadoData(empleadoActualizado);
      setOriginalData(empleadoActualizado);
      setEditMode(false);
      setNuevaFoto(null);

      // Mostrar notificación de éxito
      showNotification(
        "Éxito",
        "Cambios guardados correctamente",
        "success",
        () => {
          if (onEmpleadoActualizado) {
            onEmpleadoActualizado();
          }
        }
      );
    } catch (error) {
      console.error("❌ Error al guardar cambios:", error);
      showNotification(
        "Error",
        "Error al guardar los cambios",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // 🔹 Cancelar edición
  const handleCancel = () => {
    setEmpleadoData(originalData);
    setEditMode(false);
    setNuevaFoto(null);
  };

  // 🔹 Mostrar modal de confirmación para eliminar
  const handleDelete = () => {
    if (!empleadoData?._id) return;
    setConfirmDeleteOpen(true);
  };

  // 🔹 Confirmar eliminación
  const handleConfirmDelete = async () => {
    setConfirmDeleteOpen(false);
    if (!empleadoData?._id) return;

    try {
      setPendingDelete(true);
      const res = await fetch(
        `${API_BASE_URL}/empleados/${empleadoData._id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) throw new Error("Error al eliminar empleado");

      // Mostrar notificación de éxito
      showNotification(
        "Éxito",
        "Empleado eliminado correctamente",
        "success",
        () => {
          onClose();
          if (onEmpleadoActualizado) {
            onEmpleadoActualizado();
          }
        }
      );
    } catch (error) {
      console.error("❌ Error al eliminar empleado:", error);
      showNotification(
        "Error",
        "Error al eliminar el empleado",
        "error"
      );
    } finally {
      setPendingDelete(false);
    }
  };

  // 🔹 Cancelar eliminación
  const handleCancelDelete = () => {
    setConfirmDeleteOpen(false);
  };

  // Botones del modal
  const actions = editMode
    ? [
        {
          label: saving ? "Guardando..." : "Guardar cambios",
          onClick: handleSave,
          variant: "contained",
          disabled: saving,
        },
        { label: "Cancelar", onClick: handleCancel, variant: "outlined" },
      ]
    : [
        {
          label: "Editar",
          onClick: () => setEditMode(true),
          variant: "contained",
        },
        {
          label: "Enviar Mensaje",
          onClick: () => setMessageModalOpen(true),
          variant: "outlined",
        },
        {
          label: "Eliminar empleado",
          onClick: handleDelete,
          variant: "outlined",
        },
      ];

  if (!open) return null;

  return (
    <>
      <ModalCard
        open={open}
        onClose={onClose}
        title="Ficha del Empleado"
        width={1000}
        actions={actions}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : empleadoData ? (
          <FichaEmpleadoBase
            data={empleadoData}
            readOnly={!editMode}
            onChange={handleChange}
            onImageChange={handleImageChange}
          />
        ) : (
          <Box sx={{ p: 3, textAlign: "center" }}>
            No se pudo cargar la información del empleado.
          </Box>
        )}
      </ModalCard>

      {/* Modal de notificaciones */}
      <ModalDialog
        open={notificationOpen}
        onClose={handleCloseNotification}
        title={notificationTitle}
        content={notificationMessage}
        actions={[
          {
            label: "Aceptar",
            onClick: handleCloseNotification,
            variant: notificationType === "error" ? "outlined" : "contained",
          },
        ]}
      />

      {/* Modal de confirmación de eliminación */}
      <ModalDialog
        open={confirmDeleteOpen}
        onClose={handleCancelDelete}
        title="Confirmar eliminación"
        content={`¿Estás seguro de que deseas eliminar al empleado ${empleadoData?.nombre} ${empleadoData?.apellido}?`}
        actions={[
          {
            label: "Cancelar",
            onClick: handleCancelDelete,
            variant: "outlined",
          },
          {
            label: "Eliminar",
            onClick: handleConfirmDelete,
            variant: "contained",
            disabled: pendingDelete,
          },
        ]}
      />

      {/* Modal de envío de mensaje */}
      <SendMessageModal
        open={messageModalOpen}
        onClose={() => setMessageModalOpen(false)}
        empleado={empleadoData}
        onMessageSent={() => {
          console.log("✅ Mensaje enviado al empleado");
        }}
      />
    </>
  );
};

export default FichaEmpleadoEditable;

