import { enviarTodos } from "./sendSCV.js";

app.get("/enviar", async (req, res) => {
  enviarTodos();
  res.send("Envío iniciado");
});
