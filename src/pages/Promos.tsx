import React, { useState } from 'react'
import { useEtab } from '../store/etablissementContext'
import type { Promo } from '../data/mockData'

// ── Config niveaux ──
const NIVEAU_CONFIG_ING: Record<string, { label: string; color: string; bg: string }> = {
  '1ere': { label: '1ère Prépa',          color: '#5b4fcf', bg: '#edeaff' },
  '2eme': { label: '2ème Prépa',          color: '#4a90e2', bg: '#e6f0ff' },
  '3eme': { label: '3ème Branche comm.',  color: '#00b894', bg: '#e0faf3' },
  '4eme': { label: '4ème année',          color: '#f39c12', bg: '#fff5e0' },
  '5eme': { label: '5ème année',          color: '#e17055', bg: '#fff0ee' },
}
const NIVEAU_CONFIG_LICENCE: Record<string, { label: string; color: string; bg: string }> = {
  '1ere': { label: '1ère Licence', color: '#5b4fcf', bg: '#edeaff' },
  '2eme': { label: '2ème Licence', color: '#4a90e2', bg: '#e6f0ff' },
  '3eme': { label: '3ème Licence', color: '#00b894', bg: '#e0faf3' },
  '4eme': { label: 'Master 1',     color: '#f39c12', bg: '#fff5e0' },
  '5eme': { label: 'Master 2',     color: '#e17055', bg: '#fff0ee' },
}

// ── Spécialités prédéfinies par type ──
const SPEC_PRESETS_ING = ['Cloud Computing', 'Cybersécurité', 'Data Science', 'Génie Logiciel', 'Réseaux & Télécoms', 'Systèmes embarqués']
const SPEC_PRESETS_LICENCE = ['Informatique', 'Mathématiques', 'Physique', 'Gestion', 'Biologie', 'Chimie', 'Droit', 'Économie']

const SPEC_COLORS: Record<string, string> = {
  'Cloud Computing':    '#4a90e2',
  'Cybersécurité':      '#e17055',
  'Data Science':       '#00b894',
  'Génie Logiciel':     '#5b4fcf',
  'Réseaux & Télécoms': '#f39c12',
  'Systèmes embarqués': '#a29bfe',
}
function specColor(s: string) { return SPEC_COLORS[s] ?? '#5b4fcf' }

// ── Tous les niveaux peuvent avoir des spécialités ──
function canHaveSpec(_niveau: string, _etabType: string) {
  return true
}

// ── State: spécialités par niveau (admin peut en ajouter) ──
type SpecsState = Record<string, string[]>
function initSpecs(etabType: string): SpecsState {
  if (etabType === 'cycle_ing') {
    return {
      '1ere': [],
      '2eme': [],
      '3eme': [],
      '4eme': ['Cloud Computing', 'Cybersécurité', 'Data Science', 'Génie Logiciel'],
      '5eme': ['Cloud Computing', 'Cybersécurité', 'Data Science', 'Génie Logiciel'],
    }
  }
  // Licence : tous vides, l'admin ajoute ce qu'il veut
  return { '1ere': [], '2eme': [], '3eme': [], '4eme': [], '5eme': [] }
}

