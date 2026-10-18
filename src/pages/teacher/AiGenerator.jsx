import { useState, useRef, useEffect } from "react"
import DashboardLayout from "../../components/teacher/DashboardLayout"
import { useAuth } from "../../context/AuthContext"
import { aiApi } from "../../services/api"

const CONTENT_TYPES = [
  { value: "quiz",   label: "Quiz",               icon: "📝" },
  { value: "cours",  label: "Cours",              icon: "📚" },
  { value: "resume", label: "Résumé",             icon: "📄" },
  { value: "serie",  label: "Série d'exercices",  icon: "✏️" },
  { value: "examen", label: "Examen",             icon: "📋" },
]

const NIVEAUX = [
  { value: "debutant",      label: "Débutant" },
  { value: "intermediaire", label: "Intermédiaire" },
  { value: "avance",        label: "Avancé" },
]

// ── Chat IA ─────────────────────────────────────────────────────────────────
function AiChat() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Bonjour ! Je suis ExoCraft IA. Posez-moi une question ou demandez-moi de générer un contenu pédagogique." }
  ])
  const [input, setInput]     = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function sendMessage(e) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: userMessage }])
    setLoading(true)

    try {
      const data = await aiApi.chat({ message: userMessage, historique: messages.slice(-10) })
      setMessages(prev => [...prev, { role: "assistant", content: data.response || "Réponse reçue." }])
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: `Erreur : ${err.message}` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "60vh", border: "1px solid #e0e2f0", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "75%", padding: "10px 16px", borderRadius: 12,
              background: m.role === "user" ? "linear-gradient(135deg,#6c5ce7,#4a90e2)" : "#f0f2ff",
              color: m.role === "user" ? "#fff" : "#1a1a3e",
              fontSize: 14, lineHeight: 1.6,
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ padding: "10px 16px", borderRadius: 12, background: "#f0f2ff", color: "#8888aa", fontSize: 14 }}>
              ExoCraft IA réfléchit...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={sendMessage} style={{ display: "flex", gap: 8, padding: 12, borderTop: "1px solid #e0e2f0" }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Posez votre question..."
          style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid #e0e2f0", fontSize: 14, outline: "none" }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{ padding: "10px 20px", background: "linear-gradient(135deg,#6c5ce7,#4a90e2)", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}
        >
          Envoyer
        </button>
      </form>
    </div>
  )
}

