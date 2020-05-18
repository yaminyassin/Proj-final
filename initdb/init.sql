CREATE DATABASE location
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    TABLESPACE = pg_default

    

CREATE TABLE public.regiao
(
    geom geometry(Polygon,4326),
    pais character varying(255) COLLATE pg_catalog."default" NOT NULL,
    cidade character varying(255) COLLATE pg_catalog."default" NOT NULL,
    concelho character varying(255) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT regiao_pkey PRIMARY KEY (pais, cidade, concelho)
)

TABLESPACE pg_default;

ALTER TABLE public.regiao
    OWNER to postgres;
-- Index: sidx_regiao_geom

-- DROP INDEX public.sidx_regiao_geom;

CREATE INDEX sidx_regiao_geom
    ON public.regiao USING gist
    (geom)
    TABLESPACE pg_default;

CREATE TABLE public.parque
(
    id numeric NOT NULL,
    nlugares numeric,
    nvagos numeric,
    pais character varying(255) COLLATE pg_catalog."default" NOT NULL,
    cidade character varying(255) COLLATE pg_catalog."default" NOT NULL,
    concelho character varying(255) COLLATE pg_catalog."default" NOT NULL,
    rua character varying(255) COLLATE pg_catalog."default" NOT NULL,
    geom geometry(Polygon,4326),
    CONSTRAINT parque_pkey PRIMARY KEY (id),
    CONSTRAINT fk_regiao FOREIGN KEY (cidade, concelho, pais)
        REFERENCES public.regiao (cidade, concelho, pais) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE public.parque
    OWNER to postgres;
-- Index: sidx_parque_geom

-- DROP INDEX public.sidx_parque_geom;

CREATE INDEX sidx_parque_geom
    ON public.parque USING gist
    (geom)
    TABLESPACE pg_default;
