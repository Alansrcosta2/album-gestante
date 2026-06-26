# Álbum Gestante — Karine & Alan

## Estado atual do projeto (26/06/2026)

### Stack
- **Framework**: Next.js 14 + React + TypeScript
- **Estilização**: Tailwind CSS + Framer Motion
- **Backend**: Supabase (PostgreSQL + Storage)
- **Deploy**: Vercel (projeto deletado, refazer amanhã via dashboard)
- **Fontes**: Playfair Display (títulos), Lato (conteúdo)
- **Paleta**: `#FFF8F5` (fundo), `#F5E6D3` (bege), `#D4A574` (dourado), `#C68E8E` (rosa), `#3D2B1F` (texto)

### Estrutura
```
album-gestante/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── PasswordGate.tsx
│   │   ├── HeroSection.tsx
│   │   ├── WelcomeMessage.tsx
│   │   ├── Highlights.tsx
│   │   ├── Gallery.tsx
│   │   ├── PhotoModal.tsx
│   │   └── Footer.tsx
│   └── lib/
│       ├── supabase.ts
│       └── utils.ts
├── scripts/
│   ├── upload_fotos.py
│   └── requirements.txt
├── supabase/
│   └── schema.sql
├── .env.local
├── HANDOFF.md
└── ...
```

### Status

| Etapa | Status |
|-------|--------|
| Fotos processadas (sem marca d'água) | ✅ 217 fotos |
| Upload para Supabase Storage | ✅ 217 fotos |
| Registro no banco (tabela `fotos`) | ✅ 217 registros |
| Schema SQL + permissões | ✅ Atualizado |
| Git init + GitHub privado | ✅ `Alansrcosta2/album-gestante` |
| Build (`npm run build`) | ❌ Erro SWC no Windows (build OK na Vercel Linux) |
| Deploy Vercel | ⏳ Refazer amanhã (projeto deletado) |

### Configurações
- **Senha do álbum**: `karinegestante2026`
- **Supabase Project**: `hofulrzzndybzoliyvmx.supabase.co`
- **Bucket**: `fotos_gestante` (privado, signed URLs)
- **GitHub**: `https://github.com/Alansrcosta2/album-gestante`

### Próximos passos (amanhã)
1. Acessar https://vercel.com/new
2. Importar `Alansrcosta2/album-gestante`
3. Adicionar env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_ALBUM_PASSWORD`
4. Em **Settings → Deployment Protection → Disabled** (senão fica bloqueado)
5. Deploy
6. Testar online com senha `karinegestante2026`
