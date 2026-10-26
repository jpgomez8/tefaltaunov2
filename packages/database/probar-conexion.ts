import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const adapter = new PrismaPg({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const prisma = new PrismaClient({ adapter });

try {
  const [regiones, comunas, actividades] = await Promise.all([
    prisma.regiones.count(),
    prisma.comunas.count(),
    prisma.actividades.count(),
  ]);

  console.log({
    regiones,
    comunas,
    actividades,
  });
} finally {
  await prisma.$disconnect();
}