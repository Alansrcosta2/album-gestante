-- ============================================
-- ÁLBUM GESTANTE - KARINE & ALAN
-- Supabase Schema
-- ============================================

-- 1. TABELA DE FOTOS
CREATE TABLE IF NOT EXISTS fotos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  titulo TEXT NOT NULL DEFAULT '',
  storage_path TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index para ordenação
CREATE INDEX IF NOT EXISTS idx_fotos_ordem ON fotos (ordem);

-- 2. TABELA DE SETTINGS
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

-- Permissões para anon (leitura das settings públicas)
GRANT SELECT ON settings TO anon;

-- Permissões para service_role (admin pode editar)
GRANT ALL PRIVILEGES ON settings TO service_role;

-- 3. ROW LEVEL SECURITY
ALTER TABLE fotos ENABLE ROW LEVEL SECURITY;

-- Permitir leitura para usuários anônimos autenticados via anon key
-- (a segurança real está no bucket privado + signed URLs)
CREATE POLICY "Fotos visíveis para todos com chave anon" ON fotos
  FOR SELECT
  USING (true);

-- 3. BUCKET PRIVADO
-- Execute no SQL Editor do Supabase:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('fotos_gestante', 'fotos_gestante', false);

-- 4. PERMISSÕES PARA SERVICE_ROLE (necessário para upload via service key)
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 5. UNIQUE CONSTRAINT para upsert
ALTER TABLE fotos ADD CONSTRAINT fotos_storage_path_key UNIQUE (storage_path);

-- 6. POLÍTICAS DO BUCKET
-- Acesso negado por padrão (bucket privado)
-- Apenas signed URLs funcionam

CREATE POLICY "Usuários autenticados podem fazer upload" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'fotos_gestante');

CREATE POLICY "Usuários autenticados podem atualizar" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'fotos_gestante');

CREATE POLICY "Usuários autenticados podem deletar" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'fotos_gestante');

-- Nota: SELECT não tem policy porque o bucket é privado
-- o acesso é feito exclusivamente via signed URLs
