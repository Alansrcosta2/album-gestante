import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-admin'

async function checkAuth() {
  const cookieStore = await cookies()
  return cookieStore.get('admin_session')?.value === 'authenticated'
}

export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('fotos')
    .select('id, titulo, ordem, storage_path, created_at')
    .order('ordem', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const fotosComUrl = await Promise.all(
    (data || []).map(async (f) => {
      const { data: urlData } = await supabaseAdmin.storage
        .from('fotos_gestante')
        .createSignedUrl(f.storage_path, 3600)
      return { ...f, signedUrl: urlData?.signedUrl || '' }
    })
  )

  return NextResponse.json({ fotos: fotosComUrl })
}

export async function POST(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File
  const titulo = (formData.get('titulo') as string) || ''

  if (!file) {
    return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = file.name.split('.').pop() || 'jpg'
  const timestamp = Date.now()
  const storagePath = `uploads/${timestamp}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const { error: uploadError } = await supabaseAdmin.storage
    .from('fotos_gestante')
    .upload(storagePath, buffer, { contentType: file.type })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: maxOrdem } = await supabaseAdmin
    .from('fotos')
    .select('ordem')
    .order('ordem', { ascending: false })
    .limit(1)
    .single()

  const { data: newFoto, error: dbError } = await supabaseAdmin
    .from('fotos')
    .insert({ titulo, storage_path: storagePath, ordem: (maxOrdem?.ordem ?? -1) + 1 })
    .select()
    .single()

  if (dbError) {
    await supabaseAdmin.storage.from('fotos_gestante').remove([storagePath])
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ foto: newFoto })
}

export async function PUT(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id, titulo, ordem } = await request.json()

  if (!id) {
    return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (titulo !== undefined) updates.titulo = titulo
  if (ordem !== undefined) updates.ordem = ordem

  const { error } = await supabaseAdmin
    .from('fotos')
    .update(updates)
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id, storage_path } = await request.json()

  if (!id || !storage_path) {
    return NextResponse.json({ error: 'ID e storage_path são obrigatórios' }, { status: 400 })
  }

  const { error: storageError } = await supabaseAdmin.storage
    .from('fotos_gestante')
    .remove([storage_path])

  if (storageError) {
    return NextResponse.json({ error: storageError.message }, { status: 500 })
  }

  const { error: dbError } = await supabaseAdmin
    .from('fotos')
    .delete()
    .eq('id', id)

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
