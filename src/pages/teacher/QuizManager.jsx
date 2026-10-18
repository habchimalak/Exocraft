import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/teacher/DashboardLayout'
import { quizApi } from '../../services/api'

export default function QuizManager() {
  const { user } = useAuth()
  const [quizzes, setQuizzes]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [search, setSearch]     = useState('')

  async function loadQuizzes() {
    setLoading(true)
    try {
      const data = await quizApi.getAll()
      setQuizzes(data?.data ?? data ?? [])
    } catch (err) {
      setError(err.message || 'Erreur chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadQuizzes() }, [])

  const filtered = quizzes.filter(q =>
    !search || q.titre?.toLowerCase().includes(search.toLowerCase())
  )

  async function handleDelete(id) {
    if (!window.confirm('Supprimer ce quiz ?')) return
    try {
      await quizApi.remove(id)
      setQuizzes(prev => prev.filter(q => q.id !== id))
    } catch (err) {
      setError(err.message || 'Erreur suppression')
    }
  }

  async function handleValider(id) {
    try {
      await quizApi.valider(id)
      loadQuizzes()
    } catch (err) {
      setError(err.message || 'Erreur validation')
    }
  }

  return (
    <DashboardLayout activePage="quiz">
      <div style={{ padding: 24 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a3e', marginBottom: 4 }}>Mes Exercices & Quiz</h1>
          <p style={{ color: '#8888aa' }}>Gérez vos quiz et examens générés par l'IA</p>
        </div>

        {error && <div style={{ background: '#fff0ee', border: '1px solid #ffd5cc', borderRadius: 8, padding: '10px 14px', color: '#e17055', marginBottom: 16 }}>{error}</div>}

        <div style={{ marginBottom: 16 }}>
          <input
            placeholder="Rechercher un quiz..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e0e2f0', fontSize: 13, width: 280 }}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#8888aa' }}>Chargement...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: '#fafbff', borderRadius: 12, border: '1px solid #e0e2f0' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📝</div>
            <div style={{ fontWeight: 700, color: '#1a1a3e', marginBottom: 8 }}>Aucun quiz</div>
            <p style={{ color: '#8888aa' }}>Utilisez l'Assistant IA pour générer vos premiers quiz</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(q => (
              <div key={q.id} style={{ background: '#fff', border: '1px solid #e0e2f0', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#1a1a3e', marginBottom: 4 }}>{q.titre}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, background: '#e6f0ff', color: '#4a90e2', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>{q.matiere}</span>
                    <span style={{ fontSize: 11, background: '#f0f2ff', color: '#8888aa', padding: '2px 8px', borderRadius: 20 }}>{q.niveau}</span>
                    <span style={{ fontSize: 11, background: '#f0f2ff', color: '#8888aa', padding: '2px 8px', borderRadius: 20 }}>{q.questions?.length ?? 0} questions</span>
                    <span style={{ fontSize: 11, background: q.statut === 'valide' ? '#e0faf3' : '#fff5e0', color: q.statut === 'valide' ? '#00b894' : '#f39c12', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                      {q.statut === 'valide' ? 'Validé' : 'Brouillon'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {q.statut !== 'valide' && (
                    <button
                      onClick={() => handleValider(q.id)}
                      style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #a8e6cf', background: '#e0faf3', cursor: 'pointer', fontSize: 12, color: '#00b894', fontWeight: 600 }}
                    >
                      Valider
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(q.id)}
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
