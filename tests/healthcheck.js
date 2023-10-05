const healthCheck = (app) => app.get('/health', (req, res) => {
  res.status(200).send();
});

module.exports = healthCheck;