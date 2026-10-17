import React, { useState, useEffect } from 'react'
import type { EtablissementType } from '../data/etablissements'
import { useAuth } from '../store/authContext'

interface LoginProps {
  onLogin: (type: EtablissementType) => void
}

export default function Login({ onLogin }: LoginProps) {
  const { login } = useAuth()
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [etablissement, setEtablissement] = useState<EtablissementType | ''>('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!etablissement) { setError('Veuillez sélectionner votre type d\'établissement.'); return }
    if (!email.trim())  { setError('Adresse email requise.'); return }
    if (!password)      { setError('Mot de passe requis.'); return }
    setLoading(true)
    try {
      await login(email, password, etablissement as EtablissementType)
      onLogin(etablissement as EtablissementType)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion échouée')
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

      {/* ── Animated background blobs ── */}
      <div style={{
        position: 'absolute', width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(108,92,231,0.15) 0%, transparent 70%)',
        top: '-200px', left: '-200px', animation: 'blobFloat 8s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(74,144,226,0.12) 0%, transparent 70%)',
        bottom: '-150px', right: '-150px', animation: 'blobFloat 10s ease-in-out infinite reverse',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(162,155,254,0.1) 0%, transparent 70%)',
        top: '40%', right: '20%', animation: 'blobFloat 12s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      {/* ── Grid pattern overlay ── */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.03,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
      }} />

      {/* ── Main card ── */}
      <div style={{
        width: '100%', maxWidth: 460, position: 'relative', zIndex: 10,
        opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}>

        {/* Glass card */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 24,
          padding: '40px 44px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ display: 'inline-flex', position: 'relative', marginBottom: 16 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 18,
                background: 'linear-gradient(135deg, #6c5ce7, #4a90e2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(108,92,231,0.5)',
                position: 'relative',
              }}>
                <span style={{ color: '#fff', fontWeight: 900, fontSize: 28, letterSpacing: -1 }}>E</span>
                {/* Glow ring */}
                <div style={{
                  position: 'absolute', inset: -3,
                  borderRadius: 21, border: '1px solid rgba(108,92,231,0.4)',
                  animation: 'ringPulse 3s ease-in-out infinite',
                }} />
              </div>
            </div>
            <div style={{ fontSize: 30, fontWeight: 900, color: '#fff', letterSpacing: -0.5 }}>
              Exo<span style={{
                background: 'linear-gradient(135deg, #a29bfe, #74b9ff)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Craft</span>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 4, letterSpacing: 0.3 }}>
              Plateforme pédagogique par IA
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 28 }} />

          {/* Title */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
              Connexion administrateur
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
              Identifiez-vous pour accéder au tableau de bord
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(225,112,85,0.15)', border: '1px solid rgba(225,112,85,0.3)',
              borderRadius: 10, padding: '10px 14px', marginBottom: 18,
              fontSize: 13, color: '#ff7675', display: 'flex', alignItems: 'center', gap: 8,
              animation: 'shake 0.3s ease',
            }}>
              <span style={{ fontSize: 16 }}>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Type établissement */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                Type d'établissement
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { value: 'licence' as EtablissementType, label: 'Faculté', sub: 'Licence · Master', tag: 'FAC', grad: 'linear-gradient(135deg,#4a90e2,#667eea)' },
                  { value: 'cycle_ing' as EtablissementType, label: 'École Ingénieurs', sub: 'Cycle Ingénieur', tag: 'ING', grad: 'linear-gradient(135deg,#6c5ce7,#a29bfe)' },
                ].map(opt => {
                  const active = etablissement === opt.value
                  return (
                    <div
                      key={opt.value}
                      onClick={() => setEtablissement(opt.value)}
                      style={{
                        border: `1.5px solid ${active ? 'rgba(162,155,254,0.6)' : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: 12, padding: '14px 12px', cursor: 'pointer',
                        background: active ? 'rgba(108,92,231,0.2)' : 'rgba(255,255,255,0.03)',
                        transition: 'all 0.2s',
                        position: 'relative', overflow: 'hidden',
                      }}
                    >
                      {active && (
                        <div style={{
                          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                          background: opt.grad, borderRadius: '12px 12px 0 0',
                        }} />
                      )}
                      <div style={{
                        width: 36, height: 36, borderRadius: 9, margin: '0 auto 8px',
                        background: active ? opt.grad : 'rgba(255,255,255,0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: active ? '0 4px 16px rgba(108,92,231,0.4)' : 'none',
                        transition: 'all 0.2s',
                      }}>
                        <span style={{ fontWeight: 800, fontSize: 11, color: active ? '#fff' : 'rgba(255,255,255,0.4)' }}>
                          {opt.tag}
                        </span>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: active ? '#fff' : 'rgba(255,255,255,0.5)' }}>
                          {opt.label}
                        </div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{opt.sub}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>
                Adresse email
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@universite.tn"
                  autoComplete="email"
                  style={{
                    width: '100%', padding: '12px 14px 12px 42px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1.5px solid rgba(255,255,255,0.1)',
                    borderRadius: 10, color: '#fff', fontSize: 14,
                    outline: 'none', transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(108,92,231,0.7)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 15, opacity: 0.4 }}>✉</span>
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>
                Mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{
                    width: '100%', padding: '12px 44px 12px 42px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1.5px solid rgba(255,255,255,0.1)',
                    borderRadius: 10, color: '#fff', fontSize: 14,
                    outline: 'none', transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(108,92,231,0.7)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 15, opacity: 0.4 }}>🔒</span>
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 13, color: 'rgba(255,255,255,0.35)', padding: 4,
                  }}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px',
                background: loading
                  ? 'rgba(108,92,231,0.4)'
                  : 'linear-gradient(135deg, #6c5ce7, #4a90e2)',
                border: 'none', borderRadius: 12, color: '#fff',
                fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 8px 24px rgba(108,92,231,0.4)',
                transition: 'all 0.2s', letterSpacing: 0.3,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff', borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite', display: 'inline-block',
                  }} />
                  Connexion en cours...
                </>
              ) : (
                'Se connecter →'
              )}
            </button>
          </form>

          {/* Demo hint */}
          <div style={{
            marginTop: 24, padding: '12px 16px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10, fontSize: 12,
            color: 'rgba(255,255,255,0.3)',
            lineHeight: 1.7,
          }}>
            <span style={{ color: 'rgba(162,155,254,0.8)', fontWeight: 600 }}>Accès démo</span>
            <br />
            ING : <code style={{ color: 'rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.07)', padding: '1px 5px', borderRadius: 4 }}>admin@tekup.tn</code>
            &nbsp;·&nbsp;
            FAC : <code style={{ color: 'rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.07)', padding: '1px 5px', borderRadius: 4 }}>admin@faculte.tn</code>
            <br />
            Mot de passe : <code style={{ color: 'rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.07)', padding: '1px 5px', borderRadius: 4 }}>Admin@1234</code>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
          ExoCraft &copy; 2025-2026 · TEK-UP University
        </div>
      </div>

      <style>{`
        @keyframes blobFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(30px, -30px) scale(1.05); }
          66%  { transform: translate(-20px, 20px) scale(0.97); }
        }
        @keyframes ringPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 0.8; transform: scale(1.08); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes shake {
          0%,100%{ transform: translateX(0); }
          20%    { transform: translateX(-6px); }
          40%    { transform: translateX(6px); }
          60%    { transform: translateX(-4px); }
          80%    { transform: translateX(4px); }
        }
        input::placeholder { color: rgba(255,255,255,0.2) !important; }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px rgba(108,92,231,0.15) inset !important;
          -webkit-text-fill-color: #fff !important;
        }
      `}</style>
    </div>
  )
}
