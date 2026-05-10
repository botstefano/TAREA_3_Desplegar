-- Datos demo (se ejecuta sólo en init de Postgres si el volumen está vacío)

-- Usuarios adicionales
INSERT INTO usuarios (id, nombre, apellidos, correo, contrasena, rol, activo)
VALUES
  ('11111111-1111-4111-8111-111111111111', 'María', 'Demo Estudiante', 'maria.demo@unt.edu.pe', 'changeme', 'estudiante', TRUE),
  ('22222222-2222-4222-8222-222222222222', 'Carlos', 'Demo Asesor', 'carlos.asesor@unt.edu.pe', 'changeme', 'asesor', TRUE),
  ('33333333-3333-4333-8333-333333333333', 'Ana', 'Demo Coordinadora', 'ana.coordinador@unt.edu.pe', 'changeme', 'coordinador', TRUE),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Juan', 'Administrador', 'admin@unt.edu.pe', 'admin123', 'administrador', TRUE),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Pedro', 'Asesor Sistemas', 'pedro.asesor@unt.edu.pe', 'changeme', 'asesor', TRUE),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'Laura', 'Coordinadora Ingeniería', 'laura.coordinador@unt.edu.pe', 'changeme', 'coordinador', TRUE),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'Roberto', 'Estudiante Ingeniería', 'roberto.estudiante@unt.edu.pe', 'changeme', 'estudiante', TRUE),
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'Sofia', 'Estudiante Sistemas', 'sofia.estudiante@unt.edu.pe', 'changeme', 'estudiante', TRUE),
  ('ffffffff-ffff-4fff-8fff-ffffffffffff', 'Miguel', 'Estudiante Civil', 'miguel.estudiante@unt.edu.pe', 'changeme', 'estudiante', TRUE),
  ('12345678-1234-4abc-8abc-123456abcdef', 'Elena', 'Asesora Tesis', 'elena.asesor@unt.edu.pe', 'changeme', 'asesor', TRUE),
  ('87654321-8765-4abc-8abc-fedcba654321', 'Diego', 'Empresa Contacto', 'diego.empresa@empresa1.com', 'changeme', 'empresa', TRUE)
ON CONFLICT (correo) DO NOTHING;

-- Estudiantes adicionales
INSERT INTO estudiantes (id, codigo_estudiante, facultad, escuela, ciclo_actual)
VALUES
  ('11111111-1111-4111-8111-111111111111', '20201234', 'Ingeniería', 'Ingeniería de Sistemas', 9),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', '20211235', 'Ingeniería', 'Ingeniería Civil', 8),
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', '20221236', 'Ingeniería', 'Ingeniería de Sistemas', 7),
  ('ffffffff-ffff-4fff-8fff-ffffffffffff', '20231237', 'Ingeniería', 'Ingeniería Civil', 6)
ON CONFLICT (id) DO NOTHING;

-- Empresas adicionales
INSERT INTO empresas (id, ruc, razon_social, direccion, representante_nombre, correo_contacto, tiene_convenio, tipo_convenio)
VALUES
  ('44444444-4444-4444-8444-444444444444', '20000000001', 'Empresa Demo S.A.C.', 'Av. España 123, Trujillo', 'Juan Pérez', 'contacto@empresademo.com', TRUE, 'Marco'),
  ('55555555-5555-4555-8555-555555555555', '20000000002', 'Tech Solutions S.A.', 'Jr. Pizarro 456, Trujillo', 'María García', 'rrhh@techsolutions.com', TRUE, 'Específico'),
  ('66666666-6666-4666-8666-666666666666', '20000000003', 'Constructora Norte S.A.', 'Av. Larco 789, Trujillo', 'Carlos Rodríguez', 'contacto@constructoranorte.com', FALSE, NULL),
  ('77777777-7777-4777-8777-777777777777', '20000000004', 'Agroindustria Valle S.A.', 'Carretera a Laredo Km 5', 'Ana López', 'seleccion@agroindustria.com', TRUE, 'Marco')
ON CONFLICT (ruc) DO NOTHING;

