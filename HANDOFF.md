# Álbum Gestante — Karine & Alan

## Estado atual do projeto (26/06/2026 — finalizado)

### Stack
- **Framework**: Next.js 14 + React + TypeScript
- **Estilização**: Tailwind CSS + Framer Motion
- **Backend**: Supabase (PostgreSQL + Storage)
- **Deploy**: Vercel (em produção em `https://album-gestante.vercel.app`)
- **Fontes**: Playfair Display (títulos), Lato (conteúdo)
- **Paleta**: `#FFF8F5` (fundo), `#F5E6D3` (bege), `#D4A574` (dourado), `#C68E8E` (rosa), `#3D2B1F` (texto)

### Estrutura
```
album-gestante/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx                      # Página pública do álbum
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── route.ts              # Login do álbum (senha do álbum)
│   │   │   │   ├── check/route.ts        # Checa sessão ao recarregar
│   │   │   │   └── logout/route.ts       # Logout do álbum
│   │   │   ├── admin/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── route.ts          # Login admin (senha admin)
│   │   │   │   │   └── logout/route.ts   # Logout do admin
│   │   │   │   ├── fotos/route.ts        # CRUD fotos (upload/compress/delete/reorder)
│   │   │   │   └── settings/route.ts     # CRUD settings (protegido por admin)
│   │   │   ├── fotos/route.ts            # Lista fotos + signed URLs (protegido por álbum)
│   │   │   └── settings/route.ts         # Lê settings públicos (protegido por sessão álbum)
│   │   ├── admin/page.tsx                # Painel admin completo
│   │   ├── components/
│   │   │   ├── BackgroundMusic.tsx       # Player YouTube com playlist (autoplay mudo + unlock no toque)
│   │   │   ├── PasswordGate.tsx          # Tela de senha do álbum (com botão logout)
│   │   │   ├── HeroSection.tsx           # Hero com foto, título, subtítulo, label
│   │   │   ├── WelcomeMessage.tsx        # Mensagem de boas-vindas
│   │   │   ├── Highlights.tsx            # Slideshow de destaques (object-contain)
│   │   │   ├── Gallery.tsx               # Grid responsivo (object-contain)
│   │   │   ├── PhotoModal.tsx            # Modal com swipe, download, navegação
│   │   │   └── Footer.tsx                # Footer com título/subtítulo configuráveis
│   │   └── lib/
│   │       ├── compress-image.ts         # Compressão client-side (2000px, JPEG 85%)
│   │       ├── supabase-admin.ts         # Cliente Supabase com service_role
│   │       └── supabase.ts               # Cliente Supabase (anon key)
│   ├── scripts/
│   │   ├── upload_fotos.py
│   │   └── requirements.txt
│   └── supabase/
│       └── schema.sql
```

### Status

