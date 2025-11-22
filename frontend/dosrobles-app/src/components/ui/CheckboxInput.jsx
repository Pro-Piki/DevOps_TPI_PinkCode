import React from "react";
import {
  Box,
  FormControlLabel,
  Checkbox,
  Typography,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

/**
 * CheckBoxInput
 * Reutilizable para opciones booleanas o toggles simples.
 *
 * Props:
 * - label: string → texto que acompaña el checkbox
 * - checked: boolean → estado actual
 * - onChange: (e) => void → manejador del cambio
 * - helperText: string → texto debajo (opcional)
 * - error: boolean → indica estado de error (opcional)
 */

export default function CheckBoxInput({
  label,
  checked,
  onChange,
  helperText,
  error,
}) {
  return (
    <Box sx={{ mb: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          ml: 4,
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={checked}
              onChange={onChange}
              icon={<Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: 1,
                  border: "2px solid #E2E1E1",
                  backgroundColor: "#fff",
                }}
              />}
              checkedIcon={
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: 1,
                    backgroundColor: "#7FC6BA",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CheckIcon sx={{ fontSize: 16 }} />
                </Box>
              }
            />
          }
          label={
            <Typography sx={{ color: "#585858", fontSize: "0.95rem" }}>
              {label}
            </Typography>
          }
        />
      </Box>

      {helperText && (
        <Typography
          sx={{
            mt: 0.5,
            fontSize: "0.8rem",
            color: error ? "#FF6B6B" : "#999",
          }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
}
