const https = require('https')
const fs = require('fs')
const path = require('path')

const authPath = path.join(process.env.APPDATA, 'com.vercel.cli', 'Data', 'auth.json')
const token = JSON.parse(fs.readFileSync(authPath, 'utf8')).token
const projectId = 'prj_ucsOS3jAhxmNXg7DmHIjRwGoogq8'
const teamId = 'team_Tra07OZAHRvag7zUWl6DATUc'

const vars = [
  { key: 'NEXT_PUBLIC_SUPABASE_URL', value: 'https://hofulrzzndybzoliyvmx.supabase.co' },
  { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvZnVscnp6bmR5YnpvbGl5dm14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MjUyODQsImV4cCI6MjA5ODAwMTI4NH0.R9CrYsEO_7iQ3fTgCE7ohRirJps4bZh_fs0uccFS-AQ' },
  { key: 'ALBUM_PASSWORD', value: 'karinegestante2026' },
  { key: 'ADMIN_PASSWORD', value: 'karine2026' },
  { key: 'SUPABASE_SERVICE_ROLE_KEY', value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvZnVscnp6bmR5YnpvbGl5dm14Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjQyNTI4NCwiZXhwIjoyMDk4MDAxMjg0fQ.xDBJv90CFiAjVVJJCzY1uAC8lJl8DZu34HEekN5gMSs' },
]

async function setEnv(envVar) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      key: envVar.key,
      value: envVar.value,
      target: ['production'],
      type: 'encrypted',
    })
    const url = new URL(`/v11/projects/${projectId}/env?teamId=${teamId}`, 'https://api.vercel.com')
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'Authorization': `Bearer ${token}`,
      },
    }, (res) => {
      let body = ''
      res.on('data', chunk => body += chunk)
      res.on('end', () => resolve({ status: res.statusCode, body: body.substring(0, 100) }))
    })
    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

;(async () => {
  for (const v of vars) {
    console.log(`Setting ${v.key}...`)
    const result = await setEnv(v)
    console.log(`  Status: ${result.status}`)
  }
  console.log('Done!')
})()
