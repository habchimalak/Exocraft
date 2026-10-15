import React, { useState, useRef } from 'react'
import { formatDateTime, timeAgo, useStore } from '../store/appStore'
import { useProfileStore, useProfile } from '../store/profileStore'
// ── Validation mot de passe ──
interface PwdRule { label: string; test: (v: string) => boolean }
const PWD_RULES: PwdRule[] = [
  { label: 'Au moins 8 caractères',              test: v => v.length >= 8 },
  { label: 'Une lettre majuscule (A-Z)',          test: v => /[A-Z]/.test(v) },
  { label: 'Une lettre minuscule (a-z)',          test: v => /[a-z]/.test(v) },
  { label: 'Un chiffre (0-9)',                   test: v => /[0-9]/.test(v) },
  { label: 'Un caractère spécial (!@#$%^&*...)', test: v => /[^A-Za-z0-9]/.test(v) },
]

function pwdStrength(v: string): { score: number; label: string; color: string } {
  const score = PWD_RULES.filter(r => r.test(v)).length
  if (score <= 1) return { score, label: 'Très faible', color: '#e17055' }
  if (score === 2) return { score, label: 'Faible',      color: '#f39c12' }
  if (score === 3) return { score, label: 'Moyen',       color: '#fdcb6e' }
  if (score === 4) return { score, label: 'Fort',        color: '#00b894' }
  return { score, label: 'Très fort', color: '#00b894' }
}

interface AdminNote {
  id: number
  author: string
  authorInitials: string
  authorColor: string
  content: string
  createdAt: string
  pinned: boolean
  tag: 'info' | 'urgent' | 'todo' | 'done'
}

const OTHER_ADMINS: { id: number; nom: string; prenom: string; color: string; initials: string; poste: string; online: boolean }[] = [
  // Vide — un seul admin par fac
  // Sera rempli quand d'autres admins seront ajoutés via la page Utilisateurs
]

const TAG_CONFIG = {
  info:   { label: 'Info',    color: '#4a90e2', bg: '#e8f2ff' },
  urgent: { label: 'Urgent',  color: '#e17055', bg: '#fff0ee' },
  todo:   { label: 'À faire', color: '#f39c12', bg: '#fff8e6' },
  done:   { label: 'Fait',    color: '#00b894', bg: '#e6faf5' },
}

const INITIAL_NOTES: AdminNote[] = [
  { id: 1, author: 'Vous', authorInitials: 'AD', authorColor: '#5b4fcf', content: 'Vérifier les associations enseignants ↔ matières une fois les enseignants ajoutés.', createdAt: new Date(Date.now() - 86400000).toISOString(), pinned: false, tag: 'todo' },
]

