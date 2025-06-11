// Simple anomaly detection: flag values outside mean ± 2*stddev

function detectAnomalies(dataSeries) {
  const mean = dataSeries.reduce((a, b) => a + b, 0) / dataSeries.length;
  const stddev = Math.sqrt(dataSeries.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / dataSeries.length);
  return dataSeries
    .map((value, idx) => ({ idx, value }))
    .filter(({ value }) => Math.abs(value - mean) > 2 * stddev);
}

module.exports = { detectAnomalies };