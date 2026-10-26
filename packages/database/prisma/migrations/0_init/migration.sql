--
-- PostgreSQL database dump
--


-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', 'public', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: cancelar_inscripciones_encuentro(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.cancelar_inscripciones_encuentro() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE public.inscripciones
    SET estado = 'cancelada',
        oferta_expira_en = NULL,
        reconfirmacion_expira_en = NULL,
        motivo_cancelacion = 'Encuentro cancelado'
    WHERE encuentro_id = NEW.id
      AND estado <> 'cancelada';

    RETURN NEW;
END;
$$;


--
-- Name: establecer_actualizado_en(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.establecer_actualizado_en() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.actualizado_en := now();
    RETURN NEW;
END;
$$;


--
-- Name: impedir_modificacion_auditoria(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.impedir_modificacion_auditoria() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    RAISE EXCEPTION
        'Los registros de auditoría no se pueden modificar o eliminar';
END;
$$;


--
-- Name: validar_capacidad_encuentro(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validar_capacidad_encuentro() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_ocupados BIGINT;
BEGIN
    IF NEW.maximo_participantes
       IS DISTINCT FROM OLD.maximo_participantes THEN

        SELECT count(*)
        INTO v_ocupados
        FROM public.inscripciones
        WHERE encuentro_id = NEW.id
          AND estado IN (
              'confirmada',
              'plaza_ofrecida',
              'reconfirmacion_pendiente'
          );

        IF NEW.maximo_participantes < v_ocupados THEN
            RAISE EXCEPTION
                'La capacidad no puede ser menor que las plazas ocupadas';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;


--
-- Name: validar_cupo_inscripcion(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validar_cupo_inscripcion() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_encuentro_id UUID;
    v_estado_encuentro VARCHAR(20);
    v_maximo INTEGER;
    v_ocupados BIGINT;
    v_validar_admision BOOLEAN;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_encuentro_id := OLD.encuentro_id;
    ELSE
        v_encuentro_id := NEW.encuentro_id;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        IF NEW.encuentro_id IS DISTINCT FROM OLD.encuentro_id
           OR NEW.usuario_id IS DISTINCT FROM OLD.usuario_id THEN
            RAISE EXCEPTION
                'No se puede cambiar el encuentro o usuario de una inscripción';
        END IF;
    END IF;

    -- Escribe sobre la fila padre para coordinar operaciones concurrentes.
    UPDATE public.encuentros
    SET actualizado_en = now()
    WHERE id = v_encuentro_id
    RETURNING estado, maximo_participantes
    INTO v_estado_encuentro, v_maximo;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'El encuentro no existe';
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;

    v_validar_admision := (TG_OP = 'INSERT');

    IF TG_OP = 'UPDATE' THEN
        v_validar_admision :=
            NEW.estado IS DISTINCT FROM OLD.estado;
    END IF;

    IF v_validar_admision
       AND NEW.estado <> 'cancelada'
       AND v_estado_encuentro NOT IN ('publicado', 'confirmado') THEN
        RAISE EXCEPTION
            'El encuentro no admite inscripciones ni cambios de plaza';
    END IF;

    IF NEW.estado IN (
        'confirmada',
        'plaza_ofrecida',
        'reconfirmacion_pendiente'
    ) THEN
        SELECT count(*)
        INTO v_ocupados
        FROM public.inscripciones
        WHERE encuentro_id = NEW.encuentro_id
          AND id <> NEW.id
          AND estado IN (
              'confirmada',
              'plaza_ofrecida',
              'reconfirmacion_pendiente'
          );

        IF v_ocupados >= v_maximo THEN
            RAISE EXCEPTION
                'El encuentro no tiene cupos disponibles';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: actividades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.actividades (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    codigo character varying(50) NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    activo boolean DEFAULT true NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT actividades_codigo_formato CHECK (((codigo)::text ~ '^[a-z][a-z0-9_]*$'::text)),
    CONSTRAINT actividades_nombre_valido CHECK ((length(TRIM(BOTH FROM nombre)) > 0))
);


--
-- Name: asistencias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.asistencias (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    inscripcion_id uuid NOT NULL,
    registrada_por_id uuid,
    estado character varying(20) DEFAULT 'sin_verificar'::character varying NOT NULL,
    observacion character varying(500),
    confirmada_por_participante_en timestamp with time zone,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT asistencias_estado_valido CHECK (((estado)::text = ANY ((ARRAY['sin_verificar'::character varying, 'presente'::character varying, 'ausente'::character varying, 'en_revision'::character varying])::text[])))
);


--
-- Name: auditoria; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auditoria (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    actor_id uuid,
    accion character varying(100) NOT NULL,
    entidad character varying(100) NOT NULL,
    registro_id uuid,
    resultado character varying(20) DEFAULT 'exito'::character varying NOT NULL,
    datos jsonb DEFAULT '{}'::jsonb NOT NULL,
    correlacion_id uuid,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT auditoria_accion_valida CHECK ((length(TRIM(BOTH FROM accion)) > 0)),
    CONSTRAINT auditoria_datos_validos CHECK ((jsonb_typeof(datos) = 'object'::text)),
    CONSTRAINT auditoria_entidad_valida CHECK ((length(TRIM(BOTH FROM entidad)) > 0)),
    CONSTRAINT auditoria_resultado_valido CHECK (((resultado)::text = ANY ((ARRAY['exito'::character varying, 'rechazado'::character varying, 'error'::character varying])::text[])))
);


--
-- Name: comunas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comunas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    region_id uuid NOT NULL,
    codigo character varying(20) NOT NULL,
    nombre character varying(150) NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT comunas_codigo_valido CHECK ((((codigo)::text = TRIM(BOTH FROM codigo)) AND (length((codigo)::text) > 0))),
    CONSTRAINT comunas_nombre_valido CHECK ((length(TRIM(BOTH FROM nombre)) > 0))
);


--
-- Name: disponibilidades_intencion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.disponibilidades_intencion (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    intencion_id uuid NOT NULL,
    inicio_en timestamp with time zone NOT NULL,
    fin_en timestamp with time zone NOT NULL,
    zona_horaria character varying(64) NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT disponibilidades_horario_valido CHECK ((fin_en > inicio_en)),
    CONSTRAINT disponibilidades_zona_horaria_valida CHECK ((((zona_horaria)::text = TRIM(BOTH FROM zona_horaria)) AND (length((zona_horaria)::text) > 0)))
);


--
-- Name: encuentros; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.encuentros (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    actividad_id uuid NOT NULL,
    lugar_id uuid NOT NULL,
    organizador_id uuid NOT NULL,
    titulo character varying(150) NOT NULL,
    descripcion text,
    modalidad character varying(50),
    inicio_en timestamp with time zone NOT NULL,
    fin_en timestamp with time zone NOT NULL,
    zona_horaria character varying(64) NOT NULL,
    inscripciones_hasta timestamp with time zone,
    minimo_participantes integer DEFAULT 2 NOT NULL,
    maximo_participantes integer NOT NULL,
    nivel_requerido character varying(30) DEFAULT 'todos'::character varying NOT NULL,
    intensidad character varying(20),
    materiales text,
    accesibilidad_descripcion text,
    detalles_actividad jsonb DEFAULT '{}'::jsonb NOT NULL,
    visibilidad character varying(20) DEFAULT 'publico'::character varying NOT NULL,
    estado character varying(20) DEFAULT 'borrador'::character varying NOT NULL,
    motivo_cancelacion text,
    cancelado_en timestamp with time zone,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT encuentros_cancelacion_consistente CHECK (((((estado)::text = 'cancelado'::text) AND (cancelado_en IS NOT NULL) AND (motivo_cancelacion IS NOT NULL) AND (length(TRIM(BOTH FROM motivo_cancelacion)) > 0)) OR (((estado)::text <> 'cancelado'::text) AND (cancelado_en IS NULL) AND (motivo_cancelacion IS NULL)))),
    CONSTRAINT encuentros_capacidad_valida CHECK (((minimo_participantes >= 1) AND (maximo_participantes >= minimo_participantes))),
    CONSTRAINT encuentros_cierre_inscripciones_valido CHECK (((inscripciones_hasta IS NULL) OR (inscripciones_hasta <= inicio_en))),
    CONSTRAINT encuentros_detalles_validos CHECK ((jsonb_typeof(detalles_actividad) = 'object'::text)),
    CONSTRAINT encuentros_estado_valido CHECK (((estado)::text = ANY ((ARRAY['borrador'::character varying, 'publicado'::character varying, 'confirmado'::character varying, 'en_curso'::character varying, 'finalizado'::character varying, 'cancelado'::character varying])::text[]))),
    CONSTRAINT encuentros_horario_valido CHECK ((fin_en > inicio_en)),
    CONSTRAINT encuentros_intensidad_valida CHECK (((intensidad IS NULL) OR ((intensidad)::text = ANY ((ARRAY['suave'::character varying, 'moderada'::character varying, 'alta'::character varying])::text[])))),
    CONSTRAINT encuentros_nivel_valido CHECK (((nivel_requerido)::text = ANY ((ARRAY['todos'::character varying, 'sin_experiencia'::character varying, 'principiante'::character varying, 'intermedio'::character varying, 'avanzado'::character varying])::text[]))),
    CONSTRAINT encuentros_titulo_valido CHECK ((length(TRIM(BOTH FROM titulo)) > 0)),
    CONSTRAINT encuentros_visibilidad_valida CHECK (((visibilidad)::text = ANY ((ARRAY['publico'::character varying, 'por_enlace'::character varying])::text[]))),
    CONSTRAINT encuentros_zona_horaria_valida CHECK ((((zona_horaria)::text = TRIM(BOTH FROM zona_horaria)) AND (length((zona_horaria)::text) > 0)))
);


--
-- Name: identidades_autenticacion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.identidades_autenticacion (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario_id uuid NOT NULL,
    proveedor character varying(50) NOT NULL,
    identificador_proveedor character varying(255) NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT identidades_identificador_valido CHECK ((length(TRIM(BOTH FROM identificador_proveedor)) > 0)),
    CONSTRAINT identidades_proveedor_formato CHECK (((proveedor)::text ~ '^[a-z][a-z0-9_]*$'::text))
);


--
-- Name: inscripciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inscripciones (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    encuentro_id uuid NOT NULL,
    usuario_id uuid NOT NULL,
    estado character varying(30) DEFAULT 'confirmada'::character varying NOT NULL,
    en_espera_desde timestamp with time zone,
    oferta_expira_en timestamp with time zone,
    reconfirmacion_expira_en timestamp with time zone,
    motivo_cancelacion text,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT inscripciones_espera_valida CHECK ((((estado)::text <> 'en_espera'::text) OR (en_espera_desde IS NOT NULL))),
    CONSTRAINT inscripciones_estado_valido CHECK (((estado)::text = ANY ((ARRAY['confirmada'::character varying, 'en_espera'::character varying, 'plaza_ofrecida'::character varying, 'reconfirmacion_pendiente'::character varying, 'cancelada'::character varying])::text[]))),
    CONSTRAINT inscripciones_oferta_valida CHECK (((((estado)::text = 'plaza_ofrecida'::text) AND (oferta_expira_en IS NOT NULL)) OR (((estado)::text <> 'plaza_ofrecida'::text) AND (oferta_expira_en IS NULL)))),
    CONSTRAINT inscripciones_reconfirmacion_valida CHECK (((((estado)::text = 'reconfirmacion_pendiente'::text) AND (reconfirmacion_expira_en IS NOT NULL)) OR (((estado)::text <> 'reconfirmacion_pendiente'::text) AND (reconfirmacion_expira_en IS NULL))))
);


--
-- Name: intenciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.intenciones (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario_id uuid NOT NULL,
    actividad_id uuid NOT NULL,
    comuna_id uuid NOT NULL,
    descripcion character varying(1000),
    nivel character varying(30) DEFAULT 'principiante'::character varying NOT NULL,
    intensidad character varying(20),
    puede_organizar boolean DEFAULT false NOT NULL,
    latitud_referencia numeric(9,6),
    longitud_referencia numeric(9,6),
    radio_busqueda_metros integer DEFAULT 5000 NOT NULL,
    estado character varying(20) DEFAULT 'activa'::character varying NOT NULL,
    vigente_hasta timestamp with time zone NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT intenciones_coordenadas_consistentes CHECK ((((latitud_referencia IS NULL) AND (longitud_referencia IS NULL)) OR ((latitud_referencia IS NOT NULL) AND (longitud_referencia IS NOT NULL) AND ((latitud_referencia >= ('-90'::integer)::numeric) AND (latitud_referencia <= (90)::numeric)) AND ((longitud_referencia >= ('-180'::integer)::numeric) AND (longitud_referencia <= (180)::numeric))))),
    CONSTRAINT intenciones_estado_valido CHECK (((estado)::text = ANY ((ARRAY['activa'::character varying, 'pausada'::character varying, 'cerrada'::character varying, 'vencida'::character varying])::text[]))),
    CONSTRAINT intenciones_intensidad_valida CHECK (((intensidad IS NULL) OR ((intensidad)::text = ANY ((ARRAY['suave'::character varying, 'moderada'::character varying, 'alta'::character varying])::text[])))),
    CONSTRAINT intenciones_nivel_valido CHECK (((nivel)::text = ANY ((ARRAY['sin_experiencia'::character varying, 'principiante'::character varying, 'intermedio'::character varying, 'avanzado'::character varying])::text[]))),
    CONSTRAINT intenciones_radio_valido CHECK ((radio_busqueda_metros > 0)),
    CONSTRAINT intenciones_vigencia_valida CHECK ((vigente_hasta > creado_en))
);


--
-- Name: lugares; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lugares (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    comuna_id uuid NOT NULL,
    creado_por_id uuid,
    nombre character varying(150) NOT NULL,
    descripcion text,
    direccion character varying(255),
    tipo character varying(30) DEFAULT 'punto_encuentro'::character varying NOT NULL,
    latitud numeric(9,6) NOT NULL,
    longitud numeric(9,6) NOT NULL,
    zona_horaria character varying(64) NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT lugares_latitud_valida CHECK (((latitud >= ('-90'::integer)::numeric) AND (latitud <= (90)::numeric))),
    CONSTRAINT lugares_longitud_valida CHECK (((longitud >= ('-180'::integer)::numeric) AND (longitud <= (180)::numeric))),
    CONSTRAINT lugares_nombre_valido CHECK ((length(TRIM(BOTH FROM nombre)) > 0)),
    CONSTRAINT lugares_tipo_valido CHECK (((tipo)::text = ANY ((ARRAY['parque'::character varying, 'cancha'::character varying, 'recinto'::character varying, 'espacio_publico'::character varying, 'punto_encuentro'::character varying, 'otro'::character varying])::text[]))),
    CONSTRAINT lugares_zona_horaria_valida CHECK ((((zona_horaria)::text = TRIM(BOTH FROM zona_horaria)) AND (length((zona_horaria)::text) > 0)))
);


--
-- Name: mensajes_encuentro; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mensajes_encuentro (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    encuentro_id uuid NOT NULL,
    autor_id uuid NOT NULL,
    respuesta_a_id uuid,
    tipo character varying(20) DEFAULT 'mensaje'::character varying NOT NULL,
    contenido text NOT NULL,
    fijado boolean DEFAULT false NOT NULL,
    editado_en timestamp with time zone,
    eliminado_en timestamp with time zone,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT mensajes_contenido_valido CHECK (((length(TRIM(BOTH FROM contenido)) >= 1) AND (length(TRIM(BOTH FROM contenido)) <= 4000))),
    CONSTRAINT mensajes_edicion_valida CHECK (((editado_en IS NULL) OR (editado_en >= creado_en))),
    CONSTRAINT mensajes_eliminacion_valida CHECK (((eliminado_en IS NULL) OR (eliminado_en >= creado_en))),
    CONSTRAINT mensajes_respuesta_valida CHECK (((respuesta_a_id IS NULL) OR (respuesta_a_id <> id))),
    CONSTRAINT mensajes_tipo_valido CHECK (((tipo)::text = ANY ((ARRAY['mensaje'::character varying, 'aviso'::character varying])::text[])))
);


--
-- Name: miembros_propuesta; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.miembros_propuesta (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    propuesta_id uuid NOT NULL,
    usuario_id uuid NOT NULL,
    intencion_id uuid,
    estado character varying(20) DEFAULT 'pendiente'::character varying NOT NULL,
    respondido_en timestamp with time zone,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT miembros_propuesta_estado_valido CHECK (((estado)::text = ANY ((ARRAY['pendiente'::character varying, 'interesado'::character varying, 'confirmado'::character varying, 'rechazado'::character varying, 'retirado'::character varying])::text[]))),
    CONSTRAINT miembros_propuesta_respuesta_consistente CHECK (((((estado)::text = 'pendiente'::text) AND (respondido_en IS NULL)) OR (((estado)::text <> 'pendiente'::text) AND (respondido_en IS NOT NULL))))
);


--
-- Name: notificaciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notificaciones (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario_id uuid NOT NULL,
    encuentro_id uuid,
    propuesta_id uuid,
    tipo character varying(60) NOT NULL,
    titulo character varying(150) NOT NULL,
    contenido character varying(1500) NOT NULL,
    datos jsonb DEFAULT '{}'::jsonb NOT NULL,
    clave_deduplicacion character varying(200),
    leida_en timestamp with time zone,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT notificaciones_clave_valida CHECK (((clave_deduplicacion IS NULL) OR (length(TRIM(BOTH FROM clave_deduplicacion)) > 0))),
    CONSTRAINT notificaciones_contenido_valido CHECK ((length(TRIM(BOTH FROM contenido)) > 0)),
    CONSTRAINT notificaciones_datos_validos CHECK ((jsonb_typeof(datos) = 'object'::text)),
    CONSTRAINT notificaciones_lectura_valida CHECK (((leida_en IS NULL) OR (leida_en >= creado_en))),
    CONSTRAINT notificaciones_tipo_formato CHECK (((tipo)::text ~ '^[a-z][a-z0-9_]*$'::text)),
    CONSTRAINT notificaciones_titulo_valido CHECK ((length(TRIM(BOTH FROM titulo)) > 0))
);


--
-- Name: paises; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.paises (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    codigo character varying(2) NOT NULL,
    nombre character varying(100) NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT paises_codigo_formato CHECK (((codigo)::text ~ '^[A-Z]{2}$'::text)),
    CONSTRAINT paises_nombre_valido CHECK ((length(TRIM(BOTH FROM nombre)) > 0))
);


--
-- Name: preferencias_deportivas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.preferencias_deportivas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario_id uuid NOT NULL,
    actividad_id uuid NOT NULL,
    nivel character varying(30) DEFAULT 'principiante'::character varying NOT NULL,
    intensidad_preferida character varying(20),
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT preferencias_intensidad_valida CHECK (((intensidad_preferida IS NULL) OR ((intensidad_preferida)::text = ANY ((ARRAY['suave'::character varying, 'moderada'::character varying, 'alta'::character varying])::text[])))),
    CONSTRAINT preferencias_nivel_valido CHECK (((nivel)::text = ANY ((ARRAY['sin_experiencia'::character varying, 'principiante'::character varying, 'intermedio'::character varying, 'avanzado'::character varying])::text[])))
);


--
-- Name: propuestas_grupo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.propuestas_grupo (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    actividad_id uuid NOT NULL,
    comuna_id uuid NOT NULL,
    lugar_id uuid,
    organizador_propuesto_id uuid,
    encuentro_id uuid,
    titulo character varying(150) NOT NULL,
    descripcion text,
    inicio_propuesto_en timestamp with time zone,
    fin_propuesto_en timestamp with time zone,
    zona_horaria character varying(64),
    minimo_participantes integer DEFAULT 2 NOT NULL,
    maximo_participantes integer NOT NULL,
    estado character varying(30) DEFAULT 'borrador'::character varying NOT NULL,
    vence_en timestamp with time zone NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT propuestas_capacidad_valida CHECK (((minimo_participantes >= 1) AND (maximo_participantes >= minimo_participantes))),
    CONSTRAINT propuestas_conversion_consistente CHECK (((((estado)::text = 'convertida'::text) AND (encuentro_id IS NOT NULL) AND (organizador_propuesto_id IS NOT NULL) AND (lugar_id IS NOT NULL) AND (inicio_propuesto_en IS NOT NULL) AND (fin_propuesto_en IS NOT NULL)) OR (((estado)::text <> 'convertida'::text) AND (encuentro_id IS NULL)))),
    CONSTRAINT propuestas_estado_valido CHECK (((estado)::text = ANY ((ARRAY['borrador'::character varying, 'en_consulta'::character varying, 'lista_para_confirmar'::character varying, 'convertida'::character varying, 'rechazada'::character varying, 'vencida'::character varying, 'cerrada'::character varying])::text[]))),
    CONSTRAINT propuestas_horario_consistente CHECK ((((inicio_propuesto_en IS NULL) AND (fin_propuesto_en IS NULL) AND (zona_horaria IS NULL)) OR ((inicio_propuesto_en IS NOT NULL) AND (fin_propuesto_en IS NOT NULL) AND (fin_propuesto_en > inicio_propuesto_en) AND (zona_horaria IS NOT NULL) AND ((zona_horaria)::text = TRIM(BOTH FROM zona_horaria)) AND (length((zona_horaria)::text) > 0)))),
    CONSTRAINT propuestas_titulo_valido CHECK ((length(TRIM(BOTH FROM titulo)) > 0)),
    CONSTRAINT propuestas_vencimiento_valido CHECK ((vence_en > creado_en))
);


--
-- Name: regiones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.regiones (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    pais_id uuid NOT NULL,
    codigo character varying(20) NOT NULL,
    nombre character varying(150) NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT regiones_codigo_valido CHECK ((((codigo)::text = TRIM(BOTH FROM codigo)) AND (length((codigo)::text) > 0))),
    CONSTRAINT regiones_nombre_valido CHECK ((length(TRIM(BOTH FROM nombre)) > 0))
);


--
-- Name: reportes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reportes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    denunciante_id uuid,
    asignado_a_id uuid,
    usuario_reportado_id uuid,
    encuentro_reportado_id uuid,
    mensaje_reportado_id uuid,
    categoria character varying(40) NOT NULL,
    descripcion text NOT NULL,
    estado character varying(20) DEFAULT 'recibido'::character varying NOT NULL,
    resolucion text,
    resuelto_en timestamp with time zone,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT reportes_categoria_valida CHECK (((categoria)::text = ANY ((ARRAY['acoso'::character varying, 'spam'::character varying, 'suplantacion'::character varying, 'contenido_inapropiado'::character varying, 'informacion_incorrecta'::character varying, 'otro'::character varying])::text[]))),
    CONSTRAINT reportes_descripcion_valida CHECK (((length(TRIM(BOTH FROM descripcion)) >= 1) AND (length(TRIM(BOTH FROM descripcion)) <= 5000))),
    CONSTRAINT reportes_estado_valido CHECK (((estado)::text = ANY ((ARRAY['recibido'::character varying, 'en_revision'::character varying, 'resuelto'::character varying, 'cerrado'::character varying])::text[]))),
    CONSTRAINT reportes_fecha_resolucion_valida CHECK (((resuelto_en IS NULL) OR (resuelto_en >= creado_en))),
    CONSTRAINT reportes_objetivo_unico CHECK ((num_nonnulls(usuario_reportado_id, encuentro_reportado_id, mensaje_reportado_id) = 1)),
    CONSTRAINT reportes_resolucion_consistente CHECK (((((estado)::text = ANY ((ARRAY['resuelto'::character varying, 'cerrado'::character varying])::text[])) AND (resuelto_en IS NOT NULL) AND (resolucion IS NOT NULL) AND (length(TRIM(BOTH FROM resolucion)) > 0)) OR (((estado)::text = ANY ((ARRAY['recibido'::character varying, 'en_revision'::character varying])::text[])) AND (resuelto_en IS NULL) AND (resolucion IS NULL))))
);


--
-- Name: sesiones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sesiones (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario_id uuid NOT NULL,
    token_renovacion_hash text NOT NULL,
    nombre_dispositivo character varying(150),
    expira_en timestamp with time zone NOT NULL,
    revocada_en timestamp with time zone,
    ultimo_uso_en timestamp with time zone DEFAULT now() NOT NULL,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT sesiones_expiracion_valida CHECK ((expira_en > creado_en)),
    CONSTRAINT sesiones_revocacion_valida CHECK (((revocada_en IS NULL) OR (revocada_en >= creado_en))),
    CONSTRAINT sesiones_token_hash_valido CHECK ((length(TRIM(BOTH FROM token_renovacion_hash)) > 0))
);


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre_publico character varying(100) NOT NULL,
    correo character varying(254) NOT NULL,
    password_hash text,
    avatar_url text,
    biografia character varying(500),
    rol character varying(20) DEFAULT 'usuario'::character varying NOT NULL,
    estado character varying(30) DEFAULT 'pendiente_verificacion'::character varying NOT NULL,
    correo_verificado_en timestamp with time zone,
    mayoria_edad_confirmada_en timestamp with time zone,
    ultimo_acceso_en timestamp with time zone,
    creado_en timestamp with time zone DEFAULT now() NOT NULL,
    actualizado_en timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT usuarios_correo_normalizado CHECK ((((correo)::text = lower(TRIM(BOTH FROM correo))) AND ((correo)::text <> ''::text))),
    CONSTRAINT usuarios_estado_valido CHECK (((estado)::text = ANY ((ARRAY['pendiente_verificacion'::character varying, 'activo'::character varying, 'suspendido'::character varying, 'eliminado'::character varying])::text[]))),
    CONSTRAINT usuarios_nombre_valido CHECK ((length(TRIM(BOTH FROM nombre_publico)) > 0)),
    CONSTRAINT usuarios_password_hash_valido CHECK (((password_hash IS NULL) OR (length(TRIM(BOTH FROM password_hash)) > 0))),
    CONSTRAINT usuarios_rol_valido CHECK (((rol)::text = ANY ((ARRAY['usuario'::character varying, 'moderador'::character varying, 'administrador'::character varying])::text[])))
);


