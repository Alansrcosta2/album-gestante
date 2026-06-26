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

  const fotosComUrl = await Promise.all(
    fotos.map(async (f) => {
      const { data: urlData } = await supabase.storage
        .from('fotos_gestante')
        .createSignedUrl(f.storage_path, 3600)
      return { path: f.storage_path, url: urlData?.signedUrl || '' }
    })
  )

  return NextResponse.json({ fotos: fotosComUrl })
}
