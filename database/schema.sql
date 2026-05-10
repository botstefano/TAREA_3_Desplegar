-- Script SQL para la Gestión de Prácticas y Tesis - Universidad Nacional de Trujillo (UNT)
-- Compatible con PostgreSQL

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
    expediente_url TEXT -- Link a documentos de expediente
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
    tipo_convenio VARCHAR(50) -- 'Marco', 'Específico'
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
    vacantes INTEGER DEFAULT 1,
    activo BOOLEAN DEFAULT TRUE,
    fecha_publicacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Prácticas Preprofesionales (Gestión)
CREATE TABLE practicas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estudiante_id UUID REFERENCES estudiantes(id),
    oferta_id UUID REFERENCES ofertas_practicas(id),
    asesor_id UUID REFERENCES usuarios(id), -- Usuario con rol 'asesor'
    estado estado_practica DEFAULT 'pendiente',
    horas_totales INTEGER DEFAULT 0,
    fecha_inicio DATE,
    fecha_fin_estimada DATE,
    informe_final_url TEXT,
    evaluacion_puntuacion DECIMAL(4,2),
    comentarios_asesor TEXT
);

-- Tabla de Proyectos de Tesis
CREATE TABLE tesis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(500) NOT NULL,
    estudiante_id UUID REFERENCES estudiantes(id),
    asesor_id UUID REFERENCES usuarios(id),
    estado estado_tesis DEFAULT 'proyecto_registrado',
    fecha_registro DATE DEFAULT CURRENT_DATE,
    archivo_proyecto_url TEXT,
    fecha_sustentacion TIMESTAMP WITH TIME ZONE,
    nota_final DECIMAL(4,2)
);

-- Tabla de Jurados de Tesis (Relación N a M)
CREATE TABLE jurados_tesis (
    tesis_id UUID REFERENCES tesis(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id), -- Usuario con rol 'asesor' (docente)
    PRIMARY KEY (tesis_id, usuario_id)
);

-- Tabla de Entregables/Avances de Tesis
CREATE TABLE avances_tesis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tesis_id UUID REFERENCES tesis(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    archivo_url TEXT,
    fecha_entrega TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    comentarios_asesor TEXT,
    aprobado BOOLEAN DEFAULT FALSE
);

-- Índices para optimización
CREATE INDEX idx_usuarios_correo ON usuarios(correo);
CREATE INDEX idx_practicas_estudiante ON practicas(estudiante_id);
CREATE INDEX idx_tesis_estudiante ON tesis(estudiante_id);
CREATE INDEX idx_ofertas_empresa ON ofertas_practicas(empresa_id);
