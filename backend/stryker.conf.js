module.exports = function(config) {
  config.set({
    mutate: [
      'api/**/*.js',
      'services/**/*.js'
    ],
    mutator: 'javascript',
    testRunner: 'jest',
    reporters: ['html', 'clear-text', 'progress'],
    coverageAnalysis: 'perTest',
    jest: {
      projectType: 'custom',
      config: require('./jest.config.js'),
      enableFindRelatedTests: true
    }
  });
};
