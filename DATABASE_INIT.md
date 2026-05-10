# Inicialización de Base de Datos - UNT Gestión

## Pasos para configurar PostgreSQL en Railway:

### 1. Ejecutar Schema SQL
Copia y pega este script en el Query Editor de Railway PostgreSQL:

```sql
-- Tipos de Usuario (Roles)
CREATE TYPE rol_usuario AS ENUM ('administrador', 'coordinador', 'asesor', 'estudiante', 'empresa');

-- Estados de la Práctica
CREATE TYPE estado_practica AS ENUM ('pendiente', 'aprobada', 'en_progreso', 'finalizada', 'rechazada');

-- Estados de la Tesis
CREATE TYPE estado_tesis AS ENUM ('proyecto_registrado', 'en_desarrollo', 'sustentacion_programada', 'aprobada', 'observada');

-- Tabla de Usuarios
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    correo VARCHAR(150) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    rol rol_usuario NOT NULL,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- Tabla de Estudiantes
CREATE TABLE estudiantes (
    id UUID PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    codigo_estudiante VARCHAR(20) UNIQUE NOT NULL,
    facultad VARCHAR(100) NOT NULL,
    escuela VARCHAR(100) NOT NULL,
    ciclo_actual INTEGER,
    expediente_url TEXT
);

-- Tabla de Empresas
CREATE TABLE empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ruc VARCHAR(11) UNIQUE NOT NULL,
    razon_social VARCHAR(200) NOT NULL,
    direccion TEXT,
    representante_nombre VARCHAR(150),
    correo_contacto VARCHAR(150),
    tiene_convenio BOOLEAN DEFAULT FALSE,
    tipo_convenio VARCHAR(50)
);

-- Tabla de Ofertas de Prácticas
CREATE TABLE ofertas_practicas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    requisitos TEXT,
    fecha_inicio DATE,
    fecha_fin DATE,
    vacantes INTEGER,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Prácticas
CREATE TABLE practicas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estudiante_id UUID REFERENCES estudiantes(id) ON DELETE CASCADE,
    oferta_id UUID REFERENCES ofertas_practicas(id) ON DELETE CASCADE,
    asesor_id UUID REFERENCES usuarios(id),
    fecha_inicio DATE,
    fecha_fin_estimada DATE,
    fecha_fin_real DATE,
    horas_totales INTEGER,
    estado estado_practica DEFAULT 'pendiente',
    informe_final_url TEXT,
    evaluacion_puntuacion INTEGER CHECK (evaluacion_puntuacion >= 0 AND evaluacion_puntuacion <= 20),
    comentarios_asesor TEXT,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Tesis
CREATE TABLE tesis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(300) NOT NULL,
    estudiante_id UUID REFERENCES estudiantes(id) ON DELETE CASCADE,
    asesor_id UUID REFERENCES usuarios(id),
    estado estado_tesis DEFAULT 'proyecto_registrado',
    archivo_proyecto_url TEXT,
    fecha_sustentacion DATE,
    nota_final DECIMAL(3,1) CHECK (nota_final >= 0 AND nota_final <= 20),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Avances de Tesis
CREATE TABLE avances_tesis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tesis_id UUID REFERENCES tesis(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    archivo_url TEXT,
    fecha_entrega TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    aprobado BOOLEAN DEFAULT FALSE,
    comentarios_asesor TEXT
);

-- Tabla de Jurados de Tesis
CREATE TABLE jurados_tesis (
    tesis_id UUID REFERENCES tesis(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    PRIMARY KEY (tesis_id, usuario_id)
);

-- Índices para mejor rendimiento
CREATE INDEX idx_estudiantes_codigo ON estudiantes(codigo_estudiante);
CREATE INDEX idx_empresas_ruc ON empresas(ruc);
CREATE INDEX idx_ofertas_empresa ON ofertas_practicas(empresa_id);
CREATE INDEX idx_ofertas_activas ON ofertas_practicas(activo);
CREATE INDEX idx_practicas_estudiante ON practicas(estudiante_id);
CREATE INDEX idx_practicas_oferta ON practicas(oferta_id);
CREATE INDEX idx_practicas_estado ON practicas(estado);
CREATE INDEX idx_tesis_estudiante ON tesis(estudiante_id);
CREATE INDEX idx_tesis_estado ON tesis(estado);
CREATE INDEX idx_avances_tesis ON avances_tesis(tesis_id);
CREATE INDEX idx_usuarios_correo ON usuarios(correo);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
```

### 2. Datos de Ejemplo (Opcional)
```sql
-- Insertar usuarios de ejemplo
INSERT INTO usuarios (nombre, apellidos, correo, contrasena, rol) VALUES
('Juan', 'Pérez', 'juan.perez@unt.edu.pe', '$2b$10$hashed_password', 'estudiante'),
('María', 'García', 'maria.garcia@unt.edu.pe', '$2b$10$hashed_password', 'estudiante'),
('Carlos', 'López', 'carlos.lopez@unt.edu.pe', '$2b$10$hashed_password', 'asesor'),
('Ana', 'Martínez', 'ana.martinez@unt.edu.pe', '$2b$10$hashed_password', 'administrador');

-- Insertar empresas de ejemplo
INSERT INTO empresas (ruc, razon_social, direccion, representante_nombre, correo_contacto, tiene_convenio) VALUES
('20123456789', 'Tech Solutions S.A.C.', 'Av. Industrial 123', 'Juan Rodríguez', 'contacto@techsolutions.com', TRUE),
('20456789012', 'Software Innovations', 'Centro Comercial 456', 'María Fernández', 'info@softwareinov.com', FALSE);
```

### 3. Reiniciar el Backend
Después de ejecutar los scripts, reinicia el servicio Backend en Railway.
