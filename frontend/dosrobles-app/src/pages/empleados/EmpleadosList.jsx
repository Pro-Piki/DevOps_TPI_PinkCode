// src/pages/empleados/EmpleadosList.jsx
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
import DescriptionIcon from "@mui/icons-material/Description";
import CustomTable from "../../components/ui/CustomTable";
import {
  SecondaryButton,
  FichaButtonWithIcon,
} from "../../components/ui/Buttons";
import NuevoEmpleadoModal from "../../components/modales/NuevoEmpleadoModal";
import FichaEmpleadoEditable from "./FichaEmpleadoEditable";
import API_BASE_URL from "../api/apiConfig.js";

const EmpleadosList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [modalOpen, setModalOpen] = useState(false);
  const [fichaOpen, setFichaOpen] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);

  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);

  // Obtener empleados desde el backend
  const fetchEmpleados = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/empleados`);
      if (!response.ok) throw new Error("Error al obtener empleados");

      const data = await response.json();
      setEmpleados(data);
    } catch (error) {
      console.error("Error al cargar empleados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpleados();
  }, []);

  const handleEmpleadoGuardado = () => {
    setModalOpen(false);
    fetchEmpleados();
  };

  const handleVerFicha = (empleado) => {
    setEmpleadoSeleccionado(empleado);
    setFichaOpen(true);
  };

  const columns = isMobile
    ? ["", "Nombre y Apellido", "Ficha"]
    : [
        "",
        "Nombre y Apellido",
        "Legajo",
        "Área de Trabajo",
        "Teléfono",
        "Ficha",
      ];

  const rows = empleados.map((emp) => {
    // URL para servir la imagen desde backend si existe
    const imageUrl = emp.tieneImagen
      ? `${API_BASE_URL}/empleados/${emp._id}/imagen`
      : null;

    return {
      foto: (
        <Avatar
          src={imageUrl || "/src/assets/empleados/default-avatar.png"}
          alt={`${emp.nombre} ${emp.apellido}`}
          sx={{ width: 40, height: 40 }}
        />
      ),
      nombre: `${emp.nombre} ${emp.apellido}`,
      legajo: emp.numeroLegajo || "-",
      area: emp.areaTrabajo || "-",
      telefono: emp.telefono || "-",
      ficha: (
        <FichaButtonWithIcon
          icon={DescriptionIcon}
          label="Ver Ficha"
          onClick={() => handleVerFicha(emp)}
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
            Empleados
          </Typography>
          <Typography variant="body2" sx={{ color: "#808080" }}>
            Visualizá el listado completo de empleados y accedé a su información
            detallada
          </Typography>
        </Box>

        <SecondaryButton
          startIcon={<EditIcon />}
          onClick={() => setModalOpen(true)}
        >
          Nuevo Empleado
        </SecondaryButton>
      </Box>

      {/* Tabla */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : empleados.length === 0 ? (
        <Typography sx={{ textAlign: "center", color: "#808080", mt: 5 }}>
          No hay empleados registrados aún.
        </Typography>
      ) : (
        <CustomTable
          columns={columns}
          rows={
            isMobile
              ? rows.map((row) => ({
                  foto: row.foto,
                  nombre: row.nombre,
                  ficha: row.ficha,
                }))
              : rows
          }
        />
      )}

      {/* Modal Nuevo Empleado */}
      <NuevoEmpleadoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onEmpleadoGuardado={handleEmpleadoGuardado}
      />

      {/* Modal Ficha Editable */}
      {fichaOpen && empleadoSeleccionado && (
        <FichaEmpleadoEditable
          open={fichaOpen}
          onClose={() => setFichaOpen(false)}
          empleado={empleadoSeleccionado}
          onEmpleadoActualizado={fetchEmpleados}
        />
      )}
    </Box>
  );
};

export default EmpleadosList;
