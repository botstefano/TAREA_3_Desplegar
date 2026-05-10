# UNT Gestión - Sistema de Gestión de Prácticas y Tesis

## 🚀 Despliegue Rápido

### Opción 1: Railway.app (Recomendado)
1. Sube este código a GitHub
2. Crea cuenta en [railway.app](https://railway.app)
3. Conecta tu repositorio
4. Railway detectará automáticamente el proyecto y lo desplegará

### Opción 2: Vercel + Supabase
- **Frontend**: Despliega en [Vercel](https://vercel.com)
- **Backend + BD**: Despliega en [Supabase](https://supabase.com)

### Opción 3: Render.com
1. Crea cuenta en [render.com](https://render.com)
2. Conecta tu repositorio GitHub
3. Configura variables de entorno

## 📋 Requisitos

- Node.js 18+
- Docker y Docker Compose
- PostgreSQL 15+
- 2GB RAM mínimo

## 🏗️ Arquitectura

```
├── backend/          # NestJS + tRPC + Puppeteer
├── frontend/         # Next.js + React + TailwindCSS
├── database/         # Scripts SQL
├── nginx/           # Configuración reverse proxy
└── docker-compose.yml
```

## 🔧 Variables de Entorno

Copia `.env.production` a `.env.local` y configura:

```bash
POSTGRES_USER=tu_usuario
POSTGRES_PASSWORD=tu_contraseña
DATABASE_URL=postgresql://usuario:contraseña@host:5432/db
JWT_SECRET=tu_secreto_jwt
NEXT_PUBLIC_API_URL=tu_url_api
```

## 🚀 Despliegue Local

```bash
docker-compose up -d
```

Acceso:
- Frontend: http://localhost:3000
- Backend: http://localhost:4000/trpc
- Base de datos: localhost:5432

## 📊 Funcionalidades

- ✅ Gestión de empresas
- ✅ Gestión de ofertas de prácticas
- ✅ Gestión de estudiantes
- ✅ Gestión de prácticas profesionales
- ✅ Gestión de tesis
- ✅ Generación de reportes PDF
- ✅ Dashboard con métricas

## 🛠️ Tecnologías

- **Backend**: NestJS, tRPC, PostgreSQL, Puppeteer
- **Frontend**: Next.js, React, TailwindCSS, TypeScript
- **Infraestructura**: Docker, Nginx, SSL/TLS

## 📄 Licencia

MIT License - Puedes usar este proyecto libremente
