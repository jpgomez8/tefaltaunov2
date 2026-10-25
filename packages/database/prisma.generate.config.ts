import { defineConfig } from "prisma/config";

// Generar el cliente no necesita una conexion ni credenciales de la base.
export default defineConfig({ schema: "prisma/schema.prisma" });
