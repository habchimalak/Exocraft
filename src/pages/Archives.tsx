import React, { useState } from 'react'
import { mockArchives } from '../data/mockData'
import type { Archive } from '../data/mockData'
import { useEtab } from '../store/etablissementContext'

export default function Archives() {
  const { matieres, promos } = useEtab()
  const [archives, setArchives] = useState<Archive[]>(mockArchives)
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('tous');
  const [filterMatiere, setFilterMatiere] = useState('toutes');
  const [showModal, setShowModal] = useState(false);
  const [alert, setAlert] = useState('');
  const [fileName, setFileName] = useState('');
  const [form, setForm] = useState({
    titre: '', type: 'cours', matiere: '', promo: '', format: 'PDF',
  });

  const filtered = archives.filter(a => {
    const matchSearch = a.titre.toLowerCase().includes(search.toLowerCase()) || a.matiere.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'tous' || a.type === filterType;
    const matchMatiere = filterMatiere === 'toutes' || a.matiere === filterMatiere;
    return matchSearch && matchType && matchMatiere;
  });

  function handleSave() {
    if (!form.titre || !form.matiere || !form.promo) {
      setAlert('Veuillez remplir tous les champs.'); return;
    }
    const newArchive: Archive = {
      id: Date.now(),
      titre: form.titre,
      type: form.type as 'cours' | 'examen',
      fichier: `${form.titre.toLowerCase().replace(/\s+/g, '_')}.${form.format === 'PDF' ? 'pdf' : 'docx'}`,
      format: form.format as 'PDF' | 'Word',
      matiere: form.matiere,
      promo: form.promo,
      uploadedBy: 'Admin',
      created_at: new Date().toISOString().split('T')[0],
      size: fileName ? '~1.0 Mo' : '—',
    };
    setArchives(prev => [newArchive, ...prev]);
    setShowModal(false);
    setFileName('');
    setForm({ titre: '', type: 'cours', matiere: '', promo: '', format: 'PDF' });
    setAlert('');
  }

  function handleDelete(id: number) {
    if (window.confirm('Supprimer cette archive ?')) setArchives(prev => prev.filter(a => a.id !== id));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      if (!form.titre) setForm(prev => ({ ...prev, titre: file.name.replace(/\.[^.]+$/, '') }));
    }
  }

  const iconByType = (type: string, format: string) => {
    if (format === 'Word') return { icon: '📝', bg: 'rgba(74,144,226,0.15)', color: '#4a90e2' };
    if (type === 'examen') return { icon: '📋', bg: 'rgba(225,112,85,0.15)', color: '#e17055' };
    return { icon: '📄', bg: 'rgba(0,184,148,0.15)', color: '#00b894' };
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Archives pédagogiques</div>
          <div className="page-subtitle">{archives.length} document{archives.length > 1 ? 's' : ''} archivé{archives.length > 1 ? 's' : ''}</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Déposer une archive</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total archives', value: archives.length, color: '#6c5ce7', icon: '🗄️' },
          { label: 'Cours', value: archives.filter(a => a.type === 'cours').length, color: '#00b894', icon: '📄' },
          { label: 'Examens', value: archives.filter(a => a.type === 'examen').length, color: '#e17055', icon: '📋' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 28 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, maxWidth: 300 }}>
          <span className="search-icon">🔍</span>
          <input className="input" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input" style={{ width: 130 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="tous">Tous types</option>
          <option value="cours">Cours</option>
          <option value="examen">Examens</option>
        </select>
        <select className="input" style={{ width: 200 }} value={filterMatiere} onChange={e => setFilterMatiere(e.target.value)}>
          <option value="toutes">Toutes matières</option>
          {matieres.map(m => <option key={m.id} value={m.nom}>{m.nom}</option>)}
        </select>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center', marginLeft: 'auto' }}>
          {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Archives grid */}
      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🗄️</div>
            <div>Aucune archive trouvée</div>
            <p>Déposez un fichier Word ou PDF pour commencer</p>
          </div>
        </div>
      ) : (
        <div className="archive-grid">
          {filtered.map(a => {
            const style = iconByType(a.type, a.format);
            return (
              <div key={a.id} className="archive-card">
                <div className="archive-icon" style={{ background: style.bg, color: style.color }}>
                  {style.icon}
                </div>
                <div className="archive-info">
                  <div className="archive-title">{a.titre}</div>
                  <div className="archive-meta">
                    <span>📚 {a.matiere}</span>
                    <span>🎓 {a.promo}</span>
                    <span>📅 {a.created_at}</span>
                    <span>💾 {a.size}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <span className={`badge ${a.type === 'cours' ? 'badge-green' : 'badge-red'}`}>
                      {a.type === 'cours' ? '📄 Cours' : '📋 Examen'}
                    </span>
                    <span className={`badge ${a.format === 'PDF' ? 'badge-red' : 'badge-blue'}`}>
                      {a.format}
                    </span>
                  </div>
                </div>
                <div className="archive-actions">
                  <button className="btn-icon" title="Télécharger">⬇️</button>
                  <button className="btn-icon" onClick={() => handleDelete(a.id)} style={{ color: 'var(--danger)' }} title="Supprimer">🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>🗄️ Déposer une archive</div>
              <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {alert && <div className="alert alert-error">⚠️ {alert}</div>}

            {/* Upload zone */}
            <label className="upload-zone" style={{ display: 'block', marginBottom: 16, cursor: 'pointer' }}>
              <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleFileChange} />
              {fileName ? (
                <div className="file-info">
                  <span style={{ fontSize: 24 }}>📎</span>
                  <div>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{fileName}</div>
                    <div style={{ color: 'var(--success)' }}>Fichier sélectionné ✓</div>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📂</div>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>Glisser un fichier ou cliquer</div>
                  <div style={{ fontSize: 11 }}>PDF, Word (.docx) — max 10 Mo</div>
                </>
              )}
            </label>

            <div className="form-group">
              <label className="form-label">Titre du document</label>
              <input className="input" value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} placeholder="Ex: Cours Cloud Computing 2024" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="cours">Cours</option>
                  <option value="examen">Examen</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Format</label>
                <select className="input" value={form.format} onChange={e => setForm({ ...form, format: e.target.value })}>
                  <option value="PDF">PDF</option>
                  <option value="Word">Word (.docx)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Matière</label>
                <select className="input" value={form.matiere} onChange={e => setForm({ ...form, matiere: e.target.value })}>
                  <option value="">— Choisir —</option>
                  {matieres.map(m => <option key={m.id} value={m.nom}>{m.nom}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Promotion</label>
                <select className="input" value={form.promo} onChange={e => setForm({ ...form, promo: e.target.value })}>
                  <option value="">— Choisir —</option>
                  {promos.map(p => <option key={p.id} value={p.nom}>{p.nom}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSave}>⬆️ Déposer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