--
-- Name: actividades actividades_codigo_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.actividades
    ADD CONSTRAINT actividades_codigo_unique UNIQUE (codigo);


--
-- Name: actividades actividades_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.actividades
    ADD CONSTRAINT actividades_pkey PRIMARY KEY (id);


--
-- Name: asistencias asistencias_inscripcion_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asistencias
    ADD CONSTRAINT asistencias_inscripcion_unique UNIQUE (inscripcion_id);


--
-- Name: asistencias asistencias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asistencias
    ADD CONSTRAINT asistencias_pkey PRIMARY KEY (id);


--
-- Name: auditoria auditoria_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT auditoria_pkey PRIMARY KEY (id);


--
-- Name: comunas comunas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comunas
    ADD CONSTRAINT comunas_pkey PRIMARY KEY (id);


--
-- Name: comunas comunas_region_codigo_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comunas
    ADD CONSTRAINT comunas_region_codigo_unique UNIQUE (region_id, codigo);


--
-- Name: disponibilidades_intencion disponibilidades_franja_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disponibilidades_intencion
    ADD CONSTRAINT disponibilidades_franja_unique UNIQUE (intencion_id, inicio_en, fin_en);


--
-- Name: disponibilidades_intencion disponibilidades_intencion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disponibilidades_intencion
    ADD CONSTRAINT disponibilidades_intencion_pkey PRIMARY KEY (id);


