# Outputs de la infraestructura

# ==========================================
# URLs de Servicios
# ==========================================

output "backend_url" {
  description = "URL pública del backend"
  value       = "https://${render_web_service.backend.url}"
}

output "frontend_url" {
  description = "URL pública del frontend"
  value       = "https://${render_web_service.frontend.url}"
}

# ==========================================
# IDs de Servicios (para CI/CD)
# ==========================================

output "backend_id" {
  description = "ID del servicio backend (para usar en GitHub Actions)"
  value       = render_web_service.backend.id
  sensitive   = true
}

output "frontend_id" {
  description = "ID del servicio frontend (para usar en GitHub Actions)"
  value       = render_web_service.frontend.id
  sensitive   = true
}

# ==========================================
# Información de Configuración
# ==========================================

output "region" {
  description = "Región donde están desplegados los servicios"
  value       = var.region
}

output "environment" {
  description = "Ambiente de despliegue"
  value       = var.environment
}

# ==========================================
# Resumen de Despliegue
# ==========================================

output "deployment_summary" {
  description = "Resumen del despliegue"
  value = {
    project     = var.project_name
    environment = var.environment
    region      = var.region
    backend = {
      name = render_web_service.backend.name
      url  = "https://${render_web_service.backend.url}"
      plan = var.backend_plan
    }
    frontend = {
      name = render_web_service.frontend.name
      url  = "https://${render_web_service.frontend.url}"
      plan = var.frontend_plan
    }
  }
}

# ==========================================
# Instrucciones Post-Deploy
# ==========================================

output "next_steps" {
  description = "Próximos pasos después del despliegue"
  value = <<-EOT
  
  ✅ Infraestructura desplegada exitosamente!
  
  📋 Próximos pasos:
  
  1. Acceder al backend:
     ${render_web_service.backend.url}
  
  2. Acceder al frontend:
     ${render_web_service.frontend.url}
  
  3. Configurar CORS en MongoDB Atlas:
     - Whitelist IP: 0.0.0.0/0 (para Render)
  
  4. Verificar variables de entorno en Render Dashboard
  
  5. Monitorear logs:
     - Backend: https://dashboard.render.com/web/${render_web_service.backend.id}
     - Frontend: https://dashboard.render.com/web/${render_web_service.frontend.id}
  
  EOT
}
