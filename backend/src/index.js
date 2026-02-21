const express = require('express');
const cors = require('cors');
const { runMigrations } = require('./migrations');
const usersRouter = require('./routes/users');
const requestsRouter = require('./routes/requests');

const app = express();
const PORT = process.env.PORT || 3000;

runMigrations();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/users', usersRouter);
app.use('/requests', requestsRouter);

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
