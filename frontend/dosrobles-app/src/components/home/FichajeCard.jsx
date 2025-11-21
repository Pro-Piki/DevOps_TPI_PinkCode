/* src/components/home/FichajeCard.jsx*/


import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  useMediaQuery,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import StopIcon from "@mui/icons-material/Stop";
import { PrimaryButton, SecondaryButton, IconNextButton } from "../ui/Buttons";
import { useNavigate } from "react-router-dom";
import ModalDialog from "../ui/ModalDialog";
import { useFichaje } from "../../context/fichajeContextHelper";

export default function FichajeCard() {
  const isMobile = useMediaQuery("(max-width:900px)");
  const { notificarCambioFichaje } = useFichaje();
  const [seconds, setSeconds] = useState(0);
  const [estadoFichaje, setEstadoFichaje] = useState("inactivo");
  const [openInicio, setOpenInicio] = useState(false);
  const [openSalida, setOpenSalida] = useState(false);
  const [fichajeActivo, setFichajeActivo] = useState(null);
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const totalSeconds = 8 * 3600;
  const progress = Math.min((seconds / totalSeconds) * 100, 100);
  const navigate = useNavigate();

  // Obtener empleadoId del usuario logueado
  const user = JSON.parse(localStorage.getItem("user"));
  const empleadoId = user?.empleadoId || "6912a5168034733944baedcb";

  // Recuperar fichaje activo al montar el componente
  useEffect(() => {
    async function checkActiveFichaje() {
      try {
        const res = await fetch(`${API_BASE}/fichajes/empleado/${empleadoId}`);
        if (res.ok) {
          const data = await res.json();
          const fichajes = Array.isArray(data) ? data : data.data || [];

          // Buscar fichaje activo (sin horaSalida)
          const activeFichaje = fichajes.find(f => !f.horaSalida);

          if (activeFichaje) {
            setFichajeActivo(activeFichaje);
            setEstadoFichaje("activo");

            // Calcular segundos transcurridos desde horaEntrada
            if (activeFichaje.horaEntrada) {
              const [horas, minutos] = activeFichaje.horaEntrada.split(":").map(Number);
              const ahora = new Date();
              const entradaDate = new Date();
              entradaDate.setHours(horas, minutos, 0);

              const diffMs = ahora - entradaDate;
              const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));
              setSeconds(diffSeconds);
            }
          }
        }
      } catch (err) {
        console.error("Error al verificar fichaje activo:", err);
      }
    }

    checkActiveFichaje();
  }, [empleadoId, API_BASE]);

  useEffect(() => {
    if (estadoFichaje !== "activo") return;
    const interval = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [estadoFichaje]);

  function formatHHMM(date = new Date()) {
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  function determinarTipoFichaje(lat, lon) {
    const oficinaLat = -34.6259206;
    const oficinaLon = -58.4549131;
    const distancia = Math.sqrt(
      (lat - oficinaLat) ** 2 + (lon - oficinaLon) ** 2
    );
    return distancia < 0.001 ? "oficina" : "remoto";
  }

  async function iniciarJornadaConGeo() {
    if (!navigator.geolocation) {
      setToast({
        open: true,
        message: "GPS no disponible en este dispositivo",
        severity: "warning",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const tipoFichaje = determinarTipoFichaje(lat, lon);
        const horaEntrada = formatHHMM();

        try {
          const res = await fetch(`${API_BASE}/fichajes/inicio`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              empleadoId,
              horaEntrada,
              ubicacion: { lat, lon },
              tipoFichaje,
            }),
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data?.message || "Error al iniciar fichaje");

          setFichajeActivo(data.data);
          setEstadoFichaje("activo");
          setToast({
            open: true,
            message: "Jornada iniciada con éxito",
            severity: "info",
          });
          setSeconds(0);
          // Notificar al contexto para actualizar el estado del equipo
          await notificarCambioFichaje();
        } catch (err) {
          console.error(err);
          setToast({
            open: true,
            message: err.message || "Error al iniciar jornada",
            severity: "error",
          });
        }
      },
      (err) => {
        console.error("Geo error:", err);
        setToast({
          open: true,
          message: "No se pudo obtener la ubicación (permiso denegado?)",
          severity: "warning",
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  async function registrarSalidaConGeo() {
    if (!fichajeActivo || !fichajeActivo._id) {
      setToast({
        open: true,
        message: "No hay fichaje activo para cerrar",
        severity: "warning",
      });
      return;
    }

    if (!navigator.geolocation) {
      setToast({
        open: true,
        message: "GPS no disponible",
        severity: "warning",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const horaSalida = formatHHMM();

        try {
          const res = await fetch(`${API_BASE}/fichajes/salida`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fichajeId: fichajeActivo._id,
              horaSalida,
              ubicacionSalida: { lat, lon },
            }),
          });

          const data = await res.json();
          if (!res.ok)
            throw new Error(data?.message || "Error al registrar salida");

          setFichajeActivo(null);
          setEstadoFichaje("inactivo");
          setToast({
            open: true,
            message: "Jornada finalizada correctamente",
            severity: "success",
          });
          setSeconds(0);
          // Notificar al contexto para actualizar el estado del equipo
          await notificarCambioFichaje();
        } catch (err) {
          console.error(err);
          setToast({
            open: true,
            message: err.message || "Error al registrar salida",
            severity: "error",
          });
        }
      },
      (err) => {
        console.error("Geo error:", err);
        setToast({
          open: true,
          message: "No se pudo obtener la ubicación al salir",
          severity: "warning",
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  return (
    <>
      {/* ===================
          CUADRANTE 1 FICHAJE
          =================== */}
      <Card
        sx={{
          flex: isMobile ? "0 0 100%" : "0 0 50%",
          borderRadius: 3,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          p: 2,
          height: isMobile ? "auto" : "98%",
          position: "relative",
        }}
      >
        {/* Encabezado */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h6" fontWeight="bold" color="#808080">
            Fichaje
          </Typography>
          <IconNextButton onClick={() => navigate("/fichaje/historial")}>
            <ArrowForwardIosIcon />
          </IconNextButton>
        </Box>

        {/* Cuerpo */}
        <Box
          sx={{
            display: "flex",
            flex: 1,
            gap: 2,
            flexWrap: isMobile ? "wrap" : "nowrap",
          }}
        >
          {/* --- ESTADOS --- */}
          <Box
            sx={{
              flex: "1 1 50%",
              display: "flex",
              flexDirection: "column",
              gap: 1,
              marginLeft: 1.5,
              justifyContent: "flex-start",
              marginTop: 3.5,
            }}
          >
            {/* Botón principal */}
            <PrimaryButton
              startIcon={
                estadoFichaje === "inactivo" ? <PlayArrowIcon /> : <StopIcon />
              }
              onClick={() => {
                if (estadoFichaje === "inactivo") setOpenInicio(true);
                else if (estadoFichaje === "activo") setOpenSalida(true);
              }}
              disabled={estadoFichaje === "pausado"}
              sx={{
                bgcolor:
                  estadoFichaje === "inactivo"
                    ? "#7FC6BA"
                    : estadoFichaje === "pausado"
                    ? "#ccc"
                    : "#F28B82",
                color: estadoFichaje === "pausado" ? "#666" : "white",
                "&:hover": {
                  bgcolor:
                    estadoFichaje === "inactivo"
                      ? "#68b0a4"
                      : estadoFichaje === "pausado"
                      ? "#ccc"
                      : "#e57373",
                },
                transition: "background-color 0.3s ease",
              }}
            >
              {estadoFichaje === "inactivo"
                ? "Fichar entrada"
                : "Registrar salida"}
            </PrimaryButton>

            {/* Botón Pausar / Reanudar */}
            {estadoFichaje !== "inactivo" && (
              <SecondaryButton
                onClick={() => {
                  if (estadoFichaje === "activo") {
                    setEstadoFichaje("pausado");
                    setToast({
                      open: true,
                      message: "Jornada pausada",
                      severity: "warning",
                    });
                  } else if (estadoFichaje === "pausado") {
                    setEstadoFichaje("activo");
                    setToast({
                      open: true,
                      message: "Jornada reanudada",
                      severity: "info",
                    });
                  }
                }}
              >
                {estadoFichaje === "pausado" ? "Reanudar" : "Pausar"}
              </SecondaryButton>
            )}
          </Box>

          {/* Temporizador */}
          <Box
            sx={{
              flex: "1 1 50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "start",
            }}
          >
            <Box sx={{ position: "relative", display: "inline-flex" }}>
              <CircularProgress
                variant="determinate"
                value={100}
                size={100}
                thickness={5}
                sx={{ color: "#e0e0e0" }}
              />
              <CircularProgress
                variant="determinate"
                value={progress}
                size={100}
                thickness={5}
                sx={{ color: "#817A6F", position: "absolute", left: 0 }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="caption">
                  {Math.floor(seconds / 3600)}h{" "}
                  {Math.floor((seconds % 3600) / 60)}m
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Modales y Snackbar */}
          <ModalDialog
            open={openInicio}
            onClose={() => setOpenInicio(false)}
            title="Iniciar jornada"
            content={
              <Typography sx={{ whiteSpace: "pre-line" }}>
                {
                  "Estás a punto de iniciar tu jornada laboral.\nEl tiempo comenzará a medirse ahora."
                }
              </Typography>
            }
            actions={[
              { label: "Cancelar", variant: "outlined", onClick: () => setOpenInicio(false) },
              {
                label: "Iniciar",
                onClick: () => {
                  setOpenInicio(false);
                  setEstadoFichaje("activo");
                  iniciarJornadaConGeo();
                  setToast({
                    open: true,
                    message: "Jornada iniciada con éxito",
                    severity: "info",
                  });
                  setSeconds(0);
                },
              },
            ]}
          />

          <ModalDialog
            open={openSalida}
            onClose={() => setOpenSalida(false)}
            title="Registrar salida"
            content="¿Quieres registrar la salida y finalizar tu jornada laboral?"
            actions={[
              { label: "Cancelar", variant: "outlined", onClick: () => setOpenSalida(false) },
              {
                label: "Confirmar",
                onClick: () => {
                  setOpenSalida(false);
                  registrarSalidaConGeo();
                  setEstadoFichaje("inactivo");
                  setSeconds(0);
                  setToast({
                    open: true,
                    message: "Jornada finalizada correctamente",
                    severity: "success",
                  });
                },
              },
            ]}
          />

          <Snackbar
            open={toast.open}
            autoHideDuration={3000}
            onClose={() => setToast({ ...toast, open: false })}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            sx={{
              position: "absolute",
              bottom: 0,
              right: 16,
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
      </Card>
    </>
  );
}
