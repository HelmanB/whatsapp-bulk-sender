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

      // ← ← ← columnas EXACTAS que tienes en tu CSV
      const numero = row.phone;
      const nombre = row.first_name;

      if (!numero) {
        console.log("Fila inválida:", row);
        return;
      }

      // mensaje automático usando el nombre
      const mensaje = `Hola ${nombre}, este es un mensaje masivo de prueba.`;

      await enviarMensaje(numero, mensaje);

      // pausa anti-spam
      await new Promise((r) => setTimeout(r, 400));
    })
    .on("end", () => {
      console.log("📤 Envío masivo completado.");
    });
}

enviarDesdeCSV();
