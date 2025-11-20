// src/components/modales/VerUsuarioModal.jsx
import React from "react";
import { Box, Stack, Divider } from "@mui/material";
import ModalCard from "../ui/ModalCard";
import { PrimaryButton, SecondaryButton } from "../ui/Buttons";
import BaseInput from "../ui/BaseInput";
import SelectInput from "../ui/SelectInput";
import { Avatar } from "@mui/material";
import { Typography } from "@mui/material";
import API_BASE_URL from "../api/apiConfig.js";


const VerUsuarioModal = ({ open, onClose, usuario, onEditar, onEliminar }) => {
  if (!usuario) return null;

  return (
    <ModalCard open={open} onClose={onClose} title="Detalle del Usuario" width={500}>
      <Box sx={{ mt: 2 }}>
        {usuario.empleado && (
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <Avatar
                    src={`${API_BASE_URL}/empleados/${usuario.empleado._id}/imagen`}
                    alt="Foto de perfil"
                    sx={{ width: 100, height: 100 }}
                />
            </Box>
        )}
        {usuario.empleado && (
            <Typography align="center" sx={{ fontWeight: 500, mb: 2 }}>
                {usuario.empleado.nombre} {usuario.empleado.apellido}
            </Typography>
        )}
        <Stack spacing={2}>
          <BaseInput label="Número de legajo" value={usuario.empleado?.numeroLegajo || "—"} fullWidth disabled />
          <BaseInput label="Nombre de usuario" value={usuario.username} fullWidth disabled />
          <SelectInput
            label="Rol"
            value={usuario.role}
            options={[
              { label: "Admin", value: "admin" },
              { label: "Empleado", value: "empleado" },
            ]}
            fullWidth
            disabled
          />
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <PrimaryButton onClick={onEditar}>
                Editar
            </PrimaryButton>
            <SecondaryButton onClick={onEliminar} color="error">
                Eliminar
            </SecondaryButton>
        </Box>
      </Box>
    </ModalCard>
  );
};

export default VerUsuarioModal;
