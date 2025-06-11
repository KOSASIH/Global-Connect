const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Generates a smart, dynamic form schema and sample UI code based on requirements.
 * @param {Object} formSpec - { formPurpose, fields, validationRules, platform }
 * @returns {Promise<{formSchema: string, sampleUI: string, validationLogic: string}>}
 */
async function aiSmartFormBuilder(formSpec) {
  const prompt Given these requirements, create a form schema (JSON), sample UI code (React or HTML), and field validation logic.
Requirements:
${JSON.stringify(formSpec, null, 2)}
Return as:
formSchema: <string>
sampleUI: <string>
validationLogic: <string>
  `;
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.15,
    },
    { headers: { Authorization: `Bearer ${OPENAI_APImessage.content);
  } catch {
    return {
      formSchema: "Parsing error",
      sampleUI: "",
      validationLogic: ""
    };
  }
}

module.exports = { aiSmartFormBuilder };