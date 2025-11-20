/* frontend/src/components/modales/NuevoEmpleadoModal.jsx */
import React, { useState, useEffect } from "react";
import { Box, Stack, Typography, Alert } from "@mui/material";
import ModalCard from "../ui/ModalCard";
import ModalDialog from "../ui/ModalDialog";
import {
  NextButton,
  SecondaryButton,
  PrevButton,
  PrimaryButton,
} from "../ui/Buttons";
import BaseInput from "../ui/BaseInput";
import SelectInput from "../ui/SelectInput";
import DateField from "../ui/DateField";
import FormCard from "../ui/FormCard";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import API_BASE_URL from "../../api/apiConfig.js";


const NuevoEmpleadoModal = ({ open, onClose, onEmpleadoGuardado }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [nextLegajo, setNextLegajo] = useState("Cargando...");
  const [errorMessage, setErrorMessage] = useState("");

  // Estados para modal de notificación
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");

  const initialFormData = {
    numeroLegajo: "",
    nombre: "",
    apellido: "",
    tipoDocumento: "",
    numeroDocumento: "",
    cuil: "",
    telefono: "",
    email: "",
    fechaNacimiento: "",
    fechaAlta: "",
    areaTrabajo: "",
    puesto: "",
    categoria: "",
    modalidad: "",
    jornada: "",
    horario: "",
    obraSocial: "",
    art: "",
    tipoRemuneracion: "",
    sueldoBruto: "",
    banco: "",
    cbu: "",
    vencimientoContrato: "",
    categoriaImpositiva: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [imagenPerfil, setImagenPerfil] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (open) {
      setFormData(initialFormData);
      setImagenPerfil(null);
      setPreview(null);
      setStep(1);
      setErrorMessage("");

      const fetchNextLegajo = async () => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/empleados/proximo-legajo`
          );
          const data = await response.json();

          setNextLegajo(data.proximoLegajo || "Error");

          setFormData((prev) => ({
            ...prev,
            numeroLegajo: data.proximoLegajo,
          }));
        } catch (error) {
          console.error("Error al obtener el próximo legajo:", error);
          setNextLegajo("Error");
        }
      };

      fetchNextLegajo();
    }
  }, [open]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Solo se permiten archivos de imagen.");
        return;
      }
      setImagenPerfil(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const fixLocalDate = (val) => {
    if (!val) return "";
    const date = new Date(val);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date.toISOString().split("T")[0];
  };

  // Validaciones por paso
  const validateStep = (s) => {
    setErrorMessage("");

    if (s === 1) {
      if (!formData.nombre.trim() || !formData.apellido.trim())
        return setErrorMessage("Complete nombre y apellido."), false;

      if (!formData.tipoDocumento || !formData.numeroDocumento.trim())
        return setErrorMessage("Seleccione tipo y número de documento."), false;

      if (!/^\d+$/.test(formData.numeroDocumento))
        return (
          setErrorMessage("El número de documento debe contener solo dígitos."),
          false
        );

      if (!formData.cuil.trim()) return setErrorMessage("Ingrese CUIL."), false;

      if (!/^\d{11}$/.test(formData.cuil))
        return setErrorMessage("El CUIL debe tener 11 dígitos."), false;

      if (formData.telefono && !/^\+?\d{7,15}$/.test(formData.telefono))
        return (
          setErrorMessage(
            "El teléfono debe contener entre 7 y 15 dígitos (puede incluir +)."
          ),
          false
        );

      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        return setErrorMessage("Formato de email inválido."), false;

      if (!formData.fechaNacimiento)
        return setErrorMessage("Debe indicar la fecha de nacimiento."), false;

      const nacimiento = new Date(formData.fechaNacimiento);
      const hoy = new Date();
      if (nacimiento > hoy)
        return (
          setErrorMessage("La fecha de nacimiento no puede ser futura."), false
        );

      return true;
    }

    if (s === 2) {
      if (!formData.fechaAlta)
        return setErrorMessage("Seleccione fecha de alta."), false;

      if (!formData.areaTrabajo)
        return setErrorMessage("Seleccione un área de trabajo."), false;

      if (!formData.puesto.trim())
        return setErrorMessage("Complete el puesto o cargo."), false;

      if (!formData.categoria.trim())
        return setErrorMessage("Complete la categoría o convenio."), false;

      if (!formData.modalidad.trim())
        return setErrorMessage("Indique modalidad de contratación."), false;

      if (!formData.jornada.trim())
        return setErrorMessage("Complete jornada laboral."), false;

      if (!formData.horario.trim())
        return setErrorMessage("Complete horario habitual."), false;

      if (!formData.obraSocial.trim())
        return setErrorMessage("Indique la obra social asignada."), false;

      if (!formData.art.trim())
        return setErrorMessage("Indique la ART."), false;

      return true;
    }

    if (s === 3) {
      if (!formData.tipoRemuneracion)
        return setErrorMessage("Seleccione el tipo de remuneración."), false;

      if (!formData.sueldoBruto || Number(formData.sueldoBruto) <= 0)
        return setErrorMessage("Ingrese un sueldo bruto válido."), false;

      if (!formData.banco)
        return setErrorMessage("Seleccione un banco."), false;

      if (!formData.cbu.trim() || !/^\d{22}$/.test(formData.cbu))
        return setErrorMessage("El CBU debe tener 22 dígitos."), false;

      if (!formData.vencimientoContrato)
        return (
          setErrorMessage("Debe indicar la fecha de vencimiento de contrato."),
          false
        );

      if (
        formData.vencimientoContrato &&
        new Date(formData.vencimientoContrato) < new Date(formData.fechaAlta)
      )
        return (
          setErrorMessage(
            "El vencimiento no puede ser anterior a la fecha de alta."
          ),
          false
        );

      if (!formData.categoriaImpositiva)
        return setErrorMessage("Seleccione categoría impositiva."), false;

      return true;
    }

    return true;
  };

  // Verificar duplicado
  const verificarDuplicado = async () => {
    try {
      const params = new URLSearchParams({
        numeroDocumento: formData.numeroDocumento || "",
        cuil: formData.cuil || "",
      });
      const res = await fetch(
        `${API_BASE_URL}/empleados/verificar-duplicado?${params.toString()}`
      );
      if (!res.ok) return false;
      const json = await res.json();
      return !!json.duplicado;
    } catch (err) {
      console.error("Error al verificar duplicado:", err);
      return false;
    }
  };

  // VALIDACIÓN FINAL GLOBAL
  const validateFinal = () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) return false;
    return true;
  };

  // Envío final
  const handleSubmit = async () => {
    setErrorMessage("");
    if (!validateFinal()) return;

    setLoading(true);

    // Verificación duplicado
    const esDuplicado = await verificarDuplicado();
    if (esDuplicado) {
      setLoading(false);
      return setErrorMessage(
        "Ya existe un empleado con ese número de documento o CUIL."
      );
    }

    try {
      const dataToSend = new FormData();
      for (const [key, value] of Object.entries(formData)) {
        if (
          ["fechaAlta", "vencimientoContrato", "fechaNacimiento"].includes(key)
        ) {
          dataToSend.append(key, fixLocalDate(value));
        } else {
          dataToSend.append(key, value ?? "");
        }
      }
      if (imagenPerfil) dataToSend.append("imagenPerfil", imagenPerfil);

      const response = await fetch(`${API_BASE_URL}/empleados`, {
        method: "POST",
        body: dataToSend,
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result?.error || "Error al registrar empleado");

      setNotificationTitle("✅ Éxito");
      setNotificationMessage("Empleado registrado con éxito");
      setNotificationOpen(true);
    } catch (error) {
      console.error("Error al registrar empleado:", error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((s) => s + 1);
      setErrorMessage("");
    }
  };
  const handlePrev = () => {
    setStep((s) => Math.max(1, s - 1));
    setErrorMessage("");
  };

  const handleCloseNotification = () => {
    setNotificationOpen(false);
    onEmpleadoGuardado?.();
    onClose();
  };

  // Render de pasos completo
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Box>
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              {/* Imagen de perfil */}
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  backgroundColor: "#F2F2F2",
                  ml: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  overflow: "hidden",
                  position: "relative",
                  "&:hover": { backgroundColor: "#E0E0E0" },
                }}
                onClick={() => document.getElementById("fileInput").click()}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <AddAPhotoIcon sx={{ fontSize: 40, color: "#7FC6BA" }} />
                )}
                <input
                  type="file"
                  id="fileInput"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
              </Box>

              <DateField
                label="Fecha de nacimiento"
                value={formData.fechaNacimiento}
                onChange={(e) =>
                  handleChange("fechaNacimiento", e.target.value)
                }
              />
            </Box>

            <FormCard title="Datos personales" sx={{ p: 3 }}>
              <Stack spacing={2}>
                <BaseInput
                  label="Nombre"
                  value={formData.nombre}
                  onChange={(e) => handleChange("nombre", e.target.value)}
                  fullWidth
                />
                <BaseInput
                  label="Apellido"
                  value={formData.apellido}
                  onChange={(e) => handleChange("apellido", e.target.value)}
                  fullWidth
                />

                <Box sx={{ display: "flex", gap: 2 }}>
                  <SelectInput
                    label="Tipo de Documento"
                    options={[
                      { label: "DNI", value: "dni" },
                      { label: "Pasaporte", value: "pasaporte" },
                    ]}
                    value={formData.tipoDocumento}
                    onChange={(e) =>
                      handleChange("tipoDocumento", e.target.value)
                    }
                    fullWidth
                  />
                  <BaseInput
                    label="Número"
                    value={formData.numeroDocumento}
                    onChange={(e) =>
                      handleChange("numeroDocumento", e.target.value)
                    }
                    fullWidth
                  />
                </Box>

                <BaseInput
                  label="CUIL"
                  value={formData.cuil}
                  onChange={(e) => handleChange("cuil", e.target.value)}
                  fullWidth
                />
                <BaseInput
                  label="Teléfono"
                  value={formData.telefono}
                  onChange={(e) => handleChange("telefono", e.target.value)}
                  fullWidth
                />
                <BaseInput
                  label="Email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  fullWidth
                />
              </Stack>
            </FormCard>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <NextButton onClick={handleNext} endIcon={<ArrowForwardIcon />}>
                Siguiente
              </NextButton>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box>
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}

            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              <DateField
                label="Fecha de Alta"
                value={formData.fechaAlta}
                onChange={(e) => handleChange("fechaAlta", e.target.value)}
              />
            </Box>

            <FormCard title="Datos laborales" sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <SelectInput
                    label="Área de trabajo"
                    options={[
                      { label: "Carpintería", value: "carpinteria" },
                      { label: "Aserradero", value: "aserradero" },
                      { label: "Instalaciones", value: "instalaciones" },
                      { label: "Administración", value: "administracion" },
                      { label: "Recursos Humanos", value: "rrhh" },
                      { label: "Pintura", value: "pintura" },
                      { label: "Diseño", value: "diseno" },
                    ]}
                    value={formData.areaTrabajo}
                    onChange={(e) =>
                      handleChange("areaTrabajo", e.target.value)
                    }
                    fullWidth
                  />
                  <BaseInput
                    label="Puesto o Cargo"
                    fullWidth
                    value={formData.puesto}
                    onChange={(e) => handleChange("puesto", e.target.value)}
                  />
                </Box>

                <BaseInput
                  label="Categoría / Convenio de trabajo"
                  fullWidth
                  value={formData.categoria}
                  onChange={(e) => handleChange("categoria", e.target.value)}
                />

                <Box sx={{ display: "flex", gap: 2 }}>
                  <BaseInput
                    label="Modalidad de contratación"
                    fullWidth
                    value={formData.modalidad}
                    onChange={(e) => handleChange("modalidad", e.target.value)}
                  />
                  <BaseInput
                    label="Jornada laboral"
                    fullWidth
                    value={formData.jornada}
                    onChange={(e) => handleChange("jornada", e.target.value)}
                  />
                </Box>

                <BaseInput
                  label="Horario habitual"
                  fullWidth
                  value={formData.horario}
                  onChange={(e) => handleChange("horario", e.target.value)}
                />

                <Box sx={{ display: "flex", gap: 2 }}>
                  <BaseInput
                    label="Obra social asignada"
                    fullWidth
                    value={formData.obraSocial}
                    onChange={(e) => handleChange("obraSocial", e.target.value)}
                  />
                  <BaseInput
                    label="ART"
                    fullWidth
                    value={formData.art}
                    onChange={(e) => handleChange("art", e.target.value)}
                  />
                </Box>
              </Stack>
            </FormCard>

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 2,
              }}
            >
              <PrevButton onClick={handlePrev} startIcon={<ArrowBackIcon />}>
                Anterior
              </PrevButton>
              <NextButton onClick={handleNext} endIcon={<ArrowForwardIcon />}>
                Siguiente
              </NextButton>
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box>
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}

            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              <Box
                sx={{
                  border: "2px solid #7FC6BA",
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  width: "fit-content",
                  textAlign: "center",
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Nº de Legajo
                </Typography>
                <Typography variant="body1" sx={{ color: "#808080" }}>
                  {nextLegajo}
                </Typography>
              </Box>
            </Box>

            <FormCard title="Datos de remuneración" sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                <Box sx={{ display: "flex", columnGap: 2 }}>
                  <SelectInput
                    label="Tipo de remuneración"
                    options={[
                      { label: "Jornada completa", value: "completa" },
                      { label: "Media jornada", value: "media" },
                      { label: "Por hora", value: "hora" },
                      { label: "Por proyecto", value: "proyecto" },
                    ]}
                    value={formData.tipoRemuneracion}
                    onChange={(e) =>
                      handleChange("tipoRemuneracion", e.target.value)
                    }
                    fullWidth
                  />
                  <BaseInput
                    label="Sueldo bruto acordado"
                    type="number"
                    fullWidth
                    value={formData.sueldoBruto}
                    onChange={(e) =>
                      handleChange("sueldoBruto", e.target.value)
                    }
                  />
                </Box>

                <Box sx={{ display: "flex", columnGap: 2 }}>
                  <SelectInput
                    label="Banco"
                    options={[
                      { label: "Banco Nación", value: "nacion" },
                      { label: "Banco Provincia", value: "provincia" },
                      { label: "Banco Galicia", value: "galicia" },
                      { label: "Banco Santander", value: "santander" },
                      { label: "Banco BBVA", value: "bbva" },
                    ]}
                    value={formData.banco}
                    onChange={(e) => handleChange("banco", e.target.value)}
                    fullWidth
                  />
                  <BaseInput
                    label="CBU"
                    fullWidth
                    value={formData.cbu}
                    onChange={(e) => handleChange("cbu", e.target.value)}
                  />
                </Box>

                <DateField
                  label="Fecha de vencimiento del contrato"
                  value={formData.vencimientoContrato}
                  onChange={(e) =>
                    handleChange("vencimientoContrato", e.target.value)
                  }
                  fullWidth
                />

                <SelectInput
                  label="Categoría impositiva"
                  options={[
                    { label: "Relación de dependencia", value: "dependencia" },
                    { label: "Monotributista", value: "monotributo" },
                    { label: "Autónomo", value: "autonomo" },
                    { label: "Honorarios", value: "honorarios" },
                  ]}
                  value={formData.categoriaImpositiva}
                  onChange={(e) =>
                    handleChange("categoriaImpositiva", e.target.value)
                  }
                  fullWidth
                />
              </Stack>
            </FormCard>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mt: 3,
              }}
            >
              <PrevButton
                onClick={handlePrev}
                startIcon={<ArrowBackIcon />}
                sx={{ minWidth: 40, padding: "6px 6px" }}
              />
              <Box sx={{ display: "flex", gap: 2 }}>
                <SecondaryButton
                  onClick={onClose}
                  width={120}
                  height={40}
                  fontWeight="bold"
                >
                  Cancelar
                </SecondaryButton>
                <PrimaryButton
                  onClick={handleSubmit}
                  disabled={loading}
                  width={120}
                  height={40}
                  fontWeight="bold"
                >
                  {loading ? "Guardando..." : "Guardar"}
                </PrimaryButton>
              </Box>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <ModalCard
        open={open}
        onClose={onClose}
        title="Agregar empleado"
        width={700}
      >
        {renderStep()}
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

export default NuevoEmpleadoModal;
