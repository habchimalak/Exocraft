import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "../../components/teacher/DashboardLayout";
import { useAuth, defaultGroups } from "../../context/AuthContext";
import { aiApi, exportApi } from "../../services/api";

const CONTENT_TYPES = [
  { value: "quiz",   label: "Quiz",              icon: "Î“Ã¿Ã¦" },
  { value: "cours",  label: "Cours",             icon: "â‰¡Æ’Ã´Ã¿" },
  { value: "resume", label: "Râ”œâŒsumâ”œâŒ",            icon: "â‰¡Æ’Ã´Ã¤" },
  { value: "serie",  label: "Sâ”œâŒrie d'exercices", icon: "Î“Â£Ã„" },
  { value: "examen", label: "Examen",            icon: "â‰¡Æ’Ã´Ã¯" },
];

const NIVEAUX = [
  { value: "debutant",      label: "Dâ”œâŒbutant" },
  { value: "intermediaire", label: "Intermâ”œâŒdiaire" },
  { value: "avance",        label: "Avancâ”œâŒ" },
];

// Î“Ã¶Ã‡Î“Ã¶Ã‡ Chat IA Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
function AiChat() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Bonjour ! Je suis ExoCraft IA. Posez-moi une question ou demandez-moi de gâ”œâŒnâ”œâŒrer un contenu pâ”œâŒdagogique." }
  ]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const historique = messages.slice(1);
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const data = await aiApi.chat(userMsg.content, historique);
      setMessages((prev) => [...prev, { role: "assistant", content: data.reponse }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: `Î“Â¥Ã® Erreur : ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="ai-chat-section">
      <div className="ai-chat-heading">
        <span className="dashboard-eyebrow">ASSISTANT IA</span>
        <h2>Chat avec ExoCraft IA</h2>
        <p>Posez des questions libres ou demandez de l'aide pour crâ”œâŒer du contenu.</p>
      </div>
      <div className="ai-chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`ai-message ai-message--${msg.role}`}>
            <span className="ai-message-avatar">{msg.role === "assistant" ? "â‰¡Æ’Ã±Ã»" : "â‰¡Æ’Ã¦Ã±"}</span>
            <div className="ai-message-bubble">
              <pre className="ai-message-text">{msg.content}</pre>
            </div>
          </div>
        ))}
        {loading && (
          <div className="ai-message ai-message--assistant">
            <span className="ai-message-avatar">â‰¡Æ’Ã±Ã»</span>
            <div className="ai-message-bubble ai-message-typing">
              <span>Î“Ã¹Ã…</span><span>Î“Ã¹Ã…</span><span>Î“Ã¹Ã…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <form className="ai-chat-form" onSubmit={send}>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="â”œÃ«crivez votre message..." disabled={loading} autoFocus />
        <button type="submit" disabled={loading || !input.trim()}>
          {loading ? "..." : "Envoyer Î“Ã¥Ã†"}
        </button>
      </form>
    </section>
  );
}

// Î“Ã¶Ã‡Î“Ã¶Ã‡ Panneau d'export Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
function ExportPanel({ form, editedContent }) {
  const [exporting, setExporting] = useState(false);
  const [msg, setMsg]             = useState("");

  const doExport = async (format, avecCorrige) => {
    setExporting(true); setMsg("");
    const titre = `${form.type.charAt(0).toUpperCase() + form.type.slice(1)} Î“Ã‡Ã¶ ${form.theme}`;
    try {
      if (format === "pdf") {
        await exportApi.directPdf({ titre, matiere: form.matiere, theme: form.theme, type: form.type, contenu: editedContent, avecCorrige });
      } else {
        await exportApi.directWord({ titre, matiere: form.matiere, theme: form.theme, type: form.type, contenu: editedContent, avecCorrige });
      }
      setMsg(`Î“Â£Ã´ ${format.toUpperCase()} ${avecCorrige ? "avec corrigâ”œâŒ" : "sans corrigâ”œâŒ"} tâ”œâŒlâ”œâŒchargâ”œâŒ.`);
    } catch (err) {
      setMsg(`Î“Â¥Ã® ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="ai-export-panel">
      <h3 className="ai-export-title">â‰¡Æ’Ã´Ã‘ Tâ”œâŒlâ”œâŒcharger le contenu</h3>

      {/* Pour les â”œâŒtudiants Î“Ã‡Ã¶ sans corrigâ”œâŒ */}
      <div className="ai-export-group">
        <div className="ai-export-group-label">
          <span className="ai-export-badge ai-export-badge--student">â‰¡Æ’Ã¦Â¿Î“Ã‡Ã¬â‰¡Æ’Ã„Ã´ Version â”œâŒtudiants</span>
          <small>Sans les râ”œâŒponses correctes</small>
        </div>
        <div className="ai-export-buttons">
          <button
            className="ai-export-btn ai-export-btn--pdf"
            onClick={() => doExport("pdf", false)}
            disabled={exporting}
          >
            â‰¡Æ’Ã´Ã¤ PDF
          </button>
          <button
            className="ai-export-btn ai-export-btn--word"
            onClick={() => doExport("word", false)}
            disabled={exporting}
          >
            â‰¡Æ’Ã´Â¥ Word
          </button>
        </div>
      </div>

      {/* Pour le professeur Î“Ã‡Ã¶ avec corrigâ”œâŒ */}
      <div className="ai-export-group">
        <div className="ai-export-group-label">
          <span className="ai-export-badge ai-export-badge--prof">â‰¡Æ’Ã¦Â¿Î“Ã‡Ã¬â‰¡Æ’Ã…Â½ Version professeur</span>
          <small>Avec les râ”œâŒponses et explications</small>
        </div>
        <div className="ai-export-buttons">
          <button
            className="ai-export-btn ai-export-btn--pdf"
            onClick={() => doExport("pdf", true)}
            disabled={exporting}
          >
            â‰¡Æ’Ã´Ã¤ PDF + Corrigâ”œâŒ
          </button>
          <button
            className="ai-export-btn ai-export-btn--word"
            onClick={() => doExport("word", true)}
            disabled={exporting}
          >
            â‰¡Æ’Ã´Â¥ Word + Corrigâ”œâŒ
          </button>
        </div>
      </div>

      {exporting && <p className="ai-export-status">Î“Ã…â”‚ Gâ”œâŒnâ”œâŒration du fichier...</p>}
      {msg && <p className={`ai-export-status${msg.startsWith("Î“Â¥Ã®") ? " error" : ""}`}>{msg}</p>}
    </div>
  );
}