--
-- Name: encuentros encuentros_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encuentros
    ADD CONSTRAINT encuentros_pkey PRIMARY KEY (id);


--
-- Name: identidades_autenticacion identidades_autenticacion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.identidades_autenticacion
    ADD CONSTRAINT identidades_autenticacion_pkey PRIMARY KEY (id);


--
-- Name: identidades_autenticacion identidades_proveedor_identificador_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.identidades_autenticacion
    ADD CONSTRAINT identidades_proveedor_identificador_unique UNIQUE (proveedor, identificador_proveedor);


--
-- Name: identidades_autenticacion identidades_usuario_proveedor_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.identidades_autenticacion
    ADD CONSTRAINT identidades_usuario_proveedor_unique UNIQUE (usuario_id, proveedor);


--
-- Name: inscripciones inscripciones_encuentro_usuario_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inscripciones
    ADD CONSTRAINT inscripciones_encuentro_usuario_unique UNIQUE (encuentro_id, usuario_id);


--
-- Name: inscripciones inscripciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inscripciones
    ADD CONSTRAINT inscripciones_pkey PRIMARY KEY (id);


--
-- Name: intenciones intenciones_id_usuario_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.intenciones
    ADD CONSTRAINT intenciones_id_usuario_unique UNIQUE (id, usuario_id);


