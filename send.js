require('dotenv').config();
const fs = require('fs-extra');
const csv = require('csv-parse/sync');
const axios = require('axios');
const PQueue = require('p-queue').default;
const templates = require('./templates');

const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const CONCURRENCY_PER_SECOND = parseInt(process.env.CONCURRENCY_PER_SECOND || '80', 10);
const RETRY_MAX = parseInt(process.env.RETRY_MAX || '3', 10);

if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
  console.error('FALTAN VARIABLES: revisa .env');
  process.exit(1);
}

const raw = fs.readFileSync('recipients.csv', 'utf8');
const records = csv.parse(raw, { columns: true, skip_empty_lines: true, comment: '#' });
const recipients = records.filter(r => r.opt_in && String(r.opt_in).trim() !== '0');

const queue = new PQueue({
  intervalCap: CONCURRENCY_PER_SECOND,
  interval: 1000,
  carryoverConcurrencyCount: true
});

async function sendTemplate(to, params, attempt = 1) {
  const url = `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`;
  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: templates.name,
      language: { code: templates.language },
      components: [
        { type: 'body', parameters: params.map(p => ({ type: 'text', text: p })) }
      ]
    }
  };
  try {
    const res = await axios.post(url, payload, { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } });
    console.log(`[OK] ${to}`);
  } catch (err) {
    const status = err.response?.status;
    const shouldRetry = (!status) || (status >= 500 && status < 600);
    if (shouldRetry && attempt < RETRY_MAX) {
      await new Promise(r => setTimeout(r, 1000 * attempt));
      return sendTemplate(to, params, attempt + 1);
    }
    fs.appendFileSync('failed.log', `${to}
`);
  }
}

(async () => {
  for (const r of recipients) {
    const to = r.phone.trim();
    const params = [ (r.first_name || 'Cliente'), '20% de descuento' ];
    queue.add(() => sendTemplate(to, params));
  }
  await queue.onIdle();
})();