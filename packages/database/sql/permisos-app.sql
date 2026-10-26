-- Ejecutar como administrador, despues de las migraciones.
-- El ejecutor debe envolver este archivo completo en BEGIN / COMMIT.
-- No contiene contrasenas ni altera las de usuarios existentes.

DO $$
DECLARE
    rol record;
    faltantes text;
BEGIN
    IF current_database() NOT IN (
        'comunidad_deportiva_dev', 'comunidad_deportiva_baseline_test'
    ) THEN
        RAISE EXCEPTION 'Base no autorizada para configurar permisos: %', current_database();
    END IF;

    IF NOT (SELECT rolsuper FROM pg_roles WHERE rolname = current_user) THEN
        RAISE EXCEPTION 'Ejecuta la configuracion con el administrador de PostgreSQL';
    END IF;

    SELECT string_agg(nombre, ', ' ORDER BY nombre) INTO faltantes
    FROM unnest(ARRAY[
        'paises', 'regiones', 'comunas', 'actividades', 'usuarios',
        'identidades_autenticacion', 'sesiones', 'preferencias_deportivas',
        'lugares', 'encuentros', 'inscripciones', 'asistencias', 'intenciones',
        'disponibilidades_intencion', 'propuestas_grupo', 'miembros_propuesta',
        'mensajes_encuentro', 'notificaciones', 'reportes', 'auditoria'
    ]) AS tablas(nombre)
    WHERE to_regclass(format('public.%I', nombre)) IS NULL;

    IF faltantes IS NOT NULL THEN
        RAISE EXCEPTION 'Primero aplica las migraciones. Faltan tablas: %', faltantes;
    END IF;

    SELECT * INTO rol FROM pg_roles WHERE rolname = 'comunidad_deportiva_app';
    IF NOT FOUND THEN
        CREATE ROLE comunidad_deportiva_app
            LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE
            NOREPLICATION NOBYPASSRLS NOINHERIT;
    ELSE
        IF NOT rol.rolcanlogin OR rol.rolsuper OR rol.rolcreatedb
            OR rol.rolcreaterole OR rol.rolreplication OR rol.rolbypassrls
            OR rol.rolinherit THEN
            RAISE EXCEPTION 'El rol existente no tiene los atributos limitados esperados; revisalo antes de continuar';
        END IF;
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_auth_members
        WHERE member = (SELECT oid FROM pg_roles WHERE rolname = 'comunidad_deportiva_app')
    ) THEN
        RAISE EXCEPTION 'El usuario de la aplicacion tiene membresias adicionales; revisalas antes de continuar';
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_database
        WHERE datname = current_database()
          AND datdba = (SELECT oid FROM pg_roles WHERE rolname = 'comunidad_deportiva_app')
    ) OR EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND c.relowner = (SELECT oid FROM pg_roles WHERE rolname = 'comunidad_deportiva_app')
    ) OR EXISTS (
        SELECT 1 FROM pg_namespace
        WHERE nspname = 'public'
          AND nspowner = (SELECT oid FROM pg_roles WHERE rolname = 'comunidad_deportiva_app')
    ) THEN
        RAISE EXCEPTION 'El usuario de la aplicacion no debe ser propietario de la base ni de sus objetos';
    END IF;

    EXECUTE format('GRANT CONNECT ON DATABASE %I TO comunidad_deportiva_app', current_database());
    EXECUTE format('REVOKE CREATE ON DATABASE %I FROM comunidad_deportiva_app', current_database());
END;
$$;

REVOKE CREATE ON SCHEMA public FROM comunidad_deportiva_app;
GRANT USAGE ON SCHEMA public TO comunidad_deportiva_app;

-- Reconstruye los permisos directos en public con una lista explicita.
-- Ninguna tabla nueva recibe acceso automaticamente.
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM comunidad_deportiva_app;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM comunidad_deportiva_app;

GRANT SELECT ON TABLE
    public.paises, public.regiones, public.comunas, public.actividades
TO comunidad_deportiva_app;

GRANT SELECT, INSERT, UPDATE ON TABLE
    public.usuarios, public.identidades_autenticacion, public.sesiones,
    public.preferencias_deportivas, public.lugares, public.encuentros,
    public.inscripciones, public.asistencias, public.intenciones,
    public.disponibilidades_intencion, public.propuestas_grupo,
    public.miembros_propuesta, public.mensajes_encuentro,
    public.notificaciones, public.reportes
TO comunidad_deportiva_app;

GRANT DELETE ON TABLE
    public.identidades_autenticacion, public.sesiones,
    public.preferencias_deportivas, public.disponibilidades_intencion,
    public.notificaciones
TO comunidad_deportiva_app;

GRANT SELECT, INSERT ON TABLE public.auditoria TO comunidad_deportiva_app;

-- Impide dar por correcta una configuracion ampliada indirectamente por PUBLIC.
DO $$
DECLARE
    tabla text;
    permiso text;
    esperado boolean;
    tiene boolean;
BEGIN
    IF has_schema_privilege('comunidad_deportiva_app', 'public', 'CREATE')
       OR has_database_privilege('comunidad_deportiva_app', current_database(), 'CREATE') THEN
        RAISE EXCEPTION 'Existen permisos CREATE indirectos (por ejemplo PUBLIC); revisa la configuracion';
    END IF;

    FOR tabla IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
        FOREACH permiso IN ARRAY ARRAY[
            'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER', 'MAINTAIN'
        ] LOOP
            esperado := CASE
                WHEN tabla IN ('paises', 'regiones', 'comunas', 'actividades') THEN permiso = 'SELECT'
                WHEN tabla = 'auditoria' THEN permiso IN ('SELECT', 'INSERT')
                WHEN tabla IN (
                    'identidades_autenticacion', 'sesiones', 'preferencias_deportivas',
                    'disponibilidades_intencion', 'notificaciones'
                ) THEN permiso IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE')
                WHEN tabla IN (
                    'usuarios', 'lugares', 'encuentros', 'inscripciones', 'asistencias',
                    'intenciones', 'propuestas_grupo', 'miembros_propuesta',
                    'mensajes_encuentro', 'reportes'
                ) THEN permiso IN ('SELECT', 'INSERT', 'UPDATE')
                ELSE false
            END;
            tiene := has_table_privilege('comunidad_deportiva_app', format('public.%I', tabla), permiso);
            IF tiene <> esperado OR has_table_privilege(
                'comunidad_deportiva_app', format('public.%I', tabla), permiso || ' WITH GRANT OPTION'
            ) THEN
                RAISE EXCEPTION 'Permiso inesperado para %.%: %', 'public', tabla, permiso;
            END IF;
        END LOOP;
    END LOOP;
END;
$$;