-- Ofertas de prácticas adicionales
INSERT INTO ofertas_practicas (id, empresa_id, titulo, descripcion, requisitos, fecha_inicio, fecha_fin, vacantes, activo)
VALUES
  (
    '55555555-5555-4555-8555-555555555555',
    '44444444-4444-4444-8444-444444444444',
    'Práctica preprofesional en desarrollo web',
    'Apoyo en desarrollo frontend con React y backend NestJS.',
    'Conocimientos básicos de Git y SQL.',
    '2024-03-01',
    '2024-08-31',
    2,
    TRUE
  ),
  (
    '88888888-8888-4888-8888-888888888888',
    '55555555-5555-4555-8555-555555555555',
    'Desarrollo de software móvil',
    'Participar en el desarrollo de aplicaciones móviles para iOS y Android.',
    'Experiencia en React Native o Flutter. Conocimientos de APIs REST.',
    '2024-04-01',
    '2024-09-30',
    3,
    TRUE
  ),
  (
    '99999999-9999-4999-8999-999999999999',
    '66666666-6666-4666-8666-666666666666',
    'Práctica en gestión de proyectos de construcción',
    'Apoyo en la gestión y seguimiento de proyectos de construcción civil.',
    'Conocimientos básicos de AutoCAD y MS Project.',
    '2024-05-01',
    '2024-10-31',
    1,
    TRUE
  ),
  (
    'abcdefab-cdef-4abc-8abc-abcdefabcdef',
    '77777777-7777-4777-8777-777777777777',
    'Análisis de datos agrícolas',
    'Procesamiento y análisis de datos de producción agrícola.',
    'Conocimientos de Python, Pandas y estadística básica.',
    '2024-06-01',
    '2024-11-30',
    2,
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- Prácticas en diferentes estados
INSERT INTO practicas (id, estudiante_id, oferta_id, asesor_id, estado, horas_totales, fecha_inicio, fecha_fin_estimada, evaluacion_puntuacion, comentarios_asesor)
VALUES
  (
    'fedcbafe-dcba-4fed-8fed-fedcbafedcba',
    '11111111-1111-4111-8111-111111111111',
    '55555555-5555-4555-8555-555555555555',
    '22222222-2222-4222-8222-222222222222',
    'en_progreso',
    120,
    '2024-03-15',
    '2024-08-15',
    NULL,
    'Buen desempeño inicial'
  ),
  (
    '00000000-0000-4000-8000-000000000000',
    'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    '88888888-8888-4888-8888-888888888888',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'aprobada',
    0,
    NULL,
    '2024-09-30',
    NULL,
    NULL
  ),
  (
    '11111111-1111-4111-8111-111111111112',
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    '99999999-9999-4999-8999-999999999999',
    '12345678-1234-4abc-8abc-123456abcdef',
    'finalizada',
    240,
    '2024-05-01',
    '2024-10-01',
    18.5,
    'Excelente trabajo, muy recomendado'
  ),
  (
    '22222222-2222-4222-8222-222222222223',
    'ffffffff-ffff-4fff-8fff-ffffffffffff',
    'abcdefab-cdef-4abc-8abc-abcdefabcdef',
    '22222222-2222-4222-8222-222222222222',
    'pendiente',
    0,
    NULL,
    NULL,
    NULL,
    NULL
  )
ON CONFLICT (id) DO NOTHING;

-- Proyectos de tesis
INSERT INTO tesis (id, titulo, estudiante_id, asesor_id, estado, fecha_registro, fecha_sustentacion, nota_final)
VALUES
  (
    '44444444-4444-4444-8444-444444444445',
    'Desarrollo de un sistema de gestión académica basado en microservicios',
    '11111111-1111-4111-8111-111111111111',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'en_desarrollo',
    '2024-01-15',
    NULL,
    NULL
  ),
  (
    '55555555-5555-4555-8555-555555555556',
    'Análisis de vulnerabilidades en redes inalámbricas de instituciones educativas',
    'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    '12345678-1234-4abc-8abc-123456abcdef',
    'sustentacion_programada',
    '2023-09-01',
    '2024-06-15 10:00:00+00',
    NULL
  ),
  (
    '66666666-6666-4666-8666-666666666667',
    'Optimización de estructuras de concreto armado mediante algoritmos genéticos',
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    '22222222-2222-4222-8222-222222222222',
    'aprobada',
    '2023-03-01',
    '2024-01-20 09:00:00+00',
    17.0
  ),
  (
    '77777777-7777-4777-8777-777777777778',
    'Sistema de riego inteligente para cultivos en zonas áridas',
    'ffffffff-ffff-4fff-8fff-ffffffffffff',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'proyecto_registrado',
    '2024-04-01',
    NULL,
    NULL
  )
ON CONFLICT (id) DO NOTHING;

-- Jurados de tesis
INSERT INTO jurados_tesis (tesis_id, usuario_id)
VALUES
  ('44444444-4444-4444-8444-444444444445', '22222222-2222-4222-8222-222222222222'),
  ('44444444-4444-4444-8444-444444444445', '12345678-1234-4abc-8abc-123456abcdef'),
  ('55555555-5555-4555-8555-555555555556', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),
  ('55555555-5555-4555-8555-555555555556', '22222222-2222-4222-8222-222222222222'),
  ('66666666-6666-4666-8666-666666666667', '12345678-1234-4abc-8abc-123456abcdef'),
  ('66666666-6666-4666-8666-666666666667', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb')
ON CONFLICT (tesis_id, usuario_id) DO NOTHING;

-- Avances de tesis
INSERT INTO avances_tesis (id, tesis_id, titulo, descripcion, archivo_url, fecha_entrega, comentarios_asesor, aprobado)
VALUES
  (
    '88888888-8888-4888-8888-888888888889',
    '44444444-4444-4444-8444-444444444445',
    'Revisión bibliográfica y estado del arte',
    'Análisis de tecnologías actuales para sistemas de gestión académica',
    'https://drive.google.com/avance1.pdf',
    '2024-02-15 00:00:00+00',
    'Buen trabajo en la revisión bibliográfica',
    TRUE
  ),
  (
    '99999999-9999-4999-8999-999999999990',
    '44444444-4444-4444-8444-444444444445',
    'Diseño de la arquitectura del sistema',
    'Propuesta de arquitectura basada en microservicios',
    'https://drive.google.com/avance2.pdf',
    '2024-04-01 00:00:00+00',
    'La arquitectura propuesta es sólida',
    TRUE
  ),
  (
    'abcdefab-cdef-4abc-8abc-abcdefabcdea',
    '55555555-5555-4555-8555-555555555556',
    'Análisis de vulnerabilidades encontradas',
    'Resultados del escaneo de redes en instituciones educativas',
    'https://drive.google.com/avance3.pdf',
    '2024-03-20 00:00:00+00',
    'Interesantes hallazgos, profundizar en las recomendaciones',
    FALSE
  ),
  (
    'fedcbafe-dcba-4fed-8fed-fedcbafedcb0',
    '66666666-6666-4666-8666-666666666667',
    'Resultados finales y conclusiones',
    'Análisis completo de la optimización estructural',
    'https://drive.google.com/avance4.pdf',
    '2023-12-15 00:00:00+00',
    'Excelente trabajo de investigación',
    TRUE
  )
ON CONFLICT (id) DO NOTHING;
