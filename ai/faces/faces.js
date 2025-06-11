const Jimp = require('jimp');
const faceapi = require('@vladmandic/face-api');
const canvas = require('canvas');
const fs = require('fs');

async function blurFacesInImage(inputPath, outputPath) {
  await faceapi.nets.ssdMobilenetv1.loadFromDisk('./models');
  await faceapi.nets.faceLandmark68Net.loadFromDisk('./models');
  await faceapi.nets.faceRecognitionNet.loadFromDisk('./models');

  const img = await canvas.loadImage(inputPath);
  const c = canvas.createCanvas(img.width, img.height);
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);

  const detections = await faceapi.detectAllFaces(c);

  const jimpImg = await Jimp.read(inputPath);
  detections.forEach(det => {
    const { x, y, width, height } = det.box;
    jimpImg.blur(15).crop(x, y, width, height);
  });
  await jimpImg.writeAsync(outputPath);
  return outputPath;
}

module.exports = { blurFacesInImage };