--
-- Name: intenciones intenciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.intenciones
    ADD CONSTRAINT intenciones_pkey PRIMARY KEY (id);


--
-- Name: lugares lugares_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lugares
    ADD CONSTRAINT lugares_pkey PRIMARY KEY (id);


--
-- Name: mensajes_encuentro mensajes_encuentro_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mensajes_encuentro
    ADD CONSTRAINT mensajes_encuentro_pkey PRIMARY KEY (id);


--
-- Name: mensajes_encuentro mensajes_id_encuentro_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mensajes_encuentro
    ADD CONSTRAINT mensajes_id_encuentro_unique UNIQUE (id, encuentro_id);


--
-- Name: miembros_propuesta miembros_propuesta_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.miembros_propuesta
    ADD CONSTRAINT miembros_propuesta_pkey PRIMARY KEY (id);


--
-- Name: miembros_propuesta miembros_propuesta_usuario_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.miembros_propuesta
    ADD CONSTRAINT miembros_propuesta_usuario_unique UNIQUE (propuesta_id, usuario_id);


--
-- Name: notificaciones notificaciones_deduplicacion_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_deduplicacion_unique UNIQUE (usuario_id, clave_deduplicacion);


--
-- Name: notificaciones notificaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_pkey PRIMARY KEY (id);


