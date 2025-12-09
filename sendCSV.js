import fs from "fs";
import csv from "csv-parser";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const token = process.env.WHATSAPP_TOKEN;
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

// ENVIO DE PLANTILLA
async function enviarTemplate(numero) {
  try {
    const data = {
      messaging_product: "whatsapp",
      to: numero,
      type: "template",
      template: {
        name: "saludo_prueba",
        language: { code: "en" },
        components: [
          {
            type: "header",
            parameters: [
              {
                type: "image",
                image: {
                  link: "https://raw.githubusercontent.com/HelmanB/whatsapp-bulk-sender/main/Foto.jpeg"
                }
              }
            ]
          },
          {
            type: "body"
          }
        ]
      }
    };

    const response = await axios.post(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      data,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log("✔ Enviado", response.data);
  } catch (error) {
    console.error("❌ Error enviando", error.response?.data);
  }
}


function enviarDesdeCSV() {
  fs.createReadStream("recipients.csv")
    .pipe(csv())
    .on("data", async (row) => {
      const numero = row.phone;
      const nombre = row.first_name;

      if (!numero || !nombre) {
        console.log("Fila inválida:", row);
        return;
      }

      await enviarTemplate(numero, nombre);

      await new Promise((r) => setTimeout(r, 400));
    })
    .on("end", () => {
      console.log("📤 Envío masivo completado.");
    });
}

enviarDesdeCSV();
