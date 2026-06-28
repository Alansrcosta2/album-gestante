import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

async function checkAuth() {
  const cookieStore = await cookies()
  return cookieStore.get('admin_session')?.value === 'authenticated'
}

export async function POST(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 })
  }

  if (!file.name.endsWith('.mp3') && !file.type.startsWith('audio/')) {
    return NextResponse.json({ error: 'Apenas arquivos de áudio são aceitos' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = file.name.split('.').pop() || 'mp3'
  const timestamp = Date.now()
  const storagePath = `musicas/${timestamp}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const { error: uploadError } = await getSupabaseAdmin().storage
    .from('fotos_gestante')
    .upload(storagePath, buffer, { contentType: file.type || 'audio/mpeg' })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: signedUrlData } = await getSupabaseAdmin().storage
    .from('fotos_gestante')
    .createSignedUrl(storagePath, 604800)

  return NextResponse.json({
    url: signedUrlData?.signedUrl || '',
    storagePath,
    name: file.name,
  })
}
