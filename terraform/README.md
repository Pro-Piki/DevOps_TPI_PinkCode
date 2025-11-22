# Infraestructura como Código - Terraform

Este directorio contiene la configuración de **Infrastructure as Code (IaC)** usando Terraform para provisionar y gestionar la infraestructura del Sistema de Gestión de RR.HH. Dos Robles en Render.

## 📋 ¿Qué provisiona este código?

- **Backend Service**: API REST (Node.js + Express + MongoDB)
- **Frontend Service**: Aplicación web (React + Vite + NGINX)
- **Variables de entorno**: Configuración segura de secrets
- **Health checks**: Monitoreo automático de servicios
- **Auto-deploy**: Despliegue automático desde GitHub

## 🚀 Requisitos Previos

1. **Terraform instalado** (v1.0+)
   ```bash
   # Verificar instalación
   terraform version
   ```

2. **Cuenta en Render**
   - Crear cuenta en [render.com](https://render.com)
   - Generar API Key desde Dashboard → Account Settings → API Keys

3. **Variables de entorno**
   - `RENDER_API_KEY`: Tu API key de Render
   - `TF_VAR_jwt_secret`: Secret para JWT
   - `TF_VAR_mongodb_uri`: URI de MongoDB Atlas

## 📁 Estructura de Archivos

```
terraform/
├── README.md                 # Esta documentación
├── providers.tf              # Configuración de providers (Render)
├── variables.tf              # Variables de entrada
├── backend-service.tf        # Servicio backend en Render
├── frontend-service.tf       # Servicio frontend en Render
├── outputs.tf                # Outputs (URLs, IDs de servicios)
├── terraform.tfvars.example  # Ejemplo de variables
└── .gitignore               # Archivos a ignorar
```

## 🔧 Uso

### 1. Configurar variables

Copia el archivo de ejemplo y completa tus valores:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edita `terraform.tfvars` con tus valores reales (este archivo NO se commitea).

### 2. Inicializar Terraform

```bash
cd terraform
terraform init
```

Esto descarga los providers necesarios (Render).

### 3. Planificar cambios

```bash
terraform plan
```

Revisa los recursos que se crearán/modificarán.

### 4. Aplicar cambios

```bash
terraform apply
```

Confirma con `yes` para crear la infraestructura.

### 5. Ver outputs

```bash
terraform output
```

Muestra las URLs de tus servicios desplegados.

## 🔄 Comandos Útiles

```bash
# Ver estado actual
terraform show

# Listar recursos gestionados
terraform state list

# Destruir toda la infraestructura (¡CUIDADO!)
terraform destroy

# Formatear archivos .tf
terraform fmt

# Validar configuración
terraform validate
```

## 🔐 Seguridad

**IMPORTANTE:** Nunca commitear archivos con datos sensibles:

- ❌ `terraform.tfvars` (contiene secrets)
- ❌ `*.tfstate` (contiene estado con secrets)
- ❌ `.terraform/` (directorio de providers)

Estos están en `.gitignore` por seguridad.

## 🌍 Variables de Entorno

Puedes usar variables de entorno en lugar de `terraform.tfvars`:

```bash
export RENDER_API_KEY="tu_api_key"
export TF_VAR_jwt_secret="tu_jwt_secret"
export TF_VAR_mongodb_uri="mongodb+srv://..."
export TF_VAR_cors_origins="https://tu-frontend.onrender.com"

terraform apply
```

## 📊 Integración con CI/CD

Para automatizar con GitHub Actions, ver el workflow en `.github/workflows/terraform.yml` (próximamente).

## 🆘 Troubleshooting

### Error: "Invalid API Key"
- Verifica que `RENDER_API_KEY` esté configurado correctamente
- Regenera el API key desde Render Dashboard

### Error: "Service already exists"
- Importa el servicio existente: `terraform import render_web_service.backend srv-xxxxx`
- O elimina el servicio manual desde Render Dashboard

### Error: "Invalid MongoDB URI"
- Verifica que la URI de MongoDB Atlas sea correcta
- Asegúrate de que la IP de Render esté whitelistada en Atlas

## 📚 Recursos

- [Terraform Render Provider](https://registry.terraform.io/providers/render-oss/render/latest/docs)
- [Render API Documentation](https://api-docs.render.com/)
- [Terraform Documentation](https://www.terraform.io/docs)

## 👥 Autores

Pink Code - DevOps TPI 2025
