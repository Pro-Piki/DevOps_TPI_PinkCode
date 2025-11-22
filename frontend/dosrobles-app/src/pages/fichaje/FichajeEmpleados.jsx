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
} from "@mui/material";
import { NextButton, PrimaryButton } from "../../components/ui/Buttons";
import CheckBox from "../../components/ui/CheckBox";
import CustomTable from "../../components/ui/CustomTable";
import SearchBar from "../../components/ui/SearchBar";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate, useLocation } from "react-router-dom";

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
  const mesParam = searchParams.get("mes");
  const anioParam = searchParams.get("anio");

  const fechaActual = new Date();
  const mesActual = meses[fechaActual.getMonth()];
  const anioActual = fechaActual.getFullYear();

  const mesInicial = mesParam ? meses[parseInt(mesParam) - 1] : mesActual;
  const anioInicial = anioParam ? parseInt(anioParam) : anioActual;

  const [mes, setMes] = useState(mesInicial);
  const [anio, setAnio] = useState(anioInicial);
  const [search, setSearch] = useState("");
  const [fichajes, setFichajes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState({});
  const [aprobados, setAprobados] = useState({});
  const [approving, setApproving] = useState(false);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });



  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";


  async function aprobarFichajeService(payload) {
    const res = await fetch(`${API_URL}/fichajes/aprobar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error("Error al aprobar fichaje");
    }

    return res.json();
  }

  // Obtener fichajes
  useEffect(() => {
    const fetchFichajes = async () => {
      setLoading(true);
      try {
        const mesNumero = meses.indexOf(mes) + 1;
        const res = await fetch(
          `${API_URL}/fichajes/empleados-mes?mes=${mesNumero}&anio=${anio}`
        );

        if (!res.ok) throw new Error("Error al obtener fichajes");
        const data = await res.json();

        setFichajes(data);

      } catch (err) {
        console.error(err);
        setToast({
          open: true,
          message: "Error al cargar fichajes",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFichajes();
  }, [mes, anio]);

  // Obtener aprobaciones del mes
  useEffect(() => {
    const fetchAprobaciones = async () => {
      try {
        const mesNumero = meses.indexOf(mes) + 1;
        const res = await fetch(
          `${API_URL}/fichajes/aprobaciones/mes?mes=${mesNumero}&anio=${anio}`
        );

        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            const aprobadosMap = {};
            data.data.forEach((aprobacion) => {
              if (!aprobacion.empleadoId) return;

              const id = typeof aprobacion.empleadoId === "object"
                ? aprobacion.empleadoId._id
                : aprobacion.empleadoId;

              if (id) {
                aprobadosMap[id] = true;
              }
            });
            setAprobados(aprobadosMap);
          }
        }
      } catch (error) {
        console.error("Error al obtener aprobaciones:", error);
      }
    };

    fetchAprobaciones();
  }, [mes, anio]);

  // Filtrar empleados
  const filtered = fichajes.filter((f) =>
    f.nombre.toLowerCase().includes(search.toLowerCase())
  );

  // Columnas
  const columns = [
    "Fichaje mensual",
    "Empleado",
    "Hs Previstas",
    "Hs Trabajadas",
    "Más Info",
  ];

  //  Filas
  const rows = filtered.map((f) => ({
    check: aprobados[f.idEmpleado] ? (
      <Typography sx={{ color: "primary.main", fontWeight: 600 }}>
        Aprobado
      </Typography>
    ) : (
      <CheckBox
        checked={!!selected[f.idEmpleado]}
        onChange={(e) =>
          setSelected((prev) => ({
            ...prev,
            [f.idEmpleado]: e.target.checked,
          }))
        }
      />
    ),
    empleado: (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Avatar src={f.fotoPerfil || ""} sx={{ width: 40, height: 40 }} />
        <Typography>{`${f.nombre} ${f.apellido}`}</Typography>
      </Box>
    ),
    hsPrevistas: f.hsPrevistas || 0,
    hsTrabajadas: f.hsTrabajadas || 0,
    masInfo: (
      <NextButton
        onClick={() => {
          const mesNumero = meses.indexOf(mes) + 1;
          navigate(
            `/fichaje/historial/${f.idEmpleado}?admin=true&mes=${mesNumero}&anio=${anio}`
          );
        }}
        endIcon={<ArrowForwardIcon />}
      />
    ),
  }));


  const handleAprobar = async () => {
    try {
      const seleccionadosIds = Object.keys(selected).filter(
        (id) => selected[id] === true
      );

      if (seleccionadosIds.length === 0) {
        setToast({
          open: true,
          message: "No seleccionaste ningún empleado",
          severity: "warning",
        });
        return;
      }

      setApproving(true);

      const mesNumero = meses.indexOf(mes) + 1;

      const payload = {
        empleadoIds: seleccionadosIds,
        mes: mesNumero,
        anio: parseInt(anio),
      };

      await aprobarFichajeService(payload);

      const nuevosAprobados = {};
      seleccionadosIds.forEach((id) => {
        nuevosAprobados[id] = true;
      });

      setAprobados((prev) => ({ ...prev, ...nuevosAprobados }));
      setSelected({});

      setToast({
        open: true,
        message: "Fichajes aprobados correctamente",
        severity: "success",
      });
    } catch (error) {
      console.error(error);
      setToast({
        open: true,
        message: "Error al aprobar fichajes",
        severity: "error",
      });
    } finally {
      setApproving(false);
    }
  };

  return (
    <Box sx={{ p: 4, overflow: "hidden" }}>
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
        <TextField select label="Mes" value={mes} onChange={(e) => setMes(e.target.value)}>
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

      {/* Botón Aprobar */}
      <Box sx={{ mt: 3 }}>
        <PrimaryButton
          fullWidth
          onClick={handleAprobar}
          disabled={approving}
        >
          {approving ? "Aprobando..." : "Aprobar los fichajes de los empleados"}
        </PrimaryButton>
      </Box>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
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

export default FichajeEmpleados;
