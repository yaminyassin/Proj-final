CREATE TABLE public.place
(
	id SERIAL,
    title character varying(255) COLLATE pg_catalog."default" NOT NULL,
    description character varying(255) COLLATE pg_catalog."default" NOT NULL,
    category character varying(255) COLLATE pg_catalog."default" NOT NULL,
	geo geometry(Polygon,4326),
    CONSTRAINT place_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public.place
    OWNER to postgres;
-- Index: sidx_regiao_geom

-- DROP INDEX public.sidx_regiao_geom;

CREATE INDEX sidx_place_geo
    ON public.place USING gist
    (geo)
    TABLESPACE pg_default;

CREATE TABLE public.park
(
    id SERIAL,
    nlugares numeric,
    nvagos numeric,
    rua character varying(255) COLLATE pg_catalog."default" NOT NULL,
	geo geometry(Polygon,4326),
    CONSTRAINT parque_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE public.park
    OWNER to postgres;
-- Index: sidx_parque_geom

-- DROP INDEX public.sidx_parque_geom;

CREATE INDEX sidx_park_geo
    ON public.park USING gist
    (geo)
    TABLESPACE pg_default;
