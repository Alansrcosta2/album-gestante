# Álbum Gestante — Karine & Alan

Álbum digital privado para o ensaio gestante de Karine & Alan.

## Stack

- **Frontend:** Next.js 14 + Tailwind CSS + Framer Motion
- **Backend:** Supabase (PostgreSQL + Storage)
- **Deploy:** Vercel (frontend) + Supabase (backend)

## Configuração Supabase

### 1. Criar projeto em [supabase.com](https://supabase.com)

### 2. Executar schema SQL

Abra o SQL Editor do Supabase e cole o conteúdo de `supabase/schema.sql`.

### 3. Criar bucket privado

No SQL Editor, execute:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('fotos_gestante', 'fotos_gestante', false);
```

### 4. Obter credenciais

No dashboard do Supabase, vá em **Settings > API** e copie:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` → `SUPABASE_SERVICE_KEY` (para o script de upload)

## Upload das Fotos

```bash
cd scripts
pip install -r requirements.txt

# Configure o .env com SUPABASE_URL e SUPABASE_SERVICE_KEY
python upload_fotos.py
```

## Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.local.example .env.local
# Editar .env.local com suas credenciais do Supabase

# Rodar em desenvolvimento
npm run dev
```

## Deploy na Vercel

1. Conecte o repositório na [Vercel](https://vercel.com)
2. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_ALBUM_PASSWORD`
3. Deploy automático ativado

## Senha do Álbum

A senha padrão é `gestante2024`. Altere em `NEXT_PUBLIC_ALBUM_PASSWORD` no `.env.local`.
