// ΓöÇΓöÇΓöÇ Base URL ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
// Gr├óce au proxy Vite, on utilise un chemin relatif en dev
// En production, pointer vers l'URL r├⌐elle du backend
const API_URL = "/api";

// ΓöÇΓöÇΓöÇ Token JWT ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
function getToken() {
  return localStorage.getItem("exocraft_token");
}

export function setToken(token) {
  localStorage.setItem("exocraft_token", token);
}

export function removeToken() {
  localStorage.removeItem("exocraft_token");
  localStorage.removeItem("exocraft_user");
}

// ΓöÇΓöÇΓöÇ Requ├¬te g├⌐n├⌐rique ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
async function apiRequest(endpoint, options = {}) {
  const token = getToken();

  // Pour les requ├¬tes multipart (upload), on ne met pas Content-Type
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Session expir├⌐e ΓåÆ redirection login
  if (response.status === 401) {
    removeToken();
    window.location.href = "/login";
    throw new Error("Session expir├⌐e. Veuillez vous reconnecter.");
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const message = Array.isArray(err.message)
      ? err.message.join(", ")
      : err.message || "Une erreur est survenue.";
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

// ΓöÇΓöÇΓöÇ Auth ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
export const authApi = {
  // POST /api/auth/login  { email, password }
  login: async ({ email, password }) => {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data?.access_token) setToken(data.access_token);
    return data; // { access_token, user: { id, firstName, lastName, email, role, associations } }
  },

  // POST /api/auth/register { firstName, lastName, email, password, associations }
  register: async ({ firstName, lastName, email, password, associations }) => {
    const data = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({ firstName, lastName, email, password, associations }),
    });
    if (data?.access_token) setToken(data.access_token);
    return data;
  },

  logout: () => removeToken(),
  isAuthenticated: () => !!getToken(),
};

// ΓöÇΓöÇΓöÇ Contenus p├⌐dagogiques (cours, r├⌐sum├⌐, s├⌐rie, s├⌐rie, examen) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
export const contentApi = {
  getMesContenus: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/contents/mes-contenus${q ? "?" + q : ""}`);
  },
  getPublic: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/contents/public${q ? "?" + q : ""}`);
  },
  getOne:   (id)       => apiRequest(`/contents/${id}`),
  create:   (data)     => apiRequest("/contents",        { method: "POST",   body: JSON.stringify(data) }),
  update:   (id, data) => apiRequest(`/contents/${id}`,  { method: "PATCH",  body: JSON.stringify(data) }),
  remove:   (id)       => apiRequest(`/contents/${id}`,  { method: "DELETE" }),
  valider:  (id)       => apiRequest(`/contents/${id}/valider`,    { method: "PATCH" }),
  publier:  (id)       => apiRequest(`/contents/${id}/visibilite`, { method: "PATCH" }),
  dupliquer:(id)       => apiRequest(`/contents/${id}/dupliquer`,  { method: "POST"  }),
  // Archivage
  archiver:    (id)    => apiRequest(`/contents/${id}/archiver`,    { method: "PATCH" }),
  desarchiver: (id)    => apiRequest(`/contents/${id}/desarchiver`, { method: "PATCH" }),
  getArchived: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/contents/archived/list${q ? "?" + q : ""}`);
  },
};

// ΓöÇΓöÇΓöÇ Quiz ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
export const quizApi = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/quiz${q ? "?" + q : ""}`);
  },
  getOne:           (id)           => apiRequest(`/quiz/${id}`),
  create:           (data)         => apiRequest("/quiz",             { method: "POST",   body: JSON.stringify(data) }),
  update:           (id, data)     => apiRequest(`/quiz/${id}`,       { method: "PATCH",  body: JSON.stringify(data) }),
  remove:           (id)           => apiRequest(`/quiz/${id}`,       { method: "DELETE" }),
  valider:          (id)           => apiRequest(`/quiz/${id}/valider`,    { method: "PATCH" }),
  publier:          (id)           => apiRequest(`/quiz/${id}/visibilite`, { method: "PATCH" }),
  creerVariante:    (id)           => apiRequest(`/quiz/${id}/variante`,   { method: "POST"  }),
  importFromAi:     (data)         => apiRequest("/quiz/import",       { method: "POST",   body: JSON.stringify(data) }),
  addQuestion:      (id, q)        => apiRequest(`/quiz/${id}/questions`,         { method: "POST",   body: JSON.stringify(q) }),
  updateQuestion:   (id, qid, q)   => apiRequest(`/quiz/${id}/questions/${qid}`,  { method: "PATCH",  body: JSON.stringify(q) }),
  removeQuestion:   (id, qid)      => apiRequest(`/quiz/${id}/questions/${qid}`,  { method: "DELETE" }),
  // Archivage
  archiver:    (id)    => apiRequest(`/quiz/${id}/archiver`,    { method: "PATCH" }),
  desarchiver: (id)    => apiRequest(`/quiz/${id}/desarchiver`, { method: "PATCH" }),
  getArchived: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/quiz/archived/list${q ? "?" + q : ""}`);
  },
};

// ΓöÇΓöÇΓöÇ IA ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
export const aiApi = {
  // G├⌐n├¿re un contenu structur├⌐ (quiz, cours, s├⌐rie, examen, r├⌐sum├⌐)
  generate: (data) => apiRequest("/ai/generate", { method: "POST", body: JSON.stringify(data) }),

  // G├⌐n├¿re depuis une archive existante
  generateFromArchive: (archiveId, data) =>
    apiRequest(`/ai/generate-from-archive/${archiveId}`, { method: "POST", body: JSON.stringify(data) }),

  // Chat libre
  chat: (message, historique = []) =>
    apiRequest("/ai/chat", { method: "POST", body: JSON.stringify({ message, historique }) }),

  // Sauvegarder un contenu g├⌐n├⌐r├⌐
  save:     (data) => apiRequest("/ai/save",                        { method: "POST",  body: JSON.stringify(data) }),
  valider:  (id)   => apiRequest(`/ai/contents/${id}/valider`,      { method: "PATCH" }),
  modifier: (id, contenu) =>
    apiRequest(`/ai/contents/${id}/modifier`, { method: "PATCH", body: JSON.stringify({ contenu }) }),
  getContents: () => apiRequest("/ai/contents"),
};

// ΓöÇΓöÇΓöÇ Mati├¿res ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
export const matiereApi = {
  getAll:  ()           => apiRequest("/matieres"),
  create:  (data)       => apiRequest("/matieres",      { method: "POST",   body: JSON.stringify(data) }),
  update:  (id, data)   => apiRequest(`/matieres/${id}`,{ method: "PATCH",  body: JSON.stringify(data) }),
  remove:  (id)         => apiRequest(`/matieres/${id}`,{ method: "DELETE" }),
};

// ΓöÇΓöÇΓöÇ Promotions ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
export const promotionApi = {
  getAll:  ()           => apiRequest("/promotions"),
  create:  (data)       => apiRequest("/promotions",      { method: "POST",   body: JSON.stringify(data) }),
  update:  (id, data)   => apiRequest(`/promotions/${id}`,{ method: "PATCH",  body: JSON.stringify(data) }),
  remove:  (id)         => apiRequest(`/promotions/${id}`,{ method: "DELETE" }),
};

// ΓöÇΓöÇΓöÇ Archives ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
export const archiveApi = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/archives${q ? "?" + q : ""}`);
  },
  getForEnseignant: (matieres = [], promotions = []) =>
    apiRequest(`/archives/enseignant?matieres=${matieres.join(",")}&promotions=${promotions.join(",")}`),
  getOne:   (id) => apiRequest(`/archives/${id}`),
  getTexte: (id) => apiRequest(`/archives/${id}/texte`),
  upload: (file, matiere, promotion) => {
    const form = new FormData();
    form.append("fichier", file);
    form.append("matiere", matiere);
    form.append("promotion", promotion);
    return apiRequest("/archives/upload", { method: "POST", body: form });
  },
  remove: (id) => apiRequest(`/archives/${id}`, { method: "DELETE" }),
};

