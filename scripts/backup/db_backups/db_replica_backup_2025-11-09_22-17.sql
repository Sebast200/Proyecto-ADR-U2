--
-- PostgreSQL database dump
--

\restrict twX6rev5gDyt3TP5JMURvw8sVcU2j0L7O8AbwyWvj8vHVe1BqHpbzr3Wbj86B1k

-- Dumped from database version 15.14
-- Dumped by pg_dump version 15.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: reporte_eventualidad; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reporte_eventualidad (
    id integer NOT NULL,
    id_vehiculo integer NOT NULL,
    id_usuario integer NOT NULL,
    tipo_eventualidad character varying(100) NOT NULL,
    comentario text,
    synced boolean DEFAULT false
);


ALTER TABLE public.reporte_eventualidad OWNER TO postgres;

--
-- Name: reporte_eventualidad_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reporte_eventualidad_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.reporte_eventualidad_id_seq OWNER TO postgres;

--
-- Name: reporte_eventualidad_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reporte_eventualidad_id_seq OWNED BY public.reporte_eventualidad.id;


--
-- Name: reportes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reportes (
    id integer NOT NULL,
    id_vehiculo integer NOT NULL,
    estado_motor boolean NOT NULL,
    km_recorridos double precision DEFAULT 0,
    detenciones_vehiculo integer DEFAULT 0,
    synced boolean DEFAULT false
);


ALTER TABLE public.reportes OWNER TO postgres;

--
-- Name: reportes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reportes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.reportes_id_seq OWNER TO postgres;

--
-- Name: reportes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reportes_id_seq OWNED BY public.reportes.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    rut character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    role character varying(255) NOT NULL,
    synced boolean DEFAULT false
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vehiculo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehiculo (
    id integer NOT NULL,
    patente character varying(255) NOT NULL,
    marca character varying(255) NOT NULL,
    tipo_combustible character varying(255) NOT NULL,
    id_usuario integer,
    synced boolean DEFAULT false
);


ALTER TABLE public.vehiculo OWNER TO postgres;

--
-- Name: vehiculo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vehiculo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.vehiculo_id_seq OWNER TO postgres;

--
-- Name: vehiculo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vehiculo_id_seq OWNED BY public.vehiculo.id;


--
-- Name: reporte_eventualidad id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reporte_eventualidad ALTER COLUMN id SET DEFAULT nextval('public.reporte_eventualidad_id_seq'::regclass);


--
-- Name: reportes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reportes ALTER COLUMN id SET DEFAULT nextval('public.reportes_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vehiculo id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehiculo ALTER COLUMN id SET DEFAULT nextval('public.vehiculo_id_seq'::regclass);


--
-- Data for Name: reporte_eventualidad; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reporte_eventualidad (id, id_vehiculo, id_usuario, tipo_eventualidad, comentario, synced) FROM stdin;
\.


--
-- Data for Name: reportes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reportes (id, id_vehiculo, estado_motor, km_recorridos, detenciones_vehiculo, synced) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, rut, email, password_hash, first_name, last_name, role, synced) FROM stdin;
1	11.111.111-1	sync@test.com	hash	Sync	Test	user	t
2	22.222.222-2	sync2@test.com	hash2	Sync2	Test2	user	t
4	11111111-1	nuevo@example.com	$2a$10$NYE1IKISQMX6J24fZ3cJnuLQQPyu6R9J1QCkQvFGUtKRiWvxPpJ0m	Test	User	CHOFER	t
5	21334312	driver@flt.com	$2a$10$UFLitEGfbUfOOZtApSv.TOs4NvH7iftNuOsldLQkpKsko7ShMK7sC	Test	Driver	CHOFER	t
\.


--
-- Data for Name: vehiculo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehiculo (id, patente, marca, tipo_combustible, id_usuario, synced) FROM stdin;
\.


--
-- Name: reporte_eventualidad_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reporte_eventualidad_id_seq', 1, false);


--
-- Name: reportes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reportes_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 5, true);


--
-- Name: vehiculo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vehiculo_id_seq', 1, false);


--
-- Name: reporte_eventualidad reporte_eventualidad_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reporte_eventualidad
    ADD CONSTRAINT reporte_eventualidad_pkey PRIMARY KEY (id);


--
-- Name: reportes reportes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reportes
    ADD CONSTRAINT reportes_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_rut_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_rut_key UNIQUE (rut);


--
-- Name: vehiculo vehiculo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehiculo
    ADD CONSTRAINT vehiculo_pkey PRIMARY KEY (id);


--
-- Name: vehiculo fk_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehiculo
    ADD CONSTRAINT fk_usuario FOREIGN KEY (id_usuario) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: reporte_eventualidad fk_usuario_eventualidad; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reporte_eventualidad
    ADD CONSTRAINT fk_usuario_eventualidad FOREIGN KEY (id_usuario) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: reportes fk_vehiculo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reportes
    ADD CONSTRAINT fk_vehiculo FOREIGN KEY (id_vehiculo) REFERENCES public.vehiculo(id) ON DELETE CASCADE;


--
-- Name: reporte_eventualidad fk_vehiculo_eventualidad; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reporte_eventualidad
    ADD CONSTRAINT fk_vehiculo_eventualidad FOREIGN KEY (id_vehiculo) REFERENCES public.vehiculo(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict twX6rev5gDyt3TP5JMURvw8sVcU2j0L7O8AbwyWvj8vHVe1BqHpbzr3Wbj86B1k

