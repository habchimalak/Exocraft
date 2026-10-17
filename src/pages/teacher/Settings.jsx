import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../context/AuthContext";

function Settings() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.lastName || "Utilisateur ExoCraft");

  const [email, setEmail] = useState(
    user?.email || "utilisateur@exocraft.com"
  );

  const [language, setLanguage] = useState("Fran├ºais");

  const [notifications, setNotifications] =
    useState(true);

  const [saved, setSaved] = useState(false);

  const handleSave = (event) => {
    event.preventDefault();

    updateUser({ lastName: name.trim(), email: email.trim() });

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer votre compte ? Cette action est irr├⌐versible."
    );

    if (!confirmed) {
      return;
    }

    alert(
      "La suppression du compte sera disponible avec le backend."
    );
  };

  const handleChangePassword = () => {
    alert(
      "La modification du mot de passe sera disponible avec le backend."
    );
  };

  return (
    <DashboardLayout activePage="settings">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="settings-header">

        <div>

          <span className="dashboard-eyebrow">
            CONFIGURATION
          </span>

          <h1>
            Param├¿tres
          </h1>

          <p>
            G├⌐rez votre profil et les pr├⌐f├⌐rences de
            votre espace ExoCraft.
          </p>

        </div>

      </section>


      {/* =====================================================
          SETTINGS LAYOUT
      ===================================================== */}

      <div className="settings-layout">


        {/* =====================================================
            PROFIL
        ===================================================== */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-card-icon purple">
              Γùë
            </div>

            <div>

              <h2>
                Profil
              </h2>

              <p>
                G├⌐rez vos informations personnelles.
              </p>

            </div>

          </div>


          <form
            className="settings-form"
            onSubmit={handleSave}
          >

            <div className="settings-field">

              <label htmlFor="name">
                Nom
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Votre nom"
              />

            </div>


            <div className="settings-field">

              <label htmlFor="email">
                Adresse email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="exemple@email.com"
              />

            </div>


            <div className="settings-field">

              <label htmlFor="language">
                Langue
              </label>

              <select
                id="language"
                value={language}
                onChange={(event) =>
                  setLanguage(event.target.value)
                }
              >

                <option value="Fran├ºais">
                  Fran├ºais
                </option>

                <option value="English">
                  English
                </option>

                <option value="╪º┘ä╪╣╪▒╪¿┘è╪⌐">
                  ╪º┘ä╪╣╪▒╪¿┘è╪⌐
                </option>

              </select>

            </div>


            <div className="settings-save-row">

              <button
                type="submit"
                className="settings-save-button"
              >
                Enregistrer les modifications
              </button>

              {saved && (
                <span className="settings-saved">
                  Γ£ô Modifications enregistr├⌐es
                </span>
              )}

            </div>

          </form>

        </section>


        {/* =====================================================
            PR├ëF├ëRENCES
        ===================================================== */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-card-icon blue">
              ΓÜÖ
            </div>

            <div>

              <h2>
                Pr├⌐f├⌐rences
              </h2>

              <p>
                Personnalisez votre exp├⌐rience ExoCraft.
              </p>

            </div>

          </div>


          <div className="settings-options">


            {/* NOTIFICATIONS */}

            <div className="settings-option">

              <div>

                <strong>
                  Notifications
                </strong>

                <span>
                  Recevoir les notifications concernant
                  vos contenus et votre espace.
                </span>

              </div>


              <button
                type="button"
                className={
                  notifications
                    ? "settings-toggle active"
                    : "settings-toggle"
                }
                onClick={() =>
                  setNotifications(!notifications)
                }
                aria-label={
                  notifications
                    ? "D├⌐sactiver les notifications"
                    : "Activer les notifications"
                }
              >

                <span></span>

              </button>

            </div>


            {/* G├ëN├ëRATION INTELLIGENTE */}

            <div className="settings-option">

              <div>

                <strong>
                  Organisation des contenus
                </strong>

                <span>
                  Vos contenus restent class├⌐s par classe et par section.
                </span>

              </div>

              <span className="settings-status">
                Activ├⌐
              </span>

            </div>


            {/* SAUVEGARDE AUTOMATIQUE */}

            <div className="settings-option">

              <div>

                <strong>
                  Sauvegarde automatique
                </strong>

                <span>
                  Conserver automatiquement vos contenus
                  enregistr├⌐s.
                </span>

              </div>

              <span className="settings-status">
                Activ├⌐
              </span>

            </div>

          </div>

        </section>


        {/* =====================================================
            S├ëCURIT├ë
        ===================================================== */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-card-icon green">
              Γ£ô
            </div>

            <div>

              <h2>
                S├⌐curit├⌐
              </h2>

              <p>
                G├⌐rez la s├⌐curit├⌐ de votre compte.
              </p>

            </div>

          </div>


          <div className="security-content">


            {/* MOT DE PASSE */}

            <div className="security-row">

              <div>

                <strong>
                  Mot de passe
                </strong>

                <span>
                  Derni├¿re modification : jamais
                </span>

              </div>

              <button
                type="button"
                className="secondary-settings-button"
                onClick={handleChangePassword}
              >
                Modifier
              </button>

            </div>


            {/* SESSION */}

            <div className="security-row">

              <div>

                <strong>
                  Session actuelle
                </strong>

                <span>
                  Votre session ExoCraft est active.
                </span>

              </div>

              <span className="session-active">
                ΓùÅ Active
              </span>

            </div>

          </div>

        </section>


        {/* =====================================================
            COMPTE
        ===================================================== */}

        <section className="settings-card danger-card">

          <div className="settings-card-header">

            <div className="settings-card-icon red">
              !
            </div>

            <div>

              <h2>
                Compte
              </h2>

              <p>
                Actions concernant votre compte ExoCraft.
              </p>

            </div>

          </div>


          <div className="account-danger">

            <div>

              <strong>
                Supprimer mon compte
              </strong>

              <span>
                Cette action supprimera d├⌐finitivement
                votre compte et vos donn├⌐es.
              </span>

            </div>

            <button
              type="button"
              className="delete-account-button"
              onClick={handleDeleteAccount}
            >
              Supprimer
            </button>

          </div>

        </section>

      </div>

    </DashboardLayout>
  );
}

export default Settings;

