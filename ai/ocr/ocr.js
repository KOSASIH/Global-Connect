const vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient();

async function extractTextFromImage(filePath) {
  const [result] = await client.textDetection(filePath);
  const detections = result.textAnnotations;
  return detections.length ? detections[0].description : '';
}

module.exports = { extractTextFromImage };