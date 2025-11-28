import { enviarTodos } from "./sendCSV.js";

app.get("/enviar", async (req, res) => {
  enviarTodos();
  res.send("Envío iniciado");
});
