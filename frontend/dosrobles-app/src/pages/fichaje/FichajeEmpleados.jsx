import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Avatar,
  Stack,
  TextField,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  Checkbox,
} from "@mui/material";
import { NextButton, PrimaryButton } from "../../components/ui/Buttons";
import CustomTable from "../../components/ui/CustomTable";
import SearchBar from "../../components/ui/SearchBar";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate, useLocation } from "react-router-dom";
import API_BASE_URL from "../../api/apiConfig.js";


const meses = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const FichajeEmpleados = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const mesParam = searchParams.get("mes"); // Ej: "9"
  const anioParam = searchParams.get("anio"); // Ej: "2025"

  // 📅 Fecha actual
  const fechaActual = new Date();
  const mesActual = meses[fechaActual.getMonth()]; // Ej: "Noviembre"
  const anioActual = fechaActual.getFullYear(); // Ej: 2025

  // Determinar mes y año iniciales (desde URL o actuales)
  const mesInicial = mesParam ? meses[parseInt(mesParam) - 1] : mesActual;
  const anioInicial = anioParam ? parseInt(anioParam) : anioActual;

  // 🧩 Estados
  const [mes, setMes] = useState(mesInicial);
  const [anio, setAnio] = useState(anioInicial);
  const [search, setSearch] = useState("");
  const [fichajes, setFichajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmpleados, setSelectedEmpleados] = useState(new Set());
  const [approvingLoading, setApprovingLoading] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

  // 🔁 Obtener fichajes
  useEffect(() => {
    const fetchFichajes = async () => {
      setLoading(true);
      try {
        const mesNumero = meses.indexOf(mes) + 1; // Enero=1, Febrero=2...
        const response = await fetch(
          `${API_BASE_URL}/fichajes/empleados-mes?mes=${mesNumero}&anio=${anio}`
        );
        if (!response.ok) throw new Error("Error al obtener fichajes");
        const data = await response.json();
        setFichajes(data);
      } catch (error) {
        console.error("Error al obtener fichajes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFichajes();
  }, [mes, anio]);

  // 🔍 Filtro de búsqueda
  const filtered = fichajes.filter((f) =>
    f.nombre.toLowerCase().includes(search.toLowerCase())
  );

  // 🧱 Columnas de la tabla
  const columns = ["", "Empleado", "Hs Previstas", "Hs Trabajadas", "Más Info"];

  // 🧾 Filas
  const rows = filtered.map((f) => ({
    check: (
      <Checkbox
        checked={selectedEmpleados.has(f.idEmpleado)}
        onChange={(e) => {
          const newSelected = new Set(selectedEmpleados);
          if (e.target.checked) {
            newSelected.add(f.idEmpleado);
          } else {
            newSelected.delete(f.idEmpleado);
          }
          setSelectedEmpleados(newSelected);
        }}
      />
    ),
    empleado: (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Avatar src={f.fotoPerfil || ""} sx={{ width: 40, height: 40 }} />
        <Typography>{`${f.nombre} ${f.apellido}`}</Typography>
      </Box>
    ),
    hsPrevistas: f.hsPrevistas || "—",
    hsTrabajadas: f.hsTrabajadas || "—",
    masInfo: (
      <NextButton
        onClick={() => {
          const mesNumero = meses.indexOf(mes) + 1;
          navigate(`/fichaje/historial/${f.idEmpleado}?admin=true&mes=${mesNumero}&anio=${anio}`)
        }
        }
        endIcon={<ArrowForwardIcon />}
      />
    ),
    _empleadoId: f.idEmpleado,
  }));

  // 📤 Aprobar fichajes
  const handleAprobarFichajes = async () => {
    if (selectedEmpleados.size === 0) {
      setToast({
        open: true,
        message: "Debes seleccionar al menos un empleado",
        severity: "warning",
      });
      return;
    }

    setApprovingLoading(true);
    try {
      const mesNumero = meses.indexOf(mes) + 1;
      const response = await fetch(`${API_BASE}/api/fichajes/aprobar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empleadoIds: Array.from(selectedEmpleados),
          mes: mesNumero,
          anio: parseInt(anio),
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Error al aprobar");

      setToast({
        open: true,
        message: data.message || "Fichajes aprobados correctamente",
        severity: "success",
      });

      setSelectedEmpleados(new Set());
    } catch (error) {
      console.error("Error:", error);
      setToast({
        open: true,
        message: error.message || "Error al aprobar los fichajes",
        severity: "error",
      });
    } finally {
      setApprovingLoading(false);
    }
  };

  // 🖥 Render
  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 600, color: "#585858", mb: 1 }}
        >
          Fichaje de Empleados
        </Typography>
        <Typography variant="body2" sx={{ color: "#808080" }}>
          Visualizá las horas trabajadas por mes y empleado
        </Typography>
      </Box>

      {/* Controles */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
        <TextField
          select
          label="Mes"
          value={mes}
          onChange={(e) => setMes(e.target.value)}
        >
          {meses.map((m) => (
            <MenuItem key={m} value={m}>
              {m}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          type="number"
          label="Año"
          value={anio}
          onChange={(e) => setAnio(e.target.value)}
        />

        <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} />
      </Stack>

      {/* Tabla */}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <CustomTable columns={columns} rows={rows} />
      )}

      {/* Botón */}
      <Box sx={{ mt: 3 }}>
        <PrimaryButton
          fullWidth
          onClick={handleAprobarFichajes}
          disabled={approvingLoading || selectedEmpleados.size === 0}
        >
          {approvingLoading
            ? "Aprobando..."
            : `Aprobar los fichajes de los empleados (${selectedEmpleados.size} seleccionados)`}
        </PrimaryButton>
      </Box>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          sx={{ width: "100%", minWidth: "300px" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FichajeEmpleados;
