import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/exocraft-logo.svg";

export default function Home() {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", padding: 40, textAlign: "center" }}>
      <img src={logo} alt="ExoCraft" style={{ width: 80, height: 80, marginBottom: 24, borderRadius: 18 }} />
      <h1 style={{ fontSize: 42, fontWeight: 900, marginBottom: 12 }}>
        Exo<span style={{ background: "linear-gradient(135deg,#a29bfe,#74b9ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Craft</span>
      </h1>
      <p style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", maxWidth: 500, lineHeight: 1.6, marginBottom: 40 }}>
        Plateforme pédagogique propulsée par l'IA. Générez des cours, quiz et examens en quelques secondes.
      </p>

      {user ? (
        <Link
          to={user.role === "admin" ? "/admin" : "/dashboard"}
          style={{ padding: "14px 32px", background: "linear-gradient(135deg,#6c5ce7,#4a90e2)", borderRadius: 12, color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 16 }}
        >
          Accéder à mon espace →
        </Link>
      ) : (
        <div style={{ display: "flex", gap: 16 }}>
          <Link
            to="/login"
            style={{ padding: "14px 32px", background: "linear-gradient(135deg,#6c5ce7,#4a90e2)", borderRadius: 12, color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 16 }}
          >
            Se connecter
          </Link>
          <Link
            to="/register"
            style={{ padding: "14px 32px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12, color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 16 }}
          >
            Créer un compte enseignant
          </Link>
        </div>
      )}

      <div style={{ marginTop: 60, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, maxWidth: 700 }}>
        {[
          { icon: "🤖", title: "Génération IA", desc: "Cours, quiz, examens générés automatiquement" },
          { icon: "📚", title: "Bibliothèque", desc: "Organisez vos contenus par classe et matière" },
          { icon: "📊", title: "Tableau de bord", desc: "Suivez votre activité pédagogique" },
        ].map((f) => (
          <div key={f.title} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 20, border: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>{f.icon}</div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{f.title}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
