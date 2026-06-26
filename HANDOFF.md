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
│   │   ├── page.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── route.ts          # Login do álbum (senha do álbum)
│   │   │   │   └── check/route.ts    # Checa sessão ao recarregar
│   │   │   ├── admin/
│   │   │   │   ├── auth/route.ts     # Login admin (senha admin)
│   │   │   │   ├── fotos/route.ts    # CRUD fotos (upload/compress/delete/reorder)
│   │   │   │   └── settings/route.ts # CRUD settings (protegido por admin)
│   │   │   ├── fotos/route.ts        # Lista fotos + signed URLs (protegido por álbum)
│   │   │   └── settings/route.ts     # Lê settings públicos (protegido por sessão álbum)
│   │   ├── admin/page.tsx            # Painel admin completo
│   ├── components/
│   │   ├── BackgroundMusic.tsx       # Player YouTube (configurável via admin)
│   │   ├── PasswordGate.tsx          # Tela de senha do álbum
│   │   ├── HeroSection.tsx           # Hero com foto, título, subtítulo, label
│   │   ├── WelcomeMessage.tsx        # Mensagem de boas-vindas
│   │   ├── Highlights.tsx            # Slideshow de destaques (object-contain)
│   │   ├── Gallery.tsx               # Grid responsivo (object-contain)
│   │   ├── PhotoModal.tsx            # Modal com swipe, download, navegação
│   │   └── Footer.tsx                # Footer com título/subtítulo configuráveis
│   └── lib/
│       ├── compress-image.ts         # Compressão client-side (2000px, JPEG 85%)
│       ├── supabase-admin.ts         # Cliente Supabase com service_role
│       └── supabase.ts               # Cliente Supabase (anon key)
├── scripts/
│   ├── upload_fotos.py
│   └── requirements.txt
├── supabase/
│   └── schema.sql
├── .env.local
├── .env.local.example
├── .env.vercel
├── HANDOFF.md
└── ...
```

### Status

| Etapa | Status |
|-------|--------|
| Fotos processadas (sem marca d'água) | ✅ 217 fotos |
| Upload para Supabase Storage | ✅ 217 fotos |
| Registro no banco (tabela `fotos`) | ✅ 217 registros |
| Schema SQL + permissões | ✅ Atualizado (`GRANT SELECT ON fotos TO anon`) |
| Git init + GitHub | ✅ `Alansrcosta2/album-gestante` (público) |
| Build local (`npm run build`) | ✅ Funcionando |
| Deploy Vercel | ✅ **Em produção** |
| Segurança (senha server-side, cookies HTTP-only) | ✅ Implementado |
| Admin panel completo | ✅ Funcionando |
| Controle total de conteúdo via admin | ✅ Implementado |
| Sessão persiste ao recarregar | ✅ Implementado |
| Otimizações mobile (swipe, touch-action, object-contain) | ✅ Implementado |
| Player de música (YouTube) | ✅ Componente pronto, URL configurável via admin |

### Configurações

| Item | Valor |
|------|-------|
| **Senha do álbum** | `karinegestante2026` |
| **Senha do admin** | `karine2026` |
| **Supabase Project** | `hofulrzzndybzoliyvmx.supabase.co` |
| **Bucket** | `fotos_gestante` (privado, signed URLs 1h) |
| **GitHub** | `https://github.com/Alansrcosta2/album-gestante` (público) |
| **Vercel Production URL** | `https://album-gestante.vercel.app` |
| **Tabela `settings`** | Chaves: `hero_label`, `hero_title`, `hero_subtitle`, `welcome_message`, `footer_title`, `footer_subtitle` |
| **Música** | Player YouTube pronto — coloque a URL no admin |

### Próximos passos (somente configuração final)

1. **Vercel → Settings → Deployment Protection → Disabled** (senão pede login da Vercel)
2. No **Admin (`/admin`)** com senha `karine2026`:
   - Adicionar URL do YouTube da música (campo "Música de fundo")
   - Ajustar textos (Hero, Welcome, Footer) se quiser
   - Reordenar fotos se quiser mudar a foto do Hero (a de `ordem=1`)
3. Testar no celular e desktop

### Credenciais de acesso

| Acesso | Senha |
|--------|-------|
| Álbum (público) | `karinegestante2026` |
| Admin (`/admin`) | `karine2026` |

### Variáveis de ambiente (já configuradas na Vercel)

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon do Supabase |
| `ALBUM_PASSWORD` | `karinegestante2026` |
| `ADMIN_PASSWORD` | `karine2026` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (para admin upload/delete/signed URLs) |

### Observações importantes

- **Repo público** no GitHub (necessário para deploy grátis na Vercel Hobby com repo privado)
- **Bucket privado** no Supabase — acesso só via signed URLs (expiram em 1h)
- **Service Role Key** usada apenas no server-side (API routes admin + `/api/fotos`)
- **Sessão do álbum**: cookie HTTP-only `album_session` (24h), válido no `/api/auth/check`
- **Admin**: cookie HTTP-only `admin_session` (24h), separado da sessão do álbum
- **Foto do Hero** = primeira foto da galeria (`ordem=1`). Mude a ordem no admin pra trocar.
- **Música**: o componente `BackgroundMusic` aceita URL do YouTube. Insira a URL no admin e salve.