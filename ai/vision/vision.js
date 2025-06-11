const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient();

async function analyzeImage(filePath) {
  const [result] = await client.labelDetection(filePath);
  const labels = result.labelAnnotations.map(label => label.description);
  return labels;
}

module.exports = { analyzeImage };