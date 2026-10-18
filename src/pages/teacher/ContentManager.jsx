import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/teacher/DashboardLayout'
import { contentApi } from '../../services/api'

const CONTENT_TYPES = [
  { value: '', label: 'Tous les types' },
  { value: 'cours', label: 'Cours' },
  { value: 'resume', label: 'Résumé' },
  { value: 'examen', label: 'Examen' },
  { value: 'serie', label: 'Série' },
]

export default function ContentManager() {
  const { user } = useAuth()
  const [contents, setContents] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [filter, setFilter]     = useState({ type: '', search: '' })

  async function loadContents() {
    setLoading(true)
    try {
      const data = await contentApi.getMesContenus({ type: filter.type })
      setContents(data?.data ?? [])
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadContents() }, [filter.type])

  const filtered = contents.filter(c =>
    !filter.search || c.titre?.toLowerCase().includes(filter.search.toLowerCase())
  )

  async function handleDelete(id) {
    if (!window.confirm('Supprimer ce contenu ?')) return
    try {
      await contentApi.remove(id)
      setContents(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      setError(err.message || 'Erreur suppression')
    }
  }

  async function handleArchive(id) {
    try {
      await contentApi.archiver?.(id)
      loadContents()
    } catch (err) {
      setError(err.message || 'Erreur archivage')
    }
  }

  return (
    <DashboardLayout activePage="contents">
      <div style={{ padding: 24 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a3e', marginBottom: 4 }}>Mes Cours</h1>
          <p style={{ color: '#8888aa' }}>Gérez vos contenus pédagogiques</p>
        </div>

        {error && <div style={{ background: '#fff0ee', border: '1px solid #ffd5cc', borderRadius: 8, padding: '10px 14px', color: '#e17055', marginBottom: 16 }}>{error}</div>}

        {/* Filtres */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <select
            value={filter.type}
            onChange={e => setFilter(f => ({ ...f, type: e.target.value }))}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e0e2f0', fontSize: 13 }}
          >
            {CONTENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <input
            placeholder="Rechercher..."
            value={filter.search}
            onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e0e2f0', fontSize: 13, flex: 1, maxWidth: 300 }}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#8888aa' }}>Chargement...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: '#fafbff', borderRadius: 12, border: '1px solid #e0e2f0' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📚</div>
            <div style={{ fontWeight: 700, color: '#1a1a3e', marginBottom: 8 }}>Aucun contenu</div>
            <p style={{ color: '#8888aa' }}>Utilisez l'Assistant IA pour générer vos premiers contenus</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(c => (
              <div key={c.id} style={{ background: '#fff', border: '1px solid #e0e2f0', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#1a1a3e', marginBottom: 4 }}>{c.titre}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, background: '#edeaff', color: '#5b4fcf', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>{c.type}</span>
                    <span style={{ fontSize: 11, background: '#f0f2ff', color: '#8888aa', padding: '2px 8px', borderRadius: 20 }}>{c.matiere}</span>
                    <span style={{ fontSize: 11, background: c.statut === 'valide' ? '#e0faf3' : '#f5f5f5', color: c.statut === 'valide' ? '#00b894' : '#8888aa', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>{c.statut === 'valide' ? 'Validé' : 'Brouillon'}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleArchive(c.id)}
                    style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #e0e2f0', background: '#fff', cursor: 'pointer', fontSize: 12, color: '#8888aa' }}
                  >
                    Archiver
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #ffd5cc', background: '#fff0ee', cursor: 'pointer', fontSize: 12, color: '#e17055' }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
