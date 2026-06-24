const DATA_PATHS = {
  plan: "./data/plan.json",
  rules: "./data/evidence-rules.json",
  index: "./data/evidence-index.json"
};

const UPLOAD_ACCESS = {
  user: "admin",
  password: "Muyuyo2026#"
};

const HISTORICAL_PERIODS = [
  {
    id: "2015_06_a_2016_05",
    label: "Junio 2015 - mayo 2016",
    type: "Periodo anual excepcional"
  },
  {
    id: "2016_06_a_2018_05",
    label: "Junio 2016 - mayo 2018",
    type: "Periodo bianual"
  },
  {
    id: "2018_06_a_2020_05",
    label: "Junio 2018 - mayo 2020",
    type: "Periodo bianual"
  },
  {
    id: "2020_06_a_2022_05",
    label: "Junio 2020 - mayo 2022",
    type: "Periodo bianual"
  },
  {
    id: "2022_06_a_2024_05",
    label: "Junio 2022 - mayo 2024",
    type: "Periodo bianual"
  },
  {
    id: "2024_06_a_2026_05",
    label: "Junio 2024 - mayo 2026",
    type: "Periodo bianual"
  },
  {
    id: "2026_06_a_2028_05",
    label: "Junio 2026 - mayo 2028",
    type: "Periodo bianual"
  },
  {
    id: "2028_06_a_2030_05",
    label: "Junio 2028 - mayo 2030",
    type: "Periodo bianual"
  }
];

const CURRENT_PLAN_START_PERIOD = "2026_06_a_2028_05";

const EVIDENCE_YEARS = [2026, 2027, 2028, 2029, 2030];

const EVIDENCE_FOLDER_TEMPLATES = [
  ["01_patente_municipal", "Patente municipal"],
  ["02_bomberos", "Bomberos"],
  ["03_desechos_solidos", "Desechos solidos"],
  ["04_productos_proveedor", "Productos proveedor"],
  ["05_verificacion_semestral", "Verificacion semestral"],
  ["06_acta_anual_pma_simulacro", "Acta anual PMA y simulacro"],
  ["07_incidentes_acciones_quejas", "Incidentes, acciones o quejas"]
];

const DESTINATION_FOLDERS = [
  ...EVIDENCE_YEARS.flatMap((year) =>
    EVIDENCE_FOLDER_TEMPLATES.map(([folder, label]) => [`evidencias/${year}/${folder}`, `${label} ${year}`])
  ),
  ["documentos_pma/pma_final", "PMA final"],
  ...HISTORICAL_PERIODS.flatMap((period) => [
    [`documentos_pma/informes_bianuales/${period.id}`, `Informe de cumplimiento ${period.label}`],
    [`documentos_pma/oficios_presentacion/${period.id}`, `Oficio de presentacion ${period.label}`],
    [`documentos_pma/anexos/${period.id}`, `Anexos ${period.label}`]
  ])
];

const MEASURE_EVIDENCE_TYPES = {
  agua_energia: "verificacion_semestral",
  productos_respaldo: "productos_proveedor",
  desechos_verificacion: "verificacion_semestral",
  desechos_comprobante_municipal: "desechos_solidos",
  bomberos: "bomberos",
  acta_pma_simulacro: "acta_pma_simulacro",
  incidentes: "incidentes_acciones_quejas",
  patente_municipal: "patente_municipal",
  matriz_control: "matriz_control",
  dashboard_actualizado: "dashboard_actualizado"
};

const MEASURE_DEFAULT_FOLDERS = {
  agua_energia: "evidencias/2026/05_verificacion_semestral",
  productos_respaldo: "evidencias/2026/04_productos_proveedor",
  desechos_verificacion: "evidencias/2026/05_verificacion_semestral",
  desechos_comprobante_municipal: "evidencias/2026/03_desechos_solidos",
  bomberos: "evidencias/2026/02_bomberos",
  acta_pma_simulacro: "evidencias/2026/06_acta_anual_pma_simulacro",
  incidentes: "evidencias/2026/07_incidentes_acciones_quejas",
  patente_municipal: "evidencias/2026/01_patente_municipal",
  matriz_control: "documentos_pma/pma_final",
  dashboard_actualizado: "public"
};

