import { useState } from "react";
import DashboardLayout from "../../components/teacher/DashboardLayout";
import { useAuth } from "../../context/AuthContext";

function Settings() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.lastName || "Utilisateur ExoCraft");

  const [email, setEmail] = useState(
    user?.email || "utilisateur@exocraft.com"
  );

  const [language, setLanguage] = useState("Franâ”œÂºais");

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
      "Voulez-vous vraiment supprimer votre compte ? Cette action est irrâ”œâŒversible."
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
            Paramâ”œÂ¿tres
          </h1>

          <p>
            Gâ”œâŒrez votre profil et les prâ”œâŒfâ”œâŒrences de
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
              Î“Ã¹Ã«
            </div>

            <div>

              <h2>
                Profil
              </h2>

              <p>
                Gâ”œâŒrez vos informations personnelles.
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

                <option value="Franâ”œÂºais">
                  Franâ”œÂºais
                </option>

                <option value="English">
                  English
                </option>

                <option value="â•ªÂºâ”˜Ã¤â•ªâ•£â•ªâ–’â•ªÂ¿â”˜Ã¨â•ªâŒ">
                  â•ªÂºâ”˜Ã¤â•ªâ•£â•ªâ–’â•ªÂ¿â”˜Ã¨â•ªâŒ
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
                  Î“Â£Ã´ Modifications enregistrâ”œâŒes
                </span>
              )}

            </div>

          </form>

        </section>


        {/* =====================================================
            PRâ”œÃ«Fâ”œÃ«RENCES
        ===================================================== */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-card-icon blue">
              Î“ÃœÃ–
            </div>

            <div>

              <h2>
                Prâ”œâŒfâ”œâŒrences
              </h2>

              <p>
                Personnalisez votre expâ”œâŒrience ExoCraft.
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
                    ? "Dâ”œâŒsactiver les notifications"
                    : "Activer les notifications"
                }
              >

                <span></span>

              </button>

            </div>


            {/* Gâ”œÃ«Nâ”œÃ«RATION INTELLIGENTE */}

            <div className="settings-option">

              <div>

                <strong>
                  Organisation des contenus
                </strong>

                <span>
                  Vos contenus restent classâ”œâŒs par classe et par section.
                </span>

              </div>

              <span className="settings-status">
                Activâ”œâŒ
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
                  enregistrâ”œâŒs.
                </span>

              </div>

              <span className="settings-status">
                Activâ”œâŒ
              </span>

            </div>

          </div>

        </section>


        {/* =====================================================
            Sâ”œÃ«CURITâ”œÃ«
        ===================================================== */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-card-icon green">
              Î“Â£Ã´
            </div>

            <div>

              <h2>
                Sâ”œâŒcuritâ”œâŒ
              </h2>

              <p>
                Gâ”œâŒrez la sâ”œâŒcuritâ”œâŒ de votre compte.
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
                  Derniâ”œÂ¿re modification : jamais
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
                Î“Ã¹Ã… Active
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
                Cette action supprimera dâ”œâŒfinitivement
                votre compte et vos donnâ”œâŒes.
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