// ΓöÇΓöÇΓöÇ Export (URLs directes ΓÇö l'utilisateur clique pour t├⌐l├⌐charger) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
export const exportApi = {
  contentPdfUrl:  (id)              => `${API_URL}/export/content/${id}/pdf`,
  contentWordUrl: (id)              => `${API_URL}/export/content/${id}/word`,
  quizPdfUrl:     (id, corrige = false) => `${API_URL}/export/quiz/${id}/pdf${corrige ? "?corrige=true" : ""}`,
  quizWordUrl:    (id, corrige = false) => `${API_URL}/export/quiz/${id}/word${corrige ? "?corrige=true" : ""}`,
  // Ouvre le t├⌐l├⌐chargement dans un nouvel onglet (token inject├⌐ dans l'URL)
  download: (url) => {
    const token = getToken();
    window.open(`${url}${url.includes("?") ? "&" : "?"}token=${token}`, "_blank");
  },

  // Export direct depuis texte brut ΓÇö apr├¿s g├⌐n├⌐ration IA (t├⌐l├⌐charge directement)
  directPdf: async ({ titre, matiere, theme, type, contenu, avecCorrige }) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/export/direct/pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ titre, matiere, theme, type, contenu, avecCorrige }),
    });
    if (!response.ok) throw new Error("Erreur lors de la g├⌐n├⌐ration du PDF.");
    const blob = await response.blob();
    const suffix = avecCorrige ? "-corrige" : "-etudiant";
    const filename = `${type}-${theme.slice(0, 30).replace(/\s/g, "-")}${suffix}.pdf`;
    _downloadBlob(blob, filename);
  },

  directWord: async ({ titre, matiere, theme, type, contenu, avecCorrige }) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/export/direct/word`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ titre, matiere, theme, type, contenu, avecCorrige }),
    });
    if (!response.ok) throw new Error("Erreur lors de la g├⌐n├⌐ration du Word.");
    const blob = await response.blob();
    const suffix = avecCorrige ? "-corrige" : "-etudiant";
    const filename = `${type}-${theme.slice(0, 30).replace(/\s/g, "-")}${suffix}.docx`;
    _downloadBlob(blob, filename);
  },
};

// Helper : d├⌐clencher le t├⌐l├⌐chargement d'un blob dans le navigateur
function _downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ΓöÇΓöÇΓöÇ Admin ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
export const adminApi = {
  getDashboard:       ()           => apiRequest("/admin/dashboard"),
  getUsers:           ()           => apiRequest("/admin/users"),
  deleteUser:         (id)         => apiRequest(`/admin/users/${id}`, { method: "DELETE" }),
  assignerMatieres:   (id, list)   => apiRequest(`/admin/users/${id}/matieres`,   { method: "PATCH", body: JSON.stringify({ matieres: list }) }),
  assignerPromotions: (id, list)   => apiRequest(`/admin/users/${id}/promotions`, { method: "PATCH", body: JSON.stringify({ promotions: list }) }),
};

// ΓöÇΓöÇΓöÇ Export group├⌐ (compatibilit├⌐ avec l'ancien api.js de Rami) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
export const api = {
  login:      (data) => authApi.login(data),
  register:   (data) => authApi.register(data),
  getQuizzes: ()     => quizApi.getAll(),
  createQuiz: (data) => quizApi.create(data),
  getHistory: ()     => contentApi.getMesContenus(),
};

export default api;
