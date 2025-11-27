require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const PORT = process.env.WEBHOOK_PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

const app = express();
app.use(bodyParser.json());

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === VERIFY_TOKEN) return res.status(200).send(challenge);
  res.sendStatus(403);
});

app.post('/webhook', (req, res) => {
  res.sendStatus(200);
  console.log('Webhook:', JSON.stringify(req.body).slice(0,2000));
});

app.listen(PORT, () => console.log(`Webhook en puerto ${PORT}`));
