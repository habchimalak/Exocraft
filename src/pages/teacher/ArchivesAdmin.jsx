import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/teacher/DashboardLayout'
import { contentApi } from '../../services/api'

export default function ArchivesAdmin() {
  const { user } = useAuth()
  const [tab, setTab]           = useState('contenus')
  const [archives, setArchives] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  async function loadArchives() {
    setLoading(true)
    try {
      const data = await contentApi.findArchived?.() ?? { data: [] }
      setArchives(data?.data ?? [])
    } catch (err) {
      setError(err.message || 'Erreur chargement archives')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadArchives() }, [])

  async function handleRestore(id) {
    try {
      await contentApi.desarchiver?.(id)
      loadArchives()
    } catch (err) {
      setError(err.message || 'Erreur restauration')
    }
  }

  return (
    <DashboardLayout activePage="archives">
      <div style={{ padding: 24 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a3e', marginBottom: 4 }}>Archives</h1>
          <p style={{ color: '#8888aa' }}>Contenus archivés — restaurez-les pour les remettre dans votre tableau de bord</p>
        </div>

        {error && <div style={{ background: '#fff0ee', borderRadius: 8, padding: '10px 14px', color: '#e17055', marginBottom: 16 }}>{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#8888aa' }}>Chargement...</div>
        ) : archives.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: '#fafbff', borderRadius: 12, border: '1px solid #e0e2f0' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🗄️</div>
            <div style={{ fontWeight: 700, color: '#1a1a3e', marginBottom: 8 }}>Aucun contenu archivé</div>
            <p style={{ color: '#8888aa' }}>Les contenus supprimés apparaîtront ici</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {archives.map(c => (
              <div key={c.id} style={{ background: '#fff', border: '1px solid #e0e2f0', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#1a1a3e', marginBottom: 4 }}>{c.titre}</div>
                  <div style={{ fontSize: 12, color: '#8888aa' }}>{c.type} · {c.matiere}</div>
                </div>
                <button
                  onClick={() => handleRestore(c.id)}
                  style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #a8e6cf', background: '#e0faf3', cursor: 'pointer', fontSize: 12, color: '#00b894', fontWeight: 600 }}
                >
                  Restaurer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
