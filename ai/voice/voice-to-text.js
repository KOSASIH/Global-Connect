const speech = require('@google-cloud/speech');
const client = new speech.SpeechClient();

async function transcribeAudio(filePath) {
  const audio = { content: require('fs').readFileSync(filePath).toString('base64') };
  const config = { encoding: 'LINEAR16', languageCode: 'en-US' };
  const request = { audio, config };
  const [response] = await client.recognize(request);
  return response.results.map(r => r.alternatives[0].transcript).join('\n');
}

module.exports = { transcribeAudio };