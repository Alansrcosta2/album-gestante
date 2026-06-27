# Álbum Gestante — Karine & Alan

## Estado atual do projeto (28/06/2026 — em produção)

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
│   │   ├── page.tsx                      # Página pública do álbum (transição "Mamãe do Vítor")
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
│   │   │   ├── BackgroundMusic.tsx       # Player YouTube com iframe + postMessage (só carrega no 1º clique)
│   │   │   ├── PasswordGate.tsx          # Tela de senha do álbum (com botão logout)
│   │   │   ├── HeroSection.tsx           # Hero com foto + botão "Entrar na Galeria"
│   │   │   ├── WelcomeMessage.tsx        # Mensagem de boas-vindas
│   │   │   ├── Highlights.tsx            # Slideshow de destaques
│   │   │   ├── Gallery.tsx               # Grid responsivo + infinite scroll
│   │   │   ├── PhotoModal.tsx            # Modal com swipe, download, zoom (PC: scroll/clique)
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
| Player de música (YouTube) com playlist | ✅ iframe + postMessage, só carrega no 1º clique |
| Botão "Tornar Hero" no admin | ✅ Implementado |
| Logout em ambas as telas | ✅ Implementado |
| Admin responsivo (mobile otimizado) | ✅ Implementado |
| Filtro de valores vazios nas settings | ✅ Valores vazios não sobrescrevem padrões |
| Corrigido áudio no iPhone (Safari/Chrome) | ✅ postMessage unMute + iframe com enablejsapi |
| Ícone do speaker corrigido | ✅ VolumeX mudo / Volume2 tocando |
| Botão "Entrar na Galeria" no Hero | ✅ Scroll suave + ativa música |
| Voltar ao topo (↑) | ✅ Botão flutuante ao descer a página |
| Transição "Mamãe do Vítor" | ✅ Fade creme com texto pulsando (2.5s) |
| Galeria uniforme (PC e mobile) | ✅ PhotoModal nos dois, sem zoom overlay separado |
| Zoom no PhotoModal (PC) | ✅ Clique cicla 1x→2x→3x→1x, scroll do mouse |
| API de fotos otimizada | ✅ createSignedUrls em lote (em vez de 1 por foto) |

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

### ✅ Projeto finalizado

- **Deployment Protection**: Desabilitado na Vercel
- **Músicas**: Configuradas via admin
- **Textos**: Ajustados (Hero, Welcome, Footer)
- **Foto do Hero**: Definida via admin
- **Galeria**: PhotoModal uniforme (PC e mobile) com zoom no PC
- **Áudio iPhone**: Corrigido (iframe + postMessage + enablejsapi)
- **Transição**: "Mamãe do Vítor" pulsando ao entrar na galeria

### Funcionalidades do Admin

- **Upload de fotos**: clique ou arraste, compressão automática (JPEG 2000px, 85%)
- **Edição inline**: título e ordem diretamente na lista
- **Tornar Hero**: ícone de estrela (⭐) nos cards das fotos — clica para definir como foto principal do Hero
- **Exclusão**: botão de lixeira com confirmação
- **Configurações**: todos os textos editáveis + música de fundo com gerenciamento profissional (adicionar/remover URLs individualmente)
- **Gerenciamento de músicas**: lista visual com botão + para adicionar, X para remover, e setas ▲/▼ para reordenar
- **Logout**: botão no header (desktop) ou X (mobile)

### Funcionalidades do Álbum

- **Tela de senha** com botão de logout (X no canto superior direito)
- **Hero** com a primeira foto da galeria (ordem=1) — clique na ⭐ no admin para alterar
- **Highlights**: slideshow automático das primeiras 18 fotos
- **Galeria completa**: grid responsivo com lazy loading e infinite scroll (24 por página)
- **Zoom na galeria**: 
  - **PC**: passe o mouse sobre a foto e rode o scroll do mouse para dar zoom
  - **Mobile**: pinch-to-zoom (pinça com dois dedos)
  - Clique em X para sair do zoom
- **Modal de foto**: swipe, download, navegação por teclado (← → Esc)
- **Player de música**: 
  - Toca automaticamente ao abrir o álbum (mudo)
  - Clique em qualquer lugar da tela ativa o som
  - Botões play/pause, skip anterior/próximo, contador de faixa
- **Footer** configurável

### Comportamento da Música

1. **Ao abrir o álbum**: iframe do YouTube fica vazio (só carrega no primeiro clique)
2. **No primeiro clique** (botão "Entrar na Galeria" ou qualquer lugar): iframe carrega com `mute=1, autoplay=1`, envia `postMessage('seekTo',0)`, `postMessage('unMute')`, `postMessage('playVideo')`
3. **A partir daí**, player funciona normalmente (play/pause/skip)
4. **No iPhone**: o clique do usuário permite ativar o áudio via postMessage

> **Nota**: No iPhone, o áudio só ativa com interação do usuário. O `postMessage('unMute')` dentro do evento de clique resolve isso.

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
- **API de fotos** usa `createSignedUrls` (lote) em vez de chamadas individuais
- **Service Role Key** usada apenas no server-side (API routes admin + `/api/fotos`)
- **Sessão do álbum**: cookie HTTP-only `album_session` (24h)
- **Admin**: cookie HTTP-only `admin_session` (24h), separado da sessão do álbum
- **Foto do Hero**: clique na ⭐ no admin para definir qualquer foto como Hero instantaneamente
- **Música**: iframe só carrega no primeiro clique. Usa `postMessage` para controle (unMute, seekTo, playVideo, pauseVideo). Requer `enablejsapi=1` no embed.
- **Galeria**: PhotoModal funciona igual no PC e mobile. No PC, clique na foto cicla zoom (1x→2x→3x→1x) e scroll do mouse também funciona. Duplo clique reseta.
- **Transição "Entrar na Galeria"**: overlay creme com "Mamãe do Vítor" pulsando (2.5s), ativa a música e faz scroll suave até a galeria.
- **Voltar ao topo**: botão (↑) aparece no canto inferior direito ao descer a página.
- **Logout**: disponível tanto no álbum (X no canto superior direito) quanto no admin (botão LogOut no header).
- **Valores vazios**: campos de settings vazios não sobrescrevem os textos padrão.
