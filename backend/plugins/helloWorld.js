module.exports = (app) => {
  app.get('/plugin/hello', (req, res) => {
    res.send('Hello from the plugin system!');
  });
};
