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
  const { data: signedData } = await supabase.storage
    .from('fotos_gestante')
    .createSignedUrls(paths, 3600)

  const urlMap = new Map<string, string>()
  if (signedData) {
    for (const item of signedData) {
      if (item.signedUrl) urlMap.set(item.path, item.signedUrl)
    }
  }

  const fotosComUrl = fotos.map((f) => ({
    path: f.storage_path,
    url: urlMap.get(f.storage_path) || '',
  }))

  return NextResponse.json({ fotos: fotosComUrl })
}
