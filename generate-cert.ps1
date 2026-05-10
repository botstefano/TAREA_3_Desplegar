# Script para generar certificados SSL auto-firmados en Windows
# Requiere: Windows con PowerShell

Write-Host "Generando certificados SSL para UNT Gestión..."

# Crear directorio SSL si no existe
if (-not (Test-Path "nginx/ssl")) {
    New-Item -ItemType Directory -Force -Path "nginx/ssl"
}

# Generar certificado auto-firmado
$cert = New-SelfSignedCertificate -DnsName "localhost" -CertStoreLocation "cert:\LocalMachine\My" -KeyUsage KeyEncipherment,DigitalSignature -KeyLength 2048

# Exportar clave privada
$password = ConvertTo-SecureString -String "1234" -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath "nginx/ssl/cert.pfx" -Password $password

# Convertir a PEM (requiere OpenSSL o usar herramienta online)
Write-Host "Certificado generado en nginx/ssl/cert.pfx"
Write-Host "Para desarrollo local, puedes usar http en lugar de https"
Write-Host "O instala OpenSSL para convertir a formato PEM"
