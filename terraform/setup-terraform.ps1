# Script para configurar Terraform en Windows
# Ejecutar como Administrador en PowerShell

Write-Host "=== Configurador de Terraform ===" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Buscar terraform.exe
Write-Host "Buscando terraform.exe en tu sistema..." -ForegroundColor Yellow
$terraformPaths = Get-ChildItem -Path C:\Users\$env:USERNAME\Downloads -Filter terraform.exe -Recurse -ErrorAction SilentlyContinue

if ($terraformPaths) {
    $terraformPath = $terraformPaths[0].DirectoryName
    Write-Host "✓ Encontrado en: $terraformPath" -ForegroundColor Green
} else {
    Write-Host "✗ No se encontró terraform.exe en Downloads" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, indica la ruta donde está terraform.exe:"
    $terraformPath = Read-Host "Ruta completa"
    
    if (-not (Test-Path "$terraformPath\terraform.exe")) {
        Write-Host "✗ No se encontró terraform.exe en esa ruta" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# Paso 2: Crear directorio permanente (opcional)
Write-Host "¿Deseas mover terraform.exe a C:\terraform? (S/N)" -ForegroundColor Yellow
$mover = Read-Host

if ($mover -eq "S" -or $mover -eq "s") {
    $destino = "C:\terraform"
    
    if (-not (Test-Path $destino)) {
        New-Item -ItemType Directory -Path $destino -Force | Out-Null
        Write-Host "✓ Directorio C:\terraform creado" -ForegroundColor Green
    }
    
    Copy-Item "$terraformPath\terraform.exe" -Destination $destino -Force
    Write-Host "✓ terraform.exe copiado a C:\terraform" -ForegroundColor Green
    $terraformPath = $destino
}

Write-Host ""

# Paso 3: Agregar al PATH del usuario
Write-Host "Agregando $terraformPath al PATH del usuario..." -ForegroundColor Yellow

$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")

if ($currentPath -notlike "*$terraformPath*") {
    $newPath = "$currentPath;$terraformPath"
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    Write-Host "✓ PATH actualizado" -ForegroundColor Green
} else {
    Write-Host "✓ Ya está en el PATH" -ForegroundColor Green
}

Write-Host ""

# Paso 4: Actualizar PATH de la sesión actual
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host ""
Write-Host "=== Verificación ===" -ForegroundColor Cyan

# Verificar que funciona
try {
    $version = & "$terraformPath\terraform.exe" version
    Write-Host "✓ Terraform instalado correctamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host $version -ForegroundColor White
    Write-Host ""
    Write-Host "IMPORTANTE: Cierra y vuelve a abrir PowerShell para que los cambios surtan efecto" -ForegroundColor Yellow
} catch {
    Write-Host "✗ Error al ejecutar terraform" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host ""
Write-Host "Presiona Enter para salir..."
Read-Host