--
-- Name: paises paises_codigo_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paises
    ADD CONSTRAINT paises_codigo_unique UNIQUE (codigo);


--
-- Name: paises paises_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.paises
    ADD CONSTRAINT paises_pkey PRIMARY KEY (id);


--
-- Name: preferencias_deportivas preferencias_deportivas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preferencias_deportivas
    ADD CONSTRAINT preferencias_deportivas_pkey PRIMARY KEY (id);


--
-- Name: preferencias_deportivas preferencias_usuario_actividad_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preferencias_deportivas
    ADD CONSTRAINT preferencias_usuario_actividad_unique UNIQUE (usuario_id, actividad_id);


--
-- Name: propuestas_grupo propuestas_encuentro_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.propuestas_grupo
    ADD CONSTRAINT propuestas_encuentro_unique UNIQUE (encuentro_id);


--
-- Name: propuestas_grupo propuestas_grupo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.propuestas_grupo
    ADD CONSTRAINT propuestas_grupo_pkey PRIMARY KEY (id);


--
-- Name: regiones regiones_pais_codigo_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regiones
    ADD CONSTRAINT regiones_pais_codigo_unique UNIQUE (pais_id, codigo);


--
-- Name: regiones regiones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regiones
    ADD CONSTRAINT regiones_pkey PRIMARY KEY (id);


--
-- Name: reportes reportes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reportes
    ADD CONSTRAINT reportes_pkey PRIMARY KEY (id);


--
-- Name: sesiones sesiones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sesiones
    ADD CONSTRAINT sesiones_pkey PRIMARY KEY (id);


--
-- Name: sesiones sesiones_token_hash_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sesiones
    ADD CONSTRAINT sesiones_token_hash_unique UNIQUE (token_renovacion_hash);


--
-- Name: usuarios usuarios_correo_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_correo_unique UNIQUE (correo);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: asistencias_registrador_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX asistencias_registrador_idx ON public.asistencias USING btree (registrada_por_id);


--
-- Name: auditoria_actor_fecha_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX auditoria_actor_fecha_idx ON public.auditoria USING btree (actor_id, creado_en);


--
-- Name: auditoria_correlacion_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX auditoria_correlacion_idx ON public.auditoria USING btree (correlacion_id);


--
-- Name: auditoria_fecha_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX auditoria_fecha_idx ON public.auditoria USING btree (creado_en);


--
-- Name: auditoria_recurso_fecha_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX auditoria_recurso_fecha_idx ON public.auditoria USING btree (entidad, registro_id, creado_en);


