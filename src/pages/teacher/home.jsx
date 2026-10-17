import { useNavigate } from "react-router-dom";
import logo from "../assets/exocraft-logo.png";

function Home() {
  const navigate = useNavigate();

  const contentTypes = [
    {
      icon: "≡ƒôÿ",
      title: "Cours",
      description:
        "R├⌐digez et organisez vos cours dans votre tableau de bord.",
    },
    {
      icon: "≡ƒô¥",
      title: "R├⌐sum├⌐s",
      description:
        "R├⌐digez des r├⌐sum├⌐s p├⌐dagogiques clairs et adapt├⌐s ├á vos besoins.",
    },
    {
      icon: "Γ£Ä",
      title: "S├⌐ries dΓÇÖexercices",
      description:
        "Pr├⌐parez vos s├⌐ries dΓÇÖexercices et leurs consignes.",
    },
    {
      icon: "Γÿæ",
      title: "Quiz",
      description:
        "R├⌐digez vos questions et vos propositions de r├⌐ponse.",
    },
    {
      icon: "≡ƒôï",
      title: "Examens",
      description:
        "Pr├⌐parez des examens structur├⌐s avec dur├⌐e, bar├¿me et consignes.",
    },
  ];

  return (
    <div className="home-page">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="home-navbar">
        <div className="home-brand">
          <img
            src={logo}
            alt="ExoCraft"
            className="home-logo"
          />
        </div>

        <nav className="home-nav">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="home-login-button"
          >
            Connexion
          </button>

          <button
            type="button"
            onClick={() => navigate("/register")}
            className="home-register-button"
          >
            Cr├⌐er un compte
          </button>
        </nav>
      </header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <main>

        <section className="home-hero">

          <div className="home-hero-content">

            <span className="home-eyebrow">
              VOTRE ESPACE P├ëDAGOGIQUE
            </span>

            <h1>
              Cr├⌐ez vos contenus
              <br />
              p├⌐dagogiques avec{" "}
              <span>ExoCraft</span>
            </h1>

            <p>
              Un espace pour r├⌐diger, organiser et retrouver vos cours, r├⌐sum├⌐s, exercices, quiz et examens.
            </p>

            <div className="home-hero-actions">

              <button
                type="button"
                className="home-primary-button"
                onClick={() => navigate("/register")}
              >
                Commencer gratuitement
                <span>ΓåÆ</span>
              </button>

              <button
                type="button"
                className="home-secondary-button"
                onClick={() => navigate("/login")}
              >
                Se connecter
              </button>

            </div>

          </div>

          {/* =================================================
              HERO VISUAL
          ================================================= */}

          <div className="home-hero-visual">

            <div className="home-ai-card">

              <div className="home-ai-header">
                <div className="home-ai-icon">
                  Γ£ª
                </div>

                <div>
                  <strong>Mes contenus</strong>
                  <span>Tableau de bord</span>
                </div>
              </div>

              <div className="home-ai-line">
                <span>Th├¿me</span>
                <strong>Cloud Computing</strong>
              </div>

              <div className="home-ai-line">
                <span>Contenu</span>
                <strong>Quiz</strong>
              </div>

              <div className="home-ai-line">
                <span>Statut</span>
                <strong className="home-ai-status">
                  Brouillon
                </strong>
              </div>

              <div className="home-ai-progress">
                <div className="home-ai-progress-bar"></div>
              </div>

            </div>

            <div className="home-floating-card home-floating-card-top">
              <span>Γ£ô</span>
              <div>
                <strong>Contenu structur├⌐</strong>
                <small>R├⌐dig├⌐ par vous</small>
              </div>
            </div>

            <div className="home-floating-card home-floating-card-bottom">
              <span>Γ£Ä</span>
              <div>
                <strong>Modification manuelle</strong>
                <small>Avant validation</small>
              </div>
            </div>

          </div>

        </section>

        {/* =====================================================
            TYPES DE CONTENU
        ===================================================== */}

        <section className="home-content-section">

          <div className="home-section-header">

            <span className="home-eyebrow">
              VOS CONTENUS
            </span>

            <h2>
              Un seul espace pour tous
              <br />
              vos contenus p├⌐dagogiques
            </h2>

            <p>
              ExoCraft vous accompagne dans la cr├⌐ation et
              la gestion de vos diff├⌐rents supports p├⌐dagogiques.
            </p>

          </div>

          <div className="home-content-grid">

            {contentTypes.map((content) => (
              <div
                className="home-content-card"
                key={content.title}
              >
                <div className="home-content-icon">
                  {content.icon}
                </div>

                <h3>{content.title}</h3>

                <p>{content.description}</p>
              </div>
            ))}

          </div>

        </section>

        {/* =====================================================
            WORKFLOW
        ===================================================== */}

        <section className="home-workflow-section">

          <div className="home-section-header">

            <span className="home-eyebrow">
              COMMENT ├çA MARCHE
            </span>

            <h2>
              De votre id├⌐e ├á votre
              <br />
              contenu p├⌐dagogique
            </h2>

          </div>

          <div className="home-workflow">

            <div className="home-workflow-step">
              <div className="home-workflow-number">
                01
              </div>

              <h3>D├⌐finissez votre contenu</h3>

              <p>
                Choisissez le type de contenu et saisissez
                votre th├¿me ou votre plan.
              </p>
            </div>

            <div className="home-workflow-line"></div>

            <div className="home-workflow-step">
              <div className="home-workflow-number">
                02
              </div>

              <h3>R├⌐digez votre contenu</h3>

              <p>
                R├⌐digez ou collez votre texte directement depuis le tableau de bord.
              </p>
            </div>

            <div className="home-workflow-line"></div>

            <div className="home-workflow-step">
              <div className="home-workflow-number">
                03
              </div>

              <h3>Modifiez et validez</h3>

              <p>
                Relisez et modifiez le contenu avant de
                le valider.
              </p>
            </div>

            <div className="home-workflow-line"></div>

            <div className="home-workflow-step">
              <div className="home-workflow-number">
                04
              </div>

              <h3>Organisez et retrouvez</h3>

              <p>
                Retrouvez vos contenus dans le tableau de bord et restaurez ceux que vous avez archiv├⌐s.
              </p>
            </div>

          </div>

        </section>

        {/* =====================================================
            ARCHIVES
        ===================================================== */}

        <section className="home-archive-section">

          <div className="home-archive-card">

            <div className="home-archive-icon">
              Γûñ
            </div>

            <div className="home-archive-content">

              <span className="home-eyebrow">
                ARCHIVES P├ëDAGOGIQUES
              </span>

              <h2>
                Retrouvez vos contenus supprim├⌐s
              </h2>

              <p>
                Un contenu supprim├⌐ est conserv├⌐ dans les archives. Vous pouvez le consulter et le restaurer dans votre tableau de bord ├á tout moment.
              </p>

            </div>

          </div>

        </section>

        {/* =====================================================
            CTA
        ===================================================== */}

        <section className="home-cta-section">

          <div className="home-cta">

            <span className="home-cta-icon">
              Γ£ª
            </span>

            <h2>
              Pr├¬t ├á cr├⌐er vos contenus
              p├⌐dagogiques ?
            </h2>

            <p>
              Commencez ├á utiliser ExoCraft pour simplifier
              la pr├⌐paration de vos supports p├⌐dagogiques.
            </p>

            <button
              type="button"
              className="home-primary-button"
              onClick={() => navigate("/register")}
            >
              Cr├⌐er un compte
              <span>ΓåÆ</span>
            </button>

          </div>

        </section>

      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="home-footer">

        <div className="home-footer-brand">
          <img
            src={logo}
            alt="ExoCraft"
            className="home-footer-logo"
          />

          <span>
            Espace de cr├⌐ation et de gestion de contenus p├⌐dagogiques.
          </span>
        </div>

        <div className="home-footer-copy">
          ┬⌐ 2026 ExoCraft
        </div>

      </footer>

    </div>
  );
}

export default Home;

