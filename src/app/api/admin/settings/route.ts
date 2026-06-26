import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

async function checkAuth() {
  const cookieStore = await cookies()
  return cookieStore.get('admin_session')?.value === 'authenticated'
}

export async function GET() {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.from('settings').select('key, value')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const settings: Record<string, string> = {}
  for (const row of data || []) settings[row.key] = row.value

  return NextResponse.json({ settings })
}

export async function PUT(request: NextRequest) {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { key, value } = await request.json()

  if (!key) return NextResponse.json({ error: 'Key é obrigatória' }, { status: 400 })

  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('settings').upsert({ key, value })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
