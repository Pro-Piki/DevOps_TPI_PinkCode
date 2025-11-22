# Configuración de Terraform y Providers

terraform {
  required_version = ">= 1.0"

  required_providers {
    render = {
      source  = "render-oss/render"
      version = "~> 1.3"
    }
  }

  # Backend configuration (opcional - para guardar state remoto)
  # Descomentar cuando configures Terraform Cloud o S3
  # backend "remote" {
  #   organization = "pink-code"
  #   workspaces {
  #     name = "dosrobles-rrhh"
  #   }
  # }
}

# Provider de Render
# Requiere RENDER_API_KEY como variable de entorno
provider "render" {
  # El API key se toma automáticamente de la variable de entorno RENDER_API_KEY
  # No hardcodear el API key aquí por seguridad
}