| Etapa | Status |
|-------|--------|
| Fotos processadas (sem marca d'água) | ✅ 217 fotos |
| Upload para Supabase Storage | ✅ 217 fotos |
| Registro no banco (tabela `fotos`) | ✅ 217 registros |
| Schema SQL + permissões | ✅ Atualizado |
| Git init + GitHub | ✅ `Alansrcosta2/album-gestante` (público) |
| Build local (`npm run build`) | ✅ Funcionando |
| Deploy Vercel | ✅ **Em produção** |
| Segurança (senha server-side, cookies HTTP-only) | ✅ Implementado |
| Admin panel completo | ✅ Funcionando |
| Controle total de conteúdo via admin | ✅ Implementado |
| Sessão persiste ao recarregar | ✅ Implementado |
| Otimizações mobile (swipe, touch-action, object-contain) | ✅ Implementado |
| Player de música (YouTube) com playlist | ✅ Autoplay mudo + desbloqueio no primeiro toque |
| Botão "Tornar Hero" no admin | ✅ Implementado |
| Logout em ambas as telas | ✅ Implementado |
| Admin responsivo (mobile otimizado) | ✅ Implementado |
| Filtro de valores vazios nas settings | ✅ Valores vazios não sobrescrevem padrões |

### Configurações

| Item | Valor |
|------|-------|
| **Senha do álbum** | `karinegestante2026` |
| **Senha do admin** | `karine2026` |
| **Supabase Project** | `hofulrzzndybzoliyvmx.supabase.co` |
| **Bucket** | `fotos_gestante` (privado, signed URLs 1h) |
| **GitHub** | `https://github.com/Alansrcosta2/album-gestante` (público) |
| **Vercel Production URL** | `https://album-gestante.vercel.app` |
| **Tabela `settings`** | Chaves: `hero_label`, `hero_title`, `hero_subtitle`, `welcome_message`, `footer_title`, `footer_subtitle`, `background_music_url` |

### Acessos

| Página | URL | Senha |
|--------|-----|-------|
| **Álbum (público)** | https://album-gestante.vercel.app | `karinegestante2026` |
| **Admin** | https://album-gestante.vercel.app/admin | `karine2026` |

### Próximos passos (somente configuração final)

1. **Vercel → Settings → Deployment Protection → Disabled** (senão pede login da Vercel)
2. No **Admin (`/admin`)** com senha `karine2026`:
   - Adicionar URLs do YouTube das músicas no campo "Música de fundo" → botão **"Adicionar"** (uma por linha)
   - Ajustar textos (Hero, Welcome, Footer) se quiser
   - Alterar foto do Hero: clique no ícone **⭐** na foto desejada da lista
3. Testar no celular e desktop

### Funcionalidades do Admin

- **Upload de fotos**: clique ou arraste, compressão automática (JPEG 2000px, 85%)
- **Edição inline**: título e ordem diretamente na lista
- **Tornar Hero**: ícone de estrela (⭐) nos cards das fotos — clica para definir como foto principal do Hero
- **Exclusão**: botão de lixeira com confirmação
- **Configurações**: todos os textos editáveis + música de fundo com gerenciamento profissional (adicionar/remover URLs individualmente)
- **Gerenciamento de músicas**: lista visual com botão + para adicionar e X para remover cada URL
- **Logout**: botão no header (desktop) ou X (mobile)

### Funcionalidades do Álbum

- **Tela de senha** com botão de logout (X no canto superior direito)
- **Hero** com a primeira foto da galeria (ordem=1) — clique na ⭐ no admin para alterar
- **Highlights**: slideshow automático das primeiras 18 fotos
- **Galeria completa**: grid responsivo com lazy loading e infinite scroll (24 por página)
- **Modal de foto**: swipe, download, navegação por teclado (← → Esc)
- **Player de música**: 
  - Toca automaticamente ao abrir o álbum (mudo)
  - Mostra "Toque para ouvir" até o primeiro clique/toque
  - No primeiro toque: som é desbloqueado instantaneamente
  - Botões play/pause, skip anterior/próximo, contador de faixa
- **Footer** configurável

### Comportamento da Música

1. **Ao abrir o álbum**: música começa automaticamente (mudo)
2. **Aparece aviso "Toque para ouvir"** no canto inferior esquerdo
3. **No primeiro clique/toque** em qualquer lugar: som é ativado instantaneamente
4. A partir daí, player funciona normalmente (play/pause/skip)

> **Nota**: Navegadores bloqueiam autoplay com som por padrão. O site precisa de uma interação do usuário para ativar o áudio. O comportamento implementado (mudo → toque para ouvir) é a forma mais confiável de garantir que a música toque.

### Variáveis de ambiente (já configuradas na Vercel)

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon do Supabase |
| `ALBUM_PASSWORD` | `karinegestante2026` |
| `ADMIN_PASSWORD` | `karine2026` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (para admin upload/delete/signed URLs) |

### Observações importantes

- **Repo público** no GitHub (necessário para deploy grátis na Vercel Hobby)
- **Bucket privado** no Supabase — acesso só via signed URLs (expiram em 1h)
- **Service Role Key** usada apenas no server-side (API routes admin + `/api/fotos`)
- **Sessão do álbum**: cookie HTTP-only `album_session` (24h)
- **Admin**: cookie HTTP-only `admin_session` (24h), separado da sessão do álbum
- **Foto do Hero**: clique na ⭐ no admin para definir qualquer foto como Hero instantaneamente
- **Música**: player com playlist. Toca automaticamente mudo, desbloqueia som no primeiro toque.
- **Logout**: disponível tanto no álbum (X no canto superior direito) quanto no admin (botão LogOut no header).
- **Valores vazios**: campos de settings vazios não sobrescrevem os textos padrão.
