# Álbum Gestante — Karine & Alan

## Estado atual do projeto (28/06/2026 — ✅ 100% finalizado)

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
│   │   ├── page.tsx                      # Página pública do álbum (carregamento em 2 fases: hero primeiro, galeria depois)
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
│   │   │   │   ├── musicas/route.ts      # Upload MP3 para Supabase Storage
│   │   │   │   └── settings/route.ts     # CRUD settings (protegido por admin)
│   │   │   ├── fotos/
│   │   │   │   ├── route.ts              # Lista fotos + signed URLs WebP thumbs + JPEG full
│   │   │   │   └── hero/route.ts         # Apenas a primeira foto (hero) — carregamento rápido
│   │   │   └── settings/route.ts         # Lê settings públicos (protegido por sessão álbum)
│   │   ├── admin/page.tsx                # Painel admin completo
│   │   ├── components/
│   │   │   ├── BackgroundMusic.tsx       # Player de áudio nativo <audio> com MP3 do Supabase (playlist, auto-advance)
│   │   │   ├── PasswordGate.tsx          # Tela de senha do álbum (com botão logout)
│   │   │   ├── HeroSection.tsx           # Hero com foto + botão "Entrar na Galeria"
│   │   │   ├── WelcomeMessage.tsx        # Mensagem de boas-vindas
│   │   │   ├── Highlights.tsx            # Slideshow de destaques (qualidade cheia)
│   │   │   ├── Gallery.tsx               # Grid responsivo + infinite scroll (48 por página, thumbs WebP)
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
| Player de música nativo com MP3 | ✅ `<audio>` com playlist e auto-advance |
| Upload de MP3 via admin | ✅ Envia para Supabase Storage e gera signed URL |
| Botão "Tornar Hero" no admin | ✅ Implementado |
| Logout em ambas as telas | ✅ Implementado |
| Admin responsivo (mobile otimizado) | ✅ Implementado |
| Filtro de valores vazios nas settings | ✅ Valores vazios não sobrescrevem padrões |
| Áudio funcionando 100% no iPhone | ✅ `<audio>` nativo — funciona no Safari e Chrome |
| Ícone do speaker corrigido | ✅ VolumeX mudo / Volume2 tocando |
| Botão "Entrar na Galeria" no Hero | ✅ Scroll suave + ativa música |
| Voltar ao topo (↑) | ✅ Botão flutuante ao descer a página |
| Transição "Mamãe do Vítor" | ❌ Removida |
| Galeria uniforme (PC e mobile) | ✅ Thumbs WebP 400px no grid, JPEG cheio no modal |
| Zoom no PhotoModal (PC) | ✅ Clique cicla 1x→2x→3x→1x, scroll do mouse |
| API de fotos otimizada | ✅ Hero carrega primeiro, thumbs WebP + batch signed URLs |
| Galeria com 48 fotos por página | ✅ Infinite scroll mais rápido |
| Carregamento em 2 fases | ✅ Hero + texto aparecem antes da galeria |

### Configurações

| Item | Valor |
|------|-------|
| **Senha do álbum** | `karinegestante2026` |
| **Senha do admin** | `karine2026` |
| **Supabase Project** | `hofulrzzndybzoliyvmx.supabase.co` |
| **Bucket** | `fotos_gestante` (privado, signed URLs 1h, pasta `musicas/` para MP3) |
| **GitHub** | `https://github.com/Alansrcosta2/album-gestante` (público) |
| **Vercel Production URL** | `https://album-gestante.vercel.app` |
| **Tabela `settings`** | Chaves: `hero_label`, `hero_title`, `hero_subtitle`, `welcome_message`, `footer_title`, `footer_subtitle`, `background_music_url` |

### Acessos

| Página | URL | Senha |
|--------|-----|-------|
| **Álbum (público)** | https://album-gestante.vercel.app | `karinegestante2026` |
| **Admin** | https://album-gestante.vercel.app/admin | `karine2026` |

