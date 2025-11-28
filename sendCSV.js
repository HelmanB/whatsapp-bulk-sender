import fs from "fs";
import csv from "csv-parser";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const token = process.env.WHATSAPP_TOKEN;
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

async function enviarMensaje(numero, mensaje) {
  try {
    await axios.post(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        to: numero,
        type: "text",
        text: { body: mensaje }
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log(`✔ Enviado a ${numero}`);
  } catch (error) {
    console.error(`❌ Error enviando a ${numero}`, error.response?.data);
  }
}

function enviarDesdeCSV() {
  fs.createReadStream("recipients.csv")
    .pipe(csv())
    .on("data", async (row) => {
      const numero = row.numero;
      const mensaje = row.mensaje;

      if (!numero || !mensaje) {
        console.log("Fila inválida:", row);
        return;
      }

      await enviarMensaje(numero, mensaje);

      // evitar bloqueo por spam
      await new Promise((r) => setTimeout(r, 400));
    })
    .on("end", () => {
      console.log("📤 Envío masivo completado.");
    });
}

enviarDesdeCSV();