// Î“Ã¶Ã‡Î“Ã¶Ã‡ Gâ”œâŒnâ”œâŒrateur Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
function AiGeneratorForm() {
  const [searchParams] = useSearchParams();
  const archiveId = searchParams.get('archiveId');

  const [form, setForm] = useState({
    type: "quiz", matiere: "", theme: "", courseFourni: "",
    nombreQuestions: 5, niveau: "intermediaire",
    duree: "2 heures", bareme: "20 points",
  });
  const [generated, setGenerated] = useState("");
  const [editedContent, setEdited] = useState("");
  const [loading, setLoading]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");

  const update = (e) => setForm((cur) => ({ ...cur, [e.target.name]: e.target.value }));

  // Gâ”œâŒnâ”œâŒration
  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.matiere.trim() || !form.theme.trim()) {
      setError("La matiâ”œÂ¿re et le thâ”œÂ¿me sont obligatoires."); return;
    }
    setError(""); setSuccess(""); setGenerated(""); setEdited("");
    setLoading(true);
    try {
      const payload = {
        matiere: form.matiere, type: form.type, theme: form.theme,
        ...(form.courseFourni.trim() ? { courseFourni: form.courseFourni } : {}),
        ...(form.type === "quiz"   ? { nombreQuestions: +form.nombreQuestions, niveau: form.niveau } : {}),
        ...(form.type === "examen" ? { duree: form.duree, bareme: form.bareme } : {}),
      };
      const data = archiveId ? await aiApi.generateFromArchive(archiveId, payload) : await aiApi.generate(payload);
      setGenerated(data.contenu);
      setEdited(data.contenu);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarder en brouillon
  const handleSave = async () => {
    if (!editedContent.trim()) return;
    setSaving(true); setError(""); setSuccess("");
    try {
      const titre = `${form.type.charAt(0).toUpperCase() + form.type.slice(1)} Î“Ã‡Ã¶ ${form.theme}`;
      await aiApi.save({ titre, type: form.type, matiere: form.matiere, theme: form.theme, contenu: editedContent });
      const isQuizType = ["quiz", "serie", "examen"].includes(form.type);
      setSuccess(
        isQuizType
          ? "Î“Â£Ã´ Sauvegardâ”œâŒ en brouillon. Retrouvez-le dans \"Mes Exercices\"."
          : "Î“Â£Ã´ Sauvegardâ”œâŒ en brouillon. Retrouvez-le dans \"Mes Cours\"."
      );
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  // Valider
  const handleValidate = async () => {
    if (!editedContent.trim()) return;
    setSaving(true); setError(""); setSuccess("");
    try {
      const titre = `${form.type.charAt(0).toUpperCase() + form.type.slice(1)} Î“Ã‡Ã¶ ${form.theme}`;
      await aiApi.save({ titre, type: form.type, matiere: form.matiere, theme: form.theme, contenu: editedContent });
      const isQuizType = ["quiz", "serie", "examen"].includes(form.type);
      setSuccess(
        isQuizType
          ? "Î“Â£Ã´ Enregistrâ”œâŒ dans \"Mes Exercices\" ! Vous pouvez y ajouter des questions."
          : "Î“Â£Ã´ Enregistrâ”œâŒ dans \"Mes Cours\" ! Vous pouvez le valider depuis lâ”œÃ¡-bas."
      );
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <section className="ai-generator-section">
      <div className="ai-generator-heading">
        <span className="dashboard-eyebrow">Gâ”œÃ«Nâ”œÃ«RATION IA</span>
        <h2>Gâ”œâŒnâ”œâŒrer un contenu pâ”œâŒdagogique</h2>
        <p>Choisissez un type, saisissez une matiâ”œÂ¿re et un thâ”œÂ¿me. L'IA gâ”œâŒnâ”œÂ¿re le contenu en quelques secondes.</p>
      </div>

      {archiveId && (
        <div className="workspace-notice" role="status">
          â‰¡Æ’Ã´Ã„ Gâ”œâŒnâ”œâŒration depuis l'archive #{archiveId} Î“Ã‡Ã¶ le contenu sera basâ”œâŒ sur ce document.
        </div>
      )}

      <form className="ai-generator-form" onSubmit={handleGenerate}>

        {/* Sâ”œâŒlecteur de type */}
        <div className="ai-type-selector">
          {CONTENT_TYPES.map((t) => (
            <label key={t.value} className={`ai-type-card${form.type === t.value ? " active" : ""}`}>
              <input type="radio" name="type" value={t.value} checked={form.type === t.value} onChange={update} />
              <span className="ai-type-icon">{t.icon}</span>
              <span>{t.label}</span>
            </label>
          ))}
        </div>

        {/* Matiâ”œÂ¿re + Thâ”œÂ¿me */}
        <div className="ai-form-grid">
          <div className="form-group">
            <label htmlFor="matiere">Matiâ”œÂ¿re *</label>
            <input id="matiere" name="matiere" value={form.matiere} onChange={update}
              placeholder="Ex: Informatique, Mathâ”œâŒmatiques..." required />
          </div>
          <div className="form-group">
            <label htmlFor="theme">Thâ”œÂ¿me *</label>
            <input id="theme" name="theme" value={form.theme} onChange={update}
              placeholder="Ex: Les algorithmes de tri..." required />
          </div>
        </div>

        {/* Paramâ”œÂ¿tres quiz */}
        {form.type === "quiz" && (
          <div className="ai-form-grid">
            <div className="form-group">
              <label htmlFor="nombreQuestions">Nombre de questions</label>
              <input type="number" id="nombreQuestions" name="nombreQuestions"
                value={form.nombreQuestions} onChange={update} min={1} max={20} />
            </div>
            <div className="form-group">
              <label htmlFor="niveau">Niveau</label>
              <select id="niveau" name="niveau" value={form.niveau} onChange={update}>
                {NIVEAUX.map((n) => <option key={n.value} value={n.value}>{n.label}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Paramâ”œÂ¿tres examen */}
        {form.type === "examen" && (
          <div className="ai-form-grid">
            <div className="form-group">
              <label htmlFor="duree">Durâ”œâŒe</label>
              <input id="duree" name="duree" value={form.duree} onChange={update} placeholder="Ex: 2 heures" />
            </div>
            <div className="form-group">
              <label htmlFor="bareme">Barâ”œÂ¿me</label>
              <input id="bareme" name="bareme" value={form.bareme} onChange={update} placeholder="Ex: 20 points" />
            </div>
          </div>
        )}

        {/* Cours fourni */}
        <div className="form-group">
          <label htmlFor="courseFourni">
            Cours existant <small>(optionnel Î“Ã‡Ã¶ si vide, l'IA gâ”œâŒnâ”œÂ¿re depuis le thâ”œÂ¿me)</small>
          </label>
          <textarea id="courseFourni" name="courseFourni" value={form.courseFourni} onChange={update}
            rows={4} placeholder="Collez ici le contenu d'un cours existant pour que l'IA s'en inspire..." />
        </div>

        {error && <p className="workspace-error" role="alert">{error}</p>}

        <button type="submit" className="workspace-button ai-generate-btn" disabled={loading}>
          {loading ? "Î“Ã…â”‚ Gâ”œâŒnâ”œâŒration en cours..." : "Î“Â£Â¿ Gâ”œâŒnâ”œâŒrer avec l'IA"}
        </button>
      </form>

      {/* Î“Ã¶Ã‡Î“Ã¶Ã‡ Zone râ”œâŒsultat Î“Ã¶Ã‡Î“Ã¶Ã‡ */}
      {generated && (
        <div className="ai-result">
          <div className="ai-result-heading">
            <h3>Contenu gâ”œâŒnâ”œâŒrâ”œâŒ Î“Ã‡Ã¶ modifiez-le si besoin avant de tâ”œâŒlâ”œâŒcharger ou sauvegarder</h3>
          </div>

          <textarea
            className="ai-result-editor"
            value={editedContent}
            onChange={(e) => setEdited(e.target.value)}
            rows={20}
          />

          {/* Î“Ã¶Ã‡Î“Ã¶Ã‡ Panneau d'export Î“Ã¶Ã‡Î“Ã¶Ã‡ */}
          <ExportPanel form={form} editedContent={editedContent} />

          {/* Î“Ã¶Ã‡Î“Ã¶Ã‡ Sauvegarde backend Î“Ã¶Ã‡Î“Ã¶Ã‡ */}
          <div className="ai-result-actions">
            <button className="workspace-button secondary" onClick={handleSave} disabled={saving}>
              {saving ? "Sauvegarde..." : "â‰¡Æ’Ã†â•› Sauvegarder en brouillon"}
            </button>
            <button className="workspace-button" onClick={handleValidate} disabled={saving}>
              {saving ? "Enregistrement..." : (
                ["quiz", "serie", "examen"].includes(form.type)
                  ? "Î“Â£Ã´ Enregistrer dans Mes Quiz"
                  : "Î“Â£Ã´ Enregistrer dans Mes Contenus"
              )}
            </button>
          </div>

          {success && (
            <div className="workspace-notice" role="status">
              <p>{success}</p>
              {["quiz", "serie", "examen"].includes(form.type)
                ? <a href="/quiz" className="workspace-button secondary" style={{display:"inline-block",marginTop:"8px"}}>Î“Ã¥Ã† Aller â”œÃ¡ Mes Exercices</a>
                : <a href="/contents" className="workspace-button secondary" style={{display:"inline-block",marginTop:"8px"}}>Î“Ã¥Ã† Aller â”œÃ¡ Mes Cours</a>
              }
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// Î“Ã¶Ã‡Î“Ã¶Ã‡ Page principale Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡Î“Ã¶Ã‡
export default function AiGenerator() {
  const { user } = useAuth();
  const groups = user?.associations?.length ? user.associations : defaultGroups();
  const [tab, setTab] = useState("generate");

  return (
    <DashboardLayout activePage="ai" groups={groups}>
      <section className="ai-page-header">
        <div>
          <span className="dashboard-eyebrow">INTELLIGENCE ARTIFICIELLE</span>
          <h1>Assistant ExoCraft IA</h1>
          <p>Gâ”œâŒnâ”œâŒrez des cours, quiz, râ”œâŒsumâ”œâŒs, sâ”œâŒries d'exercices et examens en quelques secondes.</p>
        </div>
      </section>

      <div className="ai-tabs">
        <button className={`ai-tab${tab === "generate" ? " active" : ""}`} onClick={() => setTab("generate")}>
          Î“Â£Â¿ Gâ”œâŒnâ”œâŒrer un contenu
        </button>
        <button className={`ai-tab${tab === "chat" ? " active" : ""}`} onClick={() => setTab("chat")}>
          â‰¡Æ’Ã†Â¼ Chat avec l'IA
        </button>
      </div>

      {tab === "generate" ? <AiGeneratorForm /> : <AiChat />}
    </DashboardLayout>
  );
}
