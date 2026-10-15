import React, { useState, useEffect } from 'react'
import { useStore, timeAgo, formatDateTime } from '../store/appStore'
import { useProfile } from '../store/profileStore'
import { mockStats } from '../data/mockData'

function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return now
}

const TYPE_COLORS: Record<string, string> = {
  Quiz: '#5b4fcf', Examen: '#e17055', Cours: '#00b894',
  Exercices: '#f39c12', 'Résumé': '#4a90e2',
}

// Nom admin connecté — depuis le store du profil
const ADMIN_NAME = 'Administrateur'

export default function Dashboard() {
  const { users, matieres, aiGenerations, totalGenerations } = useStore()
  const profile = useProfile()
  const now = useClock()

  const enseignants = users.filter(u => u.role === 'enseignant')
  const totalDocs = matieres.reduce((acc, m) => acc + m.documents.length, 0)

  const countByType = mockStats.contentsByType.map(item => ({
    ...item,
    count: aiGenerations.filter(g => g.type === item.type).length,
  }))

  type ActivityItem = { label: string; sub: string; isoTime: string; color: string }
  const recentUsers: ActivityItem[] = users.slice(0, 3).map(u => ({
    label: `${u.prenom} ${u.nom} a rejoint la plateforme`,
    sub: u.email, isoTime: u.created_at, color: '#5b4fcf',
  }))
  const recentGen: ActivityItem[] = aiGenerations.slice(0, 5).map(g => ({
    label: `${g.enseignant} a généré un ${g.type}`,
    sub: g.sujet, isoTime: g.generatedAt,
    color: TYPE_COLORS[g.type] ?? '#4a90e2',
  }))
  const activity = [...recentUsers, ...recentGen]
    .sort((a, b) => new Date(b.isoTime).getTime() - new Date(a.isoTime).getTime())
    .slice(0, 8)

  return (
    <div>

      {/* ── Bannière de bienvenue ── */}
      <div style={{
        background: 'linear-gradient(135deg, #2d2a7a 0%, #3d3ab0 40%, #4a90e2 100%)',
        borderRadius: 16, padding: '28px 32px', marginBottom: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(91,79,207,0.25)',
      }}>
        {/* Cercles déco en arrière-plan */}
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', top: -100, right: 100, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', bottom: -80, right: -40, pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
            Tableau de bord · Administration
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#ffffff', marginBottom: 8, letterSpacing: -0.5 }}>
            Bonjour, {profile.prenom} {profile.nom} 👋
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', maxWidth: 420, lineHeight: 1.6 }}>
            Supervisez la plateforme ExoCraft en temps réel. Gérez les enseignants, les matières et les archives pédagogiques.
          </div>
        </div>

        {/* Horloge */}
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', fontVariantNumeric: 'tabular-nums', letterSpacing: -1 }}>
            {now.toLocaleTimeString('fr-FR')}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
            {now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* ── Stats cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Enseignants actifs', value: enseignants.filter(u => u.status === 'actif').length, total: enseignants.length, color: '#5b4fcf', bg: '#edeaff', tag: 'ENS', sub: enseignants.length > 0 ? `Dernier: ${timeAgo(enseignants[0].created_at)}` : '—' },
          { label: 'Générations IA',     value: totalGenerations, total: null,              color: '#4a90e2', bg: '#e6f0ff', tag: 'IA',  sub: totalGenerations > 0 ? `Dernière: ${timeAgo(aiGenerations[0].generatedAt)}` : 'En attente...' },
          { label: 'Documents archivés', value: totalDocs,        total: null,              color: '#00b894', bg: '#e0faf3', tag: 'DOC', sub: `${matieres.length} matières` },
          { label: 'Utilisateurs total', value: users.length,     total: null,              color: '#f39c12', bg: '#fff5e0', tag: 'USR', sub: `${users.filter(u => u.status === 'inactif').length} inactif(s)` },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #e0e2f0', borderRadius: 14, padding: 20, boxShadow: '0 2px 8px rgba(91,79,207,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11 }}>
                {s.tag}
              </div>
              {s.total !== null && (
                <span style={{ fontSize: 11, color: '#8888aa', background: '#f0f2ff', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>/ {s.total}</span>
              )}
            </div>
            <div style={{ fontSize: 30, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#8888aa', marginTop: 4 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: s.color, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
              {i === 1 && totalGenerations > 0 && (
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00b894', display: 'inline-block', animation: 'blink 1.5s infinite' }} />
              )}
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>

        {/* ── Gauche ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Graphe IA */}
          <div style={{ background: '#fff', border: '1px solid #e0e2f0', borderRadius: 14, padding: 20, boxShadow: '0 2px 8px rgba(91,79,207,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a3e' }}>Générations IA par type</div>
              <span style={{ background: '#edeaff', color: '#5b4fcf', padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{totalGenerations} total</span>
            </div>

            {totalGenerations === 0 ? (
              <div style={{ padding: '32px 0', textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: '#edeaff', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#5b4fcf', fontSize: 13 }}>IA</div>
                <div style={{ fontWeight: 700, color: '#1a1a3e', marginBottom: 6 }}>Aucune génération pour l'instant</div>
                <div style={{ fontSize: 12, color: '#8888aa', maxWidth: 260, margin: '0 auto' }}>Le compteur se met à jour automatiquement dès qu'un enseignant utilise le générateur</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14, fontSize: 12, color: '#00b894', fontWeight: 600 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00b894', display: 'inline-block', animation: 'blink 1.5s infinite' }} />
                  En écoute — mise à jour automatique
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {countByType.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                    <div style={{ width: 80, fontSize: 12, color: '#3a3a6a' }}>{item.type}</div>
                    <div style={{ flex: 1, height: 8, background: '#f0f2ff', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${totalGenerations > 0 ? (item.count / totalGenerations) * 100 : 0}%`, height: '100%', background: item.color, borderRadius: 4, transition: 'width 0.6s ease', minWidth: item.count > 0 ? 4 : 0 }} />
                    </div>
                    <div style={{ width: 28, textAlign: 'right', fontSize: 12, fontWeight: 700, color: item.color }}>{item.count}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tableau générations */}
          <div style={{ background: '#fff', border: '1px solid #e0e2f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(91,79,207,0.06)' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #e0e2f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a3e' }}>Historique des générations IA</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#00b894', fontWeight: 700 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00b894', display: 'inline-block', animation: 'blink 1.5s infinite' }} />
                Temps réel
              </div>
            </div>
            {aiGenerations.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: '#8888aa', fontSize: 13 }}>
                Aucune génération enregistrée — le tableau se remplira automatiquement
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Enseignant','Sujet généré','Type','Date & heure'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: '#8888aa', background: '#fafbff', borderBottom: '1px solid #e0e2f0', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {aiGenerations.slice(0, 8).map(g => (
                    <tr key={g.id} style={{ borderBottom: '1px solid #f0f2ff' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1a1a3e', fontSize: 13 }}>{g.enseignant}</td>
                      <td style={{ padding: '12px 16px', color: '#3a3a6a', fontSize: 13, maxWidth: 180 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.sujet}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: TYPE_COLORS[g.type] + '18', color: TYPE_COLORS[g.type] }}>{g.type}</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 11, color: '#8888aa', fontVariantNumeric: 'tabular-nums' }}>
                        <div>{formatDateTime(g.generatedAt)}</div>
                        <div style={{ color: '#b0b0cc', marginTop: 2 }}>{timeAgo(g.generatedAt)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── Droite ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Activité live */}
          <div style={{ background: '#fff', border: '1px solid #e0e2f0', borderRadius: 14, padding: 20, boxShadow: '0 2px 8px rgba(91,79,207,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a3e' }}>Activité en direct</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#00b894', fontWeight: 700 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00b894', display: 'inline-block', animation: 'blink 1.5s infinite' }} />
                Live
              </div>
            </div>
            {activity.length === 0 ? (
              <div style={{ fontSize: 13, color: '#8888aa', padding: '16px 0', textAlign: 'center' }}>Aucune activité récente</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {activity.map((act, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: act.color, flexShrink: 0, marginTop: 4 }} />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: 12, color: '#1a1a3e', fontWeight: 500, lineHeight: 1.4 }}>{act.label}</div>
                      <div style={{ fontSize: 11, color: '#8888aa', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{act.sub}</div>
                      <div style={{ fontSize: 10, color: '#b0b0cc', marginTop: 3 }}>{timeAgo(act.isoTime)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Derniers inscrits */}
          <div style={{ background: '#fff', border: '1px solid #e0e2f0', borderRadius: 14, padding: 20, boxShadow: '0 2px 8px rgba(91,79,207,0.06)' }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a3e', marginBottom: 14 }}>Derniers inscrits</div>
            {users.slice(0, 5).map((u, i) => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div className="avatar" style={{ background: ['#5b4fcf','#4a90e2','#00b894','#f39c12','#e17055'][i % 5], width: 30, height: 30, fontSize: 10, flexShrink: 0 }}>
                  {u.prenom[0]}{u.nom[0]}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a3e' }}>{u.prenom} {u.nom}</div>
                  <div style={{ fontSize: 10, color: '#8888aa', marginTop: 1 }}>{timeAgo(u.created_at)}</div>
                </div>
                <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: u.role === 'admin' ? '#edeaff' : '#e6f0ff', color: u.role === 'admin' ? '#5b4fcf' : '#4a90e2' }}>
                  {u.role === 'admin' ? 'Admin' : 'Ens.'}
                </span>
              </div>
            ))}
          </div>

          {/* Répartition */}
          <div style={{ background: '#fff', border: '1px solid #e0e2f0', borderRadius: 14, padding: 20, boxShadow: '0 2px 8px rgba(91,79,207,0.06)' }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a3e', marginBottom: 14 }}>Répartition</div>
            {[
              { label: 'Enseignants actifs',   count: users.filter(u => u.role === 'enseignant' && u.status === 'actif').length,   color: '#5b4fcf' },
              { label: 'Enseignants inactifs', count: users.filter(u => u.role === 'enseignant' && u.status === 'inactif').length, color: '#e17055' },
              { label: 'Administrateurs',      count: users.filter(u => u.role === 'admin').length,                                color: '#f39c12' },
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#3a3a6a', marginBottom: 5 }}>
                  <span>{item.label}</span>
                  <span style={{ fontWeight: 700, color: item.color }}>{item.count}</span>
                </div>
                <div style={{ height: 6, background: '#f0f2ff', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${users.length > 0 ? (item.count / users.length) * 100 : 0}%`, height: '100%', background: item.color, borderRadius: 3, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
      `}</style>
    </div>
  )
}
