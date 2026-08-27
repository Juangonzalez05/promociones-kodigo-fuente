import "dotenv/config";

const REQUIRED_ENV_VARS = [
  "POSTGRES_DB",
  "POSTGRES_USER",
  "POSTGRES_PASSWORD",
  "DATABASE_URL",
];

export function validateEnv() {
  const missingVars = REQUIRED_ENV_VARS.filter(
    (key) => !process.env[key] || process.env[key].trim() === ""
  );

  if (missingVars.length > 0) {
    console.error("\n [ERROR CRÍTICO EN VARIABLES DE ENTORNO]");
    console.error(`Faltan las siguientes variables obligatorias: ${missingVars.join(", ")}`);
    console.error("Asegúrate de definirlas en el archivo .env o en el entorno del sistema.\n");
    process.exit(1);
  }
}