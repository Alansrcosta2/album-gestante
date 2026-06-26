import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const authenticated = cookieStore.get('album_session')?.value === 'authenticated'
  return NextResponse.json({ authenticated })
}
