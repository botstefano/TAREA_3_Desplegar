-- Crear tipos de datos
CREATE TYPE rol_usuario AS ENUM ('administrador', 'coordinador', 'asesor', 'estudiante', 'empresa');
CREATE TYPE estado_practica AS ENUM ('pendiente', 'aprobada', 'en_progreso', 'finalizada', 'rechazada');
CREATE TYPE estado_tesis AS ENUM ('proyecto_registrado', 'en_desarrollo', 'sustentacion_programada', 'aprobada', 'observada');

-- Crear tablas
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

CREATE TABLE estudiantes (
    id UUID PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    codigo_estudiante VARCHAR(20) UNIQUE NOT NULL,
    facultad VARCHAR(100) NOT NULL,
    escuela VARCHAR(100) NOT NULL,
    ciclo_actual INTEGER,
    expediente_url TEXT
);

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

CREATE TABLE jurados_tesis (
    tesis_id UUID REFERENCES tesis(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    PRIMARY KEY (tesis_id, usuario_id)
);

-- Insertar datos iniciales
INSERT INTO usuarios (nombre, apellidos, correo, contrasena, rol) VALUES
('Admin', 'Sistema', 'admin@unt.edu.pe', '$2b$10$dummy_hash', 'administrador'),
('Juan', 'Pérez', 'juan.perez@unt.edu.pe', '$2b$10$dummy_hash', 'estudiante'),
('Carlos', 'López', 'carlos.lopez@unt.edu.pe', '$2b$10$dummy_hash', 'asesor');

INSERT INTO empresas (ruc, razon_social, direccion, tiene_convenio) VALUES
('20123456789', 'Tech Solutions S.A.C.', 'Av. Industrial 123', TRUE),
('20456789012', 'Software Innovations', 'Centro Comercial 456', FALSE);

INSERT INTO estudiantes (id, codigo_estudiante, facultad, escuela, ciclo_actual) 
SELECT u.id, '202100123', 'Ingeniería', 'Sistemas', 8 
FROM usuarios u WHERE u.correo = 'juan.perez@unt.edu.pe';