const FALLBACK_PLAN = {
  project: {
    currentYear: 2026
  },
  subplans: [
    { id: "prevencion_mitigacion", name: "Prevencion y mitigacion", measures: [] },
    { id: "manejo_desechos", name: "Manejo de desechos", measures: [] },
    { id: "contingencias_seguridad", name: "Contingencias y seguridad", measures: [] },
    { id: "cumplimiento_legal_municipal", name: "Cumplimiento legal municipal", measures: [] },
    { id: "seguimiento_control_documental", name: "Seguimiento y control documental", measures: [] },
    { id: "dashboard_png", name: "Dashboard para revision del PNG", measures: [] }
  ]
};

const FALLBACK_RULES = {
  rules: []
};

const FALLBACK_INDEX = {
  updatedAt: null,
  year: 2026,
  files: [],
  summary: {
    totalFiles: 0,
    foldersIndexed: 0,
    updateMode: "manual"
  }
};

const state = {
  plan: null,
  rules: null,
  evidenceIndex: null,
  measures: [],
  filters: {
    period: CURRENT_PLAN_START_PERIOD,
    subplan: "todos",
    status: "todos",
    frequency: "todos",
    text: ""
  },
  uploadUnlocked: false
};

async function loadJson(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw new Error(`No se pudo cargar ${path}`);
  return response.json();
}