--
-- Name: disponibilidades_horario_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX disponibilidades_horario_idx ON public.disponibilidades_intencion USING btree (inicio_en, fin_en);


--
-- Name: encuentros_actividad_inicio_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX encuentros_actividad_inicio_idx ON public.encuentros USING btree (actividad_id, inicio_en);


--
-- Name: encuentros_estado_inicio_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX encuentros_estado_inicio_idx ON public.encuentros USING btree (estado, inicio_en);


--
-- Name: encuentros_lugar_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX encuentros_lugar_idx ON public.encuentros USING btree (lugar_id);


--
-- Name: encuentros_organizador_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX encuentros_organizador_idx ON public.encuentros USING btree (organizador_id);


--
-- Name: inscripciones_encuentro_estado_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inscripciones_encuentro_estado_idx ON public.inscripciones USING btree (encuentro_id, estado);


--
-- Name: inscripciones_lista_espera_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inscripciones_lista_espera_idx ON public.inscripciones USING btree (encuentro_id, en_espera_desde, creado_en, id) WHERE ((estado)::text = 'en_espera'::text);


--
-- Name: inscripciones_ofertas_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inscripciones_ofertas_idx ON public.inscripciones USING btree (oferta_expira_en) WHERE ((estado)::text = 'plaza_ofrecida'::text);


--
-- Name: inscripciones_reconfirmaciones_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inscripciones_reconfirmaciones_idx ON public.inscripciones USING btree (reconfirmacion_expira_en) WHERE ((estado)::text = 'reconfirmacion_pendiente'::text);


--
-- Name: inscripciones_usuario_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX inscripciones_usuario_idx ON public.inscripciones USING btree (usuario_id);


--
-- Name: intenciones_busqueda_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX intenciones_busqueda_idx ON public.intenciones USING btree (actividad_id, comuna_id, estado, vigente_hasta);


--
-- Name: intenciones_comuna_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX intenciones_comuna_idx ON public.intenciones USING btree (comuna_id);


--
-- Name: intenciones_usuario_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX intenciones_usuario_idx ON public.intenciones USING btree (usuario_id);


--
-- Name: lugares_comuna_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lugares_comuna_idx ON public.lugares USING btree (comuna_id);


--
-- Name: lugares_creador_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lugares_creador_idx ON public.lugares USING btree (creado_por_id);


--
-- Name: mensajes_autor_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX mensajes_autor_idx ON public.mensajes_encuentro USING btree (autor_id);


--
-- Name: mensajes_encuentro_fecha_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX mensajes_encuentro_fecha_idx ON public.mensajes_encuentro USING btree (encuentro_id, creado_en, id);


--
-- Name: mensajes_respuesta_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX mensajes_respuesta_idx ON public.mensajes_encuentro USING btree (respuesta_a_id, encuentro_id);


--
-- Name: miembros_propuesta_estado_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX miembros_propuesta_estado_idx ON public.miembros_propuesta USING btree (propuesta_id, estado);


--
-- Name: miembros_propuesta_intencion_usuario_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX miembros_propuesta_intencion_usuario_idx ON public.miembros_propuesta USING btree (intencion_id, usuario_id);


--
-- Name: miembros_propuesta_usuario_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX miembros_propuesta_usuario_idx ON public.miembros_propuesta USING btree (usuario_id);


--
-- Name: notificaciones_encuentro_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notificaciones_encuentro_idx ON public.notificaciones USING btree (encuentro_id);


--
-- Name: notificaciones_no_leidas_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notificaciones_no_leidas_idx ON public.notificaciones USING btree (usuario_id, creado_en) WHERE (leida_en IS NULL);


--
-- Name: notificaciones_propuesta_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notificaciones_propuesta_idx ON public.notificaciones USING btree (propuesta_id);


--
-- Name: notificaciones_usuario_fecha_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notificaciones_usuario_fecha_idx ON public.notificaciones USING btree (usuario_id, creado_en, id);


--
-- Name: preferencias_actividad_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX preferencias_actividad_idx ON public.preferencias_deportivas USING btree (actividad_id);


--
-- Name: propuestas_busqueda_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX propuestas_busqueda_idx ON public.propuestas_grupo USING btree (actividad_id, comuna_id, estado, vence_en);


--
-- Name: propuestas_comuna_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX propuestas_comuna_idx ON public.propuestas_grupo USING btree (comuna_id);


--
-- Name: propuestas_lugar_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX propuestas_lugar_idx ON public.propuestas_grupo USING btree (lugar_id);


--
-- Name: propuestas_organizador_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX propuestas_organizador_idx ON public.propuestas_grupo USING btree (organizador_propuesto_id);


--
-- Name: reportes_asignado_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reportes_asignado_idx ON public.reportes USING btree (asignado_a_id);


--
-- Name: reportes_denunciante_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reportes_denunciante_idx ON public.reportes USING btree (denunciante_id);


--
-- Name: reportes_encuentro_reportado_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reportes_encuentro_reportado_idx ON public.reportes USING btree (encuentro_reportado_id);


--
-- Name: reportes_estado_fecha_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reportes_estado_fecha_idx ON public.reportes USING btree (estado, creado_en);


--
-- Name: reportes_mensaje_reportado_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reportes_mensaje_reportado_idx ON public.reportes USING btree (mensaje_reportado_id);


--
-- Name: reportes_usuario_reportado_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reportes_usuario_reportado_idx ON public.reportes USING btree (usuario_reportado_id);


--
-- Name: sesiones_expiracion_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sesiones_expiracion_idx ON public.sesiones USING btree (expira_en);


--
-- Name: sesiones_usuario_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sesiones_usuario_idx ON public.sesiones USING btree (usuario_id);


--
-- Name: actividades actividades_actualizado_en; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER actividades_actualizado_en BEFORE UPDATE ON public.actividades FOR EACH ROW EXECUTE FUNCTION public.establecer_actualizado_en();


--
-- Name: asistencias asistencias_actualizado_en; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER asistencias_actualizado_en BEFORE UPDATE ON public.asistencias FOR EACH ROW EXECUTE FUNCTION public.establecer_actualizado_en();


--
-- Name: auditoria auditoria_impedir_truncate; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER auditoria_impedir_truncate BEFORE TRUNCATE ON public.auditoria FOR EACH STATEMENT EXECUTE FUNCTION public.impedir_modificacion_auditoria();


--
-- Name: auditoria auditoria_solo_insercion; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER auditoria_solo_insercion BEFORE DELETE OR UPDATE ON public.auditoria FOR EACH ROW EXECUTE FUNCTION public.impedir_modificacion_auditoria();


