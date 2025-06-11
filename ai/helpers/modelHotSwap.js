// Allows dynamic switching of AI models at runtime (e.g., for A/B testing or upgrades)
const models = {
  gpt4: require('../gpt4/engine'),
  quantumSecure: require('../aiquantumsecure/aiquantumsecure')
  // Add more as needed
};
let activeModel = 'gpt4';

function setActiveModel(modelName) {
  if (models[modelName]) {
    activeModel = modelName;
    return true;
  }
  return false;
}

function getActiveModel() {
  return models[activeModel];
}

module.exports = { setActiveModel, getActiveModel };