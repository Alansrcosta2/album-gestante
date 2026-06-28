import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const cookieStore = await cookies()
  if (cookieStore.get('album_session')?.value !== 'authenticated') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()

  const { data: fotos, error } = await supabase
    .from('fotos')
    .select('id, titulo, ordem, storage_path')
    .order('ordem', { ascending: true })

  if (error || !fotos) {
    return NextResponse.json({ error: error?.message || 'Erro ao carregar fotos' }, { status: 500 })
  }

  const paths = fotos.map((f) => f.storage_path)

  const [batchResult, thumbResults] = await Promise.all([
    supabase.storage.from('fotos_gestante').createSignedUrls(paths, 3600),
    Promise.all(
      fotos.map((f) =>
        supabase.storage
          .from('fotos_gestante')
          .createSignedUrl(f.storage_path, 3600, {
            transform: { width: 400, height: 533, resize: 'cover', format: 'webp' as any, quality: 80 },
          })
          .then((r) => ({ path: f.storage_path, data: r.data }))
      )
    ),
  ])

  const urlMap = new Map<string, string>()
  if (batchResult.data) {
    for (const item of batchResult.data) {
      if (item.signedUrl && item.path) urlMap.set(item.path, item.signedUrl)
    }
  }

  const thumbMap = new Map<string, string>()
  for (const r of thumbResults) {
    if (r.data?.signedUrl) thumbMap.set(r.path, r.data.signedUrl)
  }

  const fotosComUrl = fotos.map((f) => ({
    path: f.storage_path,
    url: urlMap.get(f.storage_path) || '',
    thumb: thumbMap.get(f.storage_path) || '',
  }))

  return NextResponse.json({ fotos: fotosComUrl })
}