--
-- Name: comunas comunas_actualizado_en; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER comunas_actualizado_en BEFORE UPDATE ON public.comunas FOR EACH ROW EXECUTE FUNCTION public.establecer_actualizado_en();


--
-- Name: disponibilidades_intencion disponibilidades_actualizado_en; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER disponibilidades_actualizado_en BEFORE UPDATE ON public.disponibilidades_intencion FOR EACH ROW EXECUTE FUNCTION public.establecer_actualizado_en();


--
-- Name: encuentros encuentros_actualizado_en; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER encuentros_actualizado_en BEFORE UPDATE ON public.encuentros FOR EACH ROW EXECUTE FUNCTION public.establecer_actualizado_en();


--
-- Name: encuentros encuentros_cancelar_inscripciones; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER encuentros_cancelar_inscripciones AFTER UPDATE ON public.encuentros FOR EACH ROW WHEN ((((new.estado)::text = 'cancelado'::text) AND ((old.estado)::text IS DISTINCT FROM (new.estado)::text))) EXECUTE FUNCTION public.cancelar_inscripciones_encuentro();


--
-- Name: encuentros encuentros_validar_capacidad; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER encuentros_validar_capacidad BEFORE UPDATE ON public.encuentros FOR EACH ROW EXECUTE FUNCTION public.validar_capacidad_encuentro();


--
-- Name: identidades_autenticacion identidades_actualizado_en; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER identidades_actualizado_en BEFORE UPDATE ON public.identidades_autenticacion FOR EACH ROW EXECUTE FUNCTION public.establecer_actualizado_en();


--
-- Name: inscripciones inscripciones_actualizado_en; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER inscripciones_actualizado_en BEFORE UPDATE ON public.inscripciones FOR EACH ROW EXECUTE FUNCTION public.establecer_actualizado_en();


--
-- Name: inscripciones inscripciones_validar_cupo; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER inscripciones_validar_cupo BEFORE INSERT OR DELETE OR UPDATE ON public.inscripciones FOR EACH ROW EXECUTE FUNCTION public.validar_cupo_inscripcion();


--
-- Name: intenciones intenciones_actualizado_en; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER intenciones_actualizado_en BEFORE UPDATE ON public.intenciones FOR EACH ROW EXECUTE FUNCTION public.establecer_actualizado_en();


--
-- Name: lugares lugares_actualizado_en; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER lugares_actualizado_en BEFORE UPDATE ON public.lugares FOR EACH ROW EXECUTE FUNCTION public.establecer_actualizado_en();


--
-- Name: mensajes_encuentro mensajes_actualizado_en; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER mensajes_actualizado_en BEFORE UPDATE ON public.mensajes_encuentro FOR EACH ROW EXECUTE FUNCTION public.establecer_actualizado_en();


--
-- Name: miembros_propuesta miembros_propuesta_actualizado_en; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER miembros_propuesta_actualizado_en BEFORE UPDATE ON public.miembros_propuesta FOR EACH ROW EXECUTE FUNCTION public.establecer_actualizado_en();


--
-- Name: notificaciones notificaciones_actualizado_en; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER notificaciones_actualizado_en BEFORE UPDATE ON public.notificaciones FOR EACH ROW EXECUTE FUNCTION public.establecer_actualizado_en();


--
-- Name: paises paises_actualizado_en; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER paises_actualizado_en BEFORE UPDATE ON public.paises FOR EACH ROW EXECUTE FUNCTION public.establecer_actualizado_en();


--
-- Name: preferencias_deportivas preferencias_actualizado_en; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER preferencias_actualizado_en BEFORE UPDATE ON public.preferencias_deportivas FOR EACH ROW EXECUTE FUNCTION public.establecer_actualizado_en();


--
-- Name: propuestas_grupo propuestas_actualizado_en; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER propuestas_actualizado_en BEFORE UPDATE ON public.propuestas_grupo FOR EACH ROW EXECUTE FUNCTION public.establecer_actualizado_en();


--
-- Name: regiones regiones_actualizado_en; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER regiones_actualizado_en BEFORE UPDATE ON public.regiones FOR EACH ROW EXECUTE FUNCTION public.establecer_actualizado_en();


--
-- Name: reportes reportes_actualizado_en; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER reportes_actualizado_en BEFORE UPDATE ON public.reportes FOR EACH ROW EXECUTE FUNCTION public.establecer_actualizado_en();


--
-- Name: sesiones sesiones_actualizado_en; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER sesiones_actualizado_en BEFORE UPDATE ON public.sesiones FOR EACH ROW EXECUTE FUNCTION public.establecer_actualizado_en();


--
-- Name: usuarios usuarios_actualizado_en; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER usuarios_actualizado_en BEFORE UPDATE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION public.establecer_actualizado_en();


--
-- Name: asistencias asistencias_inscripcion_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asistencias
    ADD CONSTRAINT asistencias_inscripcion_fk FOREIGN KEY (inscripcion_id) REFERENCES public.inscripciones(id) ON DELETE RESTRICT;