### ✅ Projeto finalizado — 100%

- **Deployment Protection**: Desabilitado na Vercel
- **Músicas**: MP3 hospedados no Supabase Storage, gerenciados via admin
- **Textos**: Ajustados (Hero, Welcome, Footer)
- **Foto do Hero**: Definida via admin (⭐ no card da foto)
- **Galeria**: Thumbs WebP (400px) no grid, JPEG cheio no modal/zoom
- **Áudio iPhone**: ✅ **100% funcional** com `<audio>` nativo (sem YouTube)
- **Transição**: Removida — scroll direto para galeria
- **Carregamento**: Hero aparece imediatamente, galeria carrega em segundo plano

### Funcionalidades do Admin

- **Upload de fotos**: clique ou arraste, compressão automática (JPEG 2000px, 85%)
- **Upload de músicas**: botão "Adicionar MP3" — envia para Supabase Storage
- **Edição inline**: título e ordem diretamente na lista
- **Tornar Hero**: ícone de estrela (⭐) nos cards das fotos — clica para definir como foto principal do Hero
- **Exclusão de fotos**: botão de lixeira com confirmação
- **Configurações**: todos os textos editáveis
- **Gerenciamento de músicas**: lista visual com botão + para adicionar MP3, X para remover, e setas ▲/▼ para reordenar
- **Logout**: botão no header (desktop) ou X (mobile)

### Funcionalidades do Álbum

- **Tela de senha** com botão de logout (X no canto superior direito)
- **Hero** com a primeira foto (ordem=1) — clique na ⭐ no admin para alterar
- **Highlights**: slideshow automático das primeiras 18 fotos (qualidade cheia)
- **Galeria completa**: grid responsivo com lazy loading, thumbs WebP, infinite scroll (48 por página)
- **Zoom na galeria**: 
  - **PC**: passe o mouse sobre a foto e rode o scroll do mouse para dar zoom
  - **Mobile**: pinch-to-zoom (pinça com dois dedos)
  - Clique em X para sair do zoom
- **Modal de foto**: swipe, download, navegação por teclado (← → Esc)
- **Player de música**: 
  - Toca automaticamente ao abrir o álbum
  - Clique em "Entrar na Galeria" ativa o som
  - Botões play/pause, skip anterior/próximo, contador de faixa
  - Auto-advance para a próxima música
- **Footer** configurável

### Comportamento da Música (MP3 nativo)

1. **Ao abrir o álbum**: `<audio>` pré-carrega a primeira música
2. **No primeiro clique**: `audio.play()` inicia a reprodução
3. **A partir daí**: play/pause/skip funcionam normalmente
4. **Auto-advance**: evento `ended` do `<audio>` avança para a próxima
5. **No iPhone**: funciona 100% no Safari e Chrome (não depende de iframe YouTube)

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
- **API de fotos** retorna `url` (JPEG cheio) e `thumb` (WebP 400px) para cada foto
- **API de fotos/hero** retorna apenas a primeira foto (carregamento instantâneo do Hero)
- **Service Role Key** usada apenas no server-side
- **Sessão do álbum**: cookie HTTP-only `album_session` (24h)
- **Admin**: cookie HTTP-only `admin_session` (24h), separado da sessão do álbum
- **Foto do Hero**: clique na ⭐ no admin para definir qualquer foto como Hero instantaneamente
- **Música**: `<audio>` nativo com MP3 hospedados no Supabase Storage (pasta `musicas/`). Upload via admin.
- **Galeria**: 48 fotos por página, thumbs WebP (400px) para carregamento rápido
- **Carregamento em 2 fases**: Hero + texto aparecem primeiro, galeria carrega em segundo plano
- **Voltar ao topo**: botão (↑) aparece no canto inferior direito ao descer a página
- **Logout**: disponível tanto no álbum (X no canto superior direito) quanto no admin (botão LogOut no header)
- **Valores vazios**: campos de settings vazios não sobrescrevem os textos padrão
