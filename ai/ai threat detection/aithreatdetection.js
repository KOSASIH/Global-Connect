const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Detects possible threats, anomalies, or intrusions from logs, events, or user actions.
 * @param {Object} event - { userId, eventType, details, timestamp }
 * @returns {Promise<{threatDetected: boolean, threatType: string, description: string, recommendedAction: string}>}
 */
async function aiThreatDetection(event) {
  const prompt = `
You are an AI Threat Detection engine. Analyze the following event or activity for signs of compromise, intrusion, or abuse. Clearly state if a threat is detected, describe the threat type, and recommend actions.

Event:
${JSON.stringify(event, null, 2)}

Return as:
threatDetected: true/false
threatType: <string>
description: <string>
recommendedAction: <string>
  `;
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4',
      messages: [{ role: "user", content: prompt }],
      temperature: 0.12,
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );
  try {
    return JSON.parse(response.data.choices[0].message.content);
  } catch {
    return {
      threatDetected: true,
      threatType: "Parsing error",
      description: "AI parsing error",
      recommendedAction: "Escalate to security team"
    };
  }
}

module.exports = { aiThreatDetection };