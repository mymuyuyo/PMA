const DATA_PATHS = {
  plan: "./data/plan.json",
  rules: "./data/evidence-rules.json",
  index: "./data/evidence-index.json"
};

async function loadJson(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw new Error(`No se pudo cargar ${path}`);
  return response.json();
}

function normalizePath(path) {
  return path.replace(/\\/g, "/").replace(/\/+$/, "");
}

function filesForRule(rule, evidenceIndex) {
  const folders = rule.requiredEvidence.map(normalizePath);
  return evidenceIndex.files.filter((file) => {
    const filePath = normalizePath(file.path);
    return folders.some((folder) => filePath.startsWith(folder + "/") || filePath === folder);
  });
}

function statusForMeasure(measure, rules, evidenceIndex) {
  const rule = rules.rules.find((item) => item.measureId === measure.id);
  if (!rule) return "pendiente";
  const files = filesForRule(rule, evidenceIndex);
  if (rule.defaultStatus && Number(rule.minimumFiles) === 0 && files.length === 0) {
    return rule.defaultStatus;
  }
  return files.length >= Number(rule.minimumFiles || 1) ? "cumple" : (rule.statusWhenMissing || "pendiente");
}

function flattenMeasures(plan, rules, evidenceIndex) {
  return plan.subplans.flatMap((subplan) =>
    subplan.measures.map((measure) => ({
      subplan: subplan.name,
      ...measure,
      status: statusForMeasure(measure, rules, evidenceIndex)
    }))
  );
}

function renderSummary(measures) {
  const counts = measures.reduce((acc, measure) => {
    acc[measure.status] = (acc[measure.status] || 0) + 1;
    return acc;
  }, {});

  const total = measures.length;
  const complied = counts.cumple || 0;
  const percent = total ? Math.round((complied / total) * 100) : 0;
  const summary = document.getElementById("summary");
  summary.innerHTML = [
    ["Cumplimiento", `${percent}%`],
    ["Cumple", counts.cumple || 0],
    ["Pendiente", counts.pendiente || 0],
    ["No aplica", counts.no_aplica || 0],
    ["En correccion", counts.en_correccion || 0]
  ]
    .map(([label, value]) => `<article class="metric"><span>${label}</span><strong>${value}</strong></article>`)
    .join("");
}

function renderMatrix(measures) {
  const body = document.getElementById("matrix-body");
  body.innerHTML = measures
    .map((measure) => `
      <tr>
        <td>${measure.subplan}</td>
        <td>${measure.description}</td>
        <td>${measure.frequency}</td>
        <td>${measure.verifier}</td>
        <td><span class="status ${measure.status}">${measure.status.replace("_", " ")}</span></td>
      </tr>
    `)
    .join("");
}

async function main() {
  const [plan, rules, evidenceIndex] = await Promise.all([
    loadJson(DATA_PATHS.plan),
    loadJson(DATA_PATHS.rules),
    loadJson(DATA_PATHS.index)
  ]);
  const measures = flattenMeasures(plan, rules, evidenceIndex);
  renderSummary(measures);
  renderMatrix(measures);
  document.getElementById("last-update").textContent = evidenceIndex.updatedAt
    ? `Indice: ${evidenceIndex.updatedAt}`
    : "Indice pendiente de generar";
}

main().catch((error) => {
  document.getElementById("summary").innerHTML = `<article class="metric"><strong>Error</strong><span>${error.message}</span></article>`;
});
