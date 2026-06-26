const https = require('https')

const BASE = 'album-gestante.vercel.app'

function request(method, path, body, cookie) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: BASE,
      path,
      method,
      headers: { 'Content-Type': 'application/json' },
    }
    if (body) opts.headers['Content-Length'] = Buffer.byteLength(body)
    if (cookie) opts.headers['Cookie'] = cookie

    const req = https.request(opts, (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: data,
          cookie: res.headers['set-cookie']?.join('; ') || '',
        })
      })
    })
    req.on('error', reject)
    if (body) req.write(body)
    req.end()
  })
}

;(async () => {
  console.log('1. Testando /api/auth...')
  const auth = await request('POST', '/api/auth', JSON.stringify({ password: 'karinegestante2026' }))
  console.log('   Status:', auth.status)
  console.log('   Body:', auth.body)
  console.log('   Cookie:', auth.cookie.substring(0, 100))

  if (auth.status !== 200) {
    console.log('\nERRO: Autenticação falhou!')
    return
  }

  const sessionCookie = auth.cookie.split(';')[0]
  console.log('\n2. Testando /api/fotos...')
  const fotos = await request('GET', '/api/fotos', null, sessionCookie)
  console.log('   Status:', fotos.status)
  console.log('   Body:', fotos.body.substring(0, 300))

  if (fotos.status === 200) {
    const parsed = JSON.parse(fotos.body)
    if (parsed.fotos) {
      console.log(`\n   ${parsed.fotos.length} fotos encontradas!`)
    }
  }
})()
