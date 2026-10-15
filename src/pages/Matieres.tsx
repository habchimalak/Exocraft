import React, { useState } from 'react'
import { useEtab } from '../store/etablissementContext'
import type { Matiere, MatiereDocument } from '../data/mockData'

const TYPE_LABELS: Record<string, string> = {
  cours: 'Cours', examen: 'Examen', exercice: 'Exercice', resume: 'Résumé',
}
const TYPE_COLORS: Record<string, string> = {
  cours: 'badge-blue', examen: 'badge-red', exercice: 'badge-yellow', resume: 'badge-green',
}
const FORMAT_COLORS: Record<string, string> = {
  PDF: 'badge-red', Word: 'badge-blue',
}
const ACCENT = ['#6c5ce7','#4a90e2','#00b894','#f39c12','#e17055','#a29bfe','#fd79a8','#0984e3','#55efc4']

export default function Matieres() {
  const { matieres: initialMatieres, promos, type: etabType } = useEtab()
  const [matieres, setMatieres] = useState<Matiere[]>(initialMatieres)
  const [search, setSearch]     = useState('')
  const [filterPromo, setFilterPromo] = useState('toutes')
  const [selectedMatiere, setSelectedMatiere] = useState<Matiere | null>(null)

  // ── Modal matière ──
  const [showMatiereModal, setShowMatiereModal] = useState(false)
  const [editMatiere, setEditMatiere]           = useState<Matiere | null>(null)
  const [matiereForm, setMatiereForm]           = useState({ nom: '', promoIds: [] as number[] })
  const [matiereAlert, setMatiereAlert]         = useState('')

  // ── Modal document ──
  const [showDocModal, setShowDocModal] = useState(false)
  const [editDoc, setEditDoc]           = useState<MatiereDocument | null>(null)
  const [docForm, setDocForm]           = useState({ titre: '', type: 'cours', promo: '', format: 'PDF' })
  const [fileName, setFileName]         = useState('')
  const [fileData, setFileData]         = useState('')
  const [docAlert, setDocAlert]         = useState('')

  // ── Helpers ──
  function getPromoNames(ids: number[]) {
    return promos.filter(p => ids.includes(p.id)).map(p => p.nom)
  }

  function getNiveauLabel(ids: number[]) {
    if (ids.length === 0) return null
    // Prend le premier niveau associé pour affichage court
    const p = promos.find(p => ids.includes(p.id))
    if (!p) return null
    if (etabType === 'licence') {
      const map: Record<string, string> = { '1ere':'L1', '2eme':'L2', '3eme':'L3', '4eme':'M1', '5eme':'M2' }
      return map[p.niveau] ?? p.code
    }
    return p.code
  }

  function getNiveauColor(ids: number[]) {
    const p = promos.find(pr => ids.includes(pr.id))
    if (!p) return '#9090b0'
    const colors: Record<string, string> = {
      '1ere': '#6c5ce7', '2eme': '#4a90e2', '3eme': '#00b894',
      '4eme': '#f39c12', '5eme': '#e17055',
    }
    return colors[p.niveau] ?? '#6c5ce7'
  }

  // ── Filtered list ──
  const filtered = matieres.filter(m => {
    const matchSearch = m.nom.toLowerCase().includes(search.toLowerCase())
    const matchPromo  = filterPromo === 'toutes' || m.promoIds.includes(Number(filterPromo))
    return matchSearch && matchPromo
  })

  // ── Matière CRUD ──
  function openCreateMatiere() {
    setEditMatiere(null)
    setMatiereForm({ nom: '', promoIds: [] })
    setMatiereAlert('')
    setShowMatiereModal(true)
  }

  function openEditMatiere(m: Matiere) {
    setEditMatiere(m)
    setMatiereForm({ nom: m.nom, promoIds: m.promoIds })
    setMatiereAlert('')
    setShowMatiereModal(true)
  }

  function togglePromoCheck(id: number) {
    setMatiereForm(prev => ({
      ...prev,
      promoIds: prev.promoIds.includes(id)
        ? prev.promoIds.filter(x => x !== id)
        : [...prev.promoIds, id],
    }))
  }

  function saveMatiere() {
    if (!matiereForm.nom.trim()) { setMatiereAlert('Le nom est requis.'); return }
    if (matiereForm.promoIds.length === 0) { setMatiereAlert('Sélectionnez au moins un niveau.'); return }

    if (editMatiere) {
      setMatieres(prev => prev.map(m =>
        m.id === editMatiere.id
          ? { ...m, nom: matiereForm.nom, promoIds: matiereForm.promoIds }
          : m
      ))
      if (selectedMatiere?.id === editMatiere.id)
        setSelectedMatiere(prev => prev
          ? { ...prev, nom: matiereForm.nom, promoIds: matiereForm.promoIds }
          : null
        )
    } else {
      const newM: Matiere = {
        id: Date.now(), nom: matiereForm.nom,
        enseignantsCount: 0, documents: [],
        promoIds: matiereForm.promoIds,
      }
      setMatieres(prev => [...prev, newM])
    }
    setShowMatiereModal(false)
  }

  function deleteMatiere(id: number) {
    if (!window.confirm('Supprimer cette matière et tous ses documents ?')) return
    setMatieres(prev => prev.filter(m => m.id !== id))
    if (selectedMatiere?.id === id) setSelectedMatiere(null)
  }

  // ── Document CRUD ──
  function openAddDoc() {
    setEditDoc(null)
    setDocForm({ titre: '', type: 'cours', promo: '', format: 'PDF' })
    setFileName(''); setFileData(''); setDocAlert('')
    setShowDocModal(true)
  }

  function openEditDoc(doc: MatiereDocument) {
    setEditDoc(doc)
    setDocForm({ titre: doc.titre, type: doc.type, promo: doc.promo, format: doc.format })
    setFileName(doc.fileName); setFileData(doc.fileData ?? ''); setDocAlert('')
    setShowDocModal(true)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const ext = file.name.split('.').pop()?.toLowerCase()
    setDocForm(prev => ({
      ...prev,
      format: ext === 'pdf' ? 'PDF' : 'Word',
      titre: prev.titre || file.name.replace(/\.[^.]+$/, ''),
    }))
    const reader = new FileReader()
    reader.onload = ev => setFileData(ev.target?.result as string ?? '')
    reader.readAsDataURL(file)
  }

  function saveDoc() {
    if (!docForm.titre.trim()) { setDocAlert('Le titre est requis.'); return }
    if (!docForm.promo)        { setDocAlert('Choisissez une promotion.'); return }
    if (!fileName && !editDoc) { setDocAlert('Sélectionnez un fichier.'); return }
    const now = new Date().toISOString().split('T')[0]

    const updater = (m: Matiere): Matiere => {
      if (m.id !== selectedMatiere?.id) return m
      if (editDoc) {
        return { ...m, documents: m.documents.map(d => d.id === editDoc.id
          ? { ...d, titre: docForm.titre, type: docForm.type as MatiereDocument['type'],
              promo: docForm.promo, format: docForm.format as 'PDF'|'Word',
              fileName: fileName || d.fileName, fileData: fileData || d.fileData }
          : d) }
      }
      return { ...m, documents: [...m.documents, {
        id: Date.now(), titre: docForm.titre,
        type: docForm.type as MatiereDocument['type'],
        format: docForm.format as 'PDF'|'Word',
        fileName, size: '—', uploadedAt: now, promo: docForm.promo, fileData,
      }]}
    }

    setMatieres(prev => prev.map(updater))
    setSelectedMatiere(prev => prev ? updater(prev) : null)
    setShowDocModal(false)
  }

  function deleteDoc(docId: number) {
    if (!window.confirm('Supprimer ce document ?')) return
    const updater = (m: Matiere): Matiere =>
      m.id === selectedMatiere?.id
        ? { ...m, documents: m.documents.filter(d => d.id !== docId) }
        : m
    setMatieres(prev => prev.map(updater))
    setSelectedMatiere(prev => prev ? updater(prev) : null)
  }

  function downloadDoc(doc: MatiereDocument) {
    if (!doc.fileData) { alert('Aucun fichier disponible.'); return }
    const a = document.createElement('a')
    a.href = doc.fileData; a.download = doc.fileName; a.click()
  }

  // ── Render ──
  return (
    <div style={{ display: 'grid', gridTemplateColumns: selectedMatiere ? '340px 1fr' : '1fr', gap: 20, alignItems: 'start' }}>

      {/* ══ LEFT: liste matières ══ */}
      <div>
        <div className="page-header" style={{ marginBottom: 16 }}>
          <div>
            <div className="page-title">Matières</div>
            <div className="page-subtitle">{matieres.length} matière{matieres.length !== 1 ? 's' : ''}</div>
          </div>
          <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={openCreateMatiere}>
            + Nouvelle matière
          </button>
        </div>

        {/* Filtres */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <div className="search-bar" style={{ flex: 1 }}>
            <i className="search-icon" style={{ fontStyle: 'normal' }}>&#128269;</i>
            <input className="input" placeholder="Rechercher..." value={search}
              onChange={e => setSearch(e.target.value)} />
          </div>
          <select
            className="input" style={{ width: 160 }}
            value={filterPromo} onChange={e => setFilterPromo(e.target.value)}
          >
            <option value="toutes">Tous niveaux</option>
            {promos.map(p => (
              <option key={p.id} value={String(p.id)}>{p.nom}</option>
            ))}
          </select>
        </div>

        {/* Liste */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.length === 0 ? (
            <div className="empty-state" style={{ padding: 30 }}>
              <div className="empty-icon" style={{ fontWeight: 800, fontSize: 24 }}>M</div>
              <div>Aucune matière trouvée</div>
              {etabType === 'licence' && matieres.length === 0 && (
                <p style={{ marginTop: 8 }}>Commencez par créer des matières pour chaque niveau</p>
              )}
            </div>
          ) : filtered.map((m, i) => {
            const niveauLabel = getNiveauLabel(m.promoIds)
            const niveauColor = getNiveauColor(m.promoIds)
            const isSelected  = selectedMatiere?.id === m.id

            return (
              <div
                key={m.id}
                onClick={() => setSelectedMatiere(isSelected ? null : m)}
                style={{
                  background: isSelected ? '#f5f3ff' : '#fff',
                  border: `1.5px solid ${isSelected ? '#6c5ce7' : '#e4e6f0'}`,
                  borderRadius: 10, padding: '12px 14px', cursor: 'pointer',
                  transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 12,
                }}
              >
                {/* Initiale colorée */}
                <div style={{
                  width: 38, height: 38, borderRadius: 8, flexShrink: 0,
                  background: ACCENT[i % ACCENT.length] + '20',
                  color: ACCENT[i % ACCENT.length],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 15,
                }}>
                  {m.nom.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{
                    fontWeight: 600, fontSize: 13,
                    color: isSelected ? '#6c5ce7' : '#1a1a2e',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {m.nom}
                  </div>

                  {/* Niveaux associés */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                    {m.promoIds.length === 0 ? (
                      <span style={{ fontSize: 10, color: '#e17055', background: '#fff0ee', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>
                        Aucun niveau
                      </span>
                    ) : (
                      <>
                        {getPromoNames(m.promoIds).slice(0, 2).map((nom, j) => (
                          <span key={j} style={{
                            fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4,
                            background: niveauColor + '18', color: niveauColor,
                          }}>
                            {nom}
                          </span>
                        ))}
                        {m.promoIds.length > 2 && (
                          <span style={{ fontSize: 10, color: '#9090b0' }}>
                            +{m.promoIds.length - 2} autre{m.promoIds.length - 2 > 1 ? 's' : ''}
                          </span>
                        )}
                      </>
                    )}
                    <span style={{ fontSize: 10, color: '#9090b0', marginLeft: 2 }}>
                      · {m.documents.length} doc{m.documents.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                  <button className="btn-icon" style={{ padding: '4px 8px', fontSize: 11 }}
                    onClick={() => openEditMatiere(m)}>Modifier</button>
                  <button className="btn-icon danger" style={{ padding: '4px 8px', fontSize: 11 }}
                    onClick={() => deleteMatiere(m.id)}>Supp.</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ══ RIGHT: documents ══ */}
      {selectedMatiere && (
        <div>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <button onClick={() => setSelectedMatiere(null)}
                  style={{ background: '#f0f2f8', border: '1px solid #e4e6f0', borderRadius: 6,
                    padding: '5px 12px', cursor: 'pointer', fontSize: 12, color: '#4a4a6a', fontWeight: 500 }}>
                  ← Retour
                </button>
                <div style={{ fontWeight: 800, fontSize: 18, color: '#1a1a2e' }}>{selectedMatiere.nom}</div>
              </div>
              {/* Niveaux de cette matière */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {getPromoNames(selectedMatiere.promoIds).map((nom, i) => (
                  <span key={i} style={{
                    fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                    background: getNiveauColor(selectedMatiere.promoIds) + '18',
                    color: getNiveauColor(selectedMatiere.promoIds),
                  }}>{nom}</span>
                ))}
                <span style={{ fontSize: 11, color: '#9090b0', alignSelf: 'center' }}>
                  · {selectedMatiere.documents.length} document{selectedMatiere.documents.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <button className="btn btn-primary" onClick={openAddDoc}>+ Ajouter un document</button>
          </div>

          {/* Table documents */}
          {selectedMatiere.documents.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div style={{ fontSize: 36, color: '#6c5ce7', opacity: 0.25, fontWeight: 800, marginBottom: 12 }}>DOC</div>
                <div style={{ fontWeight: 600, color: '#4a4a6a' }}>Aucun document pour cette matière</div>
                <p>Déposez un PDF ou Word pour le mettre à disposition des enseignants</p>
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openAddDoc}>
                  + Ajouter le premier document
                </button>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Titre du document</th>
                    <th>Type</th>
                    <th>Format</th>
                    <th>Promotion</th>
                    <th>Ajouté le</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedMatiere.documents.map(doc => (
                    <tr key={doc.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#1a1a2e', fontSize: 13 }}>{doc.titre}</div>
                        <div style={{ fontSize: 11, color: '#9090b0', marginTop: 2 }}>{doc.fileName}</div>
                      </td>
                      <td><span className={`badge ${TYPE_COLORS[doc.type]}`}>{TYPE_LABELS[doc.type]}</span></td>
                      <td><span className={`badge ${FORMAT_COLORS[doc.format]}`}>{doc.format}</span></td>
                      <td style={{ fontSize: 12, color: '#4a4a6a' }}>{doc.promo}</td>
                      <td style={{ fontSize: 12, color: '#9090b0' }}>{doc.uploadedAt}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn-icon" style={{ padding: '5px 10px', fontSize: 11 }}
                            onClick={() => downloadDoc(doc)}>Télécharger</button>
                          <button className="btn-icon" style={{ padding: '5px 10px', fontSize: 11 }}
                            onClick={() => openEditDoc(doc)}>Modifier</button>
                          <button className="btn-icon danger" style={{ padding: '5px 10px', fontSize: 11 }}
                            onClick={() => deleteDoc(doc.id)}>Supprimer</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ══ MODAL: Matière ══ */}
      {showMatiereModal && (
        <div className="modal-overlay" onClick={() => setShowMatiereModal(false)}>
          <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>
                {editMatiere ? 'Modifier la matière' : 'Nouvelle matière'}
              </div>
              <button className="btn-icon" onClick={() => setShowMatiereModal(false)}>X</button>
            </div>

            {matiereAlert && <div className="alert alert-error">{matiereAlert}</div>}

            <div className="form-group">
              <label className="form-label">Nom de la matière</label>
              <input className="input" value={matiereForm.nom} autoFocus
                onChange={e => setMatiereForm(f => ({ ...f, nom: e.target.value }))}
                placeholder="Ex: Cloud Computing" />
            </div>

            {/* Sélection des niveaux/promotions */}
            <div className="form-group">
              <label className="form-label">
                Niveau(x) associé(s)
                <span style={{ color: '#9090b0', fontWeight: 400, marginLeft: 6 }}>
                  ({matiereForm.promoIds.length} sélectionné{matiereForm.promoIds.length > 1 ? 's' : ''})
                </span>
              </label>

              {promos.length === 0 ? (
                <div style={{ padding: '10px 12px', background: '#fff8e6', border: '1px solid #ffe0b2', borderRadius: 8, fontSize: 12, color: '#e67e22' }}>
                  Aucune promotion disponible — créez d'abord des promotions
                </div>
              ) : (
                <div style={{
                  border: '1.5px solid #e4e6f0', borderRadius: 8, overflow: 'hidden',
                  maxHeight: 240, overflowY: 'auto',
                }}>
                  {promos.map((p, i) => {
                    const checked = matiereForm.promoIds.includes(p.id)
                    const colors: Record<string, string> = {
                      '1ere': '#6c5ce7', '2eme': '#4a90e2', '3eme': '#00b894',
                      '4eme': '#f39c12', '5eme': '#e17055',
                    }
                    const col = colors[p.niveau] ?? '#6c5ce7'
                    return (
                      <label key={p.id} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 14px', cursor: 'pointer',
                        background: checked ? col + '0d' : i % 2 === 0 ? '#fff' : '#fafbff',
                        borderBottom: i < promos.length - 1 ? '1px solid #f0f2f8' : 'none',
                        transition: 'background 0.15s',
                      }}>
                        <input
                          type="checkbox" checked={checked}
                          onChange={() => togglePromoCheck(p.id)}
                          style={{ accentColor: col, width: 15, height: 15, flexShrink: 0 }}
                        />
                        {/* Indicateur couleur niveau */}
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: col, flexShrink: 0 }} />
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div style={{ fontWeight: checked ? 600 : 400, fontSize: 13, color: checked ? col : '#1a1a2e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {p.nom}
                          </div>
                          <div style={{ fontSize: 10, color: '#9090b0', marginTop: 1 }}>
                            <span style={{ fontFamily: 'monospace', background: '#f0f2f8', padding: '0 4px', borderRadius: 3 }}>{p.code}</span>
                            {p.specialite && <> · {p.specialite}</>}
                          </div>
                        </div>
                        {checked && <span style={{ fontSize: 12, color: col, fontWeight: 700 }}>✓</span>}
                      </label>
                    )
                  })}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn btn-secondary" onClick={() => setShowMatiereModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={saveMatiere}>
                {editMatiere ? 'Enregistrer' : 'Créer la matière'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: Document ══ */}
      {showDocModal && (
        <div className="modal-overlay" onClick={() => setShowDocModal(false)}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>
                  {editDoc ? 'Modifier le document' : 'Ajouter un document'}
                </div>
                <div style={{ fontSize: 12, color: '#9090b0', marginTop: 2 }}>{selectedMatiere?.nom}</div>
              </div>
              <button className="btn-icon" onClick={() => setShowDocModal(false)}>X</button>
            </div>

            {docAlert && <div className="alert alert-error">{docAlert}</div>}

            {/* Upload */}
            <label style={{ display: 'block', marginBottom: 16 }}>
              <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleFileChange} />
              <div className="upload-zone">
                {fileName ? (
                  <div className="file-info">
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: '#6c5ce7' }}>
                        {fileName.toLowerCase().endsWith('.pdf') ? 'PDF' : 'DOC'}
                      </span>
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#1a1a2e', fontSize: 13 }}>{fileName}</div>
                      <div style={{ color: '#00b894', fontSize: 12, marginTop: 2 }}>Fichier sélectionné ✓</div>
                    </div>
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: '#9090b0' }}>Changer</span>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#6c5ce7', opacity: 0.35, marginBottom: 8 }}>PDF / DOC</div>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Cliquer pour sélectionner un fichier</div>
                    <div style={{ fontSize: 11, color: '#9090b0' }}>PDF, Word (.docx) — max 20 Mo</div>
                  </div>
                )}
              </div>
            </label>

            <div className="form-group">
              <label className="form-label">Titre</label>
              <input className="input" value={docForm.titre}
                onChange={e => setDocForm(f => ({ ...f, titre: e.target.value }))}
                placeholder="Ex: Cours Introduction Cloud 2024" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="input" value={docForm.type} onChange={e => setDocForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="cours">Cours</option>
                  <option value="examen">Examen</option>
                  <option value="exercice">Exercice</option>
                  <option value="resume">Résumé</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Format</label>
                <select className="input" value={docForm.format} onChange={e => setDocForm(f => ({ ...f, format: e.target.value }))}>
                  <option value="PDF">PDF</option>
                  <option value="Word">Word (.docx)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Promotion concernée</label>
              <select className="input" value={docForm.promo} onChange={e => setDocForm(f => ({ ...f, promo: e.target.value }))}>
                <option value="">— Choisir —</option>
                {/* Affiche en priorité les promos de cette matière */}
                {promos
                  .filter(p => selectedMatiere?.promoIds.includes(p.id))
                  .map(p => <option key={p.id} value={p.nom}>{p.nom}</option>)
                }
                {promos
                  .filter(p => !selectedMatiere?.promoIds.includes(p.id))
                  .map(p => <option key={p.id} value={p.nom} style={{ color: '#9090b0' }}>{p.nom}</option>)
                }
              </select>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn btn-secondary" onClick={() => setShowDocModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={saveDoc}>
                {editDoc ? 'Enregistrer' : 'Déposer le document'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
