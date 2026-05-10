# UNT Gestión - Guía de Despliegue

## Requisitos Previos

- Docker y Docker Compose instalados
- Dominio configurado para apuntar al servidor
- Certificados SSL (Let's Encrypt recomendado)
- Servidor con al menos 2GB RAM y 20GB almacenamiento

## Configuración del Entorno

1. **Variables de Entorno**
   ```bash
   cp .env.production .env.local
   # Editar .env.local con valores reales
   ```

2. **Configurar Dominio**
   - Editar `nginx/nginx.conf` y reemplazar `your-domain.com` con tu dominio real

3. **Certificados SSL**
   ```bash
   # Crear directorio SSL
   mkdir -p nginx/ssl
   
   # Usar Let's Encrypt (recomendado)
   certbot certonly --standalone -d your-domain.com
   cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
   cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem
   
   # O usar certificados auto-firmados para desarrollo
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout nginx/ssl/key.pem \
     -out nginx/ssl/cert.pem
   ```

## Despliegue

1. **Construir y Desplegar**
   ```bash
   # Usar el archivo de producción
   docker-compose -f docker-compose.prod.yml --env-file .env.local up -d --build
   ```

2. **Verificar Despliegue**
   ```bash
   # Verificar contenedores
   docker-compose -f docker-compose.prod.yml ps
   
   # Verificar logs
   docker-compose -f docker-compose.prod.yml logs -f
   
   # Verificar salud de servicios
   curl https://your-domain.com/health
   ```

## Mantenimiento

### Actualizaciones
```bash
# Actualizar aplicación
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d --build
```

### Backups de Base de Datos
```bash
# Crear backup
docker exec unt_db_prod pg_dump -U unt_user_prod unt_gestion_prod > backup.sql

# Restaurar backup
docker exec -i unt_db_prod psql -U unt_user_prod unt_gestion_prod < backup.sql
```

### Monitoreo
- Los contenedores incluyen health checks
- Nginx incluye rate limiting y headers de seguridad
- Logs disponibles via `docker-compose logs`

## Seguridad Implementada

- ✅ HTTPS con SSL/TLS
- ✅ Headers de seguridad HTTP
- ✅ Rate limiting en API
- ✅ Contenedores non-root
- ✅ Variables de entorno seguras
- ✅ Health checks automáticos

## Escalado

Para entornos de mayor escala:
- Considerar Docker Swarm o Kubernetes
- Base de datos dedicada (RDS, CloudSQL)
- CDN para assets estáticos
- Balanceador de carga dedicado

## Troubleshooting

### Problemas Comunes

1. **Contenedores no inician**
   ```bash
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

2. **Error de conexión a base de datos**
   - Verificar variables de entorno en `.env.local`
   - Asegurar que el contenedor DB está corriendo

3. **Certificados SSL**
   - Verificar que los archivos existan en `nginx/ssl/`
   - Revisar fechas de expiración

### Logs Específicos

```bash
# Logs de backend
docker logs unt_backend_prod

# Logs de frontend  
docker logs unt_frontend_prod

# Logs de nginx
docker logs unt_nginx

# Logs de base de datos
docker logs unt_db_prod
```

## Soporte

Para problemas de despliegue:
1. Revisar logs de contenedores
2. Verificar configuración de red
3. Validar certificados SSL
4. Confirmar variables de entorno