// ── Génération ──────────────────────────────────────────────────────────────
function AiGenerate() {
  const [form, setForm] = useState({ type: "quiz", matiere: "", theme: "", niveau: "intermediaire", nombreQuestions: 10, courseFourni: "" })
  const [result, setResult]   = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")
  const [saved, setSaved]     = useState(false)

  function update(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })) }

  async function handleGenerate(e) {
    e.preventDefault()
    if (!form.matiere.trim() || !form.theme.trim()) { setError("Matière et thème sont requis."); return }
    setError(""); setResult(""); setSaved(false); setLoading(true)
    try {
      const data = await aiApi.generate(form)
      setResult(data.contenu || "")
    } catch (err) {
      setError(err.message || "Erreur lors de la génération")
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!result) return
    try {
      await aiApi.save({
        titre: `${form.type} - ${form.theme}`,
        type: form.type,
        matiere: form.matiere,
        theme: form.theme,
        contenu: result,
      })
      setSaved(true)
    } catch (err) {
      setError(err.message || "Erreur lors de la sauvegarde")
    }
  }

  function handleExportPdf() {
    const blob = new Blob([result], { type: "text/plain" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href = url
    a.download = `${form.type}-${form.theme}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <form onSubmit={handleGenerate}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#8888aa", textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 8 }}>
            Type de contenu
          </label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CONTENT_TYPES.map(ct => (
              <button
                key={ct.value}
                type="button"
                onClick={() => setForm(f => ({ ...f, type: ct.value }))}
                style={{
                  padding: "10px 16px", borderRadius: 10, border: `2px solid ${form.type === ct.value ? "#6c5ce7" : "#e0e2f0"}`,
                  background: form.type === ct.value ? "#edeaff" : "#fff",
                  color: form.type === ct.value ? "#6c5ce7" : "#3a3a6a",
                  fontWeight: form.type === ct.value ? 700 : 400,
                  cursor: "pointer", fontSize: 13,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 90,
                }}
              >
                <span style={{ fontSize: 20 }}>{ct.icon}</span>
                <span>{ct.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#8888aa", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Matière *</label>
            <input name="matiere" value={form.matiere} onChange={update} placeholder="Ex: Informatique, Mathématiques..." required
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e0e2f0", fontSize: 14, boxSizing: "border-box", outline: "none" }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#8888aa", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Thème *</label>
            <input name="theme" value={form.theme} onChange={update} placeholder="Ex: Les algorithmes de tri..." required
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e0e2f0", fontSize: 14, boxSizing: "border-box", outline: "none" }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#8888aa", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Niveau</label>
            <select name="niveau" value={form.niveau} onChange={update}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e0e2f0", fontSize: 14, background: "#fff" }}>
              {NIVEAUX.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
            </select>
          </div>
          {(form.type === "quiz" || form.type === "examen" || form.type === "serie") && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#8888aa", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Nombre de questions</label>
              <input type="number" name="nombreQuestions" value={form.nombreQuestions} onChange={update} min={3} max={20}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e0e2f0", fontSize: 14, boxSizing: "border-box" }} />
            </div>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#8888aa", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
            Cours fourni (optionnel — améliore la qualité)
          </label>
          <textarea name="courseFourni" value={form.courseFourni} onChange={update} rows={3}
            placeholder="Collez votre cours ici pour que l'IA génère des questions plus précises..."
            style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e0e2f0", fontSize: 14, resize: "vertical", boxSizing: "border-box" }} />
        </div>

        {error && <div style={{ background: "#fff0ee", border: "1px solid #ffd5cc", borderRadius: 8, padding: "10px 14px", color: "#e17055", marginBottom: 12 }}>{error}</div>}

        <button type="submit" disabled={loading}
          style={{ width: "100%", padding: "13px", background: loading ? "rgba(108,92,231,0.4)" : "linear-gradient(135deg,#6c5ce7,#4a90e2)", border: "none", borderRadius: 10, color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {loading ? (
            <><span style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} /> Génération en cours...</>
          ) : "🤖 Générer le contenu"}
        </button>
      </form>

      {/* Résultat */}
      {result && (
        <div style={{ marginTop: 24, background: "#fafbff", border: "1px solid #e0e2f0", borderRadius: 12, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontWeight: 700, color: "#1a1a3e", fontSize: 15 }}>Contenu généré</div>
            <div style={{ display: "flex", gap: 8 }}>
              {!saved ? (
                <button onClick={handleSave}
                  style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #a8e6cf", background: "#e0faf3", color: "#00b894", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                  💾 Sauvegarder
                </button>
              ) : (
                <span style={{ fontSize: 12, color: "#00b894", fontWeight: 600 }}>✓ Sauvegardé</span>
              )}
              <button onClick={handleExportPdf}
                style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #e0e2f0", background: "#fff", color: "#6c5ce7", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                ⬇ Exporter
              </button>
            </div>
          </div>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 13, lineHeight: 1.8, color: "#1a1a3e", margin: 0 }}>
            {result}
          </pre>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ── Page principale ──────────────────────────────────────────────────────────
export default function AiGenerator() {
  const [activeTab, setActiveTab] = useState("generate")

  const tabs = [
    { key: "generate", label: "✨ Générer un contenu" },
    { key: "chat",     label: "💬 Chat avec l'IA" },
  ]

  return (
    <DashboardLayout activePage="ai">
      <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#6c5ce7", textTransform: "uppercase", letterSpacing: 1 }}>
            INTELLIGENCE ARTIFICIELLE
          </span>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#1a1a3e", margin: "6px 0 8px" }}>
            Assistant ExoCraft IA
          </h1>
          <p style={{ color: "#8888aa", fontSize: 14 }}>
            Générez des cours, quiz, résumés, séries d'exercices et examens en quelques secondes.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "2px solid #e0e2f0" }}>
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "10px 20px", border: "none", background: "transparent", cursor: "pointer",
                fontSize: 14, fontWeight: activeTab === tab.key ? 700 : 500,
                color: activeTab === tab.key ? "#6c5ce7" : "#8888aa",
                borderBottom: activeTab === tab.key ? "2px solid #6c5ce7" : "2px solid transparent",
                marginBottom: -2,
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenu */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e0e2f0", padding: 24 }}>
          {activeTab === "generate" ? <AiGenerate /> : <AiChat />}
        </div>
      </div>
    </DashboardLayout>
  )
}
