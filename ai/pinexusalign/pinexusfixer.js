/**
 * Suggests improvements for system components to better align with Pi Nexus Autonomous Banking Network.
 * @param {Array} components - Array of { name, autonomy, modularity, privacy, auditability }
 * @returns {Array} suggestions - Array of {component, issue, suggestion}
 */
function suggestPiNexusImprovements(components) {
  return components.flatMap(comp => {
    const suggestions = [];
    if (!comp.autonomy) {
      suggestions.push({
        component: comp.name,
        issue: "Lacks autonomy",
        suggestion: "Implement autonomous workflows and reduce manual intervention."
      });
    }
    if (!comp.modularity) {
      suggestions.push({
        component: comp.name,
        issue: "Lacks modularity",
        suggestion: "Refactor into independent, API-driven modules."
      });
    }
    if (!comp.privacy) {
      suggestions.push({
        component: comp.name,
        issue: "Insufficient privacy controls",
        suggestion: "Integrate privacy-by-design and encryption for all user data."
      });
    }
    if (!comp.auditability) {
      suggestions.push({
        component: comp.name,
        issue: "Lacks auditability",
        suggestion: "Ensure all actions are logged and traceable as per Pi Nexus standards."
      });
    }
    return suggestions;
  });
}

module.exports = { suggestPiNexusImprovements };