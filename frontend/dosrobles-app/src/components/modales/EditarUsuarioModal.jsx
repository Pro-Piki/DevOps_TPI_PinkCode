// src/components/modales/EditarUsuarioModal.jsx
import React, { useState, useEffect } from "react";
import { Box, Stack, Alert } from "@mui/material";
import ModalCard from "../ui/ModalCard";
import ModalDialog from "../ui/ModalDialog";
import { PrimaryButton, SecondaryButton } from "../ui/Buttons";
import BaseInput from "../ui/BaseInput";
import SelectInput from "../ui/SelectInput";
import API_BASE_URL from "../api/apiConfig.js";

const EditarUsuarioModal = ({ open, onClose, usuario, onUsuarioActualizado }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "empleado",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados para el modal de notificación
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");

  useEffect(() => {
    if (open && usuario) {
      setFormData({
        username: usuario.username || "",
        password: "",
        role: usuario.role || "empleado",
      });
      setErrorMessage("");
    }
  }, [open, usuario]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setErrorMessage("");
    if (!formData.username) {
      setErrorMessage("El nombre de usuario es obligatorio.");
      return;
    }

    setLoading(true);
    try {
      // Preparar datos a enviar: no incluir contraseña si está vacía
      const dataToSend = {
        username: formData.username,
        role: formData.role,
      };

      // Solo incluir contraseña si fue modificada (no está vacía)
      if (formData.password && formData.password.trim() !== "") {
        dataToSend.password = formData.password;
      }

      const response = await fetch(`${API_BASE_URL}/users/${usuario._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Error al actualizar usuario");

      setNotificationTitle("Éxito");
      setNotificationMessage("Usuario actualizado correctamente");
      setNotificationOpen(true);
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotificationOpen(false);
    onUsuarioActualizado();
    onClose();
  };

  return (
    <>
      <ModalCard open={open} onClose={onClose} title="Editar Usuario" width={500}>
        <Box sx={{ mt: 2 }}>
          {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}
          <Stack spacing={2}>
            <BaseInput
              label="Nombre de usuario"
              value={formData.username}
              onChange={(e) => handleChange("username", e.target.value)}
              fullWidth
            />
            <BaseInput
              label="Nueva contraseña"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              fullWidth
            />
            <SelectInput
              label="Rol"
              options={[
                { label: "Admin", value: "admin" },
                { label: "Empleado", value: "empleado" },
              ]}
              value={formData.role}
              onChange={(e) => handleChange("role", e.target.value)}
              fullWidth
            />
          </Stack>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
            <SecondaryButton onClick={onClose}>Cancelar</SecondaryButton>
            <PrimaryButton onClick={handleSubmit} disabled={loading}>
              {loading ? "Guardando..." : "Guardar cambios"}
            </PrimaryButton>
          </Box>
        </Box>
      </ModalCard>

      {/* Modal de notificación */}
      <ModalDialog
        open={notificationOpen}
        onClose={handleCloseNotification}
        title={notificationTitle}
        content={notificationMessage}
        actions={[
          {
            label: "Aceptar",
            onClick: handleCloseNotification,
            variant: "contained",
          },
        ]}
      />
    </>
  );
};

export default EditarUsuarioModal;
