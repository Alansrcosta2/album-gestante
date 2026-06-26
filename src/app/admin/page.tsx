'use client'

import { useState, useEffect, useRef } from 'react'
import { compressImage } from '@/lib/compress-image'
import { Lock, Upload, Trash2, X, Image as ImageIcon, GripVertical, Settings } from 'lucide-react'

function Field({ label, value, onChange, onSave, textarea }: { label: string; value: string; onChange: (v: string) => void; onSave: (v: string) => void; textarea?: boolean }) {
  return (
    <div>
      <label className="block font-sans text-xs text-dark/50 uppercase tracking-wider mb-1">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} onBlur={(e) => onSave(e.target.value)} rows={4} className="w-full px-4 py-3 rounded-xl border border-beige bg-white text-dark font-sans text-sm outline-none focus:border-gold transition-colors resize-none" />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} onBlur={(e) => onSave(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-beige bg-white text-dark font-sans text-sm outline-none focus:border-gold transition-colors" />
      )}
    </div>
  )
}

interface Foto {
  id: number
  titulo: string
  ordem: number
  storage_path: string
  signedUrl: string
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fotos, setFotos] = useState<Foto[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [newTitulo, setNewTitulo] = useState('')
  const [settings, setSettings] = useState({
    hero_label: 'Ensaio Gestante',
    hero_title: 'Karine & Alan',
    hero_subtitle: 'À espera do nosso maior presente.',
    welcome_message: '',
    footer_title: 'Karine & Alan',
    footer_subtitle: 'Ensaio Gestante',
  })
  const [settingsSaved, setSettingsSaved] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!authed) return
    loadFotos()
    loadSettings()
  }, [authed])

  async function loadSettings() {
    const res = await fetch('/api/admin/settings')
    if (res.ok) {
      const data = await res.json()
      if (data.settings) {
        setSettings((prev) => ({ ...prev, ...data.settings }))
      }
    }
  }

  async function saveSetting(key: string, value: string) {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    })
    return res.ok
  }

  function updateSetting(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }))
    saveSetting(key, value).then((ok) => {
      if (ok) {
        setSettingsSaved(true)
        setTimeout(() => setSettingsSaved(false), 2000)
      }
    })
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      setAuthed(true)
    } else {
      setError('Senha incorreta')
      setPassword('')
    }
  }

  async function loadFotos() {
    setLoading(true)
    const res = await fetch('/api/admin/fotos')
    if (res.ok) {
      const data = await res.json()
      setFotos(data.fotos)
    }
    setLoading(false)
  }

  function handleFileSelect(file: File) {
    if (!file.type.startsWith('image/')) return
    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  async function handleUpload() {
    if (!selectedFile) return
    setUploading(true)

    const compressed = await compressImage(selectedFile, 2000, 0.85)
    const formData = new FormData()
    formData.append('file', compressed, selectedFile.name)
    formData.append('titulo', newTitulo)

    const res = await fetch('/api/admin/fotos', {
      method: 'POST',
      body: formData,
    })

    setUploading(false)

    if (res.ok) {
      setSelectedFile(null)
      setPreview('')
      setNewTitulo('')
      if (fileRef.current) fileRef.current.value = ''
      loadFotos()
    } else {
      const data = await res.json()
      alert('Erro: ' + (data.error || 'Falha ao enviar'))
    }
  }

  async function handleEdit(foto: Foto, campo: 'titulo' | 'ordem', valor: string | number) {
    const res = await fetch('/api/admin/fotos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: foto.id, [campo]: valor }),
    })

    if (res.ok) loadFotos()
  }

  async function handleDelete(foto: Foto) {
    if (!confirm(`Deletar "${foto.titulo || 'foto'}"?`)) return

    const res = await fetch('/api/admin/fotos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: foto.id, storage_path: foto.storage_path }),
    })

    if (res.ok) loadFotos()
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="w-full max-w-xs text-center">
          <Lock className="w-8 h-8 mx-auto mb-4 text-gold" />
          <h1 className="font-serif text-2xl text-dark mb-6">Admin</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha do álbum"
            autoFocus
            className="w-full px-4 py-3 rounded-xl border border-beige bg-white text-dark placeholder:text-dark/30 font-sans text-sm outline-none focus:border-gold transition-colors mb-3"
          />
          {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-gold to-rose text-white font-sans text-sm font-bold tracking-wider uppercase shadow-lg"
          >
            Entrar
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-beige">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-serif text-lg text-dark">Admin — Álbum Gestante</h1>
          <span className="font-sans text-xs text-dark/40">{fotos.length} fotos</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-10">
        <section className="bg-white rounded-2xl p-6 border border-beige">
          <h2 className="font-serif text-lg text-dark mb-4 flex items-center gap-2">
            <Upload className="w-4 h-4 text-gold" /> Upload de Foto
          </h2>

          <div
            ref={dropRef}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-beige rounded-xl p-8 text-center cursor-pointer hover:border-gold transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
            ) : (
              <div className="text-dark/40">
                <ImageIcon className="w-10 h-10 mx-auto mb-2" />
                <p className="font-sans text-sm">Clique ou arraste uma foto aqui</p>
                <p className="font-sans text-xs text-dark/20 mt-1">Será comprimida para JPEG 2000px</p>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
          </div>

          {selectedFile && (
            <div className="mt-4 space-y-3">
              <input
                type="text"
                value={newTitulo}
                onChange={(e) => setNewTitulo(e.target.value)}
                placeholder="Título da foto (opcional)"
                className="w-full px-4 py-2.5 rounded-xl border border-beige bg-white text-dark font-sans text-sm outline-none focus:border-gold transition-colors"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-gold to-rose text-white font-sans text-sm font-bold tracking-wider uppercase shadow-lg disabled:opacity-60"
                >
                  {uploading ? 'Enviando...' : 'Enviar'}
                </button>
                <button
                  onClick={() => { setSelectedFile(null); setPreview(''); setNewTitulo(''); if (fileRef.current) fileRef.current.value = '' }}
                  className="px-4 py-2.5 rounded-xl border border-beige text-dark/60 hover:text-dark font-sans text-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl p-6 border border-beige">
          <h2 className="font-serif text-lg text-dark mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4 text-gold" /> Conteúdo da Página
          </h2>

          <div className="space-y-4">
            <Field label="Rótulo do Hero" value={settings.hero_label} onChange={(v) => setSettings((p) => ({ ...p, hero_label: v }))} onSave={(v) => saveSetting('hero_label', v)} />
            <Field label="Título do Hero" value={settings.hero_title} onChange={(v) => setSettings((p) => ({ ...p, hero_title: v }))} onSave={(v) => saveSetting('hero_title', v)} />
            <Field label="Subtítulo do Hero" value={settings.hero_subtitle} onChange={(v) => setSettings((p) => ({ ...p, hero_subtitle: v }))} onSave={(v) => saveSetting('hero_subtitle', v)} />
            <Field label="Mensagem de Boas-Vindas" value={settings.welcome_message} onChange={(v) => setSettings((p) => ({ ...p, welcome_message: v }))} onSave={(v) => saveSetting('welcome_message', v)} textarea />
            <Field label="Título do Footer" value={settings.footer_title} onChange={(v) => setSettings((p) => ({ ...p, footer_title: v }))} onSave={(v) => saveSetting('footer_title', v)} />
            <Field label="Subtítulo do Footer" value={settings.footer_subtitle} onChange={(v) => setSettings((p) => ({ ...p, footer_subtitle: v }))} onSave={(v) => saveSetting('footer_subtitle', v)} />
          </div>

          {settingsSaved && <p className="font-sans text-xs text-green-600 mt-3">Salvo!</p>}
        </section>

        <section>
          <h2 className="font-serif text-lg text-dark mb-4">Fotos ({fotos.length})</h2>

          {loading ? (
            <p className="font-sans text-sm text-dark/40">Carregando...</p>
          ) : fotos.length === 0 ? (
            <p className="font-sans text-sm text-dark/40">Nenhuma foto ainda</p>
          ) : (
            <div className="space-y-3">
              {fotos.map((foto) => (
                <div
                  key={foto.id}
                  className="bg-white rounded-xl border border-beige p-3 flex items-center gap-4"
                >
                  <GripVertical className="w-4 h-4 text-dark/20 shrink-0" />

                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-beige/30 shrink-0">
                    {foto.signedUrl && (
                      <img src={foto.signedUrl} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <input
                      type="text"
                      defaultValue={foto.titulo}
                      onBlur={(e) => {
                        if (e.target.value !== foto.titulo) handleEdit(foto, 'titulo', e.target.value)
                      }}
                      className="w-full bg-transparent font-sans text-sm text-dark outline-none border-b border-transparent focus:border-gold transition-colors"
                      placeholder="Sem título"
                    />
                    <p className="font-sans text-[10px] text-dark/30 truncate">{foto.storage_path}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="number"
                      defaultValue={foto.ordem}
                      onBlur={(e) => {
                        const v = parseInt(e.target.value)
                        if (!isNaN(v) && v !== foto.ordem) handleEdit(foto, 'ordem', v)
                      }}
                      className="w-14 px-2 py-1 rounded-lg border border-beige bg-white text-dark font-sans text-xs text-center outline-none focus:border-gold transition-colors"
                    />
                    <button
                      onClick={() => handleDelete(foto)}
                      className="w-8 h-8 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
