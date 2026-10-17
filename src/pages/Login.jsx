/**
 * Login unifié — Solution A
 *
 * Un seul écran : email + mot de passe.
 * Après connexion, redirection automatique selon le rôle :
 *   admin      → /admin
 *   enseignant → /dashboard
 */

import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate   = useNavigate()
  const { login, user } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [mounted, setMounted]   = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Si déjà connecté → rediriger
  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true })
    }
  }, [user, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password.trim()) {
      setError('Veuillez renseigner votre email et votre mot de passe.')
      return
    }
    setLoading(true)
    try {
      const loggedUser = await login({ email: email.trim(), password })
      // Redirection selon le rôle
      if (loggedUser.role === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      setError(err.message || 'Email ou mot de passe incorrect.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, position: 'relative', overflow: 'hidden',
    }}>

      {/* Blobs déco */}
      <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,92,231,0.15) 0%, transparent 70%)', top: '-200px', left: '-200px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,144,226,0.12) 0%, transparent 70%)', bottom: '-150px', right: '-150px', pointerEvents: 'none' }} />

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 440, position: 'relative', zIndex: 10,
        opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 24, padding: '40px 44px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg, #6c5ce7, #4a90e2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 8px 32px rgba(108,92,231,0.5)' }}>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: 28 }}>E</span>
            </div>
            <div style={{ fontSize: 30, fontWeight: 900, color: '#fff' }}>
              Exo<span style={{ background: 'linear-gradient(135deg, #a29bfe, #74b9ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Craft</span>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
              Plateforme pédagogique par IA
            </div>
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 24 }} />

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Connexion</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
              Administrateur ou Enseignant — un seul accès
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(225,112,85,0.15)', border: '1px solid rgba(225,112,85,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 18, fontSize: 13, color: '#ff7675', display: 'flex', alignItems: 'center', gap: 8 }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>
                Adresse email
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="exemple@universite.tn" autoComplete="email"
                  style={{ width: '100%', padding: '12px 14px 12px 42px', background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(108,92,231,0.7)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>✉</span>
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>
                Mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" autoComplete="current-password"
                  style={{ width: '100%', padding: '12px 44px 12px 42px', background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(108,92,231,0.7)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>🔒</span>
                <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
                  {showPwd ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', background: loading ? 'rgba(108,92,231,0.4)' : 'linear-gradient(135deg, #6c5ce7, #4a90e2)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 8px 24px rgba(108,92,231,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              {loading ? (
                <><span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Connexion...</>
              ) : 'Se connecter →'}
            </button>
          </form>

          {/* Lien inscription enseignant */}
          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            Enseignant sans compte ?{' '}
            <Link to="/register" style={{ color: '#a29bfe', textDecoration: 'none', fontWeight: 600 }}>
              Créer un compte
            </Link>
          </div>

          {/* Info démo */}
          <div style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12, color: 'rgba(255,255,255,0.3)', lineHeight: 1.8 }}>
            <span style={{ color: 'rgba(162,155,254,0.8)', fontWeight: 600 }}>Comptes démo</span><br />
            Admin ING : <code style={{ color: 'rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.07)', padding: '1px 5px', borderRadius: 4 }}>admin@tekup.tn</code><br />
            Admin FAC : <code style={{ color: 'rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.07)', padding: '1px 5px', borderRadius: 4 }}>admin@faculte.tn</code><br />
            Mot de passe admin : <code style={{ color: 'rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.07)', padding: '1px 5px', borderRadius: 4 }}>Admin@1234</code>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
          ExoCraft © 2025-2026 · TEK-UP University
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.2) !important; }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 100px rgba(108,92,231,0.15) inset !important; -webkit-text-fill-color: #fff !important; }
      `}</style>
    </div>
  )
}
