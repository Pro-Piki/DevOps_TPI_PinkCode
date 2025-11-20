// src/pages/usuarios/UsuariosList.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Avatar,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import CustomTable from "../../components/ui/CustomTable";
import ModalDialog from "../../components/ui/ModalDialog";
import {
  SecondaryButton,
  FichaButtonWithIcon,
} from "../../components/ui/Buttons";
import NuevoUsuarioModal from "../../components/modales/NuevoUsuarioModal";
import VerUsuarioModal from "../../components/modales/VerUsuarioModal";
import EditarUsuarioModal from "../../components/modales/EditarUsuarioModal";
import API_BASE_URL from "../api/apiConfig.js";

const UsuariosList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [modalOpen, setModalOpen] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editarModalOpen, setEditarModalOpen] = useState(false);

  // Estados para el modal de notificaciones
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success");
  const [notificationCallback, setNotificationCallback] = useState(null);

  // Estados para el modal de confirmación
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmCallback, setConfirmCallback] = useState(null);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/users`);
      if (!response.ok) throw new Error("Error al obtener usuarios");

      const data = await response.json();
      setUsuarios(data);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Mostrar notificación modal
  const showNotification = (
    title,
    message,
    type = "success",
    callback = null
  ) => {
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

  // Mostrar modal de confirmación
  const showConfirmation = (message, callback) => {
    setConfirmMessage(message);
    setConfirmCallback(() => callback);
    setConfirmOpen(true);
  };

  // Aceptar confirmación
  const handleConfirmYes = () => {
    setConfirmOpen(false);
    if (confirmCallback) {
      confirmCallback(true);
    }
  };

  // Rechazar confirmación
  const handleConfirmNo = () => {
    setConfirmOpen(false);
    if (confirmCallback) {
      confirmCallback(false);
    }
  };

  const handleVerUsuario = (usuario) => {
    setUsuarioSeleccionado(usuario);
  };

  const handleEliminarUsuario = async (usuario) => {
    showConfirmation(
      `¿Está seguro de que desea eliminar al usuario ${usuario.username}?`,
      async (confirmed) => {
        if (!confirmed) return;

        try {
          const response = await fetch(
            `${API_BASE_URL}/users/${usuario._id}`,
            {
              method: "DELETE",
            }
          );
          if (!response.ok) throw new Error("Error al eliminar usuario");

          showNotification(
            "Éxito",
            "Usuario eliminado correctamente",
            "success",
            () => {
              fetchUsuarios();
              setUsuarioSeleccionado(null);
            }
          );
        } catch (error) {
          console.error(error);
          showNotification("Error", "No se pudo eliminar el usuario", "error");
        }
      }
    );
  };

  const columns = isMobile
    ? ["", "Usuario", "Rol", "Ver Detalle"]
    : ["", "Usuario", "Rol", "Ver Detalle"];

  const rows = usuarios.map((user) => {
    return {
      foto: (
        <Avatar
          sx={{ width: 40, height: 40 }}
          src={
            user.empleado?.imagenPerfil?.data
              ? `${API_BASE_URL}/empleados/${user.empleado._id}/imagen`
              : undefined
          }
        >
          {user.username.charAt(0).toUpperCase()}
        </Avatar>
      ),
      username: user.username,
      role: user.role,
      accion: (
        <FichaButtonWithIcon
          icon={DescriptionIcon}
          label="Ver Usuario"
          onClick={() => handleVerUsuario(user)}
        />
      ),
    };
  });

  return (
    <Box sx={{ padding: "2rem" }}>
      {/* Encabezado */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 600, color: "#585858", mb: 1 }}
          >
            Usuarios
          </Typography>
          <Typography variant="body2" sx={{ color: "#808080" }}>
            Visualizá el listado completo de usuarios y accedé a su información
            detallada
          </Typography>
        </Box>

        <SecondaryButton
          startIcon={<EditIcon />}
          onClick={() => setModalOpen(true)}
        >
          Nuevo Usuario
        </SecondaryButton>
      </Box>

      {/* Tabla */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : usuarios.length === 0 ? (
        <Typography sx={{ textAlign: "center", color: "#808080", mt: 5 }}>
          No hay usuarios registrados aún.
        </Typography>
      ) : (
        <CustomTable
          columns={columns}
          rows={
            isMobile
              ? rows.map((row) => ({
                  foto: row.foto,
                  username: row.username,
                  role: row.role,
                  accion: row.accion,
                }))
              : rows
          }
        />
      )}

      {/* Modal Nuevo Usuario */}
      <NuevoUsuarioModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onUsuarioGuardado={fetchUsuarios}
      />

      {/* Modal Ver Usuario */}
      <VerUsuarioModal
        open={!!usuarioSeleccionado}
        onClose={() => setUsuarioSeleccionado(null)}
        usuario={usuarioSeleccionado}
        onEditar={() => {
          setEditarModalOpen(true);
        }}
        onEliminar={() => handleEliminarUsuario(usuarioSeleccionado)}
      />

      <EditarUsuarioModal
        open={editarModalOpen}
        onClose={() => setEditarModalOpen(false)}
        usuario={usuarioSeleccionado}
        onUsuarioActualizado={() => {
          fetchUsuarios();
          setEditarModalOpen(false);
          setUsuarioSeleccionado(null);
        }}
      />

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

      {/* Modal de confirmación */}
      <ModalDialog
        open={confirmOpen}
        onClose={handleConfirmNo}
        title="Confirmar"
        content={confirmMessage}
        actions={[
          {
            label: "Cancelar",
            onClick: handleConfirmNo,
            variant: "outlined",
          },
          {
            label: "Eliminar",
            onClick: handleConfirmYes,
            variant: "contained",
          },
        ]}
      />
    </Box>
  );
};

export default UsuariosList;