function normalizePath(path) {
  return String(path || "").replace(/\\/g, "/").replace(/\/+$/, "");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function filesForRule(rule, evidenceIndex) {
  const folders = rule.requiredEvidence.map(normalizePath);
  return (evidenceIndex.files || []).filter((file) => {
    const filePath = normalizePath(file.path);
    return folders.some((folder) => filePath.startsWith(folder + "/") || filePath === folder);
  });
}

function statusForMeasure(measure, rule, files) {
  const manualStatus = files.find((file) => file.measureId === measure.id && file.status)?.status;
  if (manualStatus) return manualStatus;
  if (!rule) return "pendiente";
  if (rule.defaultStatus && Number(rule.minimumFiles) === 0 && files.length === 0) {
    return rule.defaultStatus;
  }
  return files.length >= Number(rule.minimumFiles || 1) ? "cumple" : (rule.statusWhenMissing || "pendiente");
}

function flattenMeasures(plan, rules, evidenceIndex) {
  return plan.subplans.flatMap((subplan) =>
    subplan.measures.map((measure) => {
      const rule = rules.rules.find((item) => item.measureId === measure.id);
      const ruleFiles = rule ? filesForRule(rule, evidenceIndex) : [];
      const directFiles = (evidenceIndex.files || []).filter((file) => file.measureId === measure.id);
      const files = Array.from(new Map([...ruleFiles, ...directFiles].map((file) => [normalizePath(file.path), file])).values());
      const datedFiles = files.filter((file) => file.reviewDate || file.date);
      const lastDatedFile = datedFiles.sort((a, b) => String(b.reviewDate || b.date).localeCompare(String(a.reviewDate || a.date)))[0];
      return {
        subplanId: subplan.id,
        subplan: subplan.name,
        ...measure,
        rule,
        evidence: files,
        periods: Array.from(new Set(files.map((file) => file.period).filter(Boolean))),
        status: statusForMeasure(measure, rule, files),
        reviewDate: lastDatedFile?.reviewDate || lastDatedFile?.date || "",
        notes: lastDatedFile?.notes || ""
      };
    })
  );
}

function statusLabel(status) {
  return {
    cumple: "Cumple",
    pendiente: "Pendiente",
    no_aplica: "No aplica",
    en_correccion: "En correccion"
  }[status] || status;
}

function renderSummary(measures) {
  const counts = measures.reduce((acc, measure) => {
    acc[measure.status] = (acc[measure.status] || 0) + 1;
    return acc;
  }, {});
  const total = measures.length;
  const complied = counts.cumple || 0;
  const percent = total ? Math.round((complied / total) * 100) : 0;
  const cards = [
    ["Cumplimiento", `${percent}%`],
    ["Medidas", total],
    ["Cumple", complied],
    ["Pendiente", counts.pendiente || 0],
    ["No aplica", counts.no_aplica || 0],
    ["En correccion", counts.en_correccion || 0]
  ];
  document.getElementById("summary").innerHTML = cards
    .map(([label, value]) => `<article class="metric"><span>${label}</span><strong>${value}</strong></article>`)
    .join("");
}

function activePeriodLabel() {
  if (state.filters.period === "todos") return "Todos los periodos vigentes desde junio 2026";
  const label = periodLabel(state.filters.period);
  if (!isCurrentPlanPeriod(state.filters.period)) return `${label} - expediente historico, no aplica matriz vigente`;
  return label;
}

function populateFilters() {
  const periodSelect = document.getElementById("filter-period");
  const editorPeriodSelect = document.getElementById("evidence-period");
  const editorSubplanSelect = document.getElementById("evidence-subplan");
  const assistedFolderSelect = document.getElementById("assisted-folder");
  const matrixMeasureSelect = document.getElementById("matrix-measure");
  const matrixPeriodSelect = document.getElementById("matrix-period");
  const subplanSelect = document.getElementById("filter-subplan");
  const frequencySelect = document.getElementById("filter-frequency");
  const periods = [["todos", "Todos"], ...HISTORICAL_PERIODS.map((item) => [item.id, item.label])];
  const subplans = [["todos", "Todos"], ...state.plan.subplans.map((item) => [item.id, item.name])];
  const frequencies = [["todos", "Todas"], ...Array.from(new Set(state.measures.map((m) => m.frequency))).map((f) => [f, f])];
  periodSelect.innerHTML = periods.map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join("");
  periodSelect.value = state.filters.period;
  editorPeriodSelect.innerHTML = HISTORICAL_PERIODS.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.label)}</option>`).join("");
  editorPeriodSelect.value = CURRENT_PLAN_START_PERIOD;
  matrixPeriodSelect.innerHTML = HISTORICAL_PERIODS.filter((item) => isCurrentPlanPeriod(item.id)).map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.label)}</option>`).join("");
  matrixPeriodSelect.value = CURRENT_PLAN_START_PERIOD;
  matrixMeasureSelect.innerHTML = state.plan.subplans.flatMap((subplan) =>
    subplan.measures.map((measure) => `<option value="${escapeHtml(measure.id)}">${escapeHtml(subplan.name)} - ${escapeHtml(measure.description)}</option>`)
  ).join("");
  editorSubplanSelect.innerHTML = state.plan.subplans.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)}</option>`).join("");
  assistedFolderSelect.innerHTML = DESTINATION_FOLDERS.map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join("");
  subplanSelect.innerHTML = subplans.map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join("");
  frequencySelect.innerHTML = frequencies.map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join("");
}

function scopeMeasureToSelectedPeriod(measure) {
  if (state.filters.period === "todos") return measure;
  const evidence = measure.evidence.filter((file) => file.period === state.filters.period || normalizePath(file.path).includes(state.filters.period));
  const datedEvidence = evidence.filter((file) => file.reviewDate || file.date)
    .sort((a, b) => String(b.reviewDate || b.date).localeCompare(String(a.reviewDate || a.date)));
  return {
    ...measure,
    evidence,
    periods: Array.from(new Set(evidence.map((file) => file.period).filter(Boolean))),
    status: statusForMeasure(measure, measure.rule, evidence),
    reviewDate: datedEvidence[0]?.reviewDate || datedEvidence[0]?.date || "",
    notes: evidence.find((file) => file.notes)?.notes || ""
  };
}

function periodScopedMeasures() {
  if (!isCurrentPlanPeriod(state.filters.period)) return [];
  return state.measures.map(scopeMeasureToSelectedPeriod);
}

function filteredMeasures() {
  const text = state.filters.text.trim().toLowerCase();
  return periodScopedMeasures().filter((measure) => {
    const matchSubplan = state.filters.subplan === "todos" || measure.subplanId === state.filters.subplan;
    const matchStatus = state.filters.status === "todos" || measure.status === state.filters.status;
    const matchFrequency = state.filters.frequency === "todos" || measure.frequency === state.filters.frequency;
    const haystack = [measure.subplan, measure.description, measure.responsible, measure.frequency, measure.verifier, measure.criterion].join(" ").toLowerCase();
    const matchText = !text || haystack.includes(text);
    return matchSubplan && matchStatus && matchFrequency && matchText;
  });
}

function evidenceLinks(files) {
  if (!files.length) return `<span class="muted">Sin evidencia registrada</span>`;
  return `<div class="evidence-links">${files
    .map((file) => `<a href="./${escapeHtml(file.path)}" target="_blank" rel="noopener">${escapeHtml(file.name || file.path)}</a>`)
    .join("")}</div>`;
}

function renderMatrix() {
  const measures = filteredMeasures();
  document.getElementById("matrix-count").textContent = `${measures.length} medidas`;
  document.getElementById("matrix-period-context").textContent = `Periodo: ${activePeriodLabel()}`;
  document.getElementById("matrix-body").innerHTML = measures
    .map((measure) => `
      <tr>
        <td>${escapeHtml(measure.subplan)}</td>
        <td>${escapeHtml(measure.description)}</td>
        <td>${escapeHtml(measure.responsible)}</td>
        <td>${escapeHtml(measure.frequency)}</td>
        <td>${escapeHtml(measure.verifier)}</td>
        <td>${escapeHtml(measure.criterion || "")}</td>
        <td>${escapeHtml(measure.reviewDate || "")}</td>
        <td><span class="status ${escapeHtml(measure.status)}">${statusLabel(measure.status)}</span></td>
        <td>${evidenceLinks(measure.evidence)}</td>
      </tr>
    `)
    .join("");
}

function renderPeriodContext() {
  const context = document.getElementById("active-period-context");
  if (context) {
    context.textContent = `Periodo de revision: ${activePeriodLabel()}`;
  }
}

function renderAlerts() {
  const alerts = periodScopedMeasures().filter((measure) => measure.status === "pendiente" || measure.status === "en_correccion");
  const box = document.getElementById("alerts");
  if (!alerts.length) {
    box.innerHTML = document.getElementById("empty-template").innerHTML;
    return;
  }
  box.innerHTML = alerts
    .map((measure) => `
      <article class="item">
        <h3>${escapeHtml(measure.subplan)}</h3>
        <p>${escapeHtml(measure.description)}</p>
        <p><strong>Verificador:</strong> ${escapeHtml(measure.verifier)}</p>
        <span class="status ${escapeHtml(measure.status)}">${statusLabel(measure.status)}</span>
      </article>
    `)
    .join("");
}

function renderEvidenceList() {
  const files = filesForSelectedPeriod(state.evidenceIndex.files || []);
  document.getElementById("evidence-count").textContent = `${files.length} archivos registrados`;
  const list = document.getElementById("evidence-list");
  if (!files.length) {
    list.innerHTML = document.getElementById("empty-template").innerHTML;
    return;
  }
  list.innerHTML = files
    .map((file) => `
      <article class="item">
        <h3>${escapeHtml(file.name || file.path)}</h3>
        <p>${escapeHtml(documentKindLabel(file.type || "sin_tipo"))} - ${escapeHtml(file.year || "")}${file.subplanId ? ` - ${escapeHtml(subplanName(file.subplanId))}` : ""}${file.status ? ` - ${escapeHtml(statusLabel(file.status))}` : ""}${file.reviewDate ? ` - ${escapeHtml(file.reviewDate)}` : ""}</p>
        ${file.notes ? `<p>${escapeHtml(file.notes)}</p>` : ""}
        <a href="./${escapeHtml(file.path)}" target="_blank" rel="noopener">${escapeHtml(file.path)}</a>
      </article>
    `)
    .join("");
}

function filesForSelectedPeriod(files) {
  if (state.filters.period === "todos") return files;
  return files.filter((file) => file.period === state.filters.period || normalizePath(file.path).includes(state.filters.period));
}

function isCurrentPlanPeriod(periodId) {
  if (!periodId || periodId === "todos") return true;
  const periodIndex = HISTORICAL_PERIODS.findIndex((period) => period.id === periodId);
  const startIndex = HISTORICAL_PERIODS.findIndex((period) => period.id === CURRENT_PLAN_START_PERIOD);
  return periodIndex >= startIndex;
}

function downloadableDocumentsForSelectedPeriod() {
  if (state.filters.period === "todos") return [];
  const files = filesForSelectedPeriod(state.evidenceIndex?.files || []);
  return files.filter((file) =>
    normalizePath(file.path).startsWith("documentos_pma/") ||
    ["plan_actualizado", "informe_cumplimiento", "informe_anual", "informe_bianual", "oficio_presentacion", "anexos"].includes(file.type)
  );
}

function documentKindLabel(type) {
  return {
    plan_actualizado: "Plan actualizado",
    informe_cumplimiento: "Informe de cumplimiento",
    informe_anual: "Informe de cumplimiento",
    informe_bianual: "Informe de cumplimiento",
    oficio_presentacion: "Oficio de presentacion",
    anexos: "Anexos",
    patente_municipal: "Patente municipal",
    bomberos: "Bomberos",
    desechos_solidos: "Desechos solidos",
    productos_proveedor: "Productos proveedor",
    verificacion_semestral: "Verificacion semestral",
    acta_pma_simulacro: "Acta PMA y simulacro",
    incidentes_acciones_quejas: "Incidentes, acciones o quejas",
    matriz_control: "Matriz de cumplimiento",
    dashboard_actualizado: "Dashboard actualizado"
  }[type] || type || "Documento";
}

function renderPeriodDocuments() {
  const container = document.getElementById("period-documents");
  const downloadable = downloadableDocumentsForSelectedPeriod();
  document.getElementById("period-doc-count").textContent = `${downloadable.length} documentos registrados`;
  document.getElementById("download-documents").disabled = downloadable.length === 0;
  if (!downloadable.length) {
    if (state.filters.period === "todos") {
      container.innerHTML = `
        <article class="item">
          <h3>Seleccione un periodo</h3>
          <p>Use el filtro Periodo para ver y descargar solo los documentos correspondientes.</p>
        </article>
      `;
      return;
    }
    container.innerHTML = `
          <article class="item">
            <h3>${escapeHtml(periodLabel(state.filters.period))}</h3>
            <p>No hay documentos registrados en el indice manual.</p>
            <a href="./documentos_pma/informes_bianuales/${escapeHtml(state.filters.period)}/" target="_blank" rel="noopener">Abrir carpeta del informe</a>
            <br>
            <a href="./documentos_pma/oficios_presentacion/${escapeHtml(state.filters.period)}/" target="_blank" rel="noopener">Abrir carpeta de oficios</a>
            <br>
            <a href="./documentos_pma/anexos/${escapeHtml(state.filters.period)}/" target="_blank" rel="noopener">Abrir carpeta de anexos</a>
          </article>
        `;
    return;
  }
  container.innerHTML = downloadable
    .map((file) => `
      <article class="item">
        <h3>${escapeHtml(documentKindLabel(file.type))}</h3>
        <p>${escapeHtml(periodLabel(file.period))}</p>
        <a href="./${escapeHtml(file.path)}" target="_blank" rel="noopener" download>${escapeHtml(file.name || file.path)}</a>
      </article>
    `)
    .join("");
}

function periodLabel(periodId) {
  return HISTORICAL_PERIODS.find((period) => period.id === periodId)?.label || periodId || "Sin periodo";
}

function subplanName(subplanId) {
  return state.plan?.subplans?.find((subplan) => subplan.id === subplanId)?.name || subplanId || "";
}

function measureById(measureId) {
  for (const subplan of state.plan?.subplans || []) {
    const measure = subplan.measures.find((item) => item.id === measureId);
    if (measure) return { ...measure, subplanId: subplan.id, subplan: subplan.name };
  }
  return null;
}

function periodStartYear(periodId) {
  const match = String(periodId || "").match(/^(\d{4})_/);
  return match ? Number(match[1]) : Number(state.plan?.project?.currentYear || 2026);
}

function filenameFromPath(path) {
  return normalizePath(path).split("/").pop() || "";
}

function syncMatrixMeasureFields() {
  const measureId = document.getElementById("matrix-measure")?.value;
  const period = document.getElementById("matrix-period")?.value || CURRENT_PLAN_START_PERIOD;
  const pathInput = document.getElementById("matrix-path");
  const nameInput = document.getElementById("matrix-name");
  const folder = MEASURE_DEFAULT_FOLDERS[measureId] || "evidencias/2026/05_verificacion_semestral";
  if (pathInput && !pathInput.value.trim()) {
    const year = periodStartYear(period);
    pathInput.placeholder = `${folder.replace("/2026/", `/${year}/`)}/archivo.pdf`;
  }
  if (nameInput && !nameInput.value.trim()) {
    nameInput.placeholder = "archivo.pdf";
  }
}

function renderAll() {
  renderPeriodContext();
  renderSummary(periodScopedMeasures());
  renderMatrix();
  renderAlerts();
  renderEvidenceList();
  renderPeriodDocuments();
  document.getElementById("last-update").textContent = state.evidenceIndex.updatedAt
    ? `Indice: ${state.evidenceIndex.updatedAt}`
    : "Indice pendiente";
}

function safeSessionGet(key) {
  try {
    return sessionStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function safeSessionSet(key, value) {
  try {
    sessionStorage.setItem(key, value);
  } catch (error) {
    // El acceso queda activo solo durante la sesion actual si el navegador bloquea sessionStorage.
  }
}

function showView(viewName) {
  const dashboardView = document.getElementById("view-dashboard");
  const uploadView = document.getElementById("view-upload");
  const dashboardButton = document.getElementById("nav-dashboard");
  const uploadButton = document.getElementById("nav-upload");
  if (!dashboardView || !uploadView || !dashboardButton || !uploadButton) return;
  const isUpload = viewName === "upload";
  dashboardView.hidden = isUpload;
  uploadView.hidden = !isUpload;
  dashboardButton.classList.toggle("active", !isUpload);
  uploadButton.classList.toggle("active", isUpload);
}

function unlockUpload() {
  state.uploadUnlocked = true;
  safeSessionSet("pmaUploadUnlocked", "true");
  document.getElementById("upload-login").hidden = true;
  document.getElementById("upload-workspace").hidden = false;
  document.getElementById("login-message").textContent = "";
}

function handleLogin(event) {
  event.preventDefault();
  const user = document.getElementById("login-user").value.trim();
  const password = document.getElementById("login-pass").value;
  if (user === UPLOAD_ACCESS.user && password === UPLOAD_ACCESS.password) {
    unlockUpload();
    event.target.reset();
    return;
  }
  document.getElementById("login-message").textContent = "Usuario o contrasena incorrectos.";
}

function setupNavigation() {
  const menu = document.querySelector(".main-menu");
  if (!menu || menu.dataset.ready === "true") return;
  menu.dataset.ready = "true";
  menu.addEventListener("click", (event) => {
    const button = event.target.closest("[data-view]");
    if (!button) return;
    showView(button.dataset.view);
  });
}

function setupUploadAccess() {
  const loginForm = document.getElementById("login-form");
  if (!loginForm || loginForm.dataset.ready === "true") return;
  loginForm.dataset.ready = "true";
  loginForm.addEventListener("submit", handleLogin);
  if (safeSessionGet("pmaUploadUnlocked") === "true") {
    unlockUpload();
  }
}

function inferPeriod(path) {
  const normalized = normalizePath(path).toLowerCase();
  return HISTORICAL_PERIODS.find((period) => normalized.includes(period.id))?.id || CURRENT_PLAN_START_PERIOD;
}

function inferMeta(path) {
  const normalized = normalizePath(path).toLowerCase();
  if (normalized.includes("patente")) {
    return { type: "patente_municipal", subplanId: "cumplimiento_legal_municipal" };
  }
  if (normalized.includes("bombero") || normalized.includes("inspeccion")) {
    return { type: "bomberos", subplanId: "contingencias_seguridad" };
  }
  if (normalized.includes("desechos") || normalized.includes("recoleccion")) {
    return { type: "desechos_solidos", subplanId: "manejo_desechos" };
  }
  if (normalized.includes("producto") || normalized.includes("proveedor") || normalized.includes("certificacion")) {
    return { type: "productos_proveedor", subplanId: "prevencion_mitigacion" };
  }
  if (normalized.includes("verificacion_semestral")) {
    return { type: "verificacion_semestral", subplanId: "seguimiento_control_documental" };
  }
  if (normalized.includes("acta") || normalized.includes("simulacro")) {
    return { type: "acta_pma_simulacro", subplanId: "contingencias_seguridad" };
  }
  if (normalized.includes("incidente") || normalized.includes("queja") || normalized.includes("acciones")) {
    return { type: "incidentes_acciones_quejas", subplanId: "contingencias_seguridad" };
  }
  if (normalized.includes("pma_final") || normalized.includes("plan")) {
    return { type: "plan_actualizado", subplanId: "seguimiento_control_documental" };
  }
  if (normalized.includes("anexos") || normalized.includes("anexo")) {
    return { type: "anexos", subplanId: "seguimiento_control_documental" };
  }
  if (normalized.includes("informes_bianuales") || normalized.includes("informe")) {
    return { type: "informe_cumplimiento", subplanId: "seguimiento_control_documental" };
  }
  if (normalized.includes("oficios_presentacion") || normalized.includes("oficio")) {
    return { type: "oficio_presentacion", subplanId: "seguimiento_control_documental" };
  }
  return { type: "verificacion_semestral", subplanId: "seguimiento_control_documental" };
}

function yearFromPeriod(periodId) {
  const match = String(periodId || "").match(/_(\d{4})_05$/);
  return match ? Number(match[1]) : Number(state.plan?.project?.currentYear || 2026);
}

function entryFromFile(file, folder) {
  const path = `${normalizePath(folder)}/${file.name}`;
  const period = inferPeriod(path);
  const meta = inferMeta(path);
  return {
    path,
    name: file.name,
    type: meta.type,
    year: yearFromPeriod(period),
    period,
    subplanId: meta.subplanId
  };
}

function updateIndexSummary() {
  const files = state.evidenceIndex.files || [];
  state.evidenceIndex.updatedAt = new Date().toISOString().slice(0, 10);
  state.evidenceIndex.summary = {
    totalFiles: files.length,
    foldersIndexed: new Set(files.map((file) => normalizePath(file.path).split("/").slice(0, -1).join("/"))).size,
    updateMode: "manual_asistido"
  };
}

function mergeEvidenceEntry(entry) {
  const files = state.evidenceIndex.files || [];
  const normalizedPath = normalizePath(entry.path);
  const index = files.findIndex((file) => normalizePath(file.path) === normalizedPath);
  if (index >= 0) {
    files[index] = entry;
  } else {
    files.push(entry);
  }
  state.evidenceIndex.files = files;
  updateIndexSummary();
}

function refreshAfterIndexChange() {
  state.measures = flattenMeasures(state.plan, state.rules, state.evidenceIndex);
  renderAll();
}

function selectedAssistedEntries() {
  const input = document.getElementById("assisted-files");
  const folder = document.getElementById("assisted-folder").value;
  return Array.from(input.files || []).map((file) => entryFromFile(file, folder));
}

function renderAssistedPreview() {
  const preview = document.getElementById("assisted-preview");
  const entries = selectedAssistedEntries();
  if (!entries.length) {
    preview.innerHTML = "";
    return;
  }
  preview.innerHTML = entries
    .map((entry) => `
      <article class="item">
        <h3>${escapeHtml(entry.name)}</h3>
        <p>${escapeHtml(documentKindLabel(entry.type))} - ${escapeHtml(periodLabel(entry.period))} - ${escapeHtml(subplanName(entry.subplanId))}</p>
        <p>${escapeHtml(entry.path)}</p>
      </article>
    `)
    .join("");
}

function addAssistedFiles() {
  const entries = selectedAssistedEntries();
  entries.forEach(mergeEvidenceEntry);
  refreshAfterIndexChange();
  renderAssistedPreview();
}

async function importIndexFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const parsed = JSON.parse(await file.text());
  state.evidenceIndex = {
    updatedAt: parsed.updatedAt || null,
    year: parsed.year || state.plan.project.currentYear,
    files: Array.isArray(parsed.files) ? parsed.files : [],
    summary: parsed.summary || {}
  };
  updateIndexSummary();
  refreshAfterIndexChange();
}

function downloadDocuments() {
  const documents = downloadableDocumentsForSelectedPeriod();
  if (!documents.length) {
    alert("No hay documentos registrados para descargar en el periodo seleccionado.");
    return;
  }
  documents.forEach((file, index) => {
    window.setTimeout(() => {
      const link = document.createElement("a");
      link.href = `./${normalizePath(file.path)}`;
      link.download = file.name || normalizePath(file.path).split("/").pop() || "documento";
      document.body.appendChild(link);
      link.click();
      link.remove();
    }, index * 250);
  });
}

function setupEvents() {
  document.getElementById("filter-period").addEventListener("change", (event) => {
    state.filters.period = event.target.value;
    renderAll();
  });
  document.getElementById("filter-subplan").addEventListener("change", (event) => {
    state.filters.subplan = event.target.value;
    renderMatrix();
  });
  document.getElementById("filter-status").addEventListener("change", (event) => {
    state.filters.status = event.target.value;
    renderMatrix();
  });
  document.getElementById("filter-frequency").addEventListener("change", (event) => {
    state.filters.frequency = event.target.value;
    renderMatrix();
  });
  document.getElementById("filter-text").addEventListener("input", (event) => {
    state.filters.text = event.target.value;
    renderMatrix();
  });
  document.getElementById("download-documents").addEventListener("click", downloadDocuments);
  document.getElementById("download-index").addEventListener("click", downloadIndex);
  document.getElementById("matrix-form").addEventListener("submit", addMatrixEntryFromForm);
  document.getElementById("matrix-measure").addEventListener("change", syncMatrixMeasureFields);
  document.getElementById("matrix-period").addEventListener("change", syncMatrixMeasureFields);
  document.getElementById("matrix-path").addEventListener("input", syncMatrixName);
  document.getElementById("evidence-form").addEventListener("submit", addEvidenceFromForm);
  document.getElementById("evidence-path").addEventListener("input", syncEvidenceName);
  document.getElementById("import-index-file").addEventListener("change", importIndexFile);
  document.getElementById("assisted-folder").addEventListener("change", renderAssistedPreview);
  document.getElementById("assisted-files").addEventListener("change", renderAssistedPreview);
  document.getElementById("assisted-add-files").addEventListener("click", addAssistedFiles);
}

function syncMatrixName() {
  const pathInput = document.getElementById("matrix-path");
  const nameInput = document.getElementById("matrix-name");
  if (nameInput.value.trim()) return;
  nameInput.value = filenameFromPath(pathInput.value);
}

function syncEvidenceName() {
  const pathInput = document.getElementById("evidence-path");
  const nameInput = document.getElementById("evidence-name");
  if (nameInput.value.trim()) return;
  const pieces = normalizePath(pathInput.value).split("/");
  nameInput.value = pieces[pieces.length - 1] || "";
}

function addMatrixEntryFromForm(event) {
  event.preventDefault();
  const measureId = document.getElementById("matrix-measure").value;
  const measure = measureById(measureId);
  const period = document.getElementById("matrix-period").value || CURRENT_PLAN_START_PERIOD;
  const path = normalizePath(document.getElementById("matrix-path").value.trim());
  const name = document.getElementById("matrix-name").value.trim() || filenameFromPath(path);
  const status = document.getElementById("matrix-status").value;
  const reviewDate = document.getElementById("matrix-date").value;
  const reviewedBy = document.getElementById("matrix-responsible").value.trim() || "Administracion";
  const notes = document.getElementById("matrix-notes").value.trim();
  if (!measure || !path || !isCurrentPlanPeriod(period)) return;
  mergeEvidenceEntry({
    path,
    name,
    type: MEASURE_EVIDENCE_TYPES[measureId] || "verificacion_semestral",
    year: periodStartYear(period),
    period,
    subplanId: measure.subplanId,
    measureId,
    status,
    reviewDate,
    reviewedBy,
    notes
  });
  refreshAfterIndexChange();
  event.target.reset();
  document.getElementById("matrix-period").value = CURRENT_PLAN_START_PERIOD;
  document.getElementById("matrix-status").value = "cumple";
  document.getElementById("matrix-responsible").value = "Administracion";
  syncMatrixMeasureFields();
}

function addEvidenceFromForm(event) {
  event.preventDefault();
  const path = normalizePath(document.getElementById("evidence-path").value.trim());
  const name = document.getElementById("evidence-name").value.trim() || path.split("/").pop();
  const type = document.getElementById("evidence-type").value;
  const subplanId = document.getElementById("evidence-subplan").value;
  const year = Number(document.getElementById("evidence-year").value || state.plan.project.currentYear);
  const period = document.getElementById("evidence-period").value;
  if (!path) return;
  const exists = (state.evidenceIndex.files || []).some((file) => normalizePath(file.path) === path);
  if (!exists) {
    state.evidenceIndex.files = [...(state.evidenceIndex.files || []), { path, name, type, year, period, subplanId }];
    state.evidenceIndex.updatedAt = new Date().toISOString().slice(0, 10);
    state.evidenceIndex.summary = {
      totalFiles: state.evidenceIndex.files.length,
      foldersIndexed: new Set(state.evidenceIndex.files.map((file) => normalizePath(file.path).split("/").slice(0, -1).join("/"))).size,
      updateMode: "manual"
    };
    state.measures = flattenMeasures(state.plan, state.rules, state.evidenceIndex);
    renderAll();
  }
  event.target.reset();
  document.getElementById("evidence-year").value = state.plan.project.currentYear;
  document.getElementById("evidence-period").value = CURRENT_PLAN_START_PERIOD;
  document.getElementById("evidence-subplan").value = state.plan.subplans[0]?.id || "";
}

function downloadIndex() {
  const blob = new Blob([`${JSON.stringify(state.evidenceIndex, null, 2)}\n`], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "evidence-index.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function main() {
  setupNavigation();
  setupUploadAccess();
  let plan;
  let rules;
  let evidenceIndex;
  try {
    [plan, rules, evidenceIndex] = await Promise.all([
      loadJson(DATA_PATHS.plan),
      loadJson(DATA_PATHS.rules),
      loadJson(DATA_PATHS.index)
    ]);
  } catch (error) {
    plan = FALLBACK_PLAN;
    rules = FALLBACK_RULES;
    evidenceIndex = { ...FALLBACK_INDEX, files: [] };
    document.getElementById("last-update").textContent = "Indice pendiente";
  }
  state.plan = plan;
  state.rules = rules;
  state.evidenceIndex = evidenceIndex;
  state.evidenceIndex.files = state.evidenceIndex.files || [];
  state.measures = flattenMeasures(plan, rules, evidenceIndex);
  populateFilters();
  setupEvents();
  document.getElementById("matrix-date").value = new Date().toISOString().slice(0, 10);
  syncMatrixMeasureFields();
  renderAll();
}

main().catch((error) => {
  document.getElementById("summary").innerHTML = `<article class="metric"><strong>Error</strong><span>${escapeHtml(error.message)}</span></article>`;
});