export default function Promos() {
  const { promos: initialPromos, type: etabType } = useEtab()
  const NIVEAU_CONFIG = etabType === 'licence' ? NIVEAU_CONFIG_LICENCE : NIVEAU_CONFIG_ING
  const SPEC_PRESETS  = etabType === 'cycle_ing' ? SPEC_PRESETS_ING : SPEC_PRESETS_LICENCE

  const [promos, setPromos]         = useState<Promo[]>(initialPromos)
  const [selectedPromo, setSelectedPromo] = useState<Promo | null>(null)
  const [specs, setSpecs]           = useState<SpecsState>(() => initSpecs(etabType))

  // ── Modal promotion ──
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem]   = useState<Promo | null>(null)
  const [form, setForm]           = useState({ nom: '', code: '', niveau: '4eme', type: 'specialite', specialite: '', semestre: 'S1' })
  const [alert, setAlert]         = useState('')

  // ── Modal spécialités ──
  const [showSpecModal, setShowSpecModal] = useState(false)
  const [specNiveau, setSpecNiveau]       = useState<string>('')
  const [newSpecName, setNewSpecName]     = useState('')
  const [specAlert, setSpecAlert]         = useState('')

  const niveaux = ['1ere', '2eme', '3eme', '4eme', '5eme'] as const

  // ── Promo CRUD ──
  function openCreate() {
    setEditItem(null)
    setForm({ nom: '', code: '', niveau: '4eme', type: 'specialite', specialite: '', semestre: 'S1' })
    setAlert('')
    setShowModal(true)
  }

  function openEdit(p: Promo) {
    setEditItem(p)
    setForm({ nom: p.nom, code: p.code, niveau: p.niveau, type: p.type, specialite: p.specialite ?? '', semestre: p.semestre })
    setAlert('')
    setShowModal(true)
  }

  function handleSave() {
    if (!form.nom.trim() || !form.code.trim()) { setAlert('Nom et code requis.'); return }
    if (form.type === 'specialite' && !form.specialite) { setAlert('Choisissez une spécialité.'); return }

    if (editItem) {
      setPromos(prev => prev.map(p => p.id === editItem.id
        ? { ...p, nom: form.nom, code: form.code, niveau: form.niveau as Promo['niveau'], type: form.type, specialite: form.specialite || undefined, semestre: form.semestre as Promo['semestre'] }
        : p
      ))
      if (selectedPromo?.id === editItem.id)
        setSelectedPromo(prev => prev ? { ...prev, nom: form.nom, code: form.code } : null)
    } else {
      const newP: Promo = {
        id: Date.now(), nom: form.nom, code: form.code,
        niveau: form.niveau as Promo['niveau'], type: form.type,
        specialite: form.specialite || undefined,
        semestre: form.semestre as Promo['semestre'], matieres: [],
      }
      setPromos(prev => [...prev, newP])
    }
    setShowModal(false)
  }

  function handleDelete(id: number) {
    if (!window.confirm('Supprimer cette promotion ?')) return
    setPromos(prev => prev.filter(p => p.id !== id))
    if (selectedPromo?.id === id) setSelectedPromo(null)
  }

  // ── Spécialités CRUD ──
  function openSpecModal(niveau: string) {
    setSpecNiveau(niveau)
    setNewSpecName('')
    setSpecAlert('')
    setShowSpecModal(true)
  }

  function addSpec() {
    if (!newSpecName.trim()) { setSpecAlert('Entrez un nom.'); return }
    const existing = specs[specNiveau] ?? []
    if (existing.includes(newSpecName.trim())) { setSpecAlert('Cette spécialité existe déjà.'); return }
    setSpecs(prev => ({ ...prev, [specNiveau]: [...(prev[specNiveau] ?? []), newSpecName.trim()] }))
    setNewSpecName('')
    setSpecAlert('')
  }

  function removeSpec(niveau: string, spec: string) {
    const usedByPromo = promos.some(p => p.niveau === niveau && p.specialite === spec)
    if (usedByPromo) { alert(`"${spec}" est utilisée par une promotion existante. Supprimez d'abord cette promotion.`); return }
    setSpecs(prev => ({ ...prev, [niveau]: (prev[niveau] ?? []).filter(s => s !== spec) }))
  }

  function addPreset(preset: string) {
    const existing = specs[specNiveau] ?? []
    if (existing.includes(preset)) return
    setSpecs(prev => ({ ...prev, [specNiveau]: [...(prev[specNiveau] ?? []), preset] }))
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Promotions</div>
          <div className="page-subtitle">
            {etabType === 'licence'
              ? `${promos.length} niveaux · Licence / Master`
              : `${promos.length} classes · Cycle Ingénieur`}
          </div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Nouvelle promotion</button>
      </div>

      {/* Résumé par niveau avec bouton spécialités */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 28 }}>
        {niveaux.map(n => {
          const cfg   = NIVEAU_CONFIG[n]
          const count = promos.filter(p => p.niveau === n).length
          const hasSpec = canHaveSpec(n, etabType)
          const specCount = (specs[n] ?? []).length
          return (
            <div key={n} className="card" style={{ textAlign: 'center', borderTop: `3px solid ${cfg.color}`, padding: '14px 10px', position: 'relative' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: cfg.color }}>{count}</div>
              <div style={{ fontSize: 11, color: '#8888aa', marginTop: 4, lineHeight: 1.3 }}>{cfg.label}</div>
              {hasSpec && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 10, color: '#8888aa', marginBottom: 4 }}>
                    {specCount} spécialité{specCount !== 1 ? 's' : ''}
                  </div>
                  <button
                    onClick={() => openSpecModal(n)}
                    style={{ fontSize: 10, padding: '3px 10px', borderRadius: 20, border: `1px solid ${cfg.color}`, background: cfg.bg, color: cfg.color, cursor: 'pointer', fontWeight: 600 }}
                  >
                    Gérer
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedPromo ? '380px 1fr' : '1fr', gap: 20, alignItems: 'start' }}>

        {/* Liste promos groupées par niveau */}
        <div>
          {niveaux.map(n => {
            const group = promos.filter(p => p.niveau === n)
            if (group.length === 0) return null
            const cfg = NIVEAU_CONFIG[n]
            return (
              <div key={n} style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a3e' }}>{cfg.label}</div>
                  <span style={{ background: cfg.bg, color: cfg.color, padding: '1px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>{group.length}</span>
                  {canHaveSpec(n, etabType) && (specs[n] ?? []).length > 0 && (
                    <span style={{ fontSize: 10, color: '#8888aa', marginLeft: 4 }}>
                      · {(specs[n] ?? []).length} spécialité{(specs[n] ?? []).length > 1 ? 's' : ''} disponibles
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {group.map(p => {
                    const sc = specColor(p.specialite ?? '')
                    const isSelected = selectedPromo?.id === p.id
                    return (
                      <div key={p.id} onClick={() => setSelectedPromo(isSelected ? null : p)}
                        style={{ background: isSelected ? '#f5f3ff' : '#fff', border: `1.5px solid ${isSelected ? '#5b4fcf' : '#e0e2f0'}`, borderRadius: 10, padding: '12px 14px', cursor: 'pointer', transition: 'all 0.15s' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                          <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                              <span style={{ fontFamily: 'monospace', fontSize: 11, background: '#f0f2f8', color: '#3a3a6a', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>{p.code}</span>
                              <span style={{ fontSize: 10, background: '#f5f5f5', color: '#8888aa', padding: '1px 6px', borderRadius: 4 }}>{p.semestre}</span>
                              {p.specialite && (
                                <span style={{ fontSize: 10, background: sc + '18', color: sc, padding: '1px 8px', borderRadius: 4, fontWeight: 700 }}>{p.specialite}</span>
                              )}
                            </div>
                            <div style={{ fontWeight: 600, fontSize: 13, color: isSelected ? '#5b4fcf' : '#1a1a3e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nom}</div>
                            <div style={{ fontSize: 11, color: '#8888aa', marginTop: 3 }}>{p.matieres.length} matière{p.matieres.length !== 1 ? 's' : ''}</div>
                          </div>
                          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                            <button className="btn-icon" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => openEdit(p)}>Modifier</button>
                            <button className="btn-icon danger" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => handleDelete(p.id)}>Supp.</button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {promos.length === 0 && (
            <div className="card">
              <div className="empty-state">
                <div style={{ fontWeight: 800, fontSize: 20, color: '#5b4fcf', opacity: 0.3, marginBottom: 12 }}>PROMO</div>
                <div>Aucune promotion créée</div>
                <p>Cliquez sur "+ Nouvelle promotion" pour commencer</p>
              </div>
            </div>
          )}
        </div>

        {/* Panneau détail */}
        {selectedPromo && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <button onClick={() => setSelectedPromo(null)} style={{ background: '#f0f2f8', border: '1px solid #e0e2f0', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 12, color: '#3a3a6a', fontWeight: 500 }}>Fermer</button>
              <div>
                <div style={{ fontWeight: 800, fontSize: 17, color: '#1a1a3e' }}>{selectedPromo.nom}</div>
                <div style={{ fontSize: 12, color: '#8888aa', marginTop: 2 }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#3a3a6a' }}>{selectedPromo.code}</span>
                  {selectedPromo.specialite && <> · <span style={{ color: specColor(selectedPromo.specialite), fontWeight: 600 }}>{selectedPromo.specialite}</span></>}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              <span style={{ padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: NIVEAU_CONFIG[selectedPromo.niveau].bg, color: NIVEAU_CONFIG[selectedPromo.niveau].color }}>{NIVEAU_CONFIG[selectedPromo.niveau].label}</span>
              <span className="badge badge-gray">{selectedPromo.semestre}</span>
              <span className="badge badge-blue">{selectedPromo.matieres.length} matières</span>
              {selectedPromo.specialite && <span style={{ padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: specColor(selectedPromo.specialite) + '18', color: specColor(selectedPromo.specialite) }}>{selectedPromo.specialite}</span>}
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #e0e2f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="section-title">Matières — {selectedPromo.code}</div>
                <span className="badge badge-purple">{selectedPromo.matieres.length}</span>
              </div>
              {selectedPromo.matieres.length === 0 ? (
                <div style={{ padding: '32px 20px', textAlign: 'center', color: '#8888aa', fontSize: 13 }}>Aucune matière associée à cette promotion</div>
              ) : (
                <div style={{ padding: '8px 0' }}>
                  {selectedPromo.matieres.map((mat, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: i < selectedPromo.matieres.length - 1 ? '1px solid #f0f2ff' : 'none' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#fafbff')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: '#edeaff', color: '#5b4fcf', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 10, flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</div>
                      <div style={{ fontWeight: 500, fontSize: 13, color: '#1a1a3e' }}>{mat}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ══ Modal: Promotion ══ */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{editItem ? 'Modifier la promotion' : 'Nouvelle promotion'}</div>
              <button className="btn-icon" onClick={() => setShowModal(false)}>X</button>
            </div>
            {alert && <div className="alert alert-error">{alert}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Nom complet</label>
                <input className="input" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} placeholder="Ex: 4ème année — Cloud Computing" />
              </div>
              <div className="form-group">
                <label className="form-label">Code classe</label>
                <input className="input" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="Ex: ING-4-J-CIM" style={{ fontFamily: 'monospace' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Semestre</label>
                <select className="input" value={form.semestre} onChange={e => setForm({ ...form, semestre: e.target.value })}>
                  <option value="S1">Semestre 1</option>
                  <option value="S2">Semestre 2</option>
                  <option value="S1-S2">S1 + S2</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Niveau</label>
                <select className="input" value={form.niveau} onChange={e => setForm({ ...form, niveau: e.target.value, specialite: '' })}>
                  {etabType === 'cycle_ing' ? (
                    <>
                      <option value="1ere">1ère année Prépa</option>
                      <option value="2eme">2ème année Prépa</option>
                      <option value="3eme">3ème Branche commune</option>
                      <option value="4eme">4ème année</option>
                      <option value="5eme">5ème année</option>
                    </>
                  ) : (
                    <>
                      <option value="1ere">1ère Licence</option>
                      <option value="2eme">2ème Licence</option>
                      <option value="3eme">3ème Licence</option>
                      <option value="4eme">Master 1</option>
                      <option value="5eme">Master 2</option>
                    </>
                  )}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value, specialite: '' })}>
                  {etabType === 'cycle_ing' && <option value="prepa">Prépa</option>}
                  {etabType === 'cycle_ing' && <option value="branche_commune">Branche commune</option>}
                  <option value="specialite">Spécialité</option>
                  <option value="general">Général (sans spécialité)</option>
                </select>
              </div>

              {/* Spécialité — uniquement si type=specialite ET niveau avec spécialités */}
              {form.type === 'specialite' && canHaveSpec(form.niveau, etabType) && (
                <div className="form-group">
                  <label className="form-label">
                    Spécialité
                    <span
                      onClick={() => { setShowModal(false); openSpecModal(form.niveau) }}
                      style={{ marginLeft: 8, fontSize: 10, color: '#5b4fcf', cursor: 'pointer', textDecoration: 'underline', fontWeight: 400 }}
                    >
                      + Gérer les spécialités
                    </span>
                  </label>
                  <select className="input" value={form.specialite} onChange={e => setForm({ ...form, specialite: e.target.value })}>
                    <option value="">— Choisir une spécialité —</option>
                    {(specs[form.niveau] ?? []).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {(specs[form.niveau] ?? []).length === 0 && (
                    <div style={{ fontSize: 11, color: '#f39c12', marginTop: 4 }}>
                      Aucune spécialité pour ce niveau. Cliquez sur "Gérer les spécialités" pour en ajouter.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSave}>{editItem ? 'Enregistrer' : 'Créer'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Modal: Gestion des spécialités ══ */}
      {showSpecModal && (
        <div className="modal-overlay" onClick={() => setShowSpecModal(false)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>Spécialités — {NIVEAU_CONFIG[specNiveau]?.label}</div>
                <div style={{ fontSize: 12, color: '#8888aa', marginTop: 2 }}>Gérez les spécialités disponibles pour ce niveau</div>
              </div>
              <button className="btn-icon" onClick={() => setShowSpecModal(false)}>X</button>
            </div>

            {specAlert && <div className="alert alert-error" style={{ marginTop: 12 }}>{specAlert}</div>}

            {/* Liste actuelle */}
            <div style={{ margin: '16px 0', display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
              {(specs[specNiveau] ?? []).length === 0 ? (
                <div style={{ textAlign: 'center', color: '#8888aa', fontSize: 13, padding: '20px 0' }}>
                  Aucune spécialité pour ce niveau
                </div>
              ) : (
                (specs[specNiveau] ?? []).map(s => {
                  const sc = specColor(s)
                  const used = promos.some(p => p.niveau === specNiveau && p.specialite === s)
                  return (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#fafbff', borderRadius: 8, border: '1px solid #e0e2f0' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: sc, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontWeight: 500, fontSize: 13, color: '#1a1a3e' }}>{s}</span>
                      {used && (
                        <span style={{ fontSize: 10, color: '#00b894', fontWeight: 600, background: '#e0faf3', padding: '1px 6px', borderRadius: 4 }}>Utilisée</span>
                      )}
                      <button
                        onClick={() => removeSpec(specNiveau, s)}
                        style={{ background: 'none', border: 'none', cursor: used ? 'not-allowed' : 'pointer', color: used ? '#c0c0d0' : '#e17055', fontSize: 13, fontWeight: 700, padding: '2px 6px' }}
                        title={used ? 'Utilisée par une promotion' : 'Supprimer'}
                        disabled={used}
                      >
                        ✕
                      </button>
                    </div>
                  )
                })
              )}
            </div>

            {/* Ajouter une spécialité */}
            <div className="divider" />
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1a1a3e', marginBottom: 10 }}>Ajouter une spécialité</div>

            {/* Presets */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: '#8888aa', marginBottom: 6 }}>Suggestions rapides :</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {SPEC_PRESETS.filter(p => !(specs[specNiveau] ?? []).includes(p)).map(p => (
                  <button key={p} onClick={() => addPreset(p)}
                    style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, border: '1px solid #e0e2f0', background: '#f5f3ff', color: '#5b4fcf', cursor: 'pointer' }}>
                    + {p}
                  </button>
                ))}
                {SPEC_PRESETS.every(p => (specs[specNiveau] ?? []).includes(p)) && (
                  <span style={{ fontSize: 11, color: '#8888aa' }}>Toutes les suggestions sont déjà ajoutées</span>
                )}
              </div>
            </div>

            {/* Champ libre */}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="input"
                value={newSpecName}
                onChange={e => setNewSpecName(e.target.value)}
                placeholder="Nom de la spécialité personnalisée..."
                onKeyDown={e => { if (e.key === 'Enter') addSpec() }}
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary" onClick={addSpec} style={{ flexShrink: 0 }}>Ajouter</button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn btn-secondary" onClick={() => setShowSpecModal(false)}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
