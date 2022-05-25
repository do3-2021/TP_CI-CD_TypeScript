import { initDB } from "./database.ts";
import { setupApp } from "./routes.ts";

const cityApiAddr = Deno.env.get("CITY_API_ADDR") || "127.0.0.1";
const cityApiPort = Deno.env.get("CITY_API_PORT") || "2022";

const dbClient = await initDB();
const app = setupApp(dbClient);

await app.listen({ hostname: cityApiAddr, port: parseInt(cityApiPort) });
