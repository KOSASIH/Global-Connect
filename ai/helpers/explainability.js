// Very simple example; real logic would use LIME/SHAP or model introspection
async function explainDecision(model, input, output) {
  return `Model "${model}" produced the output "${output}" for input "${input}" by analyzing key features and historical patterns.`;
}

module.exports = { explainDecision };