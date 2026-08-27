import "dotenv/config";
import app from "./app.js";
import { validateEnv } from "./config/env.js";

validateEnv();


const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});