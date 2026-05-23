-- =============================================
-- EJECUTA ESTE SQL EN:
-- supabase.com → tu proyecto → SQL Editor → New query
-- =============================================

-- Tabla de perfiles (vinculada a auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.perfiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre      TEXT NOT NULL,
  rol         TEXT NOT NULL CHECK (rol IN ('hombre', 'mujer', 'admin')),
  genero      TEXT,
  barrio      TEXT,
  edad        INTEGER CHECK (edad >= 18 AND edad <= 100),
  foto_url    TEXT,
  bio         TEXT,
  coins       INTEGER DEFAULT 0,
  verificada  BOOLEAN DEFAULT FALSE,
  activo      BOOLEAN DEFAULT TRUE,
  creado_en   TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para filtros frecuentes
CREATE INDEX IF NOT EXISTS idx_perfiles_barrio ON public.perfiles(barrio);
CREATE INDEX IF NOT EXISTS idx_perfiles_rol    ON public.perfiles(rol);
CREATE INDEX IF NOT EXISTS idx_perfiles_edad   ON public.perfiles(edad);

-- Trigger para actualizar automáticamente actualizado_en
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_perfiles_updated
  BEFORE UPDATE ON public.perfiles
  FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();

-- =============================================
-- ROW LEVEL SECURITY (RLS) — MUY IMPORTANTE
-- Sin esto cualquiera puede leer/borrar datos
-- =============================================

ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede ver perfiles activos (para el feed)
CREATE POLICY "perfiles_ver_activos"
  ON public.perfiles FOR SELECT
  USING (activo = TRUE);

-- Solo el propio usuario puede editar su perfil
CREATE POLICY "perfiles_editar_propio"
  ON public.perfiles FOR UPDATE
  USING (auth.uid() = id);

-- Solo el propio usuario puede insertar su perfil
CREATE POLICY "perfiles_insertar_propio"
  ON public.perfiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Solo admins pueden borrar perfiles (por ahora nadie puede)
-- CREATE POLICY "perfiles_borrar_admin" ...
-- Lo agregaremos cuando construyamos el panel admin en semana 9
