const https = require('https')

const SUPABASE_URL = 'https://hofulrzzndybzoliyvmx.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvZnVscnp6bmR5YnpvbGl5dm14Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjQyNTI4NCwiZXhwIjoyMDk4MDAxMjg0fQ.xDBJv90CFiAjVVJJCzY1uAC8lJl8DZu34HEekN5gMSs'

const queries = [
  'GRANT SELECT ON public.fotos TO anon;',
  'GRANT USAGE ON SCHEMA public TO anon;',
  `CREATE POLICY IF NOT EXISTS "Fotos visíveis para todos com chave anon" ON public.fotos
    FOR SELECT USING (true);`,
  'ALTER TABLE public.fotos ENABLE ROW LEVEL SECURITY;',
]

async function runSql(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql })
    const url = new URL('/rest/v1/rpc/', SUPABASE_URL)
    const req = https.request(
      {
        hostname: url.hostname,
        path: '/rest/v1/rpc/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
        },
      },
      (res) => {
        let body = ''
        res.on('data', (chunk) => (body += chunk))
        res.on('end', () => resolve({ status: res.statusCode, body }))
      }
    )
    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

async function runViaSqlEditor(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql })
    const url = new URL(SUPABASE_URL)
    const req = https.request(
      {
        hostname: url.hostname,
        path: '/auth/v1/query',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
        },
      },
      (res) => {
        let body = ''
        res.on('data', (chunk) => (body += chunk))
        res.on('end', () => resolve({ status: res.statusCode, body }))
      }
    )
    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

;(async () => {
  // Try direct SQL via Supabase Management API
  const mgmtData = JSON.stringify({
    sql: queries.join('\n'),
  })
  const req = https.request(
    {
      hostname: 'api.supabase.com',
      path: `/v1/projects/hofulrzzndybzoliyvmx/sql`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(mgmtData),
        'Authorization': `Bearer ${SERVICE_KEY}`,
      },
    },
    (res) => {
      let body = ''
      res.on('data', (chunk) => (body += chunk))
      res.on('end', () => {
        console.log('Status:', res.statusCode)
        console.log('Body:', body.substring(0, 500))
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('\n✅ Permissões corrigidas! Teste novamente o site.')
        } else {
          console.log('\n❌ Erro ao executar SQL. Vá no Supabase Dashboard e rode:')
          console.log('   GRANT SELECT ON public.fotos TO anon;')
          console.log('   GRANT USAGE ON SCHEMA public TO anon;')
        }
      })
    }
  )
  req.on('error', (e) => console.error('Error:', e.message))
  req.write(mgmtData)
  req.end()
})()
