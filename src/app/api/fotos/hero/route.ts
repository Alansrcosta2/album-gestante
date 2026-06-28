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
    .select('storage_path')
    .order('ordem', { ascending: true })
    .limit(1)

  if (error || !fotos || fotos.length === 0) {
    return NextResponse.json({ error: error?.message || 'Nenhuma foto' }, { status: 500 })
  }

  const { data: signedData } = await supabase.storage
    .from('fotos_gestante')
    .createSignedUrl(fotos[0].storage_path, 3600)

  return NextResponse.json({ url: signedData?.signedUrl || '' })
}
