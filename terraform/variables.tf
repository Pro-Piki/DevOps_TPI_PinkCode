# Variables de entrada para la infraestructura

# ==========================================
# Variables de Configuración General
# ==========================================

variable "project_name" {
  description = "Nombre del proyecto"
  type        = string
  default     = "dosrobles-rrhh"
}

variable "environment" {
  description = "Ambiente de despliegue (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "region" {
  description = "Región de Render para desplegar los servicios"
  type        = string
  default     = "oregon" # Opciones: oregon, frankfurt, singapore, ohio
}

# ==========================================
# Variables de GitHub
# ==========================================

variable "github_repo_url" {
  description = "URL del repositorio de GitHub"
  type        = string
  default     = "https://github.com/Pro-Piki/DevOps_TPI_PinkCode"
}

variable "github_branch" {
  description = "Rama de GitHub para auto-deploy"
  type        = string
  default     = "main"
}

# ==========================================
# Variables de Servicios
# ==========================================

variable "backend_plan" {
  description = "Plan de Render para el backend (free, starter, standard, pro)"
  type        = string
  default     = "free"
}

variable "frontend_plan" {
  description = "Plan de Render para el frontend (free, starter, standard, pro)"
  type        = string
  default     = "free"
}

# ==========================================
# Variables de Entorno - Backend
# ==========================================

variable "jwt_secret" {
  description = "Secret para firmar tokens JWT"
  type        = string
  sensitive   = true
  # Debe proporcionarse vía terraform.tfvars o variable de entorno TF_VAR_jwt_secret
}

variable "mongodb_uri" {
  description = "URI de conexión a MongoDB Atlas"
  type        = string
  sensitive   = true
  # Ejemplo: mongodb+srv://user:pass@cluster.mongodb.net/dbname
}

variable "cors_origins" {
  description = "Orígenes permitidos para CORS (separados por coma)"
  type        = string
  # Se configurará automáticamente con la URL del frontend
  default = ""
}

variable "port" {
  description = "Puerto en el que corre el backend"
  type        = number
  default     = 4000
}

# ==========================================
# Variables de Build - Backend
# ==========================================

variable "backend_docker_context" {
  description = "Contexto de Docker para el backend"
  type        = string
  default     = "./backend"
}

variable "backend_dockerfile_path" {
  description = "Ruta al Dockerfile del backend"
  type        = string
  default     = "./backend/Dockerfile"
}

# ==========================================
# Variables de Build - Frontend
# ==========================================

variable "frontend_docker_context" {
  description = "Contexto de Docker para el frontend"
  type        = string
  default     = "./frontend/dosrobles-app"
}

variable "frontend_dockerfile_path" {
  description = "Ruta al Dockerfile del frontend"
  type        = string
  default     = "./frontend/dosrobles-app/Dockerfile"
}

# ==========================================
# Variables de Health Check
# ==========================================

variable "backend_health_check_path" {
  description = "Ruta para health check del backend"
  type        = string
  default     = "/"
}

variable "frontend_health_check_path" {
  description = "Ruta para health check del frontend"
  type        = string
  default     = "/"
}

# ==========================================
# Tags y Metadata
# ==========================================

variable "tags" {
  description = "Tags para organizar recursos"
  type        = map(string)
  default = {
    Project     = "DosRobles-RRHH"
    ManagedBy   = "Terraform"
    Team        = "PinkCode"
    Environment = "Production"
  }
}
