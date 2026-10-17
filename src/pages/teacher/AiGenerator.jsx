import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth, defaultGroups } from "../context/AuthContext";
import { aiApi, exportApi } from "../services/api";

const CONTENT_TYPES = [
  { value: "quiz",   label: "Quiz",              icon: "Γÿæ" },
  { value: "cours",  label: "Cours",             icon: "≡ƒôÿ" },
  { value: "resume", label: "R├⌐sum├⌐",            icon: "≡ƒôä" },
  { value: "serie",  label: "S├⌐rie d'exercices", icon: "Γ£Ä" },
  { value: "examen", label: "Examen",            icon: "≡ƒôï" },
];

const NIVEAUX = [
  { value: "debutant",      label: "D├⌐butant" },
  { value: "intermediaire", label: "Interm├⌐diaire" },
  { value: "avance",        label: "Avanc├⌐" },
];

// ΓöÇΓöÇ Chat IA ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function AiChat() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Bonjour ! Je suis ExoCraft IA. Posez-moi une question ou demandez-moi de g├⌐n├⌐rer un contenu p├⌐dagogique." }
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
      setMessages((prev) => [...prev, { role: "assistant", content: `Γ¥î Erreur : ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="ai-chat-section">
      <div className="ai-chat-heading">
        <span className="dashboard-eyebrow">ASSISTANT IA</span>
        <h2>Chat avec ExoCraft IA</h2>
        <p>Posez des questions libres ou demandez de l'aide pour cr├⌐er du contenu.</p>
      </div>
      <div className="ai-chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`ai-message ai-message--${msg.role}`}>
            <span className="ai-message-avatar">{msg.role === "assistant" ? "≡ƒñû" : "≡ƒæñ"}</span>
            <div className="ai-message-bubble">
              <pre className="ai-message-text">{msg.content}</pre>
            </div>
          </div>
        ))}
        {loading && (
          <div className="ai-message ai-message--assistant">
            <span className="ai-message-avatar">≡ƒñû</span>
            <div className="ai-message-bubble ai-message-typing">
              <span>ΓùÅ</span><span>ΓùÅ</span><span>ΓùÅ</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <form className="ai-chat-form" onSubmit={send}>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="├ëcrivez votre message..." disabled={loading} autoFocus />
        <button type="submit" disabled={loading || !input.trim()}>
          {loading ? "..." : "Envoyer ΓåÆ"}
        </button>
      </form>
    </section>
  );
}

// ΓöÇΓöÇ Panneau d'export ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function ExportPanel({ form, editedContent }) {
  const [exporting, setExporting] = useState(false);
  const [msg, setMsg]             = useState("");

  const doExport = async (format, avecCorrige) => {
    setExporting(true); setMsg("");
    const titre = `${form.type.charAt(0).toUpperCase() + form.type.slice(1)} ΓÇö ${form.theme}`;
    try {
      if (format === "pdf") {
        await exportApi.directPdf({ titre, matiere: form.matiere, theme: form.theme, type: form.type, contenu: editedContent, avecCorrige });
      } else {
        await exportApi.directWord({ titre, matiere: form.matiere, theme: form.theme, type: form.type, contenu: editedContent, avecCorrige });
      }
      setMsg(`Γ£ô ${format.toUpperCase()} ${avecCorrige ? "avec corrig├⌐" : "sans corrig├⌐"} t├⌐l├⌐charg├⌐.`);
    } catch (err) {
      setMsg(`Γ¥î ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="ai-export-panel">
      <h3 className="ai-export-title">≡ƒôÑ T├⌐l├⌐charger le contenu</h3>

      {/* Pour les ├⌐tudiants ΓÇö sans corrig├⌐ */}
      <div className="ai-export-group">
        <div className="ai-export-group-label">
          <span className="ai-export-badge ai-export-badge--student">≡ƒæ¿ΓÇì≡ƒÄô Version ├⌐tudiants</span>
          <small>Sans les r├⌐ponses correctes</small>
        </div>
        <div className="ai-export-buttons">
          <button
            className="ai-export-btn ai-export-btn--pdf"
            onClick={() => doExport("pdf", false)}
            disabled={exporting}
          >
            ≡ƒôä PDF
          </button>
          <button
            className="ai-export-btn ai-export-btn--word"
            onClick={() => doExport("word", false)}
            disabled={exporting}
          >
            ≡ƒô¥ Word
          </button>
        </div>
      </div>

      {/* Pour le professeur ΓÇö avec corrig├⌐ */}
      <div className="ai-export-group">
        <div className="ai-export-group-label">
          <span className="ai-export-badge ai-export-badge--prof">≡ƒæ¿ΓÇì≡ƒÅ½ Version professeur</span>
          <small>Avec les r├⌐ponses et explications</small>
        </div>
        <div className="ai-export-buttons">
          <button
            className="ai-export-btn ai-export-btn--pdf"
            onClick={() => doExport("pdf", true)}
            disabled={exporting}
          >
            ≡ƒôä PDF + Corrig├⌐
          </button>
          <button
            className="ai-export-btn ai-export-btn--word"
            onClick={() => doExport("word", true)}
            disabled={exporting}
          >
            ≡ƒô¥ Word + Corrig├⌐
          </button>
        </div>
      </div>

      {exporting && <p className="ai-export-status">ΓÅ│ G├⌐n├⌐ration du fichier...</p>}
      {msg && <p className={`ai-export-status${msg.startsWith("Γ¥î") ? " error" : ""}`}>{msg}</p>}
    </div>
  );
}

// ΓöÇΓöÇ G├⌐n├⌐rateur ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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

  // G├⌐n├⌐ration
  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.matiere.trim() || !form.theme.trim()) {
      setError("La mati├¿re et le th├¿me sont obligatoires."); return;
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
      const titre = `${form.type.charAt(0).toUpperCase() + form.type.slice(1)} ΓÇö ${form.theme}`;
      await aiApi.save({ titre, type: form.type, matiere: form.matiere, theme: form.theme, contenu: editedContent });
      const isQuizType = ["quiz", "serie", "examen"].includes(form.type);
      setSuccess(
        isQuizType
          ? "Γ£ô Sauvegard├⌐ en brouillon. Retrouvez-le dans \"Mes Exercices\"."
          : "Γ£ô Sauvegard├⌐ en brouillon. Retrouvez-le dans \"Mes Cours\"."
      );
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  // Valider
  const handleValidate = async () => {
    if (!editedContent.trim()) return;
    setSaving(true); setError(""); setSuccess("");
    try {
      const titre = `${form.type.charAt(0).toUpperCase() + form.type.slice(1)} ΓÇö ${form.theme}`;
      await aiApi.save({ titre, type: form.type, matiere: form.matiere, theme: form.theme, contenu: editedContent });
      const isQuizType = ["quiz", "serie", "examen"].includes(form.type);
      setSuccess(
        isQuizType
          ? "Γ£ô Enregistr├⌐ dans \"Mes Exercices\" ! Vous pouvez y ajouter des questions."
          : "Γ£ô Enregistr├⌐ dans \"Mes Cours\" ! Vous pouvez le valider depuis l├á-bas."
      );
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <section className="ai-generator-section">
      <div className="ai-generator-heading">
        <span className="dashboard-eyebrow">G├ëN├ëRATION IA</span>
        <h2>G├⌐n├⌐rer un contenu p├⌐dagogique</h2>
        <p>Choisissez un type, saisissez une mati├¿re et un th├¿me. L'IA g├⌐n├¿re le contenu en quelques secondes.</p>
      </div>

      {archiveId && (
        <div className="workspace-notice" role="status">
          ≡ƒôÄ G├⌐n├⌐ration depuis l'archive #{archiveId} ΓÇö le contenu sera bas├⌐ sur ce document.
        </div>
      )}

      <form className="ai-generator-form" onSubmit={handleGenerate}>

        {/* S├⌐lecteur de type */}
        <div className="ai-type-selector">
          {CONTENT_TYPES.map((t) => (
            <label key={t.value} className={`ai-type-card${form.type === t.value ? " active" : ""}`}>
              <input type="radio" name="type" value={t.value} checked={form.type === t.value} onChange={update} />
              <span className="ai-type-icon">{t.icon}</span>
              <span>{t.label}</span>
            </label>
          ))}
        </div>

        {/* Mati├¿re + Th├¿me */}
        <div className="ai-form-grid">
          <div className="form-group">
            <label htmlFor="matiere">Mati├¿re *</label>
            <input id="matiere" name="matiere" value={form.matiere} onChange={update}
              placeholder="Ex: Informatique, Math├⌐matiques..." required />
          </div>
          <div className="form-group">
            <label htmlFor="theme">Th├¿me *</label>
            <input id="theme" name="theme" value={form.theme} onChange={update}
              placeholder="Ex: Les algorithmes de tri..." required />
          </div>
        </div>

        {/* Param├¿tres quiz */}
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

        {/* Param├¿tres examen */}
        {form.type === "examen" && (
          <div className="ai-form-grid">
            <div className="form-group">
              <label htmlFor="duree">Dur├⌐e</label>
              <input id="duree" name="duree" value={form.duree} onChange={update} placeholder="Ex: 2 heures" />
            </div>
            <div className="form-group">
              <label htmlFor="bareme">Bar├¿me</label>
              <input id="bareme" name="bareme" value={form.bareme} onChange={update} placeholder="Ex: 20 points" />
            </div>
          </div>
        )}

        {/* Cours fourni */}
        <div className="form-group">
          <label htmlFor="courseFourni">
            Cours existant <small>(optionnel ΓÇö si vide, l'IA g├⌐n├¿re depuis le th├¿me)</small>
          </label>
          <textarea id="courseFourni" name="courseFourni" value={form.courseFourni} onChange={update}
            rows={4} placeholder="Collez ici le contenu d'un cours existant pour que l'IA s'en inspire..." />
        </div>

        {error && <p className="workspace-error" role="alert">{error}</p>}

        <button type="submit" className="workspace-button ai-generate-btn" disabled={loading}>
          {loading ? "ΓÅ│ G├⌐n├⌐ration en cours..." : "Γ£¿ G├⌐n├⌐rer avec l'IA"}
        </button>
      </form>

      {/* ΓöÇΓöÇ Zone r├⌐sultat ΓöÇΓöÇ */}
      {generated && (
        <div className="ai-result">
          <div className="ai-result-heading">
            <h3>Contenu g├⌐n├⌐r├⌐ ΓÇö modifiez-le si besoin avant de t├⌐l├⌐charger ou sauvegarder</h3>
          </div>

          <textarea
            className="ai-result-editor"
            value={editedContent}
            onChange={(e) => setEdited(e.target.value)}
            rows={20}
          />

          {/* ΓöÇΓöÇ Panneau d'export ΓöÇΓöÇ */}
          <ExportPanel form={form} editedContent={editedContent} />

          {/* ΓöÇΓöÇ Sauvegarde backend ΓöÇΓöÇ */}
          <div className="ai-result-actions">
            <button className="workspace-button secondary" onClick={handleSave} disabled={saving}>
              {saving ? "Sauvegarde..." : "≡ƒÆ╛ Sauvegarder en brouillon"}
            </button>
            <button className="workspace-button" onClick={handleValidate} disabled={saving}>
              {saving ? "Enregistrement..." : (
                ["quiz", "serie", "examen"].includes(form.type)
                  ? "Γ£ô Enregistrer dans Mes Quiz"
                  : "Γ£ô Enregistrer dans Mes Contenus"
              )}
            </button>
          </div>

          {success && (
            <div className="workspace-notice" role="status">
              <p>{success}</p>
              {["quiz", "serie", "examen"].includes(form.type)
                ? <a href="/quiz" className="workspace-button secondary" style={{display:"inline-block",marginTop:"8px"}}>ΓåÆ Aller ├á Mes Exercices</a>
                : <a href="/contents" className="workspace-button secondary" style={{display:"inline-block",marginTop:"8px"}}>ΓåÆ Aller ├á Mes Cours</a>
              }
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// ΓöÇΓöÇ Page principale ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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
          <p>G├⌐n├⌐rez des cours, quiz, r├⌐sum├⌐s, s├⌐ries d'exercices et examens en quelques secondes.</p>
        </div>
      </section>

      <div className="ai-tabs">
        <button className={`ai-tab${tab === "generate" ? " active" : ""}`} onClick={() => setTab("generate")}>
          Γ£¿ G├⌐n├⌐rer un contenu
        </button>
        <button className={`ai-tab${tab === "chat" ? " active" : ""}`} onClick={() => setTab("chat")}>
          ≡ƒÆ¼ Chat avec l'IA
        </button>
      </div>

      {tab === "generate" ? <AiGeneratorForm /> : <AiChat />}
    </DashboardLayout>
  );
}

