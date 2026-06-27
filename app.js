const express = require('express');
const userRoutes = require('./routes/users');

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/users', userRoutes);

  app.get('/', (req, res) => {
    res.send('Hello World');
  });

  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  return app;
}

module.exports = createApp;