--
-- Name: asistencias asistencias_registrador_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asistencias
    ADD CONSTRAINT asistencias_registrador_fk FOREIGN KEY (registrada_por_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- Name: auditoria auditoria_actor_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT auditoria_actor_fk FOREIGN KEY (actor_id) REFERENCES public.usuarios(id) ON DELETE RESTRICT;


--
-- Name: comunas comunas_region_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comunas
    ADD CONSTRAINT comunas_region_fk FOREIGN KEY (region_id) REFERENCES public.regiones(id) ON DELETE RESTRICT;


--
-- Name: disponibilidades_intencion disponibilidades_intencion_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disponibilidades_intencion
    ADD CONSTRAINT disponibilidades_intencion_fk FOREIGN KEY (intencion_id) REFERENCES public.intenciones(id) ON DELETE CASCADE;


--
-- Name: encuentros encuentros_actividad_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encuentros
    ADD CONSTRAINT encuentros_actividad_fk FOREIGN KEY (actividad_id) REFERENCES public.actividades(id) ON DELETE RESTRICT;


--
-- Name: encuentros encuentros_lugar_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encuentros
    ADD CONSTRAINT encuentros_lugar_fk FOREIGN KEY (lugar_id) REFERENCES public.lugares(id) ON DELETE RESTRICT;


--
-- Name: encuentros encuentros_organizador_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encuentros
    ADD CONSTRAINT encuentros_organizador_fk FOREIGN KEY (organizador_id) REFERENCES public.usuarios(id) ON DELETE RESTRICT;


--
-- Name: identidades_autenticacion identidades_usuario_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.identidades_autenticacion
    ADD CONSTRAINT identidades_usuario_fk FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: inscripciones inscripciones_encuentro_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inscripciones
    ADD CONSTRAINT inscripciones_encuentro_fk FOREIGN KEY (encuentro_id) REFERENCES public.encuentros(id) ON DELETE RESTRICT;


--
-- Name: inscripciones inscripciones_usuario_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inscripciones
    ADD CONSTRAINT inscripciones_usuario_fk FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE RESTRICT;


--
-- Name: intenciones intenciones_actividad_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.intenciones
    ADD CONSTRAINT intenciones_actividad_fk FOREIGN KEY (actividad_id) REFERENCES public.actividades(id) ON DELETE RESTRICT;


--
-- Name: intenciones intenciones_comuna_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.intenciones
    ADD CONSTRAINT intenciones_comuna_fk FOREIGN KEY (comuna_id) REFERENCES public.comunas(id) ON DELETE RESTRICT;


--
-- Name: intenciones intenciones_usuario_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.intenciones
    ADD CONSTRAINT intenciones_usuario_fk FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE RESTRICT;


--
-- Name: lugares lugares_comuna_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lugares
    ADD CONSTRAINT lugares_comuna_fk FOREIGN KEY (comuna_id) REFERENCES public.comunas(id) ON DELETE RESTRICT;


--
-- Name: lugares lugares_creador_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lugares
    ADD CONSTRAINT lugares_creador_fk FOREIGN KEY (creado_por_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- Name: mensajes_encuentro mensajes_autor_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mensajes_encuentro
    ADD CONSTRAINT mensajes_autor_fk FOREIGN KEY (autor_id) REFERENCES public.usuarios(id) ON DELETE RESTRICT;


--
-- Name: mensajes_encuentro mensajes_encuentro_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mensajes_encuentro
    ADD CONSTRAINT mensajes_encuentro_fk FOREIGN KEY (encuentro_id) REFERENCES public.encuentros(id) ON DELETE RESTRICT;


--
-- Name: mensajes_encuentro mensajes_respuesta_mismo_encuentro_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mensajes_encuentro
    ADD CONSTRAINT mensajes_respuesta_mismo_encuentro_fk FOREIGN KEY (respuesta_a_id, encuentro_id) REFERENCES public.mensajes_encuentro(id, encuentro_id) ON DELETE RESTRICT;


--
-- Name: miembros_propuesta miembros_propuesta_intencion_usuario_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.miembros_propuesta
    ADD CONSTRAINT miembros_propuesta_intencion_usuario_fk FOREIGN KEY (intencion_id, usuario_id) REFERENCES public.intenciones(id, usuario_id) ON DELETE RESTRICT;


--
-- Name: miembros_propuesta miembros_propuesta_propuesta_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.miembros_propuesta
    ADD CONSTRAINT miembros_propuesta_propuesta_fk FOREIGN KEY (propuesta_id) REFERENCES public.propuestas_grupo(id) ON DELETE RESTRICT;


--
-- Name: miembros_propuesta miembros_propuesta_usuario_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.miembros_propuesta
    ADD CONSTRAINT miembros_propuesta_usuario_fk FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE RESTRICT;


--
-- Name: notificaciones notificaciones_encuentro_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_encuentro_fk FOREIGN KEY (encuentro_id) REFERENCES public.encuentros(id) ON DELETE SET NULL;


--
-- Name: notificaciones notificaciones_propuesta_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_propuesta_fk FOREIGN KEY (propuesta_id) REFERENCES public.propuestas_grupo(id) ON DELETE SET NULL;


--
-- Name: notificaciones notificaciones_usuario_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_usuario_fk FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: preferencias_deportivas preferencias_actividad_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preferencias_deportivas
    ADD CONSTRAINT preferencias_actividad_fk FOREIGN KEY (actividad_id) REFERENCES public.actividades(id) ON DELETE RESTRICT;


--
-- Name: preferencias_deportivas preferencias_usuario_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preferencias_deportivas
    ADD CONSTRAINT preferencias_usuario_fk FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: propuestas_grupo propuestas_actividad_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.propuestas_grupo
    ADD CONSTRAINT propuestas_actividad_fk FOREIGN KEY (actividad_id) REFERENCES public.actividades(id) ON DELETE RESTRICT;


--
-- Name: propuestas_grupo propuestas_comuna_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.propuestas_grupo
    ADD CONSTRAINT propuestas_comuna_fk FOREIGN KEY (comuna_id) REFERENCES public.comunas(id) ON DELETE RESTRICT;


--
-- Name: propuestas_grupo propuestas_encuentro_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.propuestas_grupo
    ADD CONSTRAINT propuestas_encuentro_fk FOREIGN KEY (encuentro_id) REFERENCES public.encuentros(id) ON DELETE RESTRICT;


--
-- Name: propuestas_grupo propuestas_lugar_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.propuestas_grupo
    ADD CONSTRAINT propuestas_lugar_fk FOREIGN KEY (lugar_id) REFERENCES public.lugares(id) ON DELETE RESTRICT;


--
-- Name: propuestas_grupo propuestas_organizador_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.propuestas_grupo
    ADD CONSTRAINT propuestas_organizador_fk FOREIGN KEY (organizador_propuesto_id) REFERENCES public.usuarios(id) ON DELETE RESTRICT;


--
-- Name: regiones regiones_pais_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.regiones
    ADD CONSTRAINT regiones_pais_fk FOREIGN KEY (pais_id) REFERENCES public.paises(id) ON DELETE RESTRICT;


--
-- Name: reportes reportes_asignado_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reportes
    ADD CONSTRAINT reportes_asignado_fk FOREIGN KEY (asignado_a_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- Name: reportes reportes_denunciante_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reportes
    ADD CONSTRAINT reportes_denunciante_fk FOREIGN KEY (denunciante_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- Name: reportes reportes_encuentro_reportado_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reportes
    ADD CONSTRAINT reportes_encuentro_reportado_fk FOREIGN KEY (encuentro_reportado_id) REFERENCES public.encuentros(id) ON DELETE RESTRICT;


--
-- Name: reportes reportes_mensaje_reportado_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reportes
    ADD CONSTRAINT reportes_mensaje_reportado_fk FOREIGN KEY (mensaje_reportado_id) REFERENCES public.mensajes_encuentro(id) ON DELETE RESTRICT;


--
-- Name: reportes reportes_usuario_reportado_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reportes
    ADD CONSTRAINT reportes_usuario_reportado_fk FOREIGN KEY (usuario_reportado_id) REFERENCES public.usuarios(id) ON DELETE RESTRICT;


--
-- Name: sesiones sesiones_usuario_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sesiones
    ADD CONSTRAINT sesiones_usuario_fk FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


