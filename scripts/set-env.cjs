const https = require('https')
const fs = require('fs')
const path = require('path')

const authPath = path.join(process.env.APPDATA, 'com.vercel.cli', 'Data', 'auth.json')
const token = JSON.parse(fs.readFileSync(authPath, 'utf8')).token

const projectId = 'prj_ucsOS3jAhxmNXg7DmHIjRwGoogq8'
const teamId = 'team_Tra07OZAHRvag7zUWl6DATUc'

const envVar = {
  key: 'ALBUM_PASSWORD',
  value: 'karinegestante2026',
  target: ['production'],
  type: 'encrypted',
}

const data = JSON.stringify(envVar)
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
  res.on('end', () => {
    console.log('Status:', res.statusCode)
    console.log('Response:', body.substring(0, 300))
  })
})
req.on('error', (e) => console.error('Error:', e.message))
req.write(data)
req.end()
