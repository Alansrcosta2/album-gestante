'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Heart, X } from 'lucide-react'

interface Props {
  onUnlock: () => void
}

export default function PasswordGate({ onUnlock }: Props) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    setLoading(false)

    if (res.ok) {
      setError(false)
      onUnlock()
    } else {
      setError(true)
      setPassword('')
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setPassword('')
    setError(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-cream"
    >
      <button
        onClick={handleLogout}
        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/50 flex items-center justify-center hover:bg-white/80 transition-colors"
        aria-label="Sair"
      >
        <X className="w-5 h-5 text-dark/60" />
      </button>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-sm mx-6 text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Heart className="w-12 h-12 mx-auto mb-6 text-rose" />
        </motion.div>

        <h1 className="font-serif text-3xl text-dark mb-2">Álbum Privado</h1>
        <p className="text-dark/60 text-sm mb-8 font-sans">
          Digite a senha para acessar o álbum
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false) }}
              placeholder="Senha"
              autoFocus
              className={`w-full px-5 py-3.5 rounded-xl border bg-white text-dark placeholder:text-dark/30 font-sans text-sm outline-none transition-colors ${
                error ? 'border-red-400' : 'border-beige focus:border-gold'
              }`}
            />
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-500 text-xs mt-1.5 font-sans"
                >
                  Senha incorreta. Tente novamente.
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold to-rose text-white font-sans text-sm font-bold tracking-wider uppercase shadow-lg shadow-rose/20 hover:shadow-xl hover:shadow-rose/30 transition-shadow disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <><Lock className="inline w-3.5 h-3.5 mr-2 -mt-0.5" />Entrar</>
            )}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  )
}
