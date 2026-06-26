import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getFotos() {
  const { data, error } = await supabase
    .from('fotos')
    .select('id, titulo, ordem')
    .order('ordem', { ascending: true })

  if (error) throw error
  return data
}

export async function getSignedUrl(path: string) {
  const { data, error } = await supabase.storage
    .from('fotos_gestante')
    .createSignedUrl(path, 3600)

  if (error) throw error
  return data.signedUrl
}

export async function getSignedUrls(paths: string[]) {
  const urls = await Promise.all(
    paths.map(async (path) => {
      try {
        const url = await getSignedUrl(path)
        return { path, url }
      } catch {
        return { path, url: '' }
      }
    })
  )
  return urls
}
