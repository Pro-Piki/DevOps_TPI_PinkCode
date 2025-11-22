# Servicio Frontend en Render

resource "render_web_service" "frontend" {
  name   = "${var.project_name}-frontend"
  plan   = var.frontend_plan
  region = var.region

  runtime_source = {
    docker = {
      repo_url        = var.github_repo_url
      branch          = var.github_branch
      auto_deploy     = true
      dockerfile_path = var.frontend_dockerfile_path
      docker_context  = var.frontend_docker_context
    }
  }

  env_vars = {
    NODE_ENV     = { value = var.environment }
    VITE_API_URL = { value = "https://${render_web_service.backend.url}" }
  }

  # El frontend depende del backend (para obtener su URL)
  depends_on = [render_web_service.backend]
}

# Output para usar en otros recursos
output "frontend_service_id" {
  description = "ID del servicio frontend en Render"
  value       = render_web_service.frontend.id
}

output "frontend_service_url" {
  description = "URL del servicio frontend"
  value       = render_web_service.frontend.url
}
