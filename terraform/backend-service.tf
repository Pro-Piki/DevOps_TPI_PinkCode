# Servicio Backend en Render

resource "render_web_service" "backend" {
  name   = "${var.project_name}-backend"
  plan   = var.backend_plan
  region = var.region

  runtime_source = {
    docker = {
      repo_url        = var.github_repo_url
      branch          = var.github_branch
      auto_deploy     = true
      dockerfile_path = var.backend_dockerfile_path
      docker_context  = var.backend_docker_context
    }
  }

  env_vars = {
    NODE_ENV     = { value = var.environment }
    PORT         = { value = tostring(var.port) }
    JWT_SECRET   = { value = var.jwt_secret }
    MONGODB_URI  = { value = var.mongodb_uri }
    CORS_ORIGINS = { value = var.cors_origins != "" ? var.cors_origins : "https://${var.project_name}-frontend.onrender.com" }
  }
}

# Output para usar en otros recursos
output "backend_service_id" {
  description = "ID del servicio backend en Render"
  value       = render_web_service.backend.id
}

output "backend_service_url" {
  description = "URL del servicio backend"
  value       = render_web_service.backend.url
}
