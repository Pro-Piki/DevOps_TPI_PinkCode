// src/components/modales/NuevoUsuarioModal.jsx
import React, { useState, useEffect } from "react";
import { Box, Stack, Typography, Alert } from "@mui/material";
import ModalCard from "../ui/ModalCard";
import ModalDialog from "../ui/ModalDialog";
import { PrimaryButton, SecondaryButton } from "../ui/Buttons";
import BaseInput from "../ui/BaseInput";
import SelectInput from "../ui/SelectInput";
import API_BASE_URL from "../../api/apiConfig.js";


const NuevoUsuarioModal = ({ open, onClose, onUsuarioGuardado }) => {
  const [formData, setFormData] = useState({
    legajo: "",
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
    if (open) {
      setFormData({
        legajo: "",
        username: "",
        password: "",
        role: "empleado",
      });
      setErrorMessage("");
    }
  }, [open]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setErrorMessage("");
    if (!formData.username || !formData.password) {
      setErrorMessage("Ingrese nombre de usuario y contraseña.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Error al registrar usuario");

      setNotificationTitle("Éxito");
      setNotificationMessage("Usuario registrado correctamente");
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
    onUsuarioGuardado();
    onClose();
  };

  return (
    <>
      <ModalCard
        open={open}
        onClose={onClose}
        title="Nuevo Usuario"
        width={500}
      >
        <Box sx={{ mt: 2 }}>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}
          <Stack spacing={2}>
            <BaseInput
              label="Número de legajo"
              value={formData.legajo}
              onChange={(e) => handleChange("legajo", e.target.value)}
              fullWidth
            />
            <BaseInput
              label="Nombre de usuario"
              value={formData.username}
              onChange={(e) => handleChange("username", e.target.value)}
              fullWidth
            />
            <BaseInput
              label="Contraseña"
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

          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}
          >
            <SecondaryButton onClick={onClose}>Cancelar</SecondaryButton>
            <PrimaryButton onClick={handleSubmit} disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
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

export default NuevoUsuarioModal;
