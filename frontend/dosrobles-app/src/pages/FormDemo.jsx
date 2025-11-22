// src/pages/FormDemo.jsx
import React, { useState } from "react";
import { Box, Stack } from "@mui/material";
import FormCard from "../components/ui/FormCard";
import BaseInput from "../components/ui/BaseInput";
import SelectInput from "../components/ui/SelectInput";
import CheckBox from "../components/ui/CheckBox";
import DateField from "../components/ui/DateField";
import TextInput from "../components/ui/TextInput";
import TextareaInput from "../components/ui/TextareaInput";
import { PrimaryButton } from "../components/ui/Buttons";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import WorkIcon from "@mui/icons-material/Work";


export default function FormDemo() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [terms, setTerms] = useState(false);
  const [dob, setDob] = useState("");
  const [bio, setBio] = useState("");


  const roles = [
    { label: "Administrador", value: "admin" },
    { label: "Empleado", value: "empleado" },
    { label: "Gerente", value: "gerente" },
  ];

  const isValid = () => {
    return name.trim() !== "" && email.includes("@") && role !== "" && terms;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid()) {
      alert("Por favor completá todos los campos correctamente.");
      return;
    }
    // aquí enviarías al backend; por ahora mostramos en consola
    console.log({ name, email, role, terms, dob });
    alert("Formulario enviado — mirá la consola (console.log).");
  };

  return (
    <Box sx={{ p: 4 }}>
      <FormCard title="Formulario de Ejemplo">
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <BaseInput
              label="Nombre completo"
              placeholder="Ej. Sol Juárez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<PersonIcon sx={{ color: "#7FC6BA" }} />}
              helperText={!name ? "Este campo es obligatorio" : ""}
              error={!name}
            />

            <BaseInput
              label="Correo electrónico"
              placeholder="Ej. sol@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<EmailIcon sx={{ color: "#7FC6BA" }} />}
              helperText={email && !email.includes("@") ? "Email inválido" : ""}
              error={email !== "" && !email.includes("@")}
            />

            <SelectInput
              label="Rol"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              options={roles}
              placeholder="Seleccioná un rol"
              icon={<WorkIcon sx={{ color: "#7FC6BA" }} />}
            />

            <CheckBox
              label="Acepto los términos y condiciones"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              helperText={!terms ? "Debes aceptar antes de continuar" : ""}
              error={!terms}
            />

            <DateField
              label="Fecha de nacimiento"
              value={dob}
              onClick={() => {
                // demo: pedimos por prompt por ahora
                const input = prompt("Ingresá fecha (ej: 15/04/1993)");
                if (input) setDob(input);
              }}
            />

            <TextInput
              label="Usuario"
              placeholder="Ej. soljuarez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              helperText={!name ? "Campo obligatorio" : ""}
            />

            <TextareaInput
              label="Descripción"
              placeholder="Contanos algo más..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              helperText="Máx. 200 caracteres"
            />

            <PrimaryButton type="submit">Enviar</PrimaryButton>
          </Stack>
        </form>
      </FormCard>
    </Box>
  );
}
