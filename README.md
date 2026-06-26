# Álbum Gestante — Karine & Alan

Álbum digital privado para o ensaio gestante de Karine & Alan.

## Stack

- **Frontend:** Next.js 14 + Tailwind CSS + Framer Motion
- **Backend:** Supabase (PostgreSQL + Storage)
- **Deploy:** Vercel (frontend) + Supabase (backend)

## Acesso

| Acesso | URL |
|--------|-----|
| **Álbum (público)** | https://album-gestante.vercel.app |
| **Admin** | https://album-gestante.vercel.app/admin |

| Acesso | Senha |
|--------|-------|
| Álbum (público) | `karinegestante2026` |
| Admin (`/admin`) | `karine2026` |

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
- `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

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
   - `ALBUM_PASSWORD`
   - `ADMIN_PASSWORD`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Deploy automático ativado

## Funcionalidades

- **Tela de senha** para acesso ao álbum
- **Hero** com a primeira foto da galeria
- **Highlights**: slideshow automático das primeiras fotos
- **Galeria completa** com lazy loading e infinite scroll
- **Modal de foto** com swipe, download e navegação por teclado
- **Player de música** (YouTube) configurável via admin
- **Admin panel** para upload, edição, exclusão e reordenação de fotos
- **Configurações** editáveis (hero, welcome, footer, música)

## Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon do Supabase |
| `ALBUM_PASSWORD` | Senha do álbum público |
| `ADMIN_PASSWORD` | Senha do painel admin |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-side) |