export default function Profile() {
  const profileStoreCtx = useProfileStore()
  const profile = useProfile()
  const { users } = useStore()
  const otherAdmins = users.filter(u => u.role === 'admin' && u.id !== 1)
  const otherAdmins = users.filter(u => u.role === 'admin' && u.id !== 1)
  const [editMode, setEditMode]   = useState(false)
  const [editForm, setEditForm]   = useState(profile)
  const [saveAlert, setSaveAlert] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // ── Notes ──
  const [notes, setNotes]         = useState<AdminNote[]>(INITIAL_NOTES)
  const [newNote, setNewNote]     = useState('')
  const [newTag, setNewTag]       = useState<AdminNote['tag']>('info')
  const [filterTag, setFilterTag] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'profile' | 'notes'>('profile')

  // ── Changement mot de passe ──
  const [showPwdModal, setShowPwdModal]   = useState(false)
  const [pwdForm, setPwdForm]             = useState({ current: '', next: '', confirm: '' })
  const [showCurrent, setShowCurrent]     = useState(false)
  const [showNext, setShowNext]           = useState(false)
  const [showConfirm, setShowConfirm]     = useState(false)
  const [pwdAlert, setPwdAlert]           = useState<{ type: 'error'|'success'; msg: string } | null>(null)
  const [pwdChanged, setPwdChanged]       = useState<string | null>(null)  // date dernier changement

  const strength = pwdStrength(pwdForm.next)

  function submitPwd() {
    setPwdAlert(null)
    if (!pwdForm.current) { setPwdAlert({ type: 'error', msg: 'Entrez votre mot de passe actuel.' }); return }
    if (pwdForm.current.length < 4) { setPwdAlert({ type: 'error', msg: 'Mot de passe actuel incorrect.' }); return }
    const failed = PWD_RULES.filter(r => !r.test(pwdForm.next))
    if (failed.length > 0) { setPwdAlert({ type: 'error', msg: `Règle non respectée : ${failed[0].label}` }); return }
    if (pwdForm.next !== pwdForm.confirm) { setPwdAlert({ type: 'error', msg: 'Les mots de passe ne correspondent pas.' }); return }
    if (pwdForm.next === pwdForm.current)  { setPwdAlert({ type: 'error', msg: 'Le nouveau mot de passe doit être différent.' }); return }
    // ✅ Succès
    setPwdChanged(new Date().toLocaleDateString('fr-FR'))
    setPwdAlert({ type: 'success', msg: 'Mot de passe modifié avec succès !' })
    setTimeout(() => { setShowPwdModal(false); setPwdForm({ current: '', next: '', confirm: '' }); setPwdAlert(null) }, 1800)
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const avatar = ev.target?.result as string
      profileStoreCtx.update({ avatar })
      setEditForm(f => ({ ...f, avatar }))
    }
    reader.readAsDataURL(file)
  }

  function saveProfile() {
    profileStoreCtx.update(editForm)
    setEditMode(false)
    setSaveAlert('Profil mis à jour !')
    setTimeout(() => setSaveAlert(''), 3000)
  }

  function cancelEdit() {
    setEditForm(profile)
    setEditMode(false)
  }

  function addNote() {
    if (!newNote.trim()) return
    const note: AdminNote = {
      id: Date.now(), author: 'Vous', authorInitials: 'AD', authorColor: '#5b4fcf',
      content: newNote.trim(), createdAt: new Date().toISOString(),
      pinned: false, tag: newTag,
    }
    setNotes(prev => [note, ...prev])
    setNewNote('')
  }

  function deleteNote(id: number) { setNotes(prev => prev.filter(n => n.id !== id)) }
  function togglePin(id: number)  { setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n)) }

  const filteredNotes = notes
    .filter(n => filterTag === 'all' || n.tag === filterTag)
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))

  const fields = [
    { label: 'Prénom',        key: 'prenom' as const },
    { label: 'Nom',           key: 'nom' as const },
    { label: 'Email',         key: 'email' as const },
    { label: 'Téléphone',     key: 'telephone' as const },
    { label: 'Poste',         key: 'poste' as const },
    { label: 'Département',   key: 'departement' as const },
    { label: 'Établissement', key: 'etablissement' as const, full: true },
  ]

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Mon profil</div>
          <div className="page-subtitle">Gérez vos informations et vos notes partagées</div>
        </div>
        {saveAlert && <div className="alert alert-success" style={{ margin: 0, padding: '8px 16px' }}>{saveAlert}</div>}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '2px solid #e0e2f0' }}>
        {[
          { key: 'profile', label: 'Profil' },
          { key: 'notes',   label: 'Notes partagées', count: notes.length },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as 'profile' | 'notes')}
            style={{ padding: '10px 20px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 14, fontWeight: activeTab === tab.key ? 700 : 500, color: activeTab === tab.key ? '#5b4fcf' : '#8888aa', borderBottom: activeTab === tab.key ? '2px solid #5b4fcf' : '2px solid transparent', marginBottom: -2, display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s' }}>
            {tab.label}
            {tab.count !== undefined && (
              <span style={{ background: activeTab === tab.key ? '#5b4fcf' : '#e0e2f0', color: activeTab === tab.key ? '#fff' : '#8888aa', borderRadius: 20, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ══ PROFIL ══ */}
      {activeTab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, alignItems: 'start' }}>

          {/* Avatar card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{ textAlign: 'center', padding: '28px 20px' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
                <div style={{ width: 96, height: 96, borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg,#5b4fcf,#4a90e2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', border: '3px solid #e0e2f0', boxShadow: '0 4px 16px rgba(91,79,207,0.2)' }}>
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: '#fff', fontWeight: 800, fontSize: 28 }}>
                      {profile.prenom[0]}{profile.nom[0]}
                    </span>
                  )}
                </div>
                <button onClick={() => fileRef.current?.click()} style={{ position: 'absolute', bottom: 2, right: 2, width: 26, height: 26, borderRadius: '50%', background: '#5b4fcf', border: '2px solid #fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontWeight: 700 }} title="Changer la photo">✎</button>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
              </div>

              {/* Nom mis à jour depuis le store */}
              <div style={{ fontWeight: 800, fontSize: 16, color: '#1a1a3e' }}>{profile.prenom} {profile.nom}</div>
              <div style={{ fontSize: 12, color: '#5b4fcf', fontWeight: 600, marginTop: 4 }}>{profile.poste}</div>
              <div style={{ fontSize: 12, color: '#8888aa', marginTop: 2 }}>{profile.departement}</div>

              <div className="divider" />
              <div style={{ fontSize: 12, color: '#3a3a6a', lineHeight: 1.9, textAlign: 'left' }}>
                <div>✉ {profile.email}</div>
                <div>📞 {profile.telephone}</div>
                <div>🏛 {profile.etablissement}</div>
              </div>
            </div>

            {/* Autres admins */}
            <div className="card">
              <div className="section-title" style={{ marginBottom: 14 }}>Admins dans cette fac</div>
              {otherAdmins.length === 0 ? (
                <div style={{ fontSize: 12, color: '#8888aa', textAlign: 'center', padding: '12px 0' }}>
                  Vous êtes le seul administrateur.<br />
                  <span style={{ fontSize: 11 }}>Vous pouvez promouvoir un enseignant depuis la page Utilisateurs.</span>
                </div>
              ) : (
                otherAdmins.map((a, i) => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div className="avatar" style={{ background: ['#4a90e2','#00b894','#f39c12'][i % 3], width: 34, height: 34, fontSize: 12 }}>
                      {a.prenom[0]}{a.nom[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#1a1a3e' }}>{a.prenom} {a.nom}</div>
                      <div style={{ fontSize: 11, color: '#8888aa' }}>{a.email}</div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, color: a.status === 'actif' ? '#00b894' : '#8888aa' }}>
                      {a.status === 'actif' ? '● Actif' : '○ Inactif'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Infos + bio */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div className="section-title">Informations personnelles</div>
                {!editMode ? (
                  <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => { setEditForm({...profile}); setEditMode(true) }}>✎ Modifier</button>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={cancelEdit}>Annuler</button>
                    <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={saveProfile}>Enregistrer</button>
                  </div>
                )}
              </div>

              {!editMode ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  {fields.map((f, i) => (
                    <div key={i} style={f.full ? { gridColumn: '1/-1' } : {}}>
                      <div style={{ fontSize: 11, color: '#8888aa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{f.label}</div>
                      <div style={{ fontSize: 14, color: '#1a1a3e', fontWeight: 500 }}>{profile[f.key] as string}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {fields.map((f, i) => (
                    <div key={i} className="form-group" style={{ ...(f.full ? { gridColumn: '1/-1' } : {}), margin: 0 }}>
                      <label className="form-label">{f.label}</label>
                      <input className="input" value={editForm[f.key] as string}
                        onChange={e => setEditForm(prev => ({ ...prev, [f.key]: e.target.value }))} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div className="section-title">Bio / Description</div>
              </div>
              {!editMode ? (
                <p style={{ fontSize: 13, color: '#3a3a6a', lineHeight: 1.7, margin: 0 }}>
                  {profile.bio || <span style={{ color: '#8888aa' }}>Aucune description.</span>}
                </p>
              ) : (
                <textarea className="input" value={editForm.bio}
                  onChange={e => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3} placeholder="Décrivez votre rôle..." style={{ resize: 'vertical', minHeight: 80 }} />
              )}
            </div>

            <div className="card">
              <div className="section-title" style={{ marginBottom: 14 }}>Sécurité</div>
              {[
                { label: 'Mot de passe', sub: pwdChanged ? `Dernière modification le ${pwdChanged}` : 'Dernière modification il y a 30 jours', btn: 'Changer', action: () => { setPwdForm({ current:'',next:'',confirm:'' }); setPwdAlert(null); setShowPwdModal(true) } },
                { label: 'Double authentification', sub: 'Non activée', btn: 'Activer', action: () => {} },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i === 0 ? '1px solid #f0f2ff' : 'none' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a3e' }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: '#8888aa', marginTop: 2 }}>{item.sub}</div>
                  </div>
                  <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={item.action}>{item.btn}</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ NOTES ══ */}
      {activeTab === 'notes' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
          <div>
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="section-title" style={{ marginBottom: 14 }}>Nouvelle note</div>
              <textarea className="input" value={newNote} onChange={e => setNewNote(e.target.value)}
                placeholder="Écrivez une note visible par tous les admins..." rows={3}
                style={{ resize: 'vertical', marginBottom: 12, minHeight: 80 }}
                onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') addNote() }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {(Object.entries(TAG_CONFIG) as [AdminNote['tag'], typeof TAG_CONFIG[keyof typeof TAG_CONFIG]][]).map(([key, cfg]) => (
                    <button key={key} onClick={() => setNewTag(key)} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, border: `1.5px solid ${newTag === key ? cfg.color : '#e0e2f0'}`, background: newTag === key ? cfg.bg : '#fff', color: newTag === key ? cfg.color : '#8888aa', cursor: 'pointer' }}>{cfg.label}</button>
                  ))}
                </div>
                <button className="btn btn-primary" style={{ fontSize: 13 }} onClick={addNote}>Publier</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
              <button onClick={() => setFilterTag('all')} style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: `1.5px solid ${filterTag === 'all' ? '#5b4fcf' : '#e0e2f0'}`, background: filterTag === 'all' ? '#edeaff' : '#fff', color: filterTag === 'all' ? '#5b4fcf' : '#8888aa', cursor: 'pointer' }}>Toutes ({notes.length})</button>
              {(Object.entries(TAG_CONFIG) as [AdminNote['tag'], typeof TAG_CONFIG[keyof typeof TAG_CONFIG]][]).map(([key, cfg]) => {
                const count = notes.filter(n => n.tag === key).length
                if (!count) return null
                return <button key={key} onClick={() => setFilterTag(key)} style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: `1.5px solid ${filterTag === key ? cfg.color : '#e0e2f0'}`, background: filterTag === key ? cfg.bg : '#fff', color: filterTag === key ? cfg.color : '#8888aa', cursor: 'pointer' }}>{cfg.label} ({count})</button>
              })}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredNotes.map(note => {
                const cfg = TAG_CONFIG[note.tag]
                return (
                  <div key={note.id} className="card" style={{ borderLeft: `3px solid ${note.pinned ? '#f39c12' : cfg.color}`, background: note.pinned ? '#fffdf0' : '#fff', position: 'relative' }}>
                    {note.pinned && <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 11, color: '#f39c12', fontWeight: 700 }}>📌 Épinglée</div>}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div className="avatar" style={{ background: note.authorColor, width: 30, height: 30, fontSize: 11 }}>{note.authorInitials}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#1a1a3e' }}>{note.author}</div>
                        <div style={{ fontSize: 11, color: '#8888aa' }}>{formatDateTime(note.createdAt)}</div>
                      </div>
                      <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                    </div>
                    <p style={{ fontSize: 13, color: '#3a3a6a', lineHeight: 1.7, margin: 0 }}>{note.content}</p>
                    <div style={{ display: 'flex', gap: 8, marginTop: 12, paddingTop: 10, borderTop: '1px solid #f0f2ff' }}>
                      <button className="btn-icon" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => togglePin(note.id)}>{note.pinned ? 'Désépingler' : 'Épingler'}</button>
                      {note.author === 'Vous' && <button className="btn-icon danger" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => deleteNote(note.id)}>Supprimer</button>}
                      <span style={{ marginLeft: 'auto', fontSize: 11, color: '#8888aa', alignSelf: 'center' }}>{timeAgo(note.createdAt)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="section-title" style={{ marginBottom: 14 }}>Participants</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#f5f3ff', borderRadius: 8, border: '1.5px solid #edeaff' }}>
                  <div className="avatar" style={{ background: '#5b4fcf', width: 32, height: 32, fontSize: 11 }}>
                    {profile.prenom[0]}{profile.nom[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#5b4fcf' }}>Vous</div>
                    <div style={{ fontSize: 11, color: '#8888aa' }}>{profile.poste}</div>
                  </div>
                  <span style={{ fontSize: 10, color: '#00b894', fontWeight: 600 }}>● En ligne</span>
                </div>
                {otherAdmins.map((a, i) => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#fafbff', borderRadius: 8, border: '1px solid #e0e2f0' }}>
                    <div className="avatar" style={{ background: ['#4a90e2','#00b894','#f39c12'][i % 3], width: 32, height: 32, fontSize: 11 }}>
                      {a.prenom[0]}{a.nom[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a3e' }}>{a.prenom} {a.nom}</div>
                      <div style={{ fontSize: 11, color: '#8888aa' }}>{a.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="section-title" style={{ marginBottom: 14 }}>Résumé</div>
              {(Object.entries(TAG_CONFIG) as [AdminNote['tag'], typeof TAG_CONFIG[keyof typeof TAG_CONFIG]][]).map(([key, cfg]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 12, color: '#3a3a6a' }}>{cfg.label}</span>
                  <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: cfg.bg, color: cfg.color }}>{notes.filter(n => n.tag === key).length}</span>
                </div>
              ))}
              <div className="divider" />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#3a3a6a' }}>Épinglées</span>
                <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: '#fff8e6', color: '#f39c12' }}>{notes.filter(n => n.pinned).length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL : Changement de mot de passe ══ */}
      {showPwdModal && (
        <div className="modal-overlay" onClick={() => setShowPwdModal(false)}>
          <div className="modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a3e' }}>Changer le mot de passe</div>
                <div style={{ fontSize: 12, color: '#8888aa', marginTop: 2 }}>Respectez toutes les règles de sécurité</div>
              </div>
              <button className="btn-icon" onClick={() => setShowPwdModal(false)} style={{ fontSize: 14, padding: '4px 10px' }}>✕</button>
            </div>

            {/* Alert */}
            {pwdAlert && (
              <div className={`alert ${pwdAlert.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 16 }}>
                {pwdAlert.type === 'success' ? '✓' : '⚠'} {pwdAlert.msg}
              </div>
            )}

            {/* Mot de passe actuel */}
            <div className="form-group">
              <label className="form-label">Mot de passe actuel</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showCurrent ? 'text' : 'password'}
                  value={pwdForm.current}
                  onChange={e => setPwdForm(f => ({ ...f, current: e.target.value }))}
                  placeholder="Votre mot de passe actuel"
                  style={{ paddingRight: 42 }}
                />
                <button type="button" onClick={() => setShowCurrent(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#8888aa' }}>
                  {showCurrent ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Nouveau mot de passe */}
            <div className="form-group">
              <label className="form-label">Nouveau mot de passe</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showNext ? 'text' : 'password'}
                  value={pwdForm.next}
                  onChange={e => setPwdForm(f => ({ ...f, next: e.target.value }))}
                  placeholder="Nouveau mot de passe"
                  style={{ paddingRight: 42 }}
                />
                <button type="button" onClick={() => setShowNext(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#8888aa' }}>
                  {showNext ? '🙈' : '👁'}
                </button>
              </div>

              {/* Barre de force */}
              {pwdForm.next.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= strength.score ? strength.color : '#e0e2f0', transition: 'background 0.3s' }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: strength.color }}>{strength.label}</div>
                </div>
              )}
            </div>

            {/* Règles */}
            <div style={{ background: '#fafbff', border: '1px solid #e0e2f0', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#8888aa', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
                Règles de sécurité
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {PWD_RULES.map((rule, i) => {
                  const ok = rule.test(pwdForm.next)
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                        background: ok ? '#00b894' : '#e0e2f0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 0.2s',
                      }}>
                        <span style={{ fontSize: 10, color: ok ? '#fff' : '#8888aa', fontWeight: 700 }}>
                          {ok ? '✓' : '·'}
                        </span>
                      </div>
                      <span style={{ fontSize: 12, color: ok ? '#1a1a3e' : '#8888aa', transition: 'color 0.2s' }}>
                        {rule.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Confirmation */}
            <div className="form-group">
              <label className="form-label">Confirmer le nouveau mot de passe</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showConfirm ? 'text' : 'password'}
                  value={pwdForm.confirm}
                  onChange={e => setPwdForm(f => ({ ...f, confirm: e.target.value }))}
                  placeholder="Répétez le nouveau mot de passe"
                  style={{
                    paddingRight: 42,
                    borderColor: pwdForm.confirm.length > 0
                      ? pwdForm.confirm === pwdForm.next ? '#00b894' : '#e17055'
                      : undefined,
                  }}
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#8888aa' }}>
                  {showConfirm ? '🙈' : '👁'}
                </button>
              </div>
              {pwdForm.confirm.length > 0 && (
                <div style={{ fontSize: 11, marginTop: 5, fontWeight: 600, color: pwdForm.confirm === pwdForm.next ? '#00b894' : '#e17055' }}>
                  {pwdForm.confirm === pwdForm.next ? '✓ Les mots de passe correspondent' : '✗ Les mots de passe ne correspondent pas'}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn btn-secondary" onClick={() => setShowPwdModal(false)}>Annuler</button>
              <button
                className="btn btn-primary"
                onClick={submitPwd}
                disabled={strength.score < 5 || pwdForm.next !== pwdForm.confirm || !pwdForm.current}
                style={{ opacity: (strength.score < 5 || pwdForm.next !== pwdForm.confirm || !pwdForm.current) ? 0.5 : 1 }}
              >
                Changer le mot de passe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
