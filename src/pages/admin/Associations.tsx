import React, { useState, useEffect, useCallback } from 'react'
import { associationsApi, type ApiAssociation } from '../../api/client'
import { useEtab } from '../../store/etablissementContext'

const AVATAR_COLORS = ['#6c5ce7', '#5b8dee', '#4dabf7', '#38d9a9', '#845ef7']

export default function Associations() {
  const { matieres, promos } = useEtab()
  const [teachers, setTeachers] = useState<ApiAssociation[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<number | null>(null)
  const [localAssoc, setLocalAssoc] = useState<Record<number, { matieres: string[]; promos: string[] }>>({})
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState('')

  const loadAssociations = useCallback(async () => {
    try {
      setLoading(true)
      const data = await associationsApi.list()
      setTeachers(data)
      const init: Record<number, { matieres: string[]; promos: string[] }> = {}
      data.forEach(t => { init[t.id] = { matieres: [...t.matieres], promos: [...t.promos] } })
      setLocalAssoc(init)
      if (data.length > 0 && !selected) setSelected(data[0].id)
    } catch (err) {
      console.error('Associations load error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadAssociations() }, [loadAssociations])

  const teacher = teachers.find(t => t.id === selected)
  const teacherAssoc = selected ? localAssoc[selected] : null

  function toggleMatiere(nom: string) {
    if (!selected) return
    setLocalAssoc(prev => {
      const curr = prev[selected]?.matieres ?? []
      return { ...prev, [selected]: { ...prev[selected], matieres: curr.includes(nom) ? curr.filter(m => m !== nom) : [...curr, nom] } }
    })
  }

  function togglePromo(nom: string) {
    if (!selected) return
    setLocalAssoc(prev => {
      const curr = prev[selected]?.promos ?? []
      return { ...prev, [selected]: { ...prev[selected], promos: curr.includes(nom) ? curr.filter(p => p !== nom) : [...curr, nom] } }
    })
  }

  async function handleSave() {
    if (!selected || !teacherAssoc) return
    setSaving(true)
    try {
      await associationsApi.save(selected, teacherAssoc.matieres, teacherAssoc.promos)
      setAlert('Associations enregistrÃ©es avec succÃ¨s !')
      setTimeout(() => setAlert(''), 3000)
      loadAssociations()
    } catch (err) {
      setAlert(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Associations</div>
          <div className="page-subtitle">Associer les enseignants Ã  leurs matiÃ¨res et promotions</div>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving || !selected}>
          {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </div>

      {alert && <div className={`alert ${alert.includes('succÃ¨s') ? 'alert-success' : 'alert-error'}`}>{alert}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#8888aa' }}>Chargement...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20 }}>
          {/* Liste enseignants */}
          <div className="card" style={{ padding: 12 }}>
            <div style={{ fontSize: 11, color: '#9090b0', marginBottom: 10, padding: '0 4px', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Enseignants</div>
            {teachers.length === 0 ? (
              <div style={{ padding: '20px 8px', textAlign: 'center', color: '#9090b0', fontSize: 13 }}>
                Aucun enseignant.<br />
                <span style={{ fontSize: 11 }}>CrÃ©ez des enseignants depuis la page Utilisateurs.</span>
              </div>
            ) : teachers.map((t, i) => (
              <div key={t.id} onClick={() => setSelected(t.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', background: selected === t.id ? '#f5f3ff' : 'transparent', borderLeft: `3px solid ${selected === t.id ? '#6c5ce7' : 'transparent'}`, marginBottom: 4, transition: 'all 0.15s' }}>
                <div className="avatar" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length], width: 34, height: 34, fontSize: 12, flexShrink: 0 }}>
                  {t.prenom[0]}{t.nom[0]}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: selected === t.id ? '#6c5ce7' : '#1a1a2e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {t.prenom} {t.nom}
                  </div>
                  <div style={{ fontSize: 11, color: '#9090b0' }}>
                    {localAssoc[t.id]?.matieres.length ?? 0} mat. Â· {localAssoc[t.id]?.promos.length ?? 0} promo.
                  </div>
                </div>
                {selected === t.id && <span style={{ color: '#6c5ce7', fontSize: 14, fontWeight: 700 }}>â€º</span>}
              </div>
            ))}
          </div>

          {/* Panneau associations */}
          {teacher && teacherAssoc ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="avatar" style={{ background: 'linear-gradient(135deg,#6c5ce7,#4a90e2)', width: 48, height: 48, fontSize: 16, flexShrink: 0 }}>
                  {teacher.prenom[0]}{teacher.nom[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#1a1a2e' }}>{teacher.prenom} {teacher.nom}</div>
                  <div style={{ fontSize: 12, color: '#9090b0', marginTop: 2 }}>{teacher.email}</div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ textAlign: 'center', padding: '8px 16px', background: '#f5f3ff', borderRadius: 8 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#6c5ce7' }}>{teacherAssoc.matieres.length}</div>
                    <div style={{ fontSize: 11, color: '#9090b0' }}>MatiÃ¨res</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '8px 16px', background: '#e8f2ff', borderRadius: 8 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#4a90e2' }}>{teacherAssoc.promos.length}</div>
                    <div style={{ fontSize: 11, color: '#9090b0' }}>Promotions</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="card">
                  <div className="section-header">
                    <div className="section-title">MatiÃ¨res</div>
                    <span className="badge badge-purple">{teacherAssoc.matieres.length}</span>
                  </div>
                  {matieres.length === 0 ? (
                    <div style={{ padding: '16px 0', textAlign: 'center', color: '#9090b0', fontSize: 13 }}>Aucune matiÃ¨re disponible</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 360, overflowY: 'auto' }}>
                      {matieres.map(m => {
                        const checked = teacherAssoc.matieres.includes(m.nom)
                        return (
                          <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', background: checked ? '#f5f3ff' : '#fafbff', border: `1px solid ${checked ? 'rgba(108,92,231,0.3)' : '#f0f2f8'}`, transition: 'all 0.15s' }}>
                            <input type="checkbox" checked={checked} onChange={() => toggleMatiere(m.nom)} style={{ accentColor: '#6c5ce7', width: 14, height: 14, flexShrink: 0 }} />
                            <span style={{ fontSize: 13, color: checked ? '#6c5ce7' : '#1a1a2e', fontWeight: checked ? 600 : 400, flex: 1 }}>{m.nom}</span>
                            {checked && <span style={{ color: '#6c5ce7', fontSize: 13, fontWeight: 700 }}>âœ“</span>}
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="card">
                  <div className="section-header">
                    <div className="section-title">Promotions</div>
                    <span className="badge badge-blue">{teacherAssoc.promos.length}</span>
                  </div>
                  {promos.length === 0 ? (
                    <div style={{ padding: '16px 0', textAlign: 'center', color: '#9090b0', fontSize: 13 }}>Aucune promotion disponible</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 360, overflowY: 'auto' }}>
                      {promos.map(p => {
                        const checked = teacherAssoc.promos.includes(p.nom)
                        return (
                          <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', background: checked ? '#e8f2ff' : '#fafbff', border: `1px solid ${checked ? 'rgba(74,144,226,0.3)' : '#f0f2f8'}`, transition: 'all 0.15s' }}>
                            <input type="checkbox" checked={checked} onChange={() => togglePromo(p.nom)} style={{ accentColor: '#4a90e2', width: 14, height: 14, flexShrink: 0 }} />
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                              <div style={{ fontSize: 13, color: checked ? '#4a90e2' : '#1a1a2e', fontWeight: checked ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.nom}</div>
                              {p.code && <div style={{ fontSize: 10, color: '#9090b0', fontFamily: 'monospace' }}>{p.code}</div>}
                            </div>
                            {checked && <span style={{ color: '#4a90e2', fontSize: 13, fontWeight: 700 }}>âœ“</span>}
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="empty-state">
                <div style={{ fontWeight: 800, fontSize: 22, color: '#6c5ce7', opacity: 0.3, marginBottom: 12 }}>ASSOC</div>
                <div style={{ fontWeight: 600, color: '#4a4a6a' }}>SÃ©lectionnez un enseignant</div>
                <p>Cliquez sur un enseignant pour gÃ©rer ses associations</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

