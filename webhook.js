import express from 'express';
import axios from 'axios';

const app = express();
app.use(express.json());

const token = process.env.WHATSAPP_TOKEN;
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

app.post('/send', async (req, res) => {
  const { to, message } = req.body;

  try {
    const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

    const response = await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        to,
        text: { body: message }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Error sending message" });
  }
});

app.listen(3000, () => console.log('API funcionando en Render'));
