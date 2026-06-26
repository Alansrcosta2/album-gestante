'use client'

import { useState, useEffect, useRef } from 'react'
import { compressImage } from '@/lib/compress-image'
import { Lock, Upload, Trash2, X, Image as ImageIcon, GripVertical, Settings, LogOut, Plus, Music } from 'lucide-react'

function Field({ label, value, onChange, onSave, textarea, placeholder }: { label: string; value: string; onChange: (v: string) => void; onSave: (v: string) => void; textarea?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="block font-sans text-xs text-dark/50 uppercase tracking-wider mb-1">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} onBlur={(e) => onSave(e.target.value)} rows={3} placeholder={placeholder} className="w-full px-4 py-3 rounded-xl border border-beige bg-white text-dark font-sans text-sm outline-none focus:border-gold transition-colors resize-none" />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} onBlur={(e) => onSave(e.target.value)} placeholder={placeholder} className="w-full px-4 py-2.5 rounded-xl border border-beige bg-white text-dark font-sans text-sm outline-none focus:border-gold transition-colors" />
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
    welcome_message: 'Este não é apenas um ensaio fotográfico. É a lembrança de um capítulo inesquecível da nossa história, marcado pelo amor, pela esperança e pela alegria de esperar o maior presente que a vida poderia nos dar.',
    footer_title: 'Karine & Alan',
    footer_subtitle: 'Ensaio Gestante',
    background_music_url: '',
  })
  const [settingsSaved, setSettingsSaved] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!authed) return
    loadFotos()
    loadSettings()
  }, [authed])

  const [musicUrls, setMusicUrls] = useState<string[]>([])
  const [newMusicUrl, setNewMusicUrl] = useState('')

  async function addMusicUrl() {
    const url = newMusicUrl.trim()
    if (!url) return
    const updated = [...musicUrls, url]
    setMusicUrls(updated)
    const text = updated.join('\n')
    setSettings((p) => ({ ...p, background_music_url: text }))
    await saveSetting('background_music_url', text)
    setNewMusicUrl('')
  }

  async function removeMusicUrl(index: number) {
    const updated = musicUrls.filter((_, i) => i !== index)
    setMusicUrls(updated)
    const text = updated.join('\n')
    setSettings((p) => ({ ...p, background_music_url: text }))
    await saveSetting('background_music_url', text)
  }

  async function saveSetting(key: string, value: string) {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    })
    return res.ok
  }

  async function loadSettings() {
    const res = await fetch('/api/admin/settings')
    if (res.ok) {
      const data = await res.json()
      if (data.settings) {
        const filtered: Record<string, string> = {}
        for (const [key, value] of Object.entries(data.settings as Record<string, string>)) {
          if (value && value.trim()) filtered[key] = value.trim()
        }
        setSettings((prev) => ({ ...prev, ...filtered }))
        const raw = filtered.background_music_url || ''
        setMusicUrls(raw.split(/[\n,;]+/).map((s: string) => s.trim()).filter(Boolean))
      }
    }
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
        <div className="max-w-5xl mx-auto px-3 md:px-4 py-2 md:py-3 flex items-center justify-between">
          <h1 className="font-serif text-base md:text-lg text-dark">Admin — Álbum Gestante</h1>
          <div className="flex items-center gap-2 md:gap-3">
            <span className="font-sans text-[10px] md:text-xs text-dark/40">{fotos.length} fotos</span>
            <button
              onClick={async () => {
                await fetch('/api/admin/auth/logout', { method: 'POST' })
                window.location.href = '/'
              }}
              className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-beige/50 flex items-center justify-center hover:bg-beige transition-colors"
              aria-label="Sair do admin"
            >
              <LogOut className="w-3.5 h-3.5 md:w-4 md:h-4 text-dark/60" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-3 md:px-4 py-4 md:py-8 space-y-4 md:space-y-10">
        <section className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-beige">
          <h2 className="font-serif text-base md:text-lg text-dark mb-3 md:mb-4 flex items-center gap-2">
            <Upload className="w-4 h-4 text-gold" /> Upload de Foto
          </h2>

          <div
            ref={dropRef}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-beige rounded-lg md:rounded-xl p-4 md:p-8 text-center cursor-pointer hover:border-gold transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-32 md:max-h-48 mx-auto rounded-lg" />
            ) : (
              <div className="text-dark/40">
                <ImageIcon className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2" />
                <p className="font-sans text-xs md:text-sm">Clique ou arraste uma foto aqui</p>
                <p className="font-sans text-[10px] md:text-xs text-dark/20 mt-1">Será comprimida para JPEG 2000px</p>
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
            <div className="mt-3 md:mt-4 space-y-2 md:space-y-3">
              <input
                type="text"
                value={newTitulo}
                onChange={(e) => setNewTitulo(e.target.value)}
                placeholder="Título da foto (opcional)"
                className="w-full px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl border border-beige bg-white text-dark font-sans text-xs md:text-sm outline-none focus:border-gold transition-colors"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-gradient-to-r from-gold to-rose text-white font-sans text-xs md:text-sm font-bold tracking-wider uppercase shadow-lg disabled:opacity-60"
                >
                  {uploading ? 'Enviando...' : 'Enviar'}
                </button>
                <button
                  onClick={() => { setSelectedFile(null); setPreview(''); setNewTitulo(''); if (fileRef.current) fileRef.current.value = '' }}
                  className="px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl border border-beige text-dark/60 hover:text-dark font-sans text-xs md:text-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-beige">
          <h2 className="font-serif text-base md:text-lg text-dark mb-3 md:mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4 text-gold" /> Conteúdo da Página
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <Field label="Rótulo do Hero" value={settings.hero_label} onChange={(v) => setSettings((p) => ({ ...p, hero_label: v }))} onSave={(v) => saveSetting('hero_label', v)} />
              <Field label="Título do Hero" value={settings.hero_title} onChange={(v) => setSettings((p) => ({ ...p, hero_title: v }))} onSave={(v) => saveSetting('hero_title', v)} />
              <Field label="Subtítulo do Hero" value={settings.hero_subtitle} onChange={(v) => setSettings((p) => ({ ...p, hero_subtitle: v }))} onSave={(v) => saveSetting('hero_subtitle', v)} />
              <Field label="Título do Footer" value={settings.footer_title} onChange={(v) => setSettings((p) => ({ ...p, footer_title: v }))} onSave={(v) => saveSetting('footer_title', v)} />
              <Field label="Subtítulo do Footer" value={settings.footer_subtitle} onChange={(v) => setSettings((p) => ({ ...p, footer_subtitle: v }))} onSave={(v) => saveSetting('footer_subtitle', v)} />
            </div>

            <div className="bg-beige/20 rounded-xl p-3 md:p-4 space-y-3">
              <label className="block font-sans text-xs text-dark/50 uppercase tracking-wider flex items-center gap-2">
                <Music className="w-4 h-4 text-gold" /> Músicas de fundo (YouTube)
              </label>

              <div className="space-y-2">
                {musicUrls.length === 0 && (
                  <p className="text-dark/30 text-xs font-sans">Nenhuma música adicionada</p>
                )}
                {musicUrls.map((url, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white rounded-lg border border-beige p-2">
                    <span className="text-xs text-dark/40 font-sans w-5 shrink-0">{i + 1}</span>
                    <p className="flex-1 text-xs text-dark/70 font-sans truncate">{url}</p>
                    <button
                      onClick={() => removeMusicUrl(i)}
                      className="w-7 h-7 rounded-md bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMusicUrl}
                  onChange={(e) => setNewMusicUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMusicUrl() } }}
                  placeholder="Cole a URL do YouTube e clique em Adicionar"
                  className="flex-1 px-3 py-2 rounded-lg border border-beige bg-white text-dark font-sans text-xs outline-none focus:border-gold transition-colors"
                />
                <button
                  onClick={addMusicUrl}
                  disabled={!newMusicUrl.trim()}
                  className="px-3 py-2 rounded-lg bg-dark/80 text-white text-xs font-sans hover:bg-dark transition-colors disabled:opacity-40 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </button>
              </div>
            </div>

            <div className="md:col-span-2">
              <Field label="Mensagem de Boas-Vindas" value={settings.welcome_message} onChange={(v) => setSettings((p) => ({ ...p, welcome_message: v }))} onSave={(v) => saveSetting('welcome_message', v)} textarea />
            </div>
          </div>

          {settingsSaved && <p className="font-sans text-xs text-green-600 mt-2 md:mt-3">Salvo!</p>}
        </section>

        <section>
          <h2 className="font-serif text-base md:text-lg text-dark mb-3 md:mb-4">Fotos ({fotos.length})</h2>

          {loading ? (
            <p className="font-sans text-xs md:text-sm text-dark/40">Carregando...</p>
          ) : fotos.length === 0 ? (
            <p className="font-sans text-xs md:text-sm text-dark/40">Nenhuma foto ainda</p>
          ) : (
            <div className="space-y-2">
              {fotos.map((foto) => (
                <div
                  key={foto.id}
                  className="bg-white rounded-lg md:rounded-xl border border-beige p-2 md:p-3 flex items-center gap-2 md:gap-4"
                >
                  <div className="w-10 h-10 md:w-16 md:h-16 rounded-md md:rounded-lg overflow-hidden bg-beige/30 shrink-0">
                    {foto.signedUrl && (
                      <img src={foto.signedUrl} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5 md:space-y-1">
                    <input
                      type="text"
                      defaultValue={foto.titulo}
                      onBlur={(e) => {
                        if (e.target.value !== foto.titulo) handleEdit(foto, 'titulo', e.target.value)
                      }}
                      className="w-full bg-transparent font-sans text-xs md:text-sm text-dark outline-none border-b border-transparent focus:border-gold transition-colors"
                      placeholder="Sem título"
                    />
                    <p className="font-sans text-[9px] md:text-[10px] text-dark/30 truncate">{foto.storage_path}</p>
                  </div>

                  <div className="flex items-center gap-1 md:gap-2 shrink-0">
                    <input
                      type="number"
                      defaultValue={foto.ordem}
                      onBlur={(e) => {
                        const v = parseInt(e.target.value)
                        if (!isNaN(v) && v !== foto.ordem) handleEdit(foto, 'ordem', v)
                      }}
                      className="w-10 md:w-14 px-1.5 md:px-2 py-1 rounded-md md:rounded-lg border border-beige bg-white text-dark font-sans text-xs text-center outline-none focus:border-gold transition-colors"
                    />
                    <button
                      onClick={() => handleDelete(foto)}
                      className="w-7 h-7 md:w-8 md:h-8 rounded-md md:rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
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
