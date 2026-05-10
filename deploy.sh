#!/bin/bash

# Script de despliegue para UNT Gestión
set -e

echo "🚀 Iniciando despliegue de UNT Gestión..."

# Verificar requisitos
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado"
    exit 1
fi

# Verificar archivo de entorno
if [ ! -f ".env.local" ]; then
    echo "📝 Creando archivo de entorno desde plantilla..."
    cp .env.production .env.local
    echo "⚠️  Por favor edita .env.local con tus valores reales antes de continuar"
    echo "   - Cambia las contraseñas por defecto"
    echo "   - Configura tu dominio"
    echo "   - Genera un JWT_SECRET seguro"
    read -p "Presiona Enter para continuar cuando hayas editado .env.local..."
fi

# Verificar certificados SSL
if [ ! -f "nginx/ssl/cert.pem" ] || [ ! -f "nginx/ssl/key.pem" ]; then
    echo "🔒 Generando certificados SSL auto-firmados..."
    mkdir -p nginx/ssl
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/key.pem \
        -out nginx/ssl/cert.pem \
        -subj "/C=PE/ST=La Libertad/L=Trujillo/O=UNT/CN=localhost"
    echo "⚠️  Se generaron certificados auto-firmados. Para producción usa Let's Encrypt"
fi

# Limpiar despliegue anterior
echo "🧹 Limpiando despliegue anterior..."
docker-compose -f docker-compose.prod.yml down --volumes --remove-orphans || true

# Construir y desplegar
echo "🔨 Construyendo imágenes..."
docker-compose -f docker-compose.prod.yml --env-file .env.local build

echo "🚀 Desplegando contenedores..."
docker-compose -f docker-compose.prod.yml --env-file .env.local up -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando que los servicios inicien..."
sleep 30

# Verificar salud de los servicios
echo "🏥 Verificando salud de los servicios..."
if curl -f http://localhost/health &> /dev/null; then
    echo "✅ Despliegue completado exitosamente!"
    echo ""
    echo "🌐 Aplicación disponible en:"
    echo "   - HTTP: http://localhost"
    echo "   - HTTPS: https://localhost"
    echo ""
    echo "📊 Comandos útiles:"
    echo "   - Ver logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo "   - Ver estado: docker-compose -f docker-compose.prod.yml ps"
    echo "   - Detener: docker-compose -f docker-compose.prod.yml down"
else
    echo "❌ Error en el despliegue. Revisa los logs:"
    docker-compose -f docker-compose.prod.yml logs
    exit 1
fi